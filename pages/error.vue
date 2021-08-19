<template>
  <error-component :title="title" :description="description" :link-text="linkText" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ErrorComponent from '~/components/common/Error.vue';

@Component({ components: { ErrorComponent } })
export default class Error extends Vue {
  get title() {
    return 'Unxpected Error.';
  }

  get description() {
    return `We're sorry, we've encountered an unexpected error. Please try your search again, using the filters,
    search box, or navigation bar. Or, see the latest products`;
  }

  get linkText() {
    return 'here';
  }
}
</script>
