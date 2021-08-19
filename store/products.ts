import { Module, VuexModule, Mutation, Action, config, MutationAction } from 'vuex-module-decorators';
import Vue from 'vue';
import { IProduct } from '~/types/product/product';
import { Savelist } from '~/types/savelist/savelist';

config.rawError = true;

@Module({
  name: 'products',
  namespaced: true,
  stateFactory: true
})
export default class ProductsModule extends VuexModule {
  // State
  productCache: ProductCache = {};
  identifierCache: Set<number> = new Set();
  blacklistedProducts: BlacklistedProducts = {};

  // Getters
  get cachedIdentifiers() {
    return this.identifierCache;
  }

  get getCachedProducts() {
    return this.productCache;
  }

  get getBlacklistedProducts() {
    return this.blacklistedProducts;
  }

  get productInSavelist() {
    return (product: IProduct, savelist: Savelist) => {
      if (!(parseInt(product.identifier) in this.productCache)) {
        return false;
      }

      if (!savelist.slug) {
        return false;
      }

      return this.productCache[parseInt(product.identifier)].savelists.some((value) => savelist.slug === value.slug);
    };
  }

  get productInBlacklist() {
    return (product: IProduct) => product.identifier in this.blacklistedProducts;
  }

  // Mutations
  @Mutation
  addProductsToBlacklist(payload: IProduct[]) {
    let newBlacklistedProducts: BlacklistedProducts = {};

    payload.forEach((product: IProduct) => {
      newBlacklistedProducts[parseInt(product.identifier)] = true;
    });

    // Objects are not reactive in Vue 2, so replace the original object for now
    this.blacklistedProducts = {
      ...this.blacklistedProducts,
      ...newBlacklistedProducts
    };
  }

  @Mutation
  removeProductsFromBlacklist(payload: IProduct[]) {
    let updatedBlacklist = this.blacklistedProducts;

    payload.forEach((product: IProduct) => {
      delete updatedBlacklist[parseInt(product.identifier)];
    });

    // Objects are not reactive in Vue 2, so replace the original object for now
    this.blacklistedProducts = updatedBlacklist;
  }

  @Mutation
  addProductsToCache(products: IProduct[]) {
    const updatedCache = { ...this.productCache };

    products.forEach((product) => {
      updatedCache[product.identifier] = product;
      this.identifierCache.add(parseInt(product.identifier));
    });

    this.productCache = updatedCache;
  }

  @Mutation
  addCachedProductToSavelist({ product, savelist }: SavelistModificationPayload) {
    // If the specified product is not cached, we cannot continue
    if (!(product.identifier in this.productCache)) {
      return;
    }

    // If the product is already in the specified playlist, do nothing to prevent duplicated
    if (this.productCache[parseInt(product.identifier)].savelists.some((value) => savelist.slug === value.slug)) {
      return;
    }

    const updatedSavelists = this.productCache[parseInt(product.identifier)].savelists;
    updatedSavelists.push(savelist);

    Vue.set(this.productCache[parseInt(product.identifier)], 'savelists', updatedSavelists);
  }

  @Mutation
  removeCachedProductFromSavelist({ product, savelist }: SavelistModificationPayload) {
    // If the specified product is not cached, we cannot continue
    if (!(product.identifier in this.productCache)) {
      return;
    }

    const updatedSavelists = this.productCache[parseInt(product.identifier)].savelists.filter(
      (value) => savelist.slug !== value.slug
    );

    Vue.set(this.productCache[parseInt(product.identifier)], 'savelists', updatedSavelists);
  }

  @Action
  async blacklistProducts(products: IProduct[]) {
    this.context.commit('addProductsToBlacklist', products);
  }

  @Action
  async removeBlacklistedProducts(products: IProduct[]) {
    this.context.commit('removeProductsFromBlacklist', products);
  }

  @Action
  async toggleCachedProductSavelistMembership({ product, savelist }: SavelistModificationPayload) {
    if (this.productInSavelist(product, savelist)) {
      this.context.commit('removeCachedProductFromSavelist', { product, savelist });
    } else {
      this.context.commit('addCachedProductToSavelist', { product, savelist });
    }
  }

  // Actions
  @Action
  async toggleProductSavelistMembership({ product, savelist }: SavelistModificationPayload) {
    if (!savelist.slug) {
      return;
    }

    if (this.productInSavelist(product, savelist)) {
      await this.store.$savelistProductsService.add(product, savelist);
    } else {
      await this.store.$savelistProductsService.remove(product, savelist);
    }
  }
}

export interface ProductCache {
  [key: string]: IProduct;
}

export interface BlacklistedProducts {
  [key: string]: boolean;
}

export interface SavelistModificationPayload {
  product: IProduct;
  savelist: Savelist;
}
