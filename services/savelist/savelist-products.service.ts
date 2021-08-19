import { Savelist } from '~/types/savelist/savelist';
import { IProduct } from '~/types/product/product';
import { ApiService } from '../base.service';

export class SavelistProductsService extends ApiService<Savelist> {
  /**
   * Adds the provided product to the specified playlist.
   *
   * @param savelist The savelist to add the product to.
   * @param product The product to add.
   * @return Promise that resolves if the operation was successful.
   */
  async add(product: IProduct, savelist: Savelist): Promise<boolean> {
    await this.axios.$put(
      `${process.env.NUXT_ENV_API_ROUTE}/user/savelists/${savelist.slug}/add/${product.identifier}`
    );

    return true;
  }

  /**
   * Retrieves all savelists for the requesting user.
   *
   * @param savelist The savelist to add the product to.
   * @param product The product to add.
   * @return Promise that resolves if the operation was successful.
   */
  async remove(product: IProduct, savelist: Savelist): Promise<boolean> {
    await this.axios.$put(
      `${process.env.NUXT_ENV_API_ROUTE}/user/savelists/${savelist.slug}/remove/${product.identifier}`
    );

    return true;
  }
}
