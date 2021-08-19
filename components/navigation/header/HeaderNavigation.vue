<template>
  <div>
    <nav class="navbar navbar-expand-md navbar-light" :class="{ 'navbar-padded': showBannerPadding }">
      <div class="container">
        <nuxt-link class="navbar-brand" to="/">PSYKHE</nuxt-link>
        <a class="nav-mob-toggle" :class="{ 'not-collapsed': openedSidebars.length }" @click="toggleNav()">
          <span></span>
        </a>
        <div v-if="!hideNav" id="psykhe-sidenav" class="collapse width navbar-collapse sidenav">
          <section>
            <!-- Left Side Of Navbar -->
            <ul class="navbar-nav mr-md-auto"></ul>

            <!-- Right Side Of Navbar -->
            <login-actions v-if="isLoggedIn" />
            <no-login-actions v-else />
          </section>

          <secondary-actions />
        </div>
      </div>
    </nav>

    <mobile-navigation />

    <div v-if="showBanner" class="navbar-nologin-banner">
      <p>
        These results are not personalized: to see products recommended for your personality,
        <nuxt-link to="/register">take the test</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import { UserMixin } from '~/mixins/userMixin';

import LoginActions from '~/components/navigation/header/LoginActions.vue';
import NoLoginActions from '~/components/navigation/header/NoLoginActions.vue';
import SecondaryActions from '~/components/navigation/header/SecondaryActions.vue';
import MobileNavigation from '~/components/navigation/mobile/MobileNavigation.vue';

@Component({
  components: {
    LoginActions,
    NoLoginActions,
    MobileNavigation,
    SecondaryActions
  }
})
export default class HeaderNavigation extends UserMixin {
  openedSidebars: string[] = [];
  sidebarToggled: boolean = false;

  created() {
    this.$root.$on('bv::collapse::state', (id: string, open: boolean) => {
      if (open) {
        this.openedSidebars = [...this.openedSidebars, id];
      } else {
        this.openedSidebars = this.openedSidebars.filter((sidebar) => sidebar !== id);
      }

      if (this.openedSidebars.length === 0) {
        this.sidebarToggled = false;
      }
    });
  }

  get hideNav(): boolean {
    const noNav: any[] = ['personality-test', 'merchant-redirect'];
    return noNav.includes(this.$route.name);
  }

  get showBanner(): boolean {
    const openRoutes: any[] = ['browse', 'browse-category-subcategory-slug'];
    return !this.$auth.loggedIn && openRoutes.includes(this.$route.name);
  }

  get showBannerPadding() {
    return !this.showBanner && this.$route.name !== 'index';
  }

  toggleNav() {
    this.sidebarToggled = !this.sidebarToggled;

    if (!this.sidebarToggled) {
      for (const id of this.openedSidebars) {
        this.$root.$emit('bv::toggle::collapse', id);
      }
    } else {
      this.$root.$emit('bv::toggle::collapse', 'mobile-nav');
    }
  }
}
</script>
