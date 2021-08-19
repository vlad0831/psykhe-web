<template>
  <loader
    :state="loadingState"
    :temporary-failure-message="temporaryFailureMessage"
    :permanent-failure-message="permanentFailureMessage"
    class="psykhe-browse-grid-container"
  >
    <div v-if="zappingEnabled">
      <div class="key-container">
        <b>refine your feed</b>
        <img class="img-dislike" src="/media/icon/dislike.svg" /> Not for me
        <img class="img-like" src="/media/icon/like.svg" /> Love
      </div>
    </div>

    <transition-group
      v-if="products.length !== 0"
      tag="div"
      name="grid"
      class="psykhe-browse-grid psykhe-grid psykhe-grid-3"
    >
      <browser-grid-item
        v-for="(product, index) in products"
        :key="product"
        :position="index"
        :product-identifier="product"
        :is-first-product="index === 0"
        :zapping-enabled="zappingEnabled"
        :query-identifier="customQueryIdentifier"
        :style="`z-index: ${products.length - index}`"
        page-type="ymal"
      />
    </transition-group>

    <div v-else class="psykhe-browse-grid">
      <p>No products currently match your selection.</p>
    </div>
  </loader>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';
import { queryStore, paginationStore } from '~/store';
import { productsStore } from '~/utils/store-accessor';

import { LoaderState } from '~/types/loader-states';
import { QueryStatus } from '~/types/query/status.enum';
import { QueryParameters } from '~/types/query/query';

import Loader from '~/components/common/Loader.vue';
import RemoveParent from '~/utils/remove-parent-directive';
import Pagination from '~/components/browser/filters/Pagination.vue';
import BrowserGridItem from '~/components/browser/BrowserGridItem.vue';
import BrowserFilter from '~/components/browser/filters/BrowserFilter.vue';

@Component({
  directives: { RemoveParent },
  components: { BrowserGridItem, Pagination, BrowserFilter, Loader }
})
export default class CustomBrowserGrid extends Vue {
  @Prop({ required: true, type: Boolean })
  readonly zappingEnabled!: boolean;

  @Prop({ required: true, type: Number })
  readonly pageSize!: number;

  @Prop({ required: false, type: Boolean, default: false })
  readonly expireAlways!: boolean;

  @Prop({ required: false, type: Object })
  readonly customQuery?: QueryParameters | null;

  @Prop({ required: false, type: Array })
  readonly excludedProducts?: number[];

  temporaryFailureMessage: string = '';
  permanentFailureMessage: string = '';

  queryCount: number = 0;
  retryAttempts: number = 0;

  customQueryIdentifier: string | null = null;
  activeQueryParameters: QueryParameters | null = null;

  @Watch('customQuery', { immediate: true })
  onQueryChange(customQuery: QueryParameters | null, oldQuery: QueryParameters | null) {
    if (!customQuery || _.isEqual(customQuery, oldQuery)) {
      return;
    }

    this.startQueryTimer();
    this.cancelPendingRequests();

    this.customQueryIdentifier = null;
    this.activeQueryParameters = customQuery;

    const cachedQueryIdentifier = queryStore.getQueryByParameters(customQuery, this.$auth?.user?.identifier);

    // If the query is already cached, there is no need to fetch it again
    if (
      cachedQueryIdentifier &&
      !this.expireAlways &&
      paginationStore.getPaginationReady(cachedQueryIdentifier) &&
      !paginationStore.paginationExpired(cachedQueryIdentifier)
    ) {
      this.customQueryIdentifier = cachedQueryIdentifier;

      paginationStore.buildPagination({
        maxPages: 1,
        currentPage: 1,
        queryIdentifier: cachedQueryIdentifier,
        pageSize: this.pageSize + (this.excludedProducts?.length || 0)
      });

      queryStore.setPaginationReady(cachedQueryIdentifier);
      return;
    }

    this.retryAttempts = 0;
    this.fetchQuery(customQuery);
  }

  @Watch('loadingState', { immediate: true })
  onLoadingStateChange(state: LoaderState) {
    if (state === LoaderState.LOADED) {
      this.$emit('loaded');
    }
  }

  async fetchQuery(query: QueryParameters) {
    try {
      const response = await queryStore.fetchCustomQuery({ query, userIdentifier: this.$auth?.user?.identifier });

      // If no identifier was returned, we cannot build the pagination
      // An empty response here may mean the initial query returned as expired
      if (!response || !('identifier' in response)) {
        this.retryAttempts = Number.MAX_SAFE_INTEGER;
        return;
      }

      // If the response is pending, the query was cancelled mid fetch, so do nothing
      if (response.status === QueryStatus.PENDING) {
        return;
      }

      // If a status of expired was received while polling the query, try to fetch it again
      if (response.status === QueryStatus.EXPIRED) {
        if (this.retryAttempts < 5) {
          this.retryAttempts++;
          this.fetchQuery(query);
        }

        return;
      }

      this.customQueryIdentifier = response.identifier;

      // If requested, clear any cached pagination for this query before building it
      if (this.expireAlways) {
        paginationStore.expireQuery(this.customQueryIdentifier);
      }

      // Build the pagination, setting the current page from the URL if available
      paginationStore.buildPagination({
        maxPages: 1,
        currentPage: 1,
        pageSize: this.pageSize + (this.excludedProducts?.length || 0),
        queryIdentifier: this.customQueryIdentifier
      });
    } catch (error) {
      this.retryAttempts = Number.MAX_SAFE_INTEGER;
    }
  }

  startQueryTimer() {
    this.queryCount++;
    this.temporaryFailureMessage = '';
    this.permanentFailureMessage = '';

    const currentCount = this.queryCount.valueOf();

    setTimeout(() => {
      // Ensure we are still fetching the same query as before
      if (this.queryCount !== currentCount) {
        return;
      }

      if ([LoaderState.LOADING, LoaderState.TEMPORARY_FAILURE].includes(this.loadingState)) {
        this.temporaryFailureMessage = "We're using your results to find your matches...";
      }
    }, 2000);

    setTimeout(() => {
      // Ensure we are still fetching the same query as before
      if (this.queryCount !== currentCount) {
        return;
      }

      if ([LoaderState.LOADING, LoaderState.TEMPORARY_FAILURE].includes(this.loadingState)) {
        this.temporaryFailureMessage =
          'Hang on, the system is taking a little longer than usual to retrieve your matches.';
      }
    }, 10000);

    setTimeout(() => {
      // Ensure we are still fetching the same query as before
      if (this.queryCount !== currentCount) {
        return;
      }

      if ([LoaderState.LOADING, LoaderState.TEMPORARY_FAILURE].includes(this.loadingState)) {
        if (this.customQueryIdentifier) {
          queryStore.cancelQuery(this.customQueryIdentifier);
        }

        this.cancelPendingRequests();
        this.permanentFailureMessage =
          "The system is taking way too long to retrieve results - we're sorry and are working to fix it.";
      }
    }, 45000);
  }

  beforeDestroy() {
    this.cancelPendingRequests();
  }

  cancelPendingRequests() {
    // If a query identifier is known for the current parameters, ensure fetch requests are cancelled
    if (this.customQueryIdentifier) {
      queryStore.cancelQuery(this.customQueryIdentifier);
    }

    // Otherwise, cancel store requests for the current query parameters
    else if (this.activeQueryParameters) {
      this.$queryService.cancelQueryStore(this.activeQueryParameters);
    }
  }

  get loadingState() {
    if (this.retryAttempts >= 5 || this.permanentFailureMessage) {
      return LoaderState.PERMANENT_FAILURE;
    }

    if (!this.customQueryIdentifier) {
      return this.temporaryFailureMessage ? LoaderState.TEMPORARY_FAILURE : LoaderState.LOADING;
    }

    if (queryStore.getQueryStatus(this.customQueryIdentifier) === QueryStatus.ERROR) {
      return LoaderState.PERMANENT_FAILURE;
    }

    if (
      !queryStore.getQueryReady(this.customQueryIdentifier) ||
      !paginationStore.getPaginationReady(this.customQueryIdentifier) ||
      paginationStore.paginationExpired(this.customQueryIdentifier) ||
      paginationStore
        .getCurrentPageProducts(this.customQueryIdentifier)
        .some((product) => product === null || !productsStore.identifierCache.has(product))
    ) {
      return this.temporaryFailureMessage ? LoaderState.TEMPORARY_FAILURE : LoaderState.LOADING;
    }

    return LoaderState.LOADED;
  }

  get products() {
    if (!this.customQueryIdentifier) {
      return [];
    }

    return paginationStore
      .getCurrentPageProducts(this.customQueryIdentifier)
      .filter((product) => !(this.excludedProducts || []).includes(product))
      .slice(0, this.pageSize);
  }
}
</script>
