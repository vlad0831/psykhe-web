<template>
  <div class="page-login-hero">
    <div class="col">
      <div>
        <login></login>
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
import Login from '~/components/user/Login.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';

@Component({
  layout: 'unauthenticated',
  middleware: 'require-unauthenticated',
  components: { DeferredFigure, Login }
})
export default class Index extends Vue {
  get metaTitle() {
    return 'Log In | PSYKHE';
  }

  get metaDescription() {
    return `Enter your details to take the Big 5 personality test so you can begin using
            PSYKHE's highly tailored shopping platform and shop by personality.`;
  }

  head() {
    return {
      title: this.metaTitle,
      bodyAttrs: {
        class: 'page page-login'
      },
      meta: [
        { hid: 'description', name: 'description', content: this.metaDescription },
        { hid: 'og:title', name: 'og:title', content: this.metaTitle },
        { hid: 'og:description', name: 'og:description', content: this.metaDescription },
        { hid: 'twitter:title', name: 'twitter:title', content: this.metaTitle },
        { hid: 'twitter:description', name: 'twitter:description', content: this.metaDescription }
      ]
    };
  }
}
</script>
