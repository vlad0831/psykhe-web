<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-color">
    <div class="psykhe-browse-filters-filter-heading" @click="toggleVisible">
      <div class="psykhe-browse-filters-filter-heading-label">Colors</div>
      <div class="psykhe-browse-filters-filter-heading-actions">
        <a v-if="visible" class="filter-close"></a>
        <a v-if="!visible" class="filter-open"></a>
      </div>
    </div>
    <div v-if="visible" class="psykhe-browse-filters-filter-main">
      <ul class="psykhe-browse-filters-filter-color-list">
        <template v-if="availableColors.length === 0">No Colors</template>
        <template v-else>
          <template v-for="color in availableColors">
            <nuxt-link :key="color.identifier" :to="getColorPath(color)" rel="nofollow">
              <li
                :class="
                  Object.assign(
                    {
                      active: activeColor.identifier === color.identifier
                    },
                    Object.fromEntries([['psykhe-browse-filters-filter-color-' + color.identifier, true]])
                  )
                "
              >
                <span>{{ color.name }}</span>
              </li>
            </nuxt-link>
          </template>
        </template>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { filterStore, queryStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';

@Component
export default class FilterColor extends Vue {
  visible: boolean = true;

  getColorPath(color: any) {
    const updatedQuery = Object.assign({}, this.query);

    // If this color is already selected, selecting it again should disable it
    updatedQuery.colors = color.identifier !== this.activeColor.identifier ? [color.identifier] : [];

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  toggleVisible() {
    this.visible = !this.visible;
  }

  get activeColor() {
    const color = this.availableColors.find((color) => this.query.colors?.includes(color.identifier));

    if (!color) {
      return {
        identifier: '',
        name: ''
      };
    }

    return color;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availableColors() {
    return filterStore.colors;
  }
}
</script>
