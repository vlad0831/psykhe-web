import { ApiService } from '../base.service';
import { Option } from '~/types/user/option';

export class OptionsService extends ApiService<Option> {
  /**
   * Retrieves all options for the requesting user.
   *
   * @return Promise that resolves with the options.
   */
  async all(): Promise<Option[]> {
    const response = await this.axios.$get(`${process.env.NUXT_ENV_API_ROUTE}/user/options`);

    return response as Option[];
  }

  /**
   * Update the value of the provided option for the user.
   *
   * @return Promise that resolves if the operation was successful.
   */
  async update(option: Option): Promise<boolean> {
    await this.axios.$patch(`${process.env.NUXT_ENV_API_ROUTE}/user/options`, {
      key: option.key,
      value: option.value
    });

    return true;
  }
}
