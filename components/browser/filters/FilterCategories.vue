<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-category">
    <template v-if="selectedCategory">
      <nuxt-link :to="getCategoryPath(null)" :rel="noFollowRel" class="psykhe-browse-filters-filter-category-top">
        {{ selectedCategory.label }}
      </nuxt-link>
    </template>
    <ul>
      <template v-if="!activeCategories">No Categories</template>
      <template v-else>
        <template v-for="(category, slug) in activeCategories">
          <li :key="slug" :class="{ active: subcategoryActive(slug) }">
            <template v-if="subcategoryActive(slug)">
              <nuxt-link :to="getCategoryPath(slug)">
                <div class="psykhe-browse-filters-filter-category-label">
                  {{ category.label }}
                </div>
              </nuxt-link>
              <template v-if="category.children">
                <ul>
                  <template v-for="(tick, tickSlug) in category.children">
                    <li :key="tickSlug">
                      <nuxt-link :to="getCategoryPath(`${slug}/${tickSlug}`)">
                        {{ getCategoryTickSymbol(`${slug}/${tickSlug}`) }} {{ tick.label }}
                      </nuxt-link>
                    </li>
                  </template>
                </ul>
              </template>
            </template>
            <template v-else>
              <nuxt-link :to="getCategoryPath(slug)" :rel="noFollowRel">
                {{ category.label }}
              </nuxt-link>
            </template>
          </li>
        </template>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { isEmpty } from 'lodash';

import { queryStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';
import { CategoryMap } from '~/types/category';
import { filterStore } from '~/utils/store-accessor';

@Component
export default class FilterCategory extends Vue {
  getCategoryPath(target: string) {
    const updatedQuery = { ...this.query };
    updatedQuery.categories = [];

    if (target && this.query.categories) {
      let path = target;
      const parts = target.split('/');

      // If this category is currently selected, clicking it should take you a layer up in the tree
      if (this.query.categories?.includes(target)) {
        path = [...parts].splice(0, parts.length - 1).join('/');
      }

      // Include 3rd level categories from the same 2nd level category in the query paramaters
      updatedQuery.categories = [
        path,
        ...this.query.categories.filter(
          (slug) => slug !== target && parts.length === 3 && slug.includes(`${parts[0]}/${parts[1]}/`)
        )
      ];
    }

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  subcategoryActive(slug: string) {
    return this.query.categories?.some((category) => category === slug || category.includes(slug + '/'));
  }

  getCategoryTickSymbol(slug: string) {
    return this.query.categories?.includes(slug) ? '☒' : '☐';
  }

  get activeCategories() {
    if (!this.query.categories || !this.query.categories.length) {
      return this.availableCategories;
    }

    const categories: CategoryMap = {};
    const categorySlug = this.query.categories[0].split('/')[0];

    // Ensure the parent category is included in each category slug
    Object.entries(this.availableCategories[categorySlug].children).forEach((category) => {
      categories[`${categorySlug}/${category[0]}`] = category[1];
    });

    return categories;
  }

  get selectedCategory() {
    if (!this.query.categories?.length) {
      return undefined;
    }

    return this.availableCategories[this.query.categories[0].split('/')[0]];
  }

  get noFollowRel() {
    return !isEmpty(this.$route.query) ? 'nofollow' : '';
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availableCategories() {
    return filterStore.categories;
  }
}
</script>
