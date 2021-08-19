<template>
  <div>
    <div v-if="!isLoaded" class="psykhe-loading-container">
      <svg v-if="!(isPermanentFailure || isNotFound)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
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

      <p v-if="!isTemporaryFailure && !isPermanentFailure">&nbsp;</p>

      <transition name="fade">
        <p v-if="isTemporaryFailure && isLoggedIn" :key="temporaryFailureMessage">
          {{ temporaryFailureMessage }}
        </p>
      </transition>

      <transition name="fade">
        <p v-if="isPermanentFailure">
          {{
            permanentFailureMessage ||
            "The system encountered an error while retrieving results - we're sorry and are working to fix it."
          }}
          <a href="#" @click.stop.prevent="reloadPage">Please try again later</a>.
        </p>
      </transition>

      <transition name="fade">
        <p v-if="isNotFound" class="psykhe-404-message">
          <span class="psykhe-404-heading"> {{ notFoundType | capitalize }} not found </span>

          <span> Sorry, we couldn't find the {{ notFoundType }} you requested. Please try again later. </span>
        </p>
      </transition>
    </div>

    <slot v-else></slot>
  </div>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { UserMixin } from '~/mixins/userMixin';
import { LoaderState } from '~/types/loader-states';

@Component({
  filters: {
    capitalize(value: string) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
})
export default class Loader extends UserMixin {
  @Prop({ type: String, required: true })
  readonly state!: LoaderState;

  @Prop({ type: String, default: 'product' })
  readonly notFoundType!: string;

  @Prop({ type: String, default: "We're calculating your results..." })
  readonly temporaryFailureMessage!: string;

  @Prop({
    type: String,
    default: "The system encountered an error while retrieving results - we're sorry and are working to fix it."
  })
  readonly permanentFailureMessage!: string;

  reloadPage() {
    window.location.reload(true);
  }

  get isLoaded() {
    return this.state === LoaderState.LOADED;
  }

  get isLoading() {
    return this.state === LoaderState.LOADING;
  }

  get isTemporaryFailure() {
    return this.state === LoaderState.TEMPORARY_FAILURE;
  }

  get isPermanentFailure() {
    return this.state === LoaderState.PERMANENT_FAILURE;
  }

  get isNotFound() {
    return this.state === LoaderState.NOT_FOUND;
  }
}
</script>
