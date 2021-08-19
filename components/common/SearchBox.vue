<template>
  <div>
    <li
      :class="{
        'mob-nav-lists mob-search': mobile,
        'nav-item nav-link-search-li': !mobile,
        'nav-logged-in-item': !mobile && !nli
      }"
    >
      <transition name="fade-in-only">
        <img v-if="showSearchIcon" :src="searchIcon" @click="showSearchInput || mobile ? submit() : showSearch()" />
      </transition>

      <transition name="fade-in-only">
        <div v-if="showSearchText && !mobile" @click="showSearch">SEARCH</div>
      </transition>

      <transition name="slide-fade">
        <input
          v-if="showSearchInput || mobile"
          :id="mobile ? 'search-mobile' : 'search-desktop'"
          ref="search"
          v-model="query"
          placeholder="Search for..."
          @keyup.enter.exact="submit"
        />
      </transition>
    </li>

    <li v-if="!mobile && !nli" class="nav-item nav-logged-in-item"></li>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { UserMixin } from '~/mixins/userMixin';

@Component
export default class SearchBox extends UserMixin {
  @Prop({ type: Boolean, required: false, default: false })
  readonly mobile!: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  readonly nli!: boolean;

  $refs!: {
    search: HTMLInputElement;
  };

  query: string = '';
  showSearchIcon: boolean = true;
  showSearchText: boolean = true;
  showSearchInput: boolean = false;

  @Watch('$route')
  onRouteChange(route: Route) {
    // If the q parameter is removed from the URL, hide the search box
    if (this.query && !route.query.q) {
      this.showSearchInput = false;
      this.showSearchIcon = false;
      this.query = '';

      setTimeout(() => {
        this.showSearchIcon = true;
        this.showSearchText = true;
      }, 300);
    }
  }

  @Watch('showSearchInput')
  onShowSearchInputChange(value: boolean) {
    this.$emit('toggled', value);
  }

  created() {
    // If search results are the first page of the user's session, ensure the search box is populated
    if (this.$route.query.q) {
      this.showSearchInput = true;
      this.query = this.$route.query.q as string;
    }
  }

  showSearch() {
    this.showSearchText = false;
    this.showSearchInput = true;

    if (this.showSearchInput) {
      this.$nextTick(() => this.$refs.search.focus());
    }
  }

  submit() {
    if (this.query === '') {
      return;
    }

    this.$router.push(`/browse?q=${this.query.toLocaleLowerCase()}`);
  }

  get searchIcon() {
    return this.mobile ? '/media/icon/search-light.svg' : '/media/icon/search.svg';
  }
}
</script>
