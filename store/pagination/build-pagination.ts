import _ from 'lodash';

import { CachedSprinklerPool, CachedSprinklerPools } from '../sprinklers';
import { PaginationData } from '../pagination';
import { IProduct } from '~/types/product/product';
import { SprinklerPool } from '~/types/query/response';
import { QueryStatus } from '~/types/query/status.enum';
import { initialQueryParameters } from '~/types/query/query';
import { QueryService } from '~/services/query/query.service';

export async function buildPagination({
  cachedProductIdentifiers,
  currentCheckpoint,
  existingTracking,
  queryIdentifier,
  existingProducts,
  queryService,
  currentPage,
  sprinklers,
  pageSize,
  maxPages
}: BuildPaginationPayload) {
  const paginationStart = performance.now();
  logDebug('buildPagination', `Received request to build ${maxPages} pages of size ${pageSize}`);

  let expires: Date = existingTracking && existingTracking.expires ? new Date(existingTracking.expires) : new Date();
  const products: number[] = existingProducts && expires > new Date() ? [...existingProducts] : [];

  // If we are building the products from fresh, set the expiry to 4 hours from now
  if (products.length === 0) {
    const now = new Date();
    expires = new Date(now.setUTCHours(now.getUTCHours() + 4));
  }

  // Ensure the current products are all marked as allocated
  sprinklers = __markProductsAsAllocated(sprinklers, products);

  let firstFetch = true;
  const productsToCache: IProduct[] = [];
  const currentProductsSet = new Set(products);

  // Repeatedly fetch and allocate products until we reach the desired maximum page, or run out of products
  while ((currentCheckpoint || firstFetch) && products.length < maxPages * pageSize) {
    firstFetch = false;

    const pagesNeeded = maxPages - Math.floor(products.length / pageSize);
    logDebug('buildPagination', `${pagesNeeded} pages remaining to build`);

    // Ensure each sprinkler pool with has_more has on average enough products for the query
    if (__sprinklerRunningLow(sprinklers, pagesNeeded)) {
      logDebug('buildPagination', 'Sprinklers are running low, fetching more');
      const response = await __fetchMore(queryIdentifier, currentCheckpoint, queryService);

      currentCheckpoint = response.nextCheckpoint;
      productsToCache.push(...response.newProducts);
      sprinklers = __addProductsToSprinklers(sprinklers, response.newSprinklers);
    }

    const weights: number[] = [];
    const identifiers: number[][] = [];
    const moreProductsAvailable: boolean[] = [];
    let totalAvailableProducts = 0;

    Object.values(sprinklers).forEach((pool: CachedSprinklerPool) => {
      if (pool.availableProducts.size) {
        weights.push(pool.weight);
        identifiers.push([...pool.availableProducts]);
        moreProductsAvailable.push(pool.has_more);

        totalAvailableProducts += pool.availableProducts.size;
      }
    });

    logDebug('buildPagination', `Pools have ${totalAvailableProducts} available products before pagination`);

    // There are no more products left for the query
    if (totalAvailableProducts === 0) {
      logDebug('buildPagination', 'No available products remaining for query, stopping pagination');
      break;
    }

    const newProducts = __buildWeightedProductOrder(
      weights,
      identifiers,
      moreProductsAvailable,
      maxPages * pageSize - products.length
    );

    // Mark the products as allocated
    sprinklers = __markProductsAsAllocated(sprinklers, newProducts);
    const uniqueProducts = newProducts.filter((product) => !currentProductsSet.has(product));

    if (uniqueProducts.length < newProducts.length) {
      logDebug(
        'buildPagination',
        `${
          newProducts.length - uniqueProducts.length
        } allocated products already exist in the pagination, discarding them`
      );
    }

    // There are no more non-duplicate products left for the query
    if (uniqueProducts.length === 0) {
      logDebug('buildPagination', 'No non-duplicate products remaining for query, stopping pagination');
      break;
    }

    // Assign unique products to the query result
    uniqueProducts.forEach((product) => {
      products.push(product);
      currentProductsSet.add(product);
    });

    // Mark product data in the query as cached
    productsToCache.forEach((product) => cachedProductIdentifiers.add(parseInt(product.identifier)));

    logDebug('buildPagination', `Allocated ${products.length} products out of ${maxPages * pageSize} desired`);
  }

  const cacheMisses: number[] = products.filter((product) => !cachedProductIdentifiers.has(product));

  if (cacheMisses.length) {
    logDebug('buildPagination', `Detected ${cacheMisses.length} cache misses after allocation:`);

    for (const productChunk of _.chunk(cacheMisses, 100)) {
      const fetchedMisses = await __fetchCacheMisses(productChunk, queryService);
      productsToCache.push(...fetchedMisses);
    }

    logDebug('buildPagination', 'Fetched cache misses');
  }

  const lastAvailablePage = Math.ceil(products.length / pageSize);
  currentPage = Math.min(lastAvailablePage, currentPage);

  const paginationStop = performance.now();

  logDebug(
    'buildPagination',
    `Built pagination of ${products.length} products in ${paginationStop - paginationStart}ms`
  );

  return { products, expires, currentPage, sprinklers, productsToCache };
}

async function __fetchMore(identifier: string, checkpoint: string | undefined, queryService: QueryService) {
  let newProducts: IProduct[] = [];
  let newSprinklers: SprinklerPool[] = [];
  let nextCheckpoint: string | undefined = '';

  while (true) {
    const response = await __fetchQuery(queryService, identifier, checkpoint);

    if (![QueryStatus.PENDING, QueryStatus.PROCESSING].includes(response.status)) {
      newProducts = response.products;
      newSprinklers = response.pools;
      nextCheckpoint = response.checkpoint;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return { newProducts, newSprinklers, nextCheckpoint };
}

function __addProductsToSprinklers(sprinklers: CachedSprinklerPools, pools: SprinklerPool[]) {
  for (const pool of pools) {
    sprinklers[pool.identifier].has_more = pool.has_more;

    for (const product of pool.order) {
      if (!sprinklers[pool.identifier].allocatedProducts.has(product)) {
        sprinklers[pool.identifier].availableProducts.add(product);
      }
    }
  }

  return sprinklers;
}

function __markProductsAsAllocated(sprinklers: CachedSprinklerPools, products: number[]) {
  Object.values(sprinklers).forEach((pool) => {
    for (const product of products) {
      if (pool.availableProducts.has(product)) {
        pool.availableProducts.delete(product);
        pool.allocatedProducts.add(product);
      }
    }
  });

  return sprinklers;
}

function __sprinklerRunningLow(sprinklers: CachedSprinklerPools, minimumPages: number) {
  const pools = Object.entries(sprinklers);

  let runningLow = false;

  for (const [identifier, pool] of pools) {
    if (!pool.has_more) {
      continue;
    }

    if (pools.length === 1 && pool.weight === 0 && pool.availableProducts.size < 30) {
      logDebug('sprinklerRunningLow', `0 weighted pool ${identifier} is running low`);
      return true;
    }

    if (pool.weight !== 0 && pool.availableProducts.size < minimumPages * pool.weight) {
      logDebug(
        'sprinklerRunningLow',
        `${decodeURIComponent(identifier)} of weight ${pool.weight} has ${
          pool.availableProducts.size
        } products, wanted ${minimumPages * pool.weight}`
      );

      runningLow = true;
    }
  }

  return runningLow;
}

function __buildWeightedProductOrder(
  weights: number[],
  products: number[][],
  moreProductsAvailable: boolean[],
  maximum: number
): number[] {
  logDebug('buildWeightedProductOrder', `Received ${weights.length} weights for ${products.length} pools to allocate`);

  const orderedProducts: Set<number> = new Set();
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  weights =
    totalWeight > 0 ? weights.map((weight) => weight / totalWeight) : Array(products.length).fill(1 / products.length);

  while (products.length > 0 && orderedProducts.size < maximum) {
    const choice = Math.random();

    let chosenList = 0;
    let cumulativeProbability = 0;

    // Pick a random list to take the next item from
    for (let i = 0; i < weights.length; i++) {
      if (choice >= cumulativeProbability && choice <= cumulativeProbability + weights[i]) {
        chosenList = i;
        break;
      }

      cumulativeProbability += weights[i];
    }

    // Take the next item from the chosen list
    const chosenProduct = products[chosenList].shift() as number;
    if (!orderedProducts.has(chosenProduct)) {
      orderedProducts.add(chosenProduct);
    }

    // If the chosen pool still has products, there is no need to fetch more
    if (products[chosenList].length > 0) {
      continue;
    }

    // If the chosen pool is now empty, remove it and re-scale probabilites
    if (!moreProductsAvailable[chosenList]) {
      logDebug(
        'buildWeightedProductOrder',
        'Pool ran out of products while paginating but has_more not set, so continuing paginating'
      );

      weights.splice(chosenList, 1);
      products.splice(chosenList, 1);

      const totalWeight = weights.reduce((a, b) => a + b, 0);
      weights = weights.map((weight) => weight / totalWeight);
    }

    // Otherwise, stop pagination to allow more products to be fetched
    else {
      logDebug(
        'buildWeightedProductOrder',
        'Pool ran out of products and has_more set, halting pagination to retrieve more products'
      );
      return Array.from(orderedProducts.values());
    }
  }

  if (products.length === 0) {
    logDebug('buildWeightedProductOrder', 'Ran out of products while paginating');
  } else {
    logDebug('buildWeightedProductOrder', `Reached maximum required products of ${maximum} while paginating`);
  }

  return Array.from(orderedProducts.values());
}

async function __fetchCacheMisses(products: number[], queryService: QueryService) {
  const response = await queryService.store({ ...initialQueryParameters(), products });

  return response.products as IProduct[];
}

async function __fetchQuery(queryService: QueryService, identifer: string, checkpoint: string | undefined = '') {
  const response = await queryService.fetch(identifer, checkpoint);

  return response;
}

function logDebug(context: string, message: string) {
  if (process.env.PAGINATION_DEBUG_ENABLED && ['true', '1'].includes(process.env.PAGINATION_DEBUG_ENABLED)) {
    console.log(`[${context}] ${message}`);
  }
}

// Send to the worker function by the pagination store
export interface BuildPaginationPayload {
  maxPages: number;
  pageSize: number;
  currentPage: number;
  queryIdentifier: string;
  queryService: QueryService;
  currentCheckpoint?: string;
  existingProducts: number[];
  existingTracking: PaginationData;
  sprinklers: CachedSprinklerPools;
  cachedProductIdentifiers: Set<number>;
}

// Sent back to the pagination store
export interface BuildPaginationResponse {
  expires: Date;
  products: number[];
  currentPage: number;
  sprinklers: CachedSprinklerPools;
  productsToCache: IProduct[];
}
