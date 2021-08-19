<template>
  <section class="nav-toplevel-section navbar-responsive-collapse">
    <transition name="fade">
      <ul v-if="renderCategories" class="navbar-nav navbar-nav-toplevel">
        <li class="nav-item">
          <nuxt-link class="nav-link" :to="buildCategoryLink()"> Everything</nuxt-link>
        </li>

        <li v-for="(category, slug) in categories" :key="slug" class="nav-item dropdown">
          <nuxt-link class="nav-link dropdown-toggle" :to="buildCategoryLink(slug)">
            {{ category.label }}
          </nuxt-link>

          <ul v-if="Object.keys(category.children).length > 0" class="dropdown-menu">
            <li v-for="(child, childSlug) in category.children" :key="childSlug" class="nav-item">
              <nuxt-link class="nav-link" :to="buildCategoryLink(slug, childSlug)">
                {{ child.label }}
              </nuxt-link>
            </li>
          </ul>
        </li>

        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle">Editorial</a>

          <ul class="dropdown-menu dropdown-editorial">
            <div class="editorial-rows">
              <div class="editorial-column">
                <p class="editorial-heading">The Psychology of Fashion</p>
                <deferred-figure
                  asset-key="nav/tpof"
                  pool="psykhed"
                  :aspect-x="275"
                  :aspect-y="412"
                  :force-render="true"
                />

                <div class="editorial-divider" />
              </div>

              <div class="editorial-column">
                <p class="editorial-heading">PSYKHED</p>
                <deferred-figure
                  asset-key="nav/carmen"
                  pool="psykhed"
                  :aspect-x="275"
                  :aspect-y="412"
                  :force-render="true"
                />
              </div>

              <div class="editorial-column no-heading">
                <div class="editorial-read-more-block">
                  <deferred-figure
                    asset-key="nav/ume"
                    pool="psykhed"
                    :aspect-x="275"
                    :aspect-y="120"
                    :force-render="true"
                  />

                  <p class="editorial-subheading">Ume Romaan</p>

                  <p class="editorial-excerpt">
                    See what the UK-based fashion influencer got for her Big 5 scores and see her picks...
                  </p>
                  <router-link to="/editorial/ume-romaan" class="editorial-link">READ NOW</router-link>
                </div>

                <div>
                  <deferred-figure
                    asset-key="nav/anabel"
                    pool="psykhed"
                    :aspect-x="275"
                    :aspect-y="120"
                    :force-render="true"
                  />
                </div>
              </div>
            </div>

            <div class="editorial-rows">
              <div class="editorial-column">
                <p class="editorial-subheading">How to Use Fashion to Change Your Personality</p>
              </div>

              <div class="editorial-column"><p class="editorial-subheading">Carmen Busquets</p></div>

              <div class="editorial-column"><p class="editorial-subheading">Anabel Maldonado</p></div>
            </div>

            <div class="editorial-rows">
              <div class="editorial-column">
                <p class="editorial-excerpt">Studies prove that we want to change these three things...</p>
              </div>

              <div class="editorial-column">
                <p class="editorial-excerpt">
                  We put the fashion-tech entrepreneur and humanitarian through the Big 5 framework...
                </p>
              </div>

              <div class="editorial-column">
                <p class="editorial-excerpt">
                  PSYKHE's founder & CEO talks through her Big 5 scores and favorite items...
                </p>
              </div>
            </div>

            <div class="editorial-rows">
              <div class="editorial-column">
                <a
                  href="https://magazine.psykhefashion.com/features/fashion-psychology-change-you-personality"
                  class="editorial-link"
                  target="_blank"
                >
                  READ NOW
                </a>
              </div>

              <div class="editorial-column">
                <router-link to="/editorial/carmen-busquets" class="editorial-link">READ NOW</router-link>
              </div>

              <div class="editorial-column">
                <router-link to="/editorial/anabel-maldonado" class="editorial-link">READ NOW</router-link>
              </div>
            </div>
          </ul>
        </li>
      </ul>
    </transition>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { filterStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';

import DeferredFigure from '~/components/common/DeferredFigure.vue';
import { initialQueryParameters } from '~/types/query/query';

@Component({
  components: { DeferredFigure }
})
export default class SecondaryActions extends Vue {
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
        ...initialQueryParameters(),
        categories: categorySlug ? [categorySlug] : []
      },
      null
    );
  }

  get categories() {
    return filterStore.categories;
  }

  get renderCategories() {
    return Object.entries(this.categories).length > 0;
  }
}
</script>
