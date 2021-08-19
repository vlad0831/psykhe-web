<template>
  <div
    class="survey"
    :class="{
      'survey-complete': isComplete,
      'survey-navigating-previous': navigatingPrevious
    }"
  >
    <template v-if="isLoaded">
      <div v-if="completedQuestions === 0 && !disclaimerShown" class="survey-disclaimer">
        <div class="survey-disclaimer-content">
          <p>
            In under 3 minutes, you’ll complete the Big Five Inventory-2 (BFI-2) with questions supplemented by PSYKHE,
            giving you the results of your unique personality profile in terms of the Big Five traits: the most
            important measure identified by psychologists for understanding people’s life outcomes, and we believe, key
            to understanding your personal style.
          </p>

          <deferred-figure pool="pt" asset-key="main/hero" :constraints="heroConstraints" />

          <div class="survey-disclaimer-actions">
            <button @click="disclaimerShown = true">Start</button>
          </div>

          <p class="smaller">
            Big Five Inventory-2 Items Copyright 2015 By Drs. Oliver P. John and Christopher J. Soto. Reprinted with
            permission. Fashion Recommendation Engine independently developed by PSYKHE, and not endorsed by Drs. John
            and Soto.
          </p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="container-fluid">
          <b-progress :value="completedQuestions" :max="totalQuestions"></b-progress>
        </div>

        <div v-if="error" class="mt-2">
          <p class="text-danger">{{ error }}</p>
        </div>

        <div v-if="message" class="mt-2">
          <p>{{ message }}</p>
        </div>

        <a
          v-if="!isComplete"
          :class="{
            'survey-control-prev': true,
            disabled: completedQuestions === 0
          }"
          @click="navigatePrevious"
        >
          <span class="survey-control-prev-icon"></span>

          <span class="sr-only">Prev</span>
        </a>

        <template v-if="currentSection === 'survey'">
          <survey-question-component
            :question="currentSurveyQuestion"
            :response="currentSurveyResponse"
            @input="handleSurveyResponse"
          />
        </template>

        <template v-else-if="currentSection === 'visual'">
          <visual-question-set-component
            ref="visualQuestionSet"
            :set="currentVisualQuestionSet"
            :responses="currentVisualResponses"
            @input="handleVisualResponses"
          />
        </template>
      </div>

      <template v-if="canNavigateForwards">
        <a
          :class="{
            'survey-control-next': true,
            disabled: !canNavigateForwards
          }"
          @click="navigateNext"
        >
          <span class="survey-control-next-icon"></span>
          <span class="sr-only">Next</span>
        </a>
      </template>
    </template>

    <template v-else>
      <loader
        :state="loadingState"
        class="psykhe-browse-grid-container"
        temporary-failure-message="Retrieving questions..."
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator';
import '~/plugins/service-injector.ts';

import { SurveyQuestion, SurveyResponse } from 'types/personality-test/survey-question';
import { VisualQuestionSet, VisualResponse } from 'types/personality-test/visual-question';

import LoaderState from '~/types/loader-states';
import Loader from '~/components/common/Loader.vue';
import DeferredFigure from '~/components/common/DeferredFigure.vue';

import SurveyQuestionComponent from '~/components/personality-test/SurveyQuestion.vue';
import VisualQuestionSetComponent from '~/components/personality-test/VisualQuestionSet.vue';

import { AnalyticsService } from '~/services/analytics/manager';
import { AnalyticsEvent, HomeAction } from '~/types/analytics/events';

enum PTSection {
  Survey = 'survey',
  Visual = 'visual',
  Completed = 'completed'
}

@Component({
  layout: 'unauthenticated',
  middleware: ['auth', 'require-pt-not-transmitted'],
  components: {
    Loader,
    DeferredFigure,
    SurveyQuestionComponent,
    VisualQuestionSetComponent
  }
})
export default class Index extends Vue {
  @Ref() readonly visualQuestionSet!: VisualQuestionSetComponent;
  error = '';
  message = '';
  retries = 0;
  maxRetries = 5;
  retryDelay = 1000;
  disclaimerShown: boolean = false;
  navigatingPrevious: boolean = false;
  loadingState: LoaderState = LoaderState.LOADING;

  heroConstraints = {
    width: '900',
    height: '600',
    'content-type': 'image/jpeg'
  };

  // Survey questions
  surveyQuestionsCompleted: number = 0;
  surveyQuestions: SurveyQuestion[] = [];
  surveyResponses: SurveyResponse[] = [];

  // Visual questions
  visualQuestionSetsCompleted: number = 0;
  visualQuestionSets: VisualQuestionSet[] = [];
  visualResponses: VisualResponse[] = [];

  /** Lifecycle hooks */
  async mounted() {
    // Fetch questions and responses
    const responses = await Promise.all([
      await this.$surveyQuestionsService.all(),
      await this.$visualQuestionSetsService.all(),
      await this.$surveyResponsesService.all(),
      await this.$visualResponsesService.all()
    ]);

    this.surveyQuestions = responses[0];
    this.visualQuestionSets = responses[1];
    this.surveyResponses = responses[2];
    this.visualResponses = responses[3];

    // Calculate total number of survey and visual questions completed
    this.surveyQuestionsCompleted = this.surveyResponses.length;

    this.visualQuestionSets.forEach((set) => {
      const questionIds = new Set(set.questions.map((question) => question.id));
      const responsesForQuestionSet = this.visualResponses.filter((response) =>
        questionIds.has(response.visual_question_id)
      );

      // If there are no responses at all, do not count the set
      if (responsesForQuestionSet.length === 0) {
        return;
      }

      // If this is a non-boolean set, require an answer for each question
      if (set.answers.length > 0) {
        for (const question of set.questions) {
          if (!responsesForQuestionSet.some((response) => response.visual_question_id === question.id)) {
            return false;
          }
        }
      }

      this.visualQuestionSetsCompleted++;
    });

    if (this.isComplete) {
      this.sendTestCompleted();
    }

    this.loadingState = LoaderState.LOADED;
  }

  /** Computed properties */
  get isLoaded(): boolean {
    return this.loadingState === LoaderState.LOADED;
  }

  get isComplete(): boolean {
    return this.completedQuestions === this.totalQuestions;
  }

  get currentSurveyQuestion(): SurveyQuestion {
    return this.surveyQuestions[this.surveyQuestionsCompleted];
  }

  get currentSurveyResponse(): SurveyResponse | undefined {
    return this.surveyResponses.find((response) => response.survey_question_id === this.currentSurveyQuestion.id);
  }

  get currentVisualQuestionSet(): VisualQuestionSet {
    return this.visualQuestionSets[this.visualQuestionSetsCompleted];
  }

  get currentVisualResponses(): VisualResponse[] {
    return this.visualResponses.filter((response) =>
      this.currentVisualQuestionSet.questions.some((question) => question.id === response.visual_question_id)
    );
  }

  get currentSection(): PTSection {
    if (this.visualQuestionSetsCompleted === this.visualQuestionSets.length) {
      return PTSection.Completed;
    }

    return this.surveyQuestionsCompleted < this.surveyQuestions.length ? PTSection.Survey : PTSection.Visual;
  }

  get completedQuestions(): number {
    return this.surveyQuestionsCompleted + this.visualQuestionSetsCompleted;
  }

  get totalQuestions(): number {
    return this.surveyQuestions.length + this.visualQuestionSets.length;
  }

  get canNavigateForwards(): boolean {
    if (this.isComplete) {
      return false;
    }

    if (this.currentSection === PTSection.Survey) {
      return this.currentSurveyResponse !== undefined;
    }

    // If the question set is boolean, require at least once response
    if (this.currentVisualQuestionSet.answers.length === 0) {
      return this.currentVisualResponses.length > 0;
    }

    // If there is an unanswered question in this set, it must be completed first
    for (const question of this.currentVisualQuestionSet.questions) {
      if (!this.currentVisualResponses.some((response) => response.visual_question_id === question.id)) {
        return false;
      }
    }

    return true;
  }

  @Watch('currentSection')
  handleCurrentSectionChanged(section: PTSection) {
    if (section === PTSection.Completed) {
      this.sendTestCompleted();
    }
  }

  head(): object {
    return {
      bodyAttrs: {
        class: 'page page-pt'
      }
    };
  }

  navigateNext(): void {
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    if (this.currentSection === PTSection.Survey) {
      this.surveyQuestionsCompleted++;
    } else {
      this.visualQuestionSet.markAsAnswered();
      setTimeout(() => this.visualQuestionSetsCompleted++, 500);
    }
  }

  async navigatePrevious() {
    this.navigatingPrevious = true;
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (this.currentSection === PTSection.Survey) {
      this.surveyQuestionsCompleted--;
    } else {
      this.visualQuestionSetsCompleted--;
    }

    if (this.visualQuestionSetsCompleted === -1) {
      this.visualQuestionSetsCompleted = 0;
      this.surveyQuestionsCompleted--;
    }

    if (this.surveyQuestionsCompleted === -1) {
      this.surveyQuestionsCompleted = 0;
    }

    this.navigatingPrevious = false;
  }

  async handleSurveyResponse(surveyResponse: SurveyResponse) {
    const updatedSurveyResponses = this.surveyResponses.filter(
      (response) => response.survey_question_id !== surveyResponse.survey_question_id
    );

    updatedSurveyResponses.push(surveyResponse);

    // Send survey responses, waiting sufficient time for the animation to complete
    await Promise.all([
      this.$surveyResponsesService.set(updatedSurveyResponses),
      new Promise((resolve) => setTimeout(resolve, 500))
    ]);

    this.surveyResponses = updatedSurveyResponses;
    this.navigateNext();

    if (this.isComplete) {
      this.sendTestCompleted();
    }
  }

  async handleVisualResponses(visualResponses: VisualResponse[]) {
    this.visualResponses = [
      ...this.visualResponses.filter(
        (response) =>
          !this.currentVisualQuestionSet.questions.some((question) => question.id === response.visual_question_id)
      ),
      ...visualResponses
    ];

    // Send visual responses, waiting sufficient time for the animation to complete
    await Promise.all([
      this.$visualResponsesService.set(this.visualResponses),
      new Promise((resolve) => setTimeout(resolve, 500))
    ]);

    if (this.isComplete) {
      this.sendTestCompleted();
    }
  }

  sendTestCompleted() {
    this.message = 'Please wait, your results are being calculated...';
    this.$axios
      .post(process.env.NUXT_ENV_API_ROUTE + '/user/personality-test/complete')
      .then(async () => {
        await this.$auth.fetchUser();

        AnalyticsService.publish({
          type: AnalyticsEvent.HOME_EVENT,
          data: {
            action: HomeAction.REGISTRATION_COMPLETED,
            context: {
              page: 'personality-test'
            }
          }
        });

        window.location.href = '/profile';
      })
      .catch((error) => {
        this.handleTestCompleteResponse(error);
      });
  }

  handleTestCompleteResponse(handleResponse: any) {
    const responseCode = handleResponse.response.status;
    const responseMessage = handleResponse.response.data.message;

    if (responseCode === 500) {
      this.message = '';
      this.error = responseMessage;
    } else if (responseCode === 400) {
      this.loadingState = LoaderState.LOADING;
      this.error = '';
      this.message = responseMessage;
      if (this.retries < this.maxRetries) {
        setTimeout(() => {
          this.sendTestCompleted();
        }, this.retryDelay);
        this.retries++;
      } else {
        this.message = '';
        this.error = 'Technical difficulties, please try again later';
        this.loadingState = LoaderState.LOADED;
      }
    }
  }
}
</script>
