import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { CancelTokenSource } from 'axios';

// prettier-ignore
export abstract class ApiService<T> {
  protected axios: NuxtAxiosInstance;
  protected cancelTokens: CancelTokenSource[] = [];

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;

    this.axios.interceptors.request.use((config) => {
      if (!config.cancelToken) {
        const tokenSource = this.axios.CancelToken.source();

        this.cancelTokens.push(tokenSource);
        config.cancelToken = tokenSource.token;
      }

      return config;
    });
  }

  cancelAll() {
    this.cancelTokens.forEach((token) => token.cancel());
  }

  all?(): Promise<T[]>;

  get?(params: RequestParams): Promise<T>;

  create?(entry: T): Promise<boolean | T>;

  update?(params: RequestParams, entry: T): Promise<boolean | T>;

  delete?(params: RequestParams): Promise<boolean>;
}

export interface RequestParams {}
