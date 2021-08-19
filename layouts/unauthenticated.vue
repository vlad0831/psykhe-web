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
import { Component, Vue } from 'vue-property-decorator';
import { AnalyticsMixin } from '~/mixins/analyticsMixin';

import HeaderNavigation from '~/components/navigation/header/HeaderNavigation.vue';
import FooterNavigation from '~/components/navigation/footer/FooterNavigation.vue';
import { filterStore, initialiseStores } from '~/store';

Vue.config.devtools = true;

@Component({
  components: {
    HeaderNavigation,
    FooterNavigation
  }
})
export default class Unauthenticated extends AnalyticsMixin {
  async created() {
    initialiseStores(this.$store);
    await filterStore.fetchFiltersIfNecessary();
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
