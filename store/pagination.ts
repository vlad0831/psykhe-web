import { Module, VuexModule, Mutation, Action, config } from 'vuex-module-decorators';
import { buildPagination, BuildPaginationResponse } from './pagination/build-pagination';
import { CachedSprinklerPools } from './sprinklers';

import { productsStore, queryStore, sprinklersStore } from '~/utils/store-accessor';

import _ from 'lodash';
import Vue from 'vue';

config.rawError = true;

@Module({
  namespaced: true,
  name: 'pagination',
  stateFactory: true
})
export default class PaginationModuleModule extends VuexModule {
  // State
  cache: PaginationCache = {};
  tracking: PaginationTracking = {};

  queuedBlacklistReplacement = false;

  // Getters
  get getPaginationReady() {
    return (queryIdentifier: string) =>
      queryIdentifier in this.tracking ? this.tracking[queryIdentifier].ready : false;
  }

  get getCurrentPageNumber() {
    return (queryIdentifier: string) => (queryIdentifier in this.tracking ? this.tracking[queryIdentifier].page : 1);
  }

  get getMaxAvailablePageNumber() {
    return (queryIdentifier: string) =>
      queryIdentifier in this.cache
        ? Math.ceil(this.cache[queryIdentifier].length / this.tracking[queryIdentifier].pageSize)
        : 0;
  }

  get getPageSize() {
    return (queryIdentifier: string) =>
      queryIdentifier in this.tracking ? this.tracking[queryIdentifier].pageSize : 30;
  }

  get getCurrentPageProducts() {
    return (queryIdentifier: string) => {
      const products = this.cache[queryIdentifier];
      const tracking = this.tracking[queryIdentifier];

      if (!products) {
        return [];
      }

      if (products.length === 0) {
        return [];
      }

      if (products.length < (tracking.page - 1) * tracking.pageSize + 1) {
        return [];
      }

      const start = (tracking.page - 1) * tracking.pageSize;
      const stop = Math.min(start + tracking.pageSize, products.length);

      return products.slice(start, stop);
    };
  }

  get paginationExpired() {
    return (queryIdentifier: string) =>
      queryIdentifier in this.tracking && this.tracking[queryIdentifier].expires < new Date();
  }

  // Mutations
  @Mutation
  setQueuedBlacklistReplacement(payload: boolean) {
    this.queuedBlacklistReplacement = payload;
  }

  @Mutation
  setPaginationProducts({ queryIdentifier, products }: SetPaginationProductsPayload) {
    Vue.set(this.cache, queryIdentifier, products);
  }

  @Mutation
  setPaginationTracking({ queryIdentifier, tracking }: SetPaginationTrackingPayload) {
    Vue.set(this.tracking, queryIdentifier, tracking);
  }

  @Action
  removeProduct({ queryIdentifier, productIdentifier }: RemoveProductPayload) {
    const existingProducts = this.cache[queryIdentifier];

    if (!existingProducts) {
      return;
    }

    this.context.commit('setPaginationProducts', {
      queryIdentifier,
      products: existingProducts.filter((product) => product !== productIdentifier)
    });
  }

  @Action
  setCurrentPage({ page, queryIdentifier }: SetPagePayload) {
    if (!(queryIdentifier in this.tracking)) {
      return;
    }

    const tracking = { ...this.tracking[queryIdentifier] };
    tracking.page = page;

    this.context.commit('setPaginationTracking', { queryIdentifier, tracking });
  }

  @Action
  expireQuery(queryIdentifier: string) {
    if (!(queryIdentifier in this.tracking)) {
      return;
    }

    const tracking = { ...this.tracking[queryIdentifier] };
    tracking.expires = new Date();

    this.context.commit('setPaginationTracking', { queryIdentifier, tracking });
  }

  @Action
  markPaginationAsNotReady(queryIdentifier: string) {
    if (!(queryIdentifier in this.tracking)) {
      return;
    }

    const tracking = { ...this.tracking[queryIdentifier] };
    tracking.ready = false;

    this.context.commit('setPaginationTracking', { queryIdentifier, tracking });
  }

  @Action
  async buildPagination({ queryIdentifier, maxPages, pageSize, currentPage }: BuildPaginationPayload) {
    const existingTracking: PaginationData = this.tracking[queryIdentifier];
    const existingProducts: number[] = this.cache[queryIdentifier] || [];

    // Immediately mark the query as ready if:
    //  - The query has not expired
    //  - Product data is available for all the cached products
    //  - There are sufficient cached products to display the current page
    if (
      existingTracking &&
      existingTracking.expires &&
      existingTracking.expires > new Date() &&
      existingProducts.length >= pageSize * currentPage &&
      !existingProducts.some((product) => !(product in productsStore.getCachedProducts))
    ) {
      this.context.commit('setPaginationTracking', {
        queryIdentifier,
        tracking: { expires: existingTracking.expires, pageSize, page: currentPage, ready: true, fetching: true }
      });
    }

    // Collect the data required for the worker to process
    const response: BuildPaginationResponse = await buildPagination({
      maxPages,
      pageSize,
      currentPage,
      queryIdentifier,
      existingProducts,
      existingTracking,
      queryService: this.store.$queryService,
      sprinklers: _.cloneDeep(sprinklersStore.getCachedSprinklers(queryIdentifier)),
      currentCheckpoint: queryStore.getQueryCheckpoint(queryIdentifier),
      cachedProductIdentifiers: new Set(productsStore.cachedIdentifiers)
    });

    if (response.productsToCache) {
      this.context.commit('products/addProductsToCache', response.productsToCache, { root: true });
    }

    this.context.commit('setPaginationProducts', { queryIdentifier, products: response.products });

    this.context.commit('setPaginationTracking', {
      queryIdentifier,
      tracking: { expires: response.expires, pageSize, page: response.currentPage, ready: true, fetching: false }
    });

    this.context.commit(
      'sprinklers/overwriteSprinklers',
      { ...sprinklersStore.cachedSprinklers, [queryIdentifier]: response.sprinklers },
      { root: true }
    );

    // If there are blacklisted products in the pagination result, deal with them
    if (response.products.filter((product) => product in productsStore.blacklistedProducts).length) {
      this.replaceBlacklistedProducts(queryIdentifier);
    }

    // If a blacklist replace was requested during the above call, replace the blacklisted products again
    if (this.queuedBlacklistReplacement) {
      this.replaceBlacklistedProducts(queryIdentifier);
    }
  }

  @Action
  async replaceBlacklistedProducts(queryIdentifier: string) {
    // If a replacement was queued before this method was called, we will be satisfying it
    if (this.queuedBlacklistReplacement) {
      this.context.commit('setQueuedBlacklistReplacement', false);
    }

    // If a replacement was requested while products are still being fetched, queue it for later
    if (this.tracking[queryIdentifier].fetching) {
      this.context.commit('setQueuedBlacklistReplacement', true);
      return;
    }

    let products = [...this.cache[queryIdentifier]];
    const expires = this.tracking[queryIdentifier].expires.valueOf();
    const currentPage = this.tracking[queryIdentifier].page.valueOf();
    const pageSize = this.tracking[queryIdentifier].pageSize.valueOf();

    const blacklistedProducts = new Set(products.filter((product) => product in productsStore.getBlacklistedProducts));
    let sprinklers: CachedSprinklerPools = this.context.rootGetters['sprinklers/getCachedSprinklers'](queryIdentifier);

    logDebug(
      'replaceBlacklistedProducts',
      `Started replacing ${blacklistedProducts.size} blacklisted products: ` + [...blacklistedProducts].join(', ')
    );

    // Products that were allocated from the sprinkler pools as a replacement
    const allocatedProducts = [];

    // Array of blacklisted products that were removed from the pagination
    const replacedProducts: number[] = [];

    const allSprinklers = Object.keys(sprinklers);
    const productsSet: Set<number> = new Set(products);

    for (const blacklistedProduct of blacklistedProducts) {
      logDebug('replaceBlacklistedProducts', `Attempting to find replacement for ${blacklistedProduct}`);

      const sprinklersForProduct = sprinklersStore.sprinklersForProduct(queryIdentifier, blacklistedProduct);
      const candidateSprinklers = allSprinklers.filter((sprinkler) => !sprinklersForProduct.includes(sprinkler));

      const productPage = Math.ceil((products.indexOf(blacklistedProduct) + 1) / pageSize);

      const replacementFromPagination = products
        .slice(productPage * pageSize)
        .find(
          (product) =>
            !sprinklersStore
              .sprinklersForProduct(queryIdentifier, product)
              .some((sprinkler) => !candidateSprinklers.includes(sprinkler))
        );

      // If a suitable replacement product is found on a page after the blacklisted product, use it as a replacement
      if (replacementFromPagination) {
        products = products.filter((product) => product !== replacementFromPagination);
        products[products.indexOf(blacklistedProduct)] = replacementFromPagination;

        logDebug(
          'replaceBlacklistedProducts',
          `Product ${replacementFromPagination} from pagination is an appropriate replacement for ${blacklistedProduct}, using it`
        );

        blacklistedProducts.delete(blacklistedProduct);
        replacedProducts.push(blacklistedProduct);
        break;
      }

      const pools = Object.values(sprinklers);

      // Otherwise, attempt to retrieve an unallocated product from the existing sprinkler pools
      for (const pool of shuffleArray(pools)) {
        if (!pool.availableProducts.size) {
          continue;
        }

        // Don't consider the fallback pool if there are other pools available
        if (pool.weight === 0 && pools.length > 1) {
          continue;
        }

        const replacementProduct = pool.availableProducts.values().next().value;

        if (productsSet.has(replacementProduct)) {
          continue;
        }

        logDebug(
          'replaceBlacklistedProducts',
          `Product ${replacementProduct} from sprinkler pools is an appropriate replacement for ${blacklistedProduct}, using it`
        );

        allocatedProducts.push(replacementProduct);
        pool.availableProducts.delete(replacementProduct);
        products[products.indexOf(blacklistedProduct)] = replacementProduct;

        productsSet.add(replacementProduct);
        productsSet.delete(blacklistedProduct);
        blacklistedProducts.delete(blacklistedProduct);
        break;
      }
    }

    logDebug(
      'replaceBlacklistedProducts',
      `Initial blacklist replacements completed, comitting ${products.length} products...`
    );

    this.context.commit('setPaginationProducts', { queryIdentifier, products });

    if (allocatedProducts.length) {
      sprinklersStore.markProductsAsAllocated({ queryIdentifier, productIdentifiers: [...allocatedProducts] });
    }

    sprinklers = this.context.rootGetters['sprinklers/getCachedSprinklers'](queryIdentifier);

    // Ensure sprinklers are not running low before looking for replacements
    if (
      sprinklersStore.queryHasSprinklerRunningLow(
        queryIdentifier,
        Math.ceil((blacklistedProducts.size + replacedProducts.length) / allSprinklers.length)
      )
    ) {
      logDebug('replaceBlacklistedProducts', 'Found an empty query pool, fetching more products');
      await queryStore.fetchMoreProducts(queryIdentifier);
    }

    let updatedProducts = [...products];
    const updatedProductsSet: Set<number> = new Set(updatedProducts);

    const consumedReplacements: Set<number> = new Set();

    // Replace the products that are still blacklisted, and add a new products to the end of the pagination
    // for every time that a product was taken as a replacement
    for (const product of [...blacklistedProducts, ...replacedProducts]) {
      let foundReplacement = false;
      const pools = Object.values(sprinklers);

      for (const pool of shuffleArray(pools)) {
        if (foundReplacement) {
          break;
        }

        // Don't consider the fallback pool if there are other pools available
        if (pool.weight === 0 && pools.length > 1) {
          continue;
        }

        for (const availableProduct of pool.availableProducts) {
          if (updatedProductsSet.has(availableProduct) || consumedReplacements.has(availableProduct)) {
            continue;
          }

          logDebug('replaceBlacklistedProducts', `Using ${availableProduct} to replenish replaced product`);

          // We are replacing a product that is still in the blacklist...
          if (blacklistedProducts.has(product)) {
            updatedProducts[updatedProducts.indexOf(product)] = availableProduct;
            blacklistedProducts.delete(product);
          }

          // We are adding a replacement to the end of the pagination as a replenishment...
          else {
            updatedProducts.push(availableProduct);
          }

          consumedReplacements.add(availableProduct);
          foundReplacement = true;
          break;
        }
      }
    }

    // Mark the products  used as replenishments as allocated
    sprinklersStore.markProductsAsAllocated({ queryIdentifier, productIdentifiers: Array.from(consumedReplacements) });

    // If there are still blacklisted products left, there is likely no more products left for the query, so just remove the product
    if (blacklistedProducts.size !== 0) {
      logDebug(
        'replaceBlacklistedProducts',
        `${blacklistedProducts.size} unreplaced blacklisted products still remain, removing them from the pagination`
      );

      for (const blacklistedProduct of blacklistedProducts) {
        updatedProducts = updatedProducts.filter((product) => product !== blacklistedProduct);
      }
    }

    logDebug(
      'replaceBlacklistedProducts',
      `Final blacklist replacements completed, comitting ${updatedProducts.length} products...`
    );

    this.context.commit('setPaginationProducts', { queryIdentifier, products: updatedProducts });
    this.context.commit('setPaginationTracking', {
      queryIdentifier,
      tracking: { expires, pageSize, page: currentPage, ready: true, fetching: false }
    });
  }
}

/**
 * Randomly shuffles the provided array.
 *
 * @param array The array to shuffle
 * @returns The shuffled input array
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function logDebug(context: string, message: string) {
  if (process.env.PAGINATION_DEBUG_ENABLED && ['true', '1'].includes(process.env.PAGINATION_DEBUG_ENABLED)) {
    console.log(`[${context}] ${message}`);
  }
}

export interface PaginationCache {
  // Query identifier
  [key: string]: number[];
}

export interface PaginationTracking {
  // Query identifier
  [key: string]: PaginationData;
}

export interface PaginationData {
  page: number;
  expires: Date;
  ready: boolean;
  fetching: boolean;
  pageSize: number;
}

export interface SetPaginationProductsPayload {
  products: number[];
  queryIdentifier: string;
}
export interface SetPaginationTrackingPayload {
  tracking: PaginationData;
  queryIdentifier: string;
}

export interface BuildPaginationPayload {
  maxPages: number;
  pageSize: number;
  currentPage: number;
  queryIdentifier: string;
}

export interface SetPagePayload {
  page: number;
  queryIdentifier: string;
}

export interface RemoveProductPayload {
  queryIdentifier: string;
  productIdentifier: number;
}
