import { Store } from 'vuex';
import { Plugin } from '@nuxt/types';

import { QueryService } from '~/services/query/query.service';
import { OptionsService } from '~/services/user/options.service';
import { FiltersService } from '~/services/catalog/filters.service';
import { SavelistsService } from '~/services/savelist/savelists.service';
import { SavelistProductsService } from '~/services/savelist/savelist-products.service';

import { SurveyQuestionsService } from '~/services/personality-test/survey-questions.service';
import { SurveyResponsesService } from '~/services/personality-test/survey-responses.service';
import { VisualQuestionSetsService } from '~/services/personality-test/visual-question-sets.service';
import { VisualResponsesService } from '~/services/personality-test/visual-responses.service';

// Declare services for usage in vue components
declare module 'vue/types/vue' {
  interface Vue {
    $fb: any;
    $gtm: any;

    $queryService: QueryService;
    $optionsService: OptionsService;
    $filtersService: FiltersService;
    $savelistsService: SavelistsService;
    $savelistProductsService: SavelistProductsService;

    $surveyQuestionsService: SurveyQuestionsService;
    $surveyResponsesService: SurveyResponsesService;
    $visualQuestionSetsService: VisualQuestionSetsService;
    $visualResponsesService: VisualResponsesService;
  }
}

declare module 'vuex-module-decorators' {
  interface VuexModule<S = ThisType<any>, R = any> {
    store: Store<any>;
  }
}

// Declare services for usage in vuex actions
declare module 'vuex' {
  interface Store<S> {
    $queryService: QueryService;
    $optionsService: OptionsService;
    $filtersService: FiltersService;
    $savelistsService: SavelistsService;
    $savelistProductsService: SavelistProductsService;

    $surveyQuestionsService: SurveyQuestionsService;
    $surveyResponsesService: SurveyResponsesService;
    $visualQuestionSetsService: VisualQuestionSetsService;
    $visualResponsesService: VisualResponsesService;
  }
}

const serviceInjector: Plugin = (context, inject) => {
  // Browser-specific services
  inject('queryService', new QueryService(context.$axios));
  inject('optionsService', new OptionsService(context.$axios));
  inject('filtersService', new FiltersService(context.$axios));
  inject('savelistsService', new SavelistsService(context.$axios));
  inject('savelistProductsService', new SavelistProductsService(context.$axios));

  // PT-specific services
  inject('surveyQuestionsService', new SurveyQuestionsService(context.$axios));
  inject('surveyResponsesService', new SurveyResponsesService(context.$axios));
  inject('visualQuestionSetsService', new VisualQuestionSetsService(context.$axios));
  inject('visualResponsesService', new VisualResponsesService(context.$axios));
};

export default serviceInjector;
