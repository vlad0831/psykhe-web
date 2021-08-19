<template>
  <div class="page-login-hero">
    <div class="col">
      <div>
        <password-recover :recovery-email="email"></password-recover>
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
import PasswordRecover from '~/components/user/PasswordRecover.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';

@Component({
  layout: 'unauthenticated',
  components: { DeferredFigure, PasswordRecover }
})
export default class PasswordRecovery extends Vue {
  head() {
    return {
      bodyAttrs: {
        class: 'page page-login'
      }
    };
  }

  email: string = '';

  created() {
    this.email = this.$route.params.email;
  }
}
</script>
