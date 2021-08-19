<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-occasion">
    <div class="psykhe-browse-filters-filter-main">
      <template v-if="activeOccasion.identifier !== 'baseline'">
        <nuxt-link :to="getOccasionPath('')">
          <button class="filter-remove"></button>
        </nuxt-link>
      </template>

      <b-dropdown>
        <template v-slot:button-content>
          <template v-if="activeOccasion.identifier === 'baseline'">By Occasion</template>
          <template v-else>{{ activeOccasion.name }}</template>
        </template>

        <template v-if="availableOccasions.length === 0">
          <div class="dropdown-item">No Occasions</div>
        </template>

        <template v-else>
          <template v-for="(occasion, key) in availableOccasions">
            <nuxt-link :key="key" :to="getOccasionPath(occasion)" rel="nofollow">
              <b-dropdown-item-button v-if="occasion.name.length">
                {{ occasion.name }}
              </b-dropdown-item-button>
            </nuxt-link>
          </template>
        </template>
      </b-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { queryStore, filterStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';

@Component
export default class FilterOccasion extends Vue {
  getOccasionPath(occasion: any) {
    const updatedQuery = Object.assign({}, this.query);
    updatedQuery.occasions = [occasion.identifier];

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  get activeOccasion() {
    const occasion = this.availableOccasions.find((occasion) => this.query.occasions.includes(occasion.identifier));

    if (!occasion) {
      return {
        identifier: 'baseline',
        name: 'By Occasion'
      };
    }

    return occasion;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availableOccasions() {
    return filterStore.occasions;
  }
}
</script>
