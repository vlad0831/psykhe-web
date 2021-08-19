/* eslint-disable prefer-promise-reject-errors */
import { CancelTokenSource } from 'axios';
import _ from 'lodash';

import { ApiService } from '../base.service';
import { QueryParameters } from '~/types/query/query';
import { QueryResponse } from '~/types/query/response';

export class QueryService extends ApiService<QueryResponse> {
  // Map from query identifier to the cancel token for the query fetch
  fetchTokens: Map<string, CancelTokenSource> = new Map();

  // Map from query parameters to the cancel token for the query create
  storeTokens: Map<QueryParameters, CancelTokenSource> = new Map();

  /**
   * Retrieves status (and, potentially, results) for the requested Query.
   *
   * @return Promise that resolves with the query response.
   */
  async fetch(identifier: string, checkpoint: string | undefined = ''): Promise<QueryResponse> {
    const identifierUrlPostfix: string = identifier || '';
    const checkpointSuffix: string = checkpoint ? '/' + checkpoint : '';

    const cancelToken = this.axios.CancelToken;
    const source = cancelToken.source();

    this.fetchTokens.set(identifier, source);

    const response = await this.axios
      .$get(`${process.env.NUXT_ENV_API_ROUTE}/query/${identifierUrlPostfix}${checkpointSuffix}`, {
        cancelToken: source.token
      })
      .catch((error) => {
        return Promise.reject({ status: 'error', error });
      })
      .then((response) => {
        if (response.status === 'error') {
          return Promise.reject(response);
        }
        return response;
      });

    return response;
  }

  /**
   * Obtains an identifier based on the specified query parameters.
   *
   * @return Promise that resolves to the status of the query. A status of "error" or "expired" is considered a failure.
   */
  async store(parameters: QueryParameters): Promise<QueryResponse> {
    const cancelToken = this.axios.CancelToken;
    const source = cancelToken.source();

    this.storeTokens.set(parameters, source);

    const response = await this.axios
      .$post(process.env.NUXT_ENV_API_ROUTE + '/query', removeEmptyParameters(parameters), {
        cancelToken: source.token
      })
      .catch((error) => {
        return Promise.reject({ status: 'error', error });
      })
      .then((response) => {
        if (response.status === 'error') {
          return Promise.reject(response);
        }
        return response;
      });

    return response;
  }

  /**
   * Cancels pending fetch requests for the provided query identifier.
   *
   * @param queryIdentifier The identifier of the query.
   */
  cancelQueryFetch(queryIdentifier: string) {
    const token = this.fetchTokens.get(queryIdentifier);

    if (token) {
      token.cancel();
    }

    this.fetchTokens.delete(queryIdentifier);
  }

  /**
   * Cancels pending store requests for the provided query identifier.
   *
   * @param queryParameters The parameters of the query.
   */
  cancelQueryStore(queryParameters: QueryParameters) {
    const token = this.storeTokens.get(queryParameters);

    if (token) {
      token.cancel();
    }

    this.storeTokens.delete(queryParameters);
  }
}

function removeEmptyParameters(parameters: QueryParameters) {
  return _.pickBy(parameters, (value) => {
    if (typeof value === 'string' && value === '') {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    return true;
  });
}
