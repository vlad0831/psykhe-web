<template>
  <ul class="social-links">
    <li>SHARE</li>
    <li>
      <a :href="facebookUrl"><img src="/media/icon/icon-facebook.svg" /></a>
    </li>
    <li>
      <a :href="twitterUrl"><img src="/media/icon/icon-twitter.svg" /></a>
    </li>
    <li>
      <a :href="pinterestUrl"><img src="/media/icon/icon-pinterest.svg" /></a>
    </li>
  </ul>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
@Component
export default class SocialLink extends Vue {
  get target() {
    return String(window.location);
  }

  get encodedTarget() {
    return window.encodeURIComponent(this.target);
  }

  get facebookUrl() {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + this.encodedTarget;
  }

  get twitterUrl() {
    return 'http://twitter.com/share' + '?text=Psykhe%20Fashion' + '&url=' + this.encodedTarget + '&hashtags=PSYKHE';
  }

  get pinterestUrl() {
    return 'https://pinterest.com/pin/create/button/?url=' + this.encodedTarget;
  }
}
</script>
