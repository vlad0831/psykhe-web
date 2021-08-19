<template>
  <footer v-if="!hideFooter" class="main-footer">
    <div class="container">
      <div class="row">
        <div class="col">
          <nuxt-link class="psykhe-brand" to="/"> PSYKHE </nuxt-link>
        </div>
        <div class="col">
          <nuxt-link to="/about"> About </nuxt-link>
          <nuxt-link to="/how-it-works"> How It Works </nuxt-link>
        </div>
        <div class="col">
          <nuxt-link to="/faqs"> FAQS </nuxt-link>
          <nuxt-link to="/terms-and-conditions"> Terms of Use </nuxt-link>
        </div>
        <div class="col">
          <nuxt-link to="/privacy-policy"> Data Policy </nuxt-link>
          <nuxt-link to="/privacy-policy"> Privacy Policy </nuxt-link>
        </div>
        <div class="col">
          <a href="https://magazine.psykhefashion.com"> TPOF Magazine </a>
          <nuxt-link to="/faqs#faq-contact"> Contact </nuxt-link>
        </div>
        <div class="col social-footer">
          <span>Follow Us</span>
          <a class="soc-icon icon-facebook" href="https://www.facebook.com/psykhefashion" target="_blank"> </a>
          <a class="soc-icon icon-instagram" href="https://www.instagram.com/psykhefashion/" target="_blank"> </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class FooterNavigation extends Vue {
  get hideFooter(): boolean {
    const noNav: any[] = ['merchant-redirect'];
    return noNav.includes(this.$route.name);
  }
}
</script>
