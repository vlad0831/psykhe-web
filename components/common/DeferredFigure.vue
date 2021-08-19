<template>
  <figure v-observe-visibility="{ callback: eventVisible, intersection: { rootMargin: rootMarginString } }">
    <img ref="img" :alt="alt" :src="deferredSrc" @load="eventLoaded" @error="eventError" />

    <figcaption v-if="caption">
      <template v-if="link">
        <template v-if="linkText">
          <span>{{ caption }}</span>
          <a :href="link" :target="linkTarget">{{ linkText }}</a>
        </template>

        <template v-else>
          <a :href="link" :target="linkTarget">{{ caption }}</a>
        </template>
      </template>

      <template v-else>
        {{ caption }}
      </template>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { Ref, Prop, Component, Watch, Mixins } from 'vue-property-decorator';
import AssetManager from '@/mixins/assetManager';

@Component
export default class DeferredFigure extends Mixins(AssetManager) {
  @Ref('img')
  readonly image!: HTMLImageElement;

  @Prop({ type: String, required: false, default: null })
  readonly alt!: string;

  @Prop({ type: String, required: false, default: null })
  readonly src!: string;

  @Prop({ type: String, required: false, default: null })
  readonly link!: string;

  @Prop({ type: String, required: false, default: null })
  readonly scale!: number;

  @Prop({ type: Number, required: false, default: null })
  readonly aspectX!: number;

  @Prop({ type: Number, required: false, default: null })
  readonly aspectY!: number;

  @Prop({ type: String, required: false })
  readonly pool!: string;

  @Prop({ type: String, required: false })
  readonly assetKey!: string;

  @Prop({ type: String, required: false, default: null })
  readonly caption!: string;

  @Prop({ type: String, required: false, default: null })
  readonly linkText!: string;

  @Prop({ type: String, required: false, default: null })
  readonly linkTarget!: string;

  @Prop({ type: String, required: false, default: null })
  readonly dynamicSrc!: string;

  @Prop({ type: Number, required: false, default: 0 })
  readonly cacheRefresh?: number;

  @Prop({ type: Boolean, required: false, default: false })
  readonly forceRender?: boolean;

  width: number = 0;
  height: number = 0;
  error: boolean = false;
  loaded: boolean = false;
  visible: boolean = false;
  rendered: boolean = false;
  renderedHandle: any = undefined;
  rootMarginCalculated: number = 1200;
  rootMarginString: string = '0px 0px ' + this.rootMarginCalculated + 'px 0px';

  eventVisible(isVisible: boolean) {
    if (isVisible && !this.visible) {
      this.visible = true;
      if (this.loaded) {
        this.eventRendered();
      }
    }
  }

  @Watch('src', { immediate: true })
  onSrcChange() {
    this.width = 0;
    this.height = 0;
    this.error = false;
    this.loaded = false;
    this.rendered = this.forceRender || false;
  }

  eventRendered() {
    if (this.renderedHandle) {
      window.clearTimeout(this.renderedHandle);
    }

    if (this.rendered || !this.loaded || !this.visible || !this.image) {
      return;
    }

    if (
      !this.image.clientWidth ||
      !this.image.clientHeight ||
      (this.aspectX && this.image.clientWidth === this.aspectX) ||
      (this.aspectY && this.image.clientHeight === this.aspectY)
    ) {
      this.renderedHandle = window.setTimeout(() => {}, 50);
      return;
    }

    this.width = this.image.clientWidth;
    this.height = this.image.clientHeight;
    this.rendered = true;
  }

  eventLoaded() {
    if (!this.$refs.img || this.loaded) {
      return;
    }

    this.loaded = true;
    if (this.visible) {
      this.eventRendered();
    }
  }

  eventError() {
    this.error = true;
  }

  get aspectSrc() {
    const x = this.aspectX ? this.aspectX : this.aspectY ? this.aspectY : 1;
    const y = this.aspectY ? this.aspectY : this.aspectX ? this.aspectX : 1;

    return [
      'data:image/svg+xml',
      encodeURI(
        [
          '<svg',
          'xmlns="http://www.w3.org/2000/svg"',
          'viewBox="0 0 ' + x + ' ' + y + '"',
          'width="' + x + '"',
          'height="' + y + '"',
          '/>'
        ].join(' ')
      )
    ].join(',');
  }

  get resizedSrc() {
    const calculatedWidth = this.forceRender ? this.aspectX : this.width;
    const calculatedHeight = this.forceRender ? this.aspectY : this.height;

    if (!calculatedWidth || !calculatedHeight || !this.calculatedDynamicSrc || this.calculatedDynamicSrc === this.src) {
      return this.src;
    }

    let width: any = this.aspectX ? Math.round(calculatedWidth) : '';
    let height: any = this.aspectY ? Math.round(calculatedHeight) : '';

    if (this.aspectX && this.aspectY) {
      // we prefer to use the Aspect loader, but if this results
      // in a "huge" image, we fall back to a smaller one.
      const ratio: number = this.aspectX / this.aspectY;

      if (width > 1000) {
        width = 1000;
        height = Math.round(width / ratio);
      }

      if (height > 1000) {
        height = 1000;
        width = Math.round(height * ratio);
      }
    }

    // Double the image width/height if the user has a retina display
    if (window.devicePixelRatio > 1 && !this.forceRender) {
      width *= 2;
      height *= 2;
    }

    // Upscale the image if a scale has been provided
    if (this.scale && !this.forceRender) {
      width *= this.scale;
      height *= this.scale;
    }

    return String(this.calculatedDynamicSrc)
      .replace(':width:', width)
      .replace(':height:', height)
      .replace(':type:', '.webp');
  }

  get deferredSrc() {
    return !this.error && this.rendered ? this.resizedSrc : this.aspectSrc;
  }

  get calculatedDynamicSrc() {
    return this.pool ? this.getUrl(this.pool, this.assetKey, this.cacheRefresh) : this.dynamicSrc;
  }
}
</script>
