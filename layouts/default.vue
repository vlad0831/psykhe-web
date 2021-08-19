<template>
  <div id="app">
    <header-navigation />
    <main>
      <Nuxt />
    </main>
    <footer-navigation />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import HeaderNavigation from '~/components/navigation/header/HeaderNavigation.vue';
import FooterNavigation from '~/components/navigation/footer/FooterNavigation.vue';

import { initialiseStores } from '~/utils/store-accessor';
import { filterStore, optionsStore, savelistsStore } from '~/store';

import { AnalyticsMixin } from '~/mixins/analyticsMixin';

@Component({
  components: {
    HeaderNavigation,
    FooterNavigation
  }
})
export default class Default extends AnalyticsMixin {
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

  head() {
    return {
      meta: [
        {
          hid: 'og:image',
          name: 'og:image',
          content: 'https://media.psykhefashion.com/x/page/1e/1c/1e1c668e3750d53725e0cc3dcb2fe50d0ec6f92d.jpg.webp'
        },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'twitter:site', name: 'twitter:site', content: '@psykhefashion' },
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
