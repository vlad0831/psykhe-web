import { ApiService } from '../base.service';
import { VisualResponse } from '~/types/personality-test/visual-question';

export class VisualResponsesService extends ApiService<VisualResponse> {
  /**
   * Retrieves all VisualResponse question responses.
   *
   * @returns Promise that resolves with the user's VisualResponse responses.
   */
  async all() {
    const response = await this.axios.$get(
      `${process.env.NUXT_ENV_API_ROUTE}/user/personality-test/visual-question-responses`
    );

    return response as VisualResponse[];
  }

  /**
   * Set the user's visual responses to the provided array.
   *
   * @param responses The responses to set.
   * @returns Promise that resolves when the responses have been set.
   */
  async set(responses: VisualResponse[]) {
    const url = `${process.env.NUXT_ENV_API_ROUTE}/user/personality-test/visual-question-responses`;

    await this.axios.$put(url, { responses });
  }
}
