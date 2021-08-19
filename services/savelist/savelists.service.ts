import { Savelist } from '~/types/savelist/savelist';
import { ApiService } from '../base.service';

export class SavelistsService extends ApiService<Savelist> {
  /**
   * Retrieves all savelists for the requesting user.
   *
   * @return Promise that resolves with the savelists.
   */
  async all(): Promise<Savelist[]> {
    const response = await this.axios.$get(`${process.env.NUXT_ENV_API_ROUTE}/user/savelists`);

    return response.savelists as Savelist[];
  }

  /**
   * Creates a new savelist for the user.
   *
   * @return Promise that resolves if the operation was successful.
   */
  async create(savelist: Savelist): Promise<Savelist> {
    const response = await this.axios.$put(`${process.env.NUXT_ENV_API_ROUTE}/user/savelists`, {
      name: savelist.name
    });

    return response as Savelist;
  }

  /**
   * Updates the name of a savelist for the user.
   *
   * @return Promise that resolves if the operation was successful.
   */
  async update(savelist: Savelist): Promise<Savelist> {
    const response = await this.axios.$patch(`${process.env.NUXT_ENV_API_ROUTE}/user/savelists/${savelist.slug}`, {
      name: savelist.name
    });

    return response as Savelist;
  }

  /**
   * Deletes the specified playlist for the user.
   *
   * @return Promise that resolves if the operation was successful.
   */
  async delete(savelist: Savelist): Promise<boolean> {
    await this.axios.$delete(`${process.env.NUXT_ENV_API_ROUTE}/user/savelists/${savelist.slug}`);

    return true;
  }
}
