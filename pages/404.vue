<template>
  <error-component :title="title" :description="description" :link-text="linkText" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ErrorComponent from '~/components/common/Error.vue';

@Component({ components: { ErrorComponent } })
export default class Error404 extends Vue {
  get title() {
    return 'Not Found.';
  }

  get description() {
    return `We're sorry, we've not been able to find the page you're looking for. Please try your search again,
     using the filters, search box, or navigation bar. Or, see the latest products`;
  }

  get linkText() {
    return 'here';
  }
}
</script>
