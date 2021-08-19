import { Module, VuexModule, Mutation, config } from 'vuex-module-decorators';
import { SprinklerPool } from '~/types/query/response';

config.rawError = true;

@Module({
  name: 'sprinklers',
  namespaced: true,
  stateFactory: true
})
export default class SprinklersModule extends VuexModule {
  cachedSprinklers: CachedQuerySprinklers = {};

  get allSprinklers() {
    return this.cachedSprinklers;
  }

  /**
   * Retreives all sprinklers associated with the provided query.
   */
  get getCachedSprinklers() {
    return (queryIdentifier: string) => this.cachedSprinklers[queryIdentifier];
  }

  /**
   * Determines if a product exists at all in a provided sprinkler
   */
  get sprinklerPoolHasProduct() {
    return (queryIdentifier: string, sprinklerIdentifier: string, productIdentifier: number) => {
      const sprinklers = this.cachedSprinklers[queryIdentifier];

      if (!sprinklers) {
        return false;
      }

      const pool = sprinklers[sprinklerIdentifier];

      if (!pool) {
        return false;
      }

      return pool.availableProducts.has(productIdentifier) || pool.allocatedProducts.has(productIdentifier);
    };
  }

  /**
   * Determines if a product has been allocated in a sprinkler
   */
  get sprinklerPoolHasAllocatedProduct() {
    return (queryIdentifier: string, sprinklerIdentifier: string, productIdentifier: number) => {
      const sprinklers = this.cachedSprinklers[queryIdentifier];

      if (!sprinklers) {
        return false;
      }

      const pool = sprinklers[sprinklerIdentifier];

      if (!pool) {
        return false;
      }

      return pool.allocatedProducts.has(productIdentifier);
    };
  }

  /**
   * Retrieves a list of sprinkler identifiers associated with a product for the given query.
   */
  get sprinklersForProduct() {
    return (queryIdentifier: string, productIdentifier: number) => {
      let sprinklerIdentifiers: string[] = [];
      const sprinklers = Object.entries(this.cachedSprinklers[queryIdentifier]);

      for (let [identifier, sprinkler] of sprinklers) {
        if (sprinkler.availableProducts.has(productIdentifier) || sprinkler.allocatedProducts.has(productIdentifier)) {
          sprinklerIdentifiers.push(identifier);
        }
      }

      return sprinklerIdentifiers;
    };
  }

  /**
   * Retrieves a list of sprinkler identifiers that have allocated the provided product
   */
  get allocatedSprinklersForProduct() {
    return (queryIdentifier: string, productIdentifier: number) => {
      const sprinklerIdentifiers: string[] = [];
      const sprinklers = Object.entries(this.cachedSprinklers[queryIdentifier]);

      for (const [identifier, sprinkler] of sprinklers) {
        if (sprinkler.allocatedProducts.has(productIdentifier)) {
          sprinklerIdentifiers.push(identifier);
        }
      }

      return sprinklerIdentifiers;
    };
  }

  /**
   * Determines if there is a sprinkler for the provided query that is running low
   */
  get queryHasSprinklerRunningLow() {
    return (queryIdentifier: string, minimumProductsInSprinkler: number) => {
      const sprinklers = Object.entries(this.cachedSprinklers[queryIdentifier]);

      for (let [identifier, sprinkler] of sprinklers) {
        if (sprinkler.has_more && sprinkler.availableProducts.size < minimumProductsInSprinkler) {
          return true;
        }
      }

      return false;
    };
  }

  @Mutation
  overwriteSprinklers(sprinklers: CachedQuerySprinklers) {
    this.cachedSprinklers = sprinklers;
  }

  @Mutation
  cacheSprinklerPools({ queryIdentifier, sprinklerPools }: SprinklerCachePayload) {
    const newSprinklers: CachedSprinklerPools = {};

    for (const pool of sprinklerPools) {
      newSprinklers[pool.identifier] = {
        weight: pool.weight,
        has_more: pool.has_more,
        allocatedProducts: new Set(),
        availableProducts: new Set(pool.order)
      };
    }

    this.cachedSprinklers = {
      ...this.cachedSprinklers,
      [queryIdentifier]: newSprinklers
    };
  }

  @Mutation
  addProductsToExistingPools({ queryIdentifier, sprinklerPools }: SprinklerCachePayload) {
    if (!(queryIdentifier in this.cachedSprinklers)) {
      return;
    }

    const updatedSprinklers: CachedSprinklerPools = { ...this.cachedSprinklers[queryIdentifier] };

    for (const pool of sprinklerPools) {
      updatedSprinklers[pool.identifier].has_more = pool.has_more;
      updatedSprinklers[pool.identifier].availableProducts = new Set([
        ...updatedSprinklers[pool.identifier].availableProducts,
        ...pool.order.filter((product) => !updatedSprinklers[pool.identifier].allocatedProducts.has(product))
      ]);
    }

    this.cachedSprinklers = {
      ...this.cachedSprinklers,
      [queryIdentifier]: updatedSprinklers
    };
  }

  @Mutation
  markProductsAsAllocated({ queryIdentifier, productIdentifiers }: SprinklerAllocationPayload) {
    if (!(queryIdentifier in this.cachedSprinklers)) {
      return;
    }

    const updatedSprinklers: CachedSprinklerPools = { ...this.cachedSprinklers[queryIdentifier] };

    Object.entries(updatedSprinklers).forEach(([identifier, pool]) => {
      for (const product of productIdentifiers) {
        if (pool.availableProducts.has(product)) {
          pool.availableProducts.delete(product);
          pool.allocatedProducts.add(product);
        }
      }
    });

    this.cachedSprinklers = {
      ...this.cachedSprinklers,
      [queryIdentifier]: updatedSprinklers
    };
  }
}

export interface CachedQuerySprinklers {
  // Query identifier
  [key: string]: CachedSprinklerPools;
}

export interface CachedSprinklerPools {
  // Sprinkler identifier
  [key: string]: CachedSprinklerPool;
}

export interface CachedSprinklerPool {
  weight: number;
  has_more: boolean;

  // Array of identifiers in this pool that have not been allocated to the pagination
  availableProducts: Set<number>;

  // Array of indentifiers in this pool that are already allocated to the pagination
  // We track these so the origin sprinkler(s) for a paginated product can be determined
  allocatedProducts: Set<number>;
}

export interface SprinklerCachePayload {
  queryIdentifier: string;
  sprinklerIdentifiers: string[];
  sprinklerPools: SprinklerPool[];
}

export interface SprinklerAllocationPayload {
  queryIdentifier: string;
  productIdentifiers: number[];
}
