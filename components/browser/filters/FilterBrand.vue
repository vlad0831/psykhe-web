<template>
  <div class="psykhe-browse-filters-filter psykhe-browse-filters-filter-brand">
    <div class="psykhe-browse-filters-filter-heading" @click="toggleVisible">
      <div class="psykhe-browse-filters-filter-heading-label">Brands</div>
      <div class="psykhe-browse-filters-filter-heading-actions">
        <a v-if="visible" class="filter-close"></a>
        <a v-if="!visible" class="filter-open"></a>
      </div>
    </div>

    <div v-if="visible" class="psykhe-browse-filters-filter-main">
      <input v-model="filter" class="psykhe-browse-filters-filter-brand-search" placeholder="Search for a brand" />

      <ul v-if="filter" ref="filters" class="psykhe-browse-filters-filter-brand-list" @scroll="handleFilterScroll">
        <template v-if="filteredBrands.length == 0">No Brands</template>

        <template v-else>
          <nuxt-link v-for="brand in reducedBrands" :key="brand.identifier" :to="getBrandPath(brand)" rel="nofollow">
            <li
              :class="{
                active: activeBrand.identifier === brand.identifier
              }"
            >
              {{ brand.name }}
            </li>
          </nuxt-link>
        </template>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Ref } from 'nuxt-property-decorator';
import { filterStore, queryStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';
import { IFilter } from '~/types/query/filter';
import { IBrand } from '~/types/product/product';

@Component
export default class FilterBrand extends Vue {
  @Ref('filters')
  readonly filters!: HTMLCanvasElement;

  filter: string = '';
  visible: boolean = true;
  maxBrands: number = 20;

  toggleVisible() {
    this.visible = !this.visible;
  }

  getBrandPath(brand: IFilter) {
    const updatedQuery = Object.assign({}, this.query);
    updatedQuery.brands = brand.name !== 'All' ? [brand.identifier] : [];

    return QueryLinkService.getInstance().createLinkFromQuery(updatedQuery, null);
  }

  @Watch('activeBrand')
  activeBrandChanged(brand: IBrand) {
    if (!brand) {
      return;
    }

    if (!this.filter && brand.name !== 'All') {
      this.filter = brand.name;
    }

    this.filter = brand.name ? this.filter : '';
  }

  @Watch('filter')
  filterChanged() {
    if (this.filters) {
      this.filters.scrollTop = 0;
    }

    this.maxBrands = 20;
  }

  // When the user scrolls 90% of the way to the bottom, display more
  handleFilterScroll({ target: { scrollTop, clientHeight, scrollHeight } }: any) {
    if (scrollTop + clientHeight >= 0.9 * scrollHeight) {
      this.maxBrands += 20;
    }
  }

  get activeBrand() {
    if (!this.query.brands || !this.query.brands.length) {
      return {
        identifier: '',
        name: ''
      };
    }

    return [{ name: 'All', identifier: 'all' }, ...this.availableBrands].find((brand) =>
      this.query.brands?.includes(brand.identifier)
    );
  }

  get reducedBrands() {
    return this.filteredBrands.slice(0, this.maxBrands);
  }

  get filteredBrands() {
    const filter = this.filter.trim().replace(' ', '').toLocaleLowerCase();

    return [
      { name: 'All', identifier: '' },
      ...this.availableBrands
        .filter((brand) => brand.name.trim().replace(' ', '').toLocaleLowerCase().includes(filter))
        .sort((a, b) => {
          const aStartsWithFilter = a.name.trim().replace(' ', '').toLocaleLowerCase().startsWith(filter);
          const bStartsWithFilter = b.name.trim().replace(' ', '').toLocaleLowerCase().startsWith(filter);

          if (aStartsWithFilter && !bStartsWithFilter) {
            return -1;
          }

          if (bStartsWithFilter && !aStartsWithFilter) {
            return 1;
          }

          return a.name.localeCompare(b.name, undefined, { ignorePunctuation: true, sensitivity: 'base' });
        })
    ];
  }

  get moreBrandsAvailable() {
    return this.filteredBrands.length > this.reducedBrands.length;
  }

  get query() {
    return queryStore.getGlobalQueryParameters;
  }

  get availableBrands() {
    return filterStore.brands;
  }
}
</script>
