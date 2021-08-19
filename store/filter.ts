import { Module, Mutation, Action, VuexModule } from 'vuex-module-decorators';
import { ActionContext } from 'vuex/types';
import { Route } from 'vue-router';

import { FiltersService } from '~/services/catalog/filters.service';
import { CategoryMap } from '~/types/category';
import { IFilter } from '~/types/query/filter';

@Module({
  name: 'filter',
  stateFactory: true,
  namespaced: true
})
export default class FilterModule extends VuexModule {
  brands: IFilter[] = [];
  categories: CategoryMap = {};
  colors: IFilter[] = [];
  moods: IFilter[] = [];
  occasions: IFilter[] = [];
  options: IFilter[] = [];
  modes: IFilter[] = [];

  fetchedFilters: boolean = false;

  get getCategories() {
    return this.categories;
  }

  get getCategoryBySlug() {
    return (target: string) => {
      const parts = target.split('/');
      let categories = this.categories;

      for (const [index, slug] of parts.entries()) {
        const category = categories[slug];

        if (!category) {
          return undefined;
        }

        if (index === parts.length - 1) {
          return category;
        }

        categories = category.children;
      }

      return undefined;
    };
  }

  get routeHasValidFilters() {
    return (route: Route) => {
      if (route.params.category) {
        let categorySlug = route.params.category;

        if (route.params.subcategory) {
          categorySlug += `/${route.params.subcategory}`;
        }

        if (route.params.subsubcategory) {
          categorySlug += `/${route.params.subsubcategory}`;
        }

        if (this.getCategoryBySlug(categorySlug) === undefined) {
          return false;
        }
      }

      if (route.params.brandslugs || route.query.brands) {
        const queryBrandSlugs = route.query.brands as string;
        const paramBrandSlugs = route.params.brandslugs as string;

        const slugs = queryBrandSlugs ? queryBrandSlugs.split(',') : paramBrandSlugs.split(',');

        for (const slug of slugs) {
          if (!this.brands.some((brand) => brand.identifier === slug)) {
            return false;
          }
        }
      }

      if (route.query.mood) {
        if (!this.moods.some((mood) => mood.identifier === route.query.mood)) {
          return false;
        }
      }

      if (route.query.occasions) {
        const slugs = (route.query.occasions as string).split(',');

        for (const slug of slugs) {
          if (!this.occasions.some((occasion) => occasion.identifier === slug)) {
            return false;
          }
        }
      }

      if (route.query.colors) {
        const slugs = (route.query.colors as string).split(',');

        for (const slug of slugs) {
          if (!this.colors.find((color) => color.identifier === slug)) {
            return false;
          }
        }
      }

      if (route.query.options) {
        const slugs = (route.query.options as string).split(',');

        for (const slug of slugs) {
          if (!this.options.find((option) => option.identifier === slug)) {
            return false;
          }
        }
      }

      if (route.query.price) {
        const prices = (route.query.price as string).split(',');

        if (prices.length !== 2) {
          return false;
        }

        const isNumeric = (price: any) => price.trim() !== '' && !isNaN(price as number);

        if (!isNumeric(prices[0]) || !isNumeric(prices[1])) {
          return false;
        }
      }

      return true;
    };
  }

  @Mutation
  setModes() {
    this.modes = [
      {
        identifier: 'non-sale',
        name: 'Non-Sale'
      },
      {
        identifier: 'sale',
        name: 'Sale'
      }
    ];
  }

  @Mutation
  setBrands(payload: IFilter[]) {
    this.brands = payload;
  }

  @Mutation
  setCategories(payload: CategoryMap) {
    this.categories = payload;
  }

  @Mutation
  setColors(payload: IFilter[]) {
    this.colors = payload;
  }

  @Mutation
  setMoods(payload: IFilter[]) {
    this.moods = payload;
  }

  @Mutation
  setOccasions(payload: IFilter[]) {
    this.occasions = payload;
  }

  @Mutation
  setOptions(payload: IFilter[]) {
    this.options = payload;
  }

  @Mutation
  markFiltersAsFetched() {
    this.fetchedFilters = true;
  }

  @Action({ rawError: true })
  async forceFetchFilters() {
    fetchFilters(this.context, this.store.$filtersService);
  }

  @Action({ rawError: true })
  async fetchFiltersIfNecessary() {
    if (
      this.fetchedFilters &&
      this.brands.length > 0 &&
      Object.keys(this.categories).length > 0 &&
      this.colors.length > 0 &&
      this.moods.length > 0 &&
      this.occasions.length > 0 &&
      this.options.length > 0
    ) {
      return;
    }

    fetchFilters(this.context, this.store.$filtersService);
  }
}

async function fetchFilters(context: ActionContext<ThisType<any>, any>, service: FiltersService) {
  const response = await service.all();

  context.commit('setBrands', response.brands);
  context.commit('setCategories', response.categories);
  context.commit('setColors', response.colors);
  context.commit('setMoods', response.moods);
  context.commit('setOccasions', response.occasions);
  context.commit('setOptions', response.options);
  context.commit('setModes', response.options);

  context.commit('markFiltersAsFetched');
}
