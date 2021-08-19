<template>
  <div class="psykhe-redirect">
    <template v-if="url && partner">
      <h2>Now taking you to {{ partner }}</h2>
      <div>If you are not automatically redirected, <a :href="url">click here</a>.</div>
    </template>

    <template v-else>
      <h2>Unexpected Error.</h2>

      <div>
        We're sorry, we've encountered an unexpected error. Please try again, or <a href="/browse">click here</a> to see
        the latest products.
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  layout: 'unauthenticated'
})
export default class MerchantRedirect extends Vue {
  mounted() {
    if (!this.url) {
      return;
    }

    window.location.href = this.url;
  }

  get transaction() {
    const transactionId = this.$route.query.transaction;

    if (!transactionId) {
      return null;
    }

    const rawTransaction = window.localStorage.getItem(transactionId as string);

    if (!rawTransaction) {
      return null;
    }

    window.localStorage.removeItem(rawTransaction);

    return JSON.parse(rawTransaction);
  }

  get partner() {
    return this.transaction?.partner;
  }

  get url() {
    return this.transaction?.url;
  }
}
</script>
