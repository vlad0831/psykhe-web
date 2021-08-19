<template>
  <transition name="fade">
    <svg v-if="zapping" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="psykhe-loader-zapping">
      <mask id="outlines">
        <rect x="0" y="0" width="100" height="100" fill="white" />

        <circle fill="#000" cx="12" cy="50" r="18">
          <animateTransform
            attributeName="transform"
            dur="1.1s"
            type="rotate"
            from="0 50 48"
            to="360 50 52"
            repeatCount="indefinite"
          />
        </circle>

        <circle fill="#000" cx="12" cy="50" r="14">
          <animateTransform
            attributeName="transform"
            dur="0.9s"
            type="rotate"
            from="0 50 48"
            to="360 50 52"
            repeatCount="indefinite"
          />
        </circle>
      </mask>

      <circle
        fill="none"
        stroke="#aaa"
        stroke-width="4"
        cx="50"
        cy="50"
        r="40"
        style="opacity: 0.5"
        mask="url(#outlines)"
      ></circle>

      <circle fill="#c1b096" cx="12" cy="50" r="10">
        <animateTransform
          attributeName="transform"
          dur="1.1s"
          type="rotate"
          from="0 50 48"
          to="360 50 52"
          repeatCount="indefinite"
        />
      </circle>

      <circle fill="#c1b096" cx="12" cy="50" r="8">
        <animateTransform
          attributeName="transform"
          dur="0.9s"
          type="rotate"
          from="0 50 48"
          to="360 50 52"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class BrowseItemTransition extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  readonly zapping!: object;
}
</script>
