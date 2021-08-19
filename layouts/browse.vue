<template>
  <div id="app">
    <header-navigation />
    <main>
      <transition name="fade">
        <div v-if="fetchedFilters" class="psykhe-browse-do-filters psykhe-browse">
          <div v-if="oceanPercentage" class="psykhe-browse-heading">
            {{ queryHeading }}
            <p>{{ queryDescription }}</p>
          </div>

          <div v-else class="psykhe-browse-heading">
            <div class="row">
              <section>
                <h2>Fashion, personalized by personality</h2>

                <p>
                  PSYKHE is a shopping platform where you can see products from all your favourite brands matched to
                  your personality
                </p>

                <nuxt-link to="/personality-test">Sign up for a personalized feed</nuxt-link>
              </section>
            </div>
          </div>

          <div class="psykhe-browse-main">
            <browser-filter />
            <Nuxt />
          </div>
        </div>
      </transition>
    </main>
    <footer-navigation />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { mixins } from 'nuxt-property-decorator';

import { UserMixin } from '~/mixins/userMixin';
import { AnalyticsMixin } from '~/mixins/analyticsMixin';

import HeaderNavigation from '~/components/navigation/header/HeaderNavigation.vue';
import FooterNavigation from '~/components/navigation/footer/FooterNavigation.vue';
import { initialiseStores } from '~/utils/store-accessor';

import BrowserFilter from '~/components/browser/filters/BrowserFilter.vue';
import { filterStore, queryStore, optionsStore, savelistsStore } from '~/store';

@Component({
  components: {
    BrowserFilter,
    HeaderNavigation,
    FooterNavigation
  }
})
export default class Default extends mixins(UserMixin, AnalyticsMixin) {
  async created() {
    initialiseStores(this.$store);

    await Promise.all([
      filterStore.fetchFiltersIfNecessary(),
      ...(this.$auth.loggedIn ? [optionsStore.fetchOptionsIfNescessary()] : []),
      ...(this.$auth.loggedIn ? [savelistsStore.fetchSavelistsIfNescessary()] : [])
    ]);
  }

  beforeMount() {
    this.displayOptionalsModal();
  }

  get fetchedFilters() {
    return filterStore.fetchedFilters;
  }

  get queryHeading() {
    if (this.query.categories?.length) {
      const category = filterStore.getCategoryBySlug(this.query.categories[0]);
      const heading = this.isLoggedIn ? category?.heading_with_login : category?.heading_no_login;
      if (heading) {
        return heading;
      }

      return category?.label;
    }
    // todo: partner, brand, etc

    return this.isLoggedIn ? 'Your Matches' : "Women's Luxury Fashion";
  }

  get queryDescription() {
    if (this.query.categories?.length) {
      const category = filterStore.getCategoryBySlug(this.query.categories[0]);

      if (category && this.isLoggedIn && category.description_with_login) {
        return category.description_with_login;
      }

      if (category && !this.isLoggedIn && category.description_no_login) {
        return category.description_no_login;
      }

      if (this.query.categories[0].split('/').length > 2) {
        return (
          'Our AI determined these to be your closest matches for ' +
          category?.label +
          ', based on your personality. Use the x and tick to refine your feed.'
        );
      }
    }

    return this.isLoggedIn
      ? 'Our AI determined these to be your closest matches based on your personality. Use the x and tick to refine your feed.'
      : "Shop the best women's luxury fashion, including clothes, shoes, bags, and accessories from leading global fashion retailers.";
  }

  get metaDescription() {
    if (this.query.categories?.length) {
      const category = filterStore.getCategoryBySlug(this.query.categories[0]);

      if (category && category.description_no_login) {
        return category.description_no_login;
      }
    }

    return "Shop the best women's luxury fashion, including clothes, shoes, bags, and accessories from leading global fashion retailers.";
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  head() {
    return {
      title: `${this.queryHeading} | PSYKHE`,
      bodyAttrs: {
        class: 'page page-browse'
      },
      meta: [
        { hid: 'description', name: 'description', content: this.metaDescription },
        { hid: 'og:title', name: 'og:title', content: `${this.queryHeading} | PSYKHE` },
        { hid: 'og:description', name: 'og:description', content: this.metaDescription },
        {
          hid: 'og:image',
          name: 'og:image',
          content: 'https://media.psykhefashion.com/x/page/1e/1c/1e1c668e3750d53725e0cc3dcb2fe50d0ec6f92d.jpg.webp'
        },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'twitter:site', name: 'twitter:site', content: '@psykhefashion' },
        { hid: 'twitter:title', name: 'twitter:title', content: `${this.queryHeading} | PSYKHE` },
        { hid: 'twitter:description', name: 'twitter:description', content: this.metaDescription },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: 'https://media.psykhefashion.com/x/page/1e/1c/1e1c668e3750d53725e0cc3dcb2fe50d0ec6f92d.jpg.webp'
        }
      ]
    };
  }
}
</script>
