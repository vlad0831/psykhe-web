<template>
  <ul class="psykhe-browse-pages">
    <li v-if="currentPage !== 1" class="psykhe-browse-pages-previous">
      <router-link :to="buildPaginationRoute(currentPage - 1)" :rel="nofollowPagination ? 'nofollow' : ''">
        PREV
      </router-link>
    </li>

    <li v-for="page in activePaginationPages" :key="page">
      <router-link
        :to="buildPaginationRoute(page)"
        :class="{ active: page === currentPage }"
        :rel="nofollowPagination ? 'nofollow' : ''"
      >
        {{ page }}
      </router-link>
    </li>

    <li v-if="currentPage !== maxPage" class="psykhe-browse-pages-next">
      <router-link :to="buildPaginationRoute(currentPage + 1)" :rel="nofollowPagination ? 'nofollow' : ''">
        NEXT
      </router-link>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'nuxt-property-decorator';
import { Route } from 'vue-router';

import _ from 'lodash';

import { queryStore, paginationStore } from '~/store';
import { QueryLinkService } from '~/services/query/query-link.service';

@Component({ scrollToTop: true })
export default class Pagination extends Vue {
  @Prop({ required: true, type: String })
  readonly queryIdentifier!: string;

  nofollowPagination: boolean = false;

  @Watch('$route')
  async onRouteChange(to: Route, from: Route) {
    window.scroll({
      top: 0,
      left: 0
    });

    if (to.query.page === from.query.page) {
      return;
    }

    await paginationStore.markPaginationAsNotReady(this.queryIdentifier);
    const requestedPage = parseInt(to.query.page as string);

    paginationStore.buildPagination({
      queryIdentifier: this.queryIdentifier,
      currentPage: parseInt(to.query.page as string) || 1,
      pageSize: paginationStore.getPageSize(this.queryIdentifier),
      maxPages: to.query.page ? Math.min(requestedPage + 5, 30) : 6
    });
  }

  buildPaginationRoute(page: number) {
    return QueryLinkService.getInstance().createLinkFromQuery(queryStore.getGlobalQueryParameters, page);
  }

  get maxPage() {
    return paginationStore.getMaxAvailablePageNumber(this.queryIdentifier);
  }

  get currentPage() {
    return paginationStore.getCurrentPageNumber(this.queryIdentifier);
  }

  get activePaginationPages() {
    let minPage = Math.max(this.currentPage - 2, 1);
    const maxPage = Math.min(minPage + 5, this.maxPage);

    // Reduce minPage if end of pagination reached
    if (maxPage - minPage < 5) {
      minPage = Math.max(minPage - (5 - (maxPage - minPage)), 1);
    }

    return _.range(minPage, maxPage + 1);
  }
}
</script>
