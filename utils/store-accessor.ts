import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

import QueryModule from '~/store/query';
import RouterModule from '~/store/router';
import FilterModule from '~/store/filter';
import OptionsModule from '~/store/options';
import ProductsModule from '~/store/products';
import SavelistsModule from '~/store/savelists';
import PaginationModule from '~/store/pagination';
import SprinklersModule from '~/store/sprinklers';

/* eslint import/no-mutable-exports: 0 */
let queryStore: QueryModule;
let filterStore: FilterModule;
let routerStore: RouterModule;
let optionsStore: OptionsModule;
let productsStore: ProductsModule;
let savelistsStore: SavelistsModule;
let paginationStore: PaginationModule;
let sprinklersStore: SprinklersModule;

function initialiseStores(store: Store<any>): void {
  queryStore = getModule(QueryModule, store);
  filterStore = getModule(FilterModule, store);
  routerStore = getModule(RouterModule, store);
  optionsStore = getModule(OptionsModule, store);
  productsStore = getModule(ProductsModule, store);
  savelistsStore = getModule(SavelistsModule, store);
  paginationStore = getModule(PaginationModule, store);
  sprinklersStore = getModule(SprinklersModule, store);
}

export {
  initialiseStores,
  queryStore,
  filterStore,
  routerStore,
  optionsStore,
  productsStore,
  savelistsStore,
  paginationStore,
  sprinklersStore
};
