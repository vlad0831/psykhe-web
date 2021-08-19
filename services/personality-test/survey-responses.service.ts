import { ApiService } from '../base.service';
import { SurveyResponse } from '~/types/personality-test/survey-question';

export class SurveyResponsesService extends ApiService<SurveyResponse> {
  /**
   * Retrieves all survey question responses.
   *
   * @returns Promise that resolves with the user's survey responses.
   */
  async all() {
    const response = await this.axios.$get(
      `${process.env.NUXT_ENV_API_ROUTE}/user/personality-test/survey-question-responses`
    );

    return response as SurveyResponse[];
  }

  /**
   * Set the user's survey responses to the provided array.
   *
   * @param responses The responses to set.
   * @returns Promise that resolves when the responses have been set.
   */
  async set(responses: SurveyResponse[]) {
    const url = `${process.env.NUXT_ENV_API_ROUTE}/user/personality-test/survey-question-responses`;

    await this.axios.$put(url, { responses });
  }
}
