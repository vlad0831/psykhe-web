<template>
  <div class="component-avatar-upload">
    <input id="file" ref="profileUpload" type="file" @change="preview" />
    <label
      :class="{
        'component-avatar-upload-file-label': true,
        'component-avatar-upload-label-hasData': !!dataUrl,
        'component-avatar-upload-label-hasPrevious-withoutHover': !componentData.url,
        'component-avatar-upload-label-hasPrevious': componentData.url
      }"
      for="file"
    >
      <deferred-figure
        v-if="!dataUrl && hasAvatar"
        class="component-avatar-previous-image"
        :pool="'user'"
        :asset-key="userIdentifier"
        :aspect-x="1"
        :aspect-y="1"
        :cache-refresh="avatarUploaded"
      />
    </label>
    <template v-if="dataUrl">
      <div
        ref="boundary"
        v-touch:start="moveStart"
        v-touch:moving="move"
        v-touch:end="moveEnd"
        class="component-avatar-upload-preview-boundary"
      >
        <div ref="innerBoundary" class="component-avatar-upload-preview-boundary-inner">
          <img
            ref="display"
            :style="{
              left: offsetX + 'px',
              top: offsetY + 'px',
              width: resizedWidth + 'px',
              height: resizedHeight + 'px'
            }"
            :src="dataUrl"
            @load="renderVisual"
            @error="fail"
          />
        </div>
      </div>
      <b-form-input ref="zoom" v-model="zoomSlide" type="range" size="sm" min="0" max="100" />
      <canvas ref="canvas" width="100%" height="100%" class="d-none" />
      <canvas ref="output" width="100%" height="100%" class="d-none" />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Ref } from 'vue-property-decorator';

import DeferredFigure from '~/components/common/DeferredFigure.vue';
import { UserMixin } from '~/mixins/userMixin';

// Ignoring jQuery type errors, as logic using it should be replaced with native Vue at some stage soon
declare let $: any;

@Component({
  components: { DeferredFigure },
  model: { event: 'input' }
})
export default class AvatarUpload extends UserMixin {
  @Ref('profileUpload')
  readonly profileUpload!: HTMLInputElement;

  @Ref('display')
  readonly display!: HTMLImageElement;

  @Ref('innerBoundary')
  readonly innerBoundary!: HTMLDivElement;

  @Ref('canvas')
  readonly canvas!: HTMLCanvasElement;

  @Ref('output')
  readonly output!: HTMLCanvasElement;

  componentData: object = {};
  dataUrl: string = '';
  offsetX: number = 0;
  offsetY: number = 0;
  zoomSlide: number = 0;
  zoom: number = 0;
  resizeBasis: string = '';
  naturalWidth: number = 0;
  naturalHeight: number = 0;
  resizedWidth: number = 0;
  resizedHeight: number = 0;
  displayWidth: number = 0;
  displayHeight: number = 0;
  movingFrom: any = {};
  isMoving: boolean = false;
  leftOff: any = null;
  outOfBoundsTime: number = 4000;

  created() {
    this.componentData = this.$attrs;
  }

  /*
   * constraints() calculates the min/max values for offsets.
   * the constraints are such that an offset never results in
   * "empty" pixels.
   * the "center" is also defined here, acting as a default position.
   */
  get constraints() {
    return {
      x: {
        min: this.resizedWidth * -1 + this.displayWidth,
        center: (this.resizedWidth - this.displayWidth) / -2,
        max: 0
      },
      y: {
        min: this.resizedHeight * -1 + this.displayWidth,
        center: (this.resizedHeight - this.displayHeight) / -2,
        max: 0
      }
    };
  }

  @Watch('zoomSlide')
  zoomSlideAction() {
    this.resize();
    this.$nextTick(() => {
      this.setOffsetX(this.offsetX);
      this.setOffsetY(this.offsetY);

      this.renderVisual();
    });
  }

  /*
   * resize() recalculates the various sizes involved
   * zoom: the requested zoom level (specified as a multiplier)
   * natural: the "original" size of the image
   * display: the size of the bounding box of the final image
   * resized: the size of the original image, scaled to fit within the
   *          display area, such that the image fully covers all parts
   *          of the display area (no "empty" pixels).
   *          ie: whichever dimension is smaller, is resized to fit the
   *          display area exactly. The other dimension is scaled
   *          proportionally.
   */
  resize() {
    const zoom = 1 + this.zoomSlide / 100;
    const naturalWidth = this.display.naturalWidth;
    const naturalHeight = this.display.naturalHeight;
    const displayWidth = this.innerBoundary.clientWidth;
    const displayHeight = this.innerBoundary.clientHeight;

    let resizeBasis;
    let resizedHeight;
    let resizedWidth;

    if (naturalWidth > naturalHeight) {
      resizeBasis = 'y';
      resizedHeight = displayHeight * zoom;
      resizedWidth = naturalWidth * (resizedHeight / naturalHeight);
    } else {
      resizeBasis = 'x';
      resizedWidth = displayWidth * zoom;
      resizedHeight = naturalHeight * (resizedWidth / naturalWidth);
    }

    this.zoom = zoom;
    this.naturalWidth = naturalWidth;
    this.naturalHeight = naturalHeight;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.resizeBasis = resizeBasis;
    this.resizedWidth = resizedWidth;
    this.resizedHeight = resizedHeight;

    if (typeof this.offsetX === 'undefined') {
      this.offsetX = this.constraints.x.center;
    }
    if (typeof this.offsetY === 'undefined') {
      this.offsetY = this.constraints.y.center;
    }
  }

  setOffsetX(x: number) {
    this.offsetX = Math.max(Math.min(this.constraints.x.max, x), this.constraints.x.min);
  }

  setOffsetY(y: number) {
    this.offsetY = Math.max(Math.min(this.constraints.y.max, y), this.constraints.y.min);
  }

  preview() {
    if (!this.profileUpload || !this.profileUpload.files || !this.profileUpload.files[0]) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = (e: any) => {
      this.dataUrl = e.target.result as string;
    };

    fileReader.readAsDataURL(this.profileUpload.files[0]);
  }

  moveStart(event: any) {
    this.isMoving = true;
    $(document.body).addClass('lock-screen');
    let cx = event.clientX;
    let cy = event.clientY;
    if (event.clientX === undefined) {
      const touch = event.touches[0];
      cx = touch.pageX;
      cy = touch.pageY;
    }

    this.movingFrom = {
      x: cx,
      y: cy,
      offsetX: this.offsetX,
      offsetY: this.offsetY
    };
  }

  move(event: any) {
    if (!this.isMoving) return;

    let cx = event.clientX;
    let cy = event.clientY;
    if (event.clientX === undefined) {
      const touch = event.touches[0];
      cx = touch.pageX;
      cy = touch.pageY;
    }
    if (!this.$refs.display) {
      return;
    }
    if (!this.movingFrom) {
      return;
    }

    const x = this.movingFrom.offsetX + (cx - this.movingFrom.x);
    const y = this.movingFrom.offsetY + (cy - this.movingFrom.y);
    this.setOffsetX(x);
    this.setOffsetY(y);
    clearTimeout(this.leftOff);
    this.leftOff = setTimeout(this.moveEnd, this.outOfBoundsTime);
  }

  moveEnd() {
    this.isMoving = false;
    $(document.body).removeClass('lock-screen');

    this.renderVisual();
  }

  fail() {
    (this as any).$bvModal
      .msgBoxOk(
        'Error uploading the selected image. The image may be in ' +
          'an unknown or unsupported format. Please try a different ' +
          'image.'
      )
      .then(() => {
        this.dataUrl = '';
        this.profileUpload.value = '';
      });
  }

  renderVisual() {
    this.resize();

    // we never make the render larger than the original source
    this.canvas.width = Math.min(this.displayWidth / (this.resizedWidth / this.naturalWidth), this.naturalWidth);
    this.canvas.height = Math.min(this.displayHeight / (this.resizedHeight / this.naturalHeight), this.naturalHeight);

    const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(
      this.display,
      0,
      0,
      this.display.naturalWidth,
      this.display.naturalHeight,
      this.offsetX / (this.resizedWidth / this.naturalWidth),
      this.offsetY / (this.resizedHeight / this.naturalHeight),
      this.display.naturalWidth,
      this.display.naturalHeight
    );

    const ratio = this.canvas.width / this.canvas.height;
    let width = this.canvas.width;
    let height = this.canvas.height;
    const max = 800;

    if (width > max) {
      width = max;
      height = width / ratio;
    }

    if (height > max) {
      height = max;
      width = height * ratio;
    }

    this.output.width = width;
    this.output.height = height;

    const outputctx = this.output.getContext('2d') as CanvasRenderingContext2D;
    outputctx.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      this.output.width,
      this.output.height
    );

    this.$emit('input', this.output.toDataURL('image/jpeg'));
  }
}
</script>
