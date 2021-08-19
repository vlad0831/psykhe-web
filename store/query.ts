import Vue from 'vue';

import { Action, config, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { initialQueryParameters, QueryParameters, QueryTracking } from '~/types/query/query';
import { QueryResponse } from '~/types/query/response';
import { QueryStatus } from '~/types/query/status.enum';

config.rawError = true;

@Module({
  name: 'query',
  stateFactory: true,
  namespaced: true
})
export default class QueryModule extends VuexModule {
  queryTracking: QueryTracking = {};
  queryParameterTracking: Map<string, string | null> = new Map();

  globalQueryIdentifier: string | null = null;
  globalQueryParameters: QueryParameters = initialQueryParameters();

  get getGlobalQueryIdentifier() {
    return this.globalQueryIdentifier;
  }

  get getGlobalQueryParameters() {
    return this.globalQueryParameters;
  }

  get getQueryStatus() {
    return (identifier: string) =>
      identifier in this.queryTracking ? this.queryTracking[identifier].status : QueryStatus.ERROR;
  }

  get getQueryReady() {
    return (identifier: string) => (identifier in this.queryTracking ? this.queryTracking[identifier].ready : false);
  }

  get getQueryCheckpoint() {
    return (identifier: string) => (identifier in this.queryTracking ? this.queryTracking[identifier].checkpoint : '');
  }

  get getQueryRecommendation() {
    return (identifier: string) =>
      identifier in this.queryTracking ? this.queryTracking[identifier].recommendation : '';
  }

  get getQueryByParameters() {
    return (parameters: QueryParameters, userIdentifier?: string) => {
      return this.queryParameterTracking.get(JSON.stringify(annotatedQueryParameters(parameters, userIdentifier)));
    };
  }

  @Mutation
  updateGlobalQueryParameters(payload: QueryParameters) {
    this.globalQueryParameters = payload;
  }

  @Mutation
  updateGlobalQueryIdentifier(identifier: string | null) {
    this.globalQueryIdentifier = identifier;
  }

  @Mutation
  updateQueryTracking({
    identifier,
    ready,
    status,
    cancelled,
    checkpoint,
    recommendation
  }: UpdateQueryTrackingPayload) {
    Vue.set(this.queryTracking, identifier, {
      ready,
      status,
      cancelled,
      checkpoint,
      recommendation
    });
  }

  @Mutation
  trackQueryParameters({ parameters, queryIdentifier, userIdentifier }: TrackQueryParametersPayload) {
    const updatedParameters = new Map(this.queryParameterTracking);

    updatedParameters.set(JSON.stringify(annotatedQueryParameters(parameters, userIdentifier)), queryIdentifier);

    this.queryParameterTracking = updatedParameters;
  }

  @Action
  setGlobalQueryIdentifier(identifier: string) {
    this.context.commit('updateGlobalQueryIdentifier', identifier);
  }

  @Action
  setPaginationReady(identifier: string) {
    const currentTracking = this.queryTracking[identifier];

    if (!currentTracking) {
      return;
    }

    this.context.commit('updateQueryTracking', {
      identifier,
      ready: true,
      status: currentTracking.status,
      cancelled: currentTracking.cancelled,
      checkpoint: currentTracking.checkpoint,
      recommendation: currentTracking.recommendation
    });
  }

  @Action
  cancelQuery(identifier: string) {
    this.store.$queryService.cancelQueryFetch(identifier);

    this.context.commit('updateQueryTracking', {
      identifier,
      ready: false,
      cancelled: true,
      recommendation: '',
      status: QueryStatus.CANCELLED
    });
  }

  @Action
  async fetchGlobalQuery(userIdentifier?: string) {
    // We don't know the new identifier yet, so update it as such
    this.context.commit('updateGlobalQueryIdentifier', null);

    try {
      const response = await this.store.$queryService.store(this.globalQueryParameters);

      if (response.status === QueryStatus.REDIRECT) {
        return response;
      }

      // If the query expired or failed, remove the link between the parameters and the identifier
      if (!('identifier' in response) || response.status === QueryStatus.EXPIRED) {
        this.context.commit('trackQueryParameters', {
          parameters: this.globalQueryParameters,
          queryIdentifier: null,
          userIdentifier
        });
        return;
      }

      // Track the newly created query
      this.context.commit('updateGlobalQueryIdentifier', response.identifier);
      this.context.commit('updateQueryTracking', {
        ready: false,
        cancelled: false,
        status: response.status,
        identifier: response.identifier,
        recommendation: response.recommendation
      });

      // Associate the query identifier with the current query parameters
      this.context.commit('trackQueryParameters', {
        userIdentifier,
        parameters: this.globalQueryParameters,
        queryIdentifier: response.identifier
      });

      // TODO: The QE does not correctly return the same query identifier for different checkpoints.
      //       We therefore need to manually pass the identifier of the original query to ensure we
      //       can track the results correctly.
      return this.processQueryResponse({ response, identifier: response.identifier });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Action
  async fetchCustomQuery({ query, userIdentifier }: FetchCustomQueryPayload): Promise<QueryResponse | undefined> {
    try {
      const response = await this.store.$queryService.store(query);

      if (response.status === QueryStatus.REDIRECT) {
        return response;
      }

      // If the query expired or failed, remove the link between the parameters and the identifier
      if (!('identifier' in response) || response.status === QueryStatus.EXPIRED) {
        this.context.commit('trackQueryParameters', {
          parameters: query,
          queryIdentifier: null,
          userIdentifier
        });
        return;
      }

      // Track the newly created query
      this.context.commit('updateQueryTracking', {
        ready: false,
        cancelled: false,
        status: response.status,
        identifier: response.identifier,
        recommendation: response.recommendation
      });

      // Associate the query identifier with the current query parameters
      this.context.commit('trackQueryParameters', {
        userIdentifier,
        parameters: query,
        queryIdentifier: response.identifier
      });

      // TODO: The QE does not correctly return the same query identifier for different checkpoints.
      //       We therefore need to manually pass the identifier of the original query to ensure we
      //       can track the results correctly.
      return this.processQueryResponse({ response, identifier: response.identifier });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Action
  async fetchMoreProducts(identifier: string) {
    try {
      const currentTracking = this.queryTracking[identifier];

      if (!currentTracking || currentTracking.cancelled || !currentTracking.checkpoint) {
        return;
      }

      const response = await this.store.$queryService.fetch(identifier, currentTracking.checkpoint);

      // TODO: The QE does not correctly return the same query identifier for different checkpoints.
      //       We therefore need to manually pass the identifier of the original query to ensure we
      //       can track the results correctly.
      return this.processQueryResponse({ identifier, response, checkpoint: currentTracking.checkpoint });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Action
  async processQueryResponse({
    identifier,
    response,
    checkpoint,
    previousDelay
  }: ProcessQueryPayload): Promise<QueryResponse> {
    if (
      !(identifier in this.queryTracking) ||
      this.queryTracking[identifier].cancelled ||
      response.status === QueryStatus.EXPIRED
    ) {
      return response;
    }

    // If the query was previously pending, poll it again
    if ([QueryStatus.PENDING, QueryStatus.PROCESSING].includes(response.status)) {
      const delay = previousDelay ? Math.min(previousDelay * 2, 3200) : 50;

      await new Promise((resolve) => setTimeout(resolve, delay));

      if (this.queryTracking[identifier].cancelled) {
        return response;
      }

      try {
        const updatedResponse = await this.store.$queryService.fetch(identifier, checkpoint);
        return this.processQueryResponse({ identifier, checkpoint, response: updatedResponse, previousDelay: delay });
      } catch (error) {
        throw new Error(error);
      }
    }

    // Cache products
    this.context.commit('products/addProductsToCache', Array.isArray(response.products) ? response.products : [], {
      root: true
    });

    // Cache new/existing sprinkler pools
    this.context.commit(
      checkpoint ? 'sprinklers/addProductsToExistingPools' : 'sprinklers/cacheSprinklerPools',
      {
        queryIdentifier: identifier,
        sprinklerPools: response.pools || []
      },
      { root: true }
    );

    // Track the response of the query
    this.context.commit('updateQueryTracking', {
      identifier,
      ready: true,
      cancelled: false,
      status: response.status,
      checkpoint: response.checkpoint,
      recommendation: response.recommendation
    });

    return response;
  }

  @Action
  updateGlobalQueryFromRoute(route: any) {
    const updatedQueryParams = buildQueryFromRoute(route, this.context.rootGetters['filter/getCategories']);

    this.context.commit('updateGlobalQueryParameters', updatedQueryParams);
  }
}

export function buildQueryFromRoute(route: any, categories: any): QueryParameters {
  const query = initialQueryParameters();

  // The category/subcategory query params may actually be a partner and brand.
  // We have no way of knowing this from the URL structure, so this is checked below.
  let category = route.params.category;
  const subcategory = route.params.subcategory;
  const subsubcategory = route.params.subsubcategory;

  const brandSlugs = route.params.brandslugs;

  // Update categories/brands/partners based on the contents of the URL
  if (category) {
    if (category in categories) {
      if (subcategory) {
        category += `/${subcategory}`;
      }

      if (subsubcategory) {
        category += `/${subsubcategory}`;
      }

      query.categories = [category];
    } else {
      if (subcategory) {
        query.brands = [subcategory];
      }

      query.partners = [category];
    }
  }

  if (route.query.categories) {
    query.categories = route.query.categories.split(',');
  }

  if (route.query.modes) {
    query.modes = [route.query.modes];
  }

  if (route.query.mood) {
    query.mood = route.query.mood;
  }

  if (route.query.occasions) {
    query.occasions = [route.query.occasions];
  }

  if (route.query.colors) {
    query.colors = [route.query.colors];
  }

  if (route.query.options) {
    query.options = [route.query.options];
  }

  if (route.query.price) {
    query.price = route.query.price.split(',');
  }

  if (route.name === 'browse-brands-slugs' && brandSlugs) {
    query.brands = brandSlugs.split(',');
  } else if (route.query.brands) {
    query.brands = [route.query.brands];
  }

  if (route.query.q) {
    query.search = route.query.q;
  }

  if (route.name === 'lists' || route.name === 'lists-slug') {
    query.savelists = route.params.slug ? [route.params.slug] : ['*', '!disliked'];
  }

  if (route.query.recommendation) {
    query.recommendation = route.query.recommendation;
  }

  return query;
}

function annotatedQueryParameters(parameters: QueryParameters, userIdentifier?: string): QueryParameters {
  const annotatedParameters: QueryParameters = Object.assign({}, parameters);
  if (userIdentifier) {
    annotatedParameters.user = userIdentifier;
  }
  return annotatedParameters;
}

export interface UpdateQueryTrackingPayload {
  ready: boolean;
  cancelled: boolean;
  identifier: string;
  checkpoint: string;
  status: QueryStatus;
  recommendation: string;
}

export interface ProcessQueryPayload {
  identifier: string;
  checkpoint?: string;
  previousDelay?: number;
  response: QueryResponse;
}

export interface TrackQueryParametersPayload {
  parameters: QueryParameters;
  queryIdentifier: string | null;
  userIdentifier: string | undefined;
}

export interface FetchCustomQueryPayload {
  query: QueryParameters;
  userIdentifier?: string;
}
