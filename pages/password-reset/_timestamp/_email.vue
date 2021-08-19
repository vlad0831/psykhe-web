<template>
  <div class="page-login-hero">
    <div class="col">
      <div>
        <reset-password :email="email" :timestamp="timestamp"></reset-password>
      </div>
    </div>
    <div class="col">
      <deferred-figure
        :asset-key="'home/hero-side'"
        :pool="'page'"
        :constraints="{ width: 1000, height: 600 }"
      ></deferred-figure>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ResetPassword from '~/components/user/ResetPassword.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';
@Component({
  layout: 'unauthenticated',
  components: { DeferredFigure, ResetPassword }
})
export default class PasswordReset extends Vue {
  head() {
    return {
      bodyAttrs: {
        class: 'page page-login'
      }
    };
  }

  timestamp: string = '';
  email: string = '';

  created() {
    this.timestamp = this.$route.params.timestamp;
    this.email = this.$route.params.email;
  }
}
</script>
