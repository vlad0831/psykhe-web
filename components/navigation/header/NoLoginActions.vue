<template>
  <ul class="navbar-nav ml-md-auto">
    <search-box v-if="showSearch" :nli="true" @toggled="handleSearchToggled" />

    <li v-else class="nav-item">
      <nuxt-link class="nav-link" to="/browse"> Shop </nuxt-link>
    </li>

    <li class="nav-item">
      <nuxt-link class="nav-link" to="/register"> Take the Test </nuxt-link>
    </li>

    <li v-if="!searchOpen" class="nav-item">
      <nuxt-link class="nav-link" to="/how-it-works"> How PSYKHE Works </nuxt-link>
    </li>

    <li class="nav-item">
      <nuxt-link class="nav-link nav-link-login" to="/sign-in">Sign in</nuxt-link>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import SearchBox from '@/components/common/SearchBox.vue';

@Component({
  components: { SearchBox }
})
export default class NoLoginActions extends Vue {
  searchOpen: boolean = false;

  handleSearchToggled(open: boolean) {
    this.searchOpen = open;
  }

  get showSearch() {
    return ['browse', 'lists', 'profile'].some((prefix) => this.$route?.name?.startsWith(prefix));
  }
}
</script>
