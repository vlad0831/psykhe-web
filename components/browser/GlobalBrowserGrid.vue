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
        :query-identifier="queryIdentifier"
        :style="`z-index: ${products.length - index}`"
        page-type="browse"
      />
    </transition-group>

    <div v-else class="psykhe-browse-grid">
      <p>No products currently match your selection.</p>
    </div>

    <pagination v-if="showPagination" :query-identifier="queryIdentifier" />
  </loader>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';
import { queryStore, paginationStore } from '~/store';
import { productsStore, filterStore, routerStore } from '~/utils/store-accessor';

import { LoaderState } from '~/types/loader-states';
import { QueryStatus } from '~/types/query/status.enum';
import { QueryLinkService } from '~/services/query/query-link.service';
import { buildQueryFromRoute } from '~/store/query';

import Loader from '~/components/common/Loader.vue';
import RemoveParent from '~/utils/remove-parent-directive';
import Pagination from '~/components/browser/filters/Pagination.vue';
import BrowserGridItem from '~/components/browser/BrowserGridItem.vue';
import BrowserFilter from '~/components/browser/filters/BrowserFilter.vue';

@Component({
  directives: { RemoveParent },
  components: { BrowserGridItem, Pagination, BrowserFilter, Loader }
})
export default class GlobalBrowserGrid extends Vue {
  @Prop({ required: true, type: Boolean })
  readonly zappingEnabled!: boolean;

  @Prop({ required: true, type: Number })
  readonly pageSize!: number;

  @Prop({ required: false, type: Boolean, default: false })
  readonly expireAlways!: boolean;

  temporaryFailureMessage: string = '';
  permanentFailureMessage: string = '';

  queryCount: number = 0;
  retryAttempts: number = 0;

  @Watch('loadingState', { immediate: true })
  onLoadingStateChange(state: LoaderState) {
    if (state !== LoaderState.LOADED || routerStore.historySize === 0) {
      return;
    }

    if (routerStore.previousRoute?.name === 'browse-merchant-brand-slug-id') {
      routerStore.popRouteFromHistory();
      const previousRoute = routerStore.previousRoute;
      const scrollPosition = routerStore.previousScrollPosition;

      if (
        scrollPosition &&
        previousRoute.query.page === this.$route.query.page &&
        _.isEqual(buildQueryFromRoute(previousRoute, filterStore.categories), queryStore.getGlobalQueryParameters)
      ) {
        this.$nextTick(() => window.scrollTo(scrollPosition.scrollX, scrollPosition.scrollY));
      }
    }
  }

  @Watch('$route', { immediate: true })
  async onRouteChange(to: any, from: any) {
    this.startQueryTimer();

    // If only the current page has changed, there is no need to modify the query
    if (
      to &&
      from &&
      to.name === from.name &&
      _.isEqual(to.params, from.params) &&
      _.isEqual({ ...to.query, page: 0 }, { ...from.query, page: 0 })
    ) {
      return;
    }

    this.retryAttempts = 0;
    this.cancelPendingRequests();

    // If any filter is invalid
    if (!filterStore.routeHasValidFilters(this.$route)) {
      window.location.href = '/404';
    }

    // Every time the route changes, check for filter changes from the route
    await queryStore.updateGlobalQueryFromRoute(this.$route);
    const cachedQueryIdentifier = queryStore.getQueryByParameters(
      queryStore.getGlobalQueryParameters,
      this.$auth?.user?.identifier
    );

    // If the query is already cached, there is no need to fetch it again
    if (
      !this.expireAlways &&
      cachedQueryIdentifier &&
      paginationStore.getPaginationReady(cachedQueryIdentifier) &&
      paginationStore.getPageSize(cachedQueryIdentifier) === this.pageSize &&
      !paginationStore.paginationExpired(cachedQueryIdentifier)
    ) {
      queryStore.setGlobalQueryIdentifier(cachedQueryIdentifier);

      paginationStore.buildPagination({
        pageSize: this.pageSize,
        queryIdentifier: cachedQueryIdentifier,
        currentPage: to.query.page ? parseInt(to.query.page) : 1,
        maxPages: to.query.page ? Math.min(parseInt(to.query.page) + 5, 30) : 6
      });

      queryStore.setPaginationReady(cachedQueryIdentifier);
      return;
    }

    this.fetchQuery(to.query.page ? Math.min(parseInt(to.query.page) + 5, 30) : 6);
  }

  async fetchQuery(maxPages: number) {
    const currentCount = this.queryCount.valueOf();

    try {
      const response = await queryStore.fetchGlobalQuery(this.$auth?.user?.identifier);

      // If no identifier was returned, we cannot build the pagination
      // An empty response here may mean the initial query returned as expired
      if (!response || !('identifier' in response || 'query' in response)) {
        throw new Error('query response is empty');
      }

      // If the response is pending, the query was cancelled mid fetch, so do nothing
      if (response.status === QueryStatus.PENDING) {
        return;
      }

      // If the query was redirected, navigate to the new query
      if (response.status === QueryStatus.REDIRECT) {
        this.$router.push(QueryLinkService.getInstance().createLinkFromQuery(response.query, null));
        return;
      }

      // If a status of expired was received while polling the query, try to fetch it again
      if (response.status === QueryStatus.EXPIRED) {
        if (this.retryAttempts < 5) {
          this.retryAttempts++;
          this.fetchQuery(maxPages);
        }

        return;
      }

      // If requested, clear any cached pagination for this query before building it
      if (this.expireAlways && this.queryIdentifier) {
        await paginationStore.expireQuery(this.queryIdentifier);
      }

      // Build the pagination, setting the current page from the URL if available
      paginationStore.buildPagination({
        maxPages,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        queryIdentifier: response.identifier
      });
    } catch (error) {
      if (this.queryCount === currentCount) {
        this.retryAttempts = Number.MAX_SAFE_INTEGER;
      }
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
        if (this.queryIdentifier) {
          queryStore.cancelQuery(this.queryIdentifier);
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
    if (this.queryIdentifier) {
      queryStore.cancelQuery(this.queryIdentifier);
    }

    // Otherwise, cancel store requests for the current query parameters
    else if (queryStore.getGlobalQueryParameters) {
      this.$queryService.cancelQueryStore(queryStore.getGlobalQueryParameters);
    }
  }

  get loadingState() {
    if (this.retryAttempts >= 5 || this.permanentFailureMessage) {
      return LoaderState.PERMANENT_FAILURE;
    }

    if (!this.queryIdentifier) {
      return this.temporaryFailureMessage ? LoaderState.TEMPORARY_FAILURE : LoaderState.LOADING;
    }

    if (queryStore.getQueryStatus(this.queryIdentifier) === QueryStatus.ERROR) {
      return LoaderState.PERMANENT_FAILURE;
    }

    if (
      !queryStore.getQueryReady(this.queryIdentifier) ||
      !paginationStore.getPaginationReady(this.queryIdentifier) ||
      paginationStore.paginationExpired(this.queryIdentifier) ||
      paginationStore.getPageSize(this.queryIdentifier) !== this.pageSize ||
      paginationStore
        .getCurrentPageProducts(this.queryIdentifier)
        .some((product) => product === null || !productsStore.identifierCache.has(product))
    ) {
      return this.temporaryFailureMessage ? LoaderState.TEMPORARY_FAILURE : LoaderState.LOADING;
    }

    return LoaderState.LOADED;
  }

  get showPagination() {
    return this.queryIdentifier ? paginationStore.getMaxAvailablePageNumber(this.queryIdentifier) > 1 : false;
  }

  get products() {
    return this.queryIdentifier ? paginationStore.getCurrentPageProducts(this.queryIdentifier) : [];
  }

  get currentPage() {
    return this.$route.query.page && !Array.isArray(this.$route.query.page) ? parseInt(this.$route.query.page) : 1;
  }

  get queryIdentifier() {
    return queryStore.getGlobalQueryIdentifier;
  }
}
</script>
