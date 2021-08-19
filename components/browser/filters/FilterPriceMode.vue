<template>
  <ul class="psykhe-browse-filters-filter-price-mode-list">
    <template v-if="availablePriceModes.length === 0">No Options</template>
    <template v-else>
      <nuxt-link v-for="(mode, slug) in availablePriceModes" :key="slug" :to="getModePath(mode)" rel="nofollow">
        <li
          :key="activeMode.identifier === mode.identifier"
          :class="{
            active: activeMode.identifier === mode.identifier
          }"
        >
          {{ mode.name }}
        </li>
      </nuxt-link>
    </template>
  </ul>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { filterStore, queryStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';
import { IFilter } from '~/types/query/filter';

@Component
export default class FilterPriceMode extends Vue {
  getModePath(mode: IFilter) {
    const updatedQuery = Object.assign({}, this.query);

    // If this option is already selected, selecting it again should disable it
    updatedQuery.modes = mode.identifier !== this.activeMode.identifier ? [mode.identifier] : [];

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  get activeMode() {
    const mode = this.availablePriceModes.find((mode) => this.query.modes.includes(mode.identifier));

    if (!mode) {
      return {
        identifier: '',
        name: ''
      };
    }
    return mode;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availablePriceModes() {
    return filterStore.modes;
  }
}
</script>
