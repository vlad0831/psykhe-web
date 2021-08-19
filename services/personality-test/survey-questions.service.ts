import { ApiService } from '../base.service';
import { SurveyQuestion } from '~/types/personality-test/survey-question';

export class SurveyQuestionsService extends ApiService<SurveyQuestion> {
  /**
   * Retrieves all survey questions.
   *
   * @returns Promise that resolves with the survey questions.
   */
  async all() {
    const response = await this.axios.$get(`${process.env.NUXT_ENV_API_ROUTE}/personality-test/survey-questions`);

    return response as SurveyQuestion[];
  }
}
