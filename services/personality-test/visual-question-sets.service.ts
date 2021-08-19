import { ApiService } from '../base.service';
import { VisualQuestionSet } from '~/types/personality-test/visual-question';

export class VisualQuestionSetsService extends ApiService<VisualQuestionSet> {
  /**
   * Retrieves all visual questions.
   *
   * @returns Promise that resolves with the visual questions.
   */
  async all(filters: any = {}) {
    const response = await this.axios.$get(`${process.env.NUXT_ENV_API_ROUTE}/personality-test/visual-question-sets`, {
      params: filters
    });

    return response as VisualQuestionSet[];
  }
}
