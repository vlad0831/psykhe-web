<template>
  <b-sidebar id="mobile-nav" ref="mobile_nav" width="440px" sidebar-class="mobile-nav" no-header shadow>
    <div class="mobile-nav">
      <nav id="menu">
        <ul>
          <li v-if="isLoggedIn" class="mob-nav-profile mob-bkg-light">
            <nuxt-link v-if="hasAvatar" class="nav-item-avatar" to="/profile">
              <deferred-figure
                class="nav-item-avatar-img"
                :pool="'user'"
                :asset-key="userIdentifier"
                :constraints="{ width: 100, height: 100 }"
              />
            </nuxt-link>
            <nuxt-link class="nav-link-profile" to="/profile"> Hi {{ userNameFirst }}</nuxt-link>
          </li>

          <li class="nav-item">
            <nuxt-link class="nav-link" to="/browse"> Everything</nuxt-link>
          </li>

          <div class="main-categories">
            <li v-for="(category, slug) in categories" :key="slug" class="nav-item">
              <a v-b-toggle="'sub' + slug" class="nav-link">
                {{ category.label }}
              </a>
              <span v-if="Object.keys(category.children).length > 0"></span>
            </li>
          </div>

          <li class="nav-item mob-bkg-light">
            <a v-b-toggle="'editorial-nav'" class="nav-link">Editorial</a>
          </li>

          <template v-if="isLoggedIn">
            <li class="nav-item mob-bkg-light">
              <nuxt-link class="nav-link" to="/profile"> My Profile</nuxt-link>
            </li>

            <li class="nav-item mob-bkg-light">
              <nuxt-link class="nav-link" to="/lists"> My Lists</nuxt-link>
            </li>

            <li class="nav-item mob-bkg-light">
              <nuxt-link class="nav-link" to="/account"> My Account</nuxt-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item mob-bkg-light">
              <nuxt-link class="nav-link" to="/register"> Take the Test</nuxt-link>
            </li>
            <li class="nav-item mob-bkg-light">
              <nuxt-link class="nav-link" to="/how-it-works"> How PSYKHE Works</nuxt-link>
            </li>
            <li class="nav-item mob-bkg-light">
              <nuxt-link class="nav-link" to="/sign-in"> Sign in</nuxt-link>
            </li>
          </template>
          <search-box :mobile="true" />
        </ul>
      </nav>
    </div>
  </b-sidebar>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import { UserMixin } from '~/mixins/userMixin';
import DeferredFigure from '~/components/common/DeferredFigure.vue';
import SearchBox from '~/components/common/SearchBox.vue';
import { QueryLinkService } from '~/services/query/query-link.service';
import { filterStore, queryStore } from '~/store';

@Component({
  components: { DeferredFigure, SearchBox }
})
export default class MainSidebar extends UserMixin {
  buildCategoryLink(slug?: string, childSlug?: string) {
    let categorySlug = '';

    if (slug) {
      categorySlug += `${slug}`;
    }

    if (childSlug) {
      categorySlug += `/${childSlug}`;
    }

    return QueryLinkService.getInstance().createLinkFromQuery(
      {
        ...this.query,
        categories: categorySlug ? [categorySlug] : []
      },
      null
    );
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get categories() {
    return filterStore.categories;
  }
}
</script>
