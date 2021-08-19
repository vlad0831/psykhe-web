<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-option">
    <div class="psykhe-browse-filters-filter-heading" @click="toggleVisible">
      <div class="psykhe-browse-filters-filter-heading-label">Options</div>
      <div class="psykhe-browse-filters-filter-heading-actions">
        <a v-if="visible" class="filter-close"></a>
        <a v-if="!visible" class="filter-open"></a>
      </div>
    </div>
    <div v-if="visible" class="psykhe-browse-filters-filter-main">
      <ul class="psykhe-browse-filters-filter-option-list">
        <template v-if="availableOptions.length === 0">No Options</template>
        <template v-else>
          <nuxt-link v-for="(option, slug) in availableOptions" :key="slug" :to="getOptionPath(option)" rel="nofollow">
            <li
              :key="activeOption.identifier === option.identifier"
              :class="{
                active: activeOption.identifier === option.identifier
              }"
            >
              {{ option.name }}
            </li>
          </nuxt-link>
        </template>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { filterStore, queryStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';
import { IFilter } from '~/types/query/filter';

@Component
export default class FilterOption extends Vue {
  visible: boolean = true;

  toggleVisible() {
    this.visible = !this.visible;
  }

  getOptionPath(option: IFilter) {
    const updatedQuery = Object.assign({}, this.query);

    // If this option is already selected, selecting it again should disable it
    updatedQuery.options = option.identifier !== this.activeOption.identifier ? [option.identifier] : [];

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  get activeOption() {
    const option = this.availableOptions.find((option) => this.query.options.includes(option.identifier));

    if (!option) {
      return {
        identifier: '',
        name: ''
      };
    }

    return option;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availableOptions() {
    return filterStore.options;
  }
}
</script>
