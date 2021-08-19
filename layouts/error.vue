<template>
  <error-component :title="title" :description="description" :link-text="linkText" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ErrorComponent from '~/components/common/Error.vue';

@Component({ components: { ErrorComponent } })
export default class NuxtError extends Vue {
  @Prop({ type: Object, required: true })
  readonly error!: any;

  get title() {
    if (!this.error || this.error.statusCode !== 404) {
      return 'Unexpected Error.';
    }
    return 'Page not found.';
  }

  get description() {
    if (!this.error || !this.error.statusCode || this.error.statusCode === 404) {
      return `We're sorry, we've encountered an unexpected error. Please try your search again, using the filters,
    search box, or navigation bar. Or, see the latest products`;
    }

    return this.error.message;
  }

  get linkText() {
    if (!this.error || !this.error.statusCode || this.error.statusCode === 404) {
      return 'here';
    }
  }
}
</script>
