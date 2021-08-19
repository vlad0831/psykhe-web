<template>
  <div class="page-login-hero">
    <div class="col">
      <div>
        <email-verification :id="id" :email="email" :timestamp="timestamp"></email-verification>
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
import EmailVerification from '~/components/user/EmailVerification.vue';
@Component({
  layout: 'unauthenticated',
  components: { EmailVerification }
})
export default class VerifyEmail extends Vue {
  head() {
    return {
      bodyAttrs: {
        class: 'page page-login'
      }
    };
  }

  timestamp: string = '';
  id: string = '';
  email: string = '';

  created() {
    this.timestamp = this.$route.params.timestamp;
    this.id = this.$route.params.id;
    this.email = this.$route.params.email;
  }
}
</script>
