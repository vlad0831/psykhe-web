import { ApiService } from '~/services/base.service';

export class FiltersService extends ApiService<any> {
  /**
   * Retrieves all filters.
   *
   * @returns Promise that resolves with the filters.
   */
  async all() {
    const response = await this.axios.$get(`${process.env.NUXT_ENV_API_ROUTE}/query/filters`);

    return response;
  }
}
