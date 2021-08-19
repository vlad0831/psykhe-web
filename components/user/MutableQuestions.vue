<template>
  <div v-if="loaded" class="psykhe-mutable-questions survey">
    <h3>Manage Preferences</h3>

    <p class="message">Feel like your matches can be even better? Update your preferences below.</p>

    <div v-for="set in sets" :key="set.id" class="question-list" :class="{ 'extra-margin': setHasLinks(set) }">
      <p class="heading">{{ set.heading }}</p>
      <p class="subheading">{{ set.text }}</p>

      <visual-question-set-component
        :set="set"
        :show-title="false"
        :responses="responsesForSet(set)"
        @input="handleVisualResponses(set, ...arguments)"
      />
    </div>
  </div>

  <loader v-else :state="loadingState" />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { mixins } from 'nuxt-property-decorator';
import { UserMixin } from '~/mixins/userMixin.ts';
import UserAuth from '~/mixins/userAuth';

import LoaderState from '~/types/loader-states';
import { VisualQuestionSet, VisualResponse } from '~/types/personality-test/visual-question';

import Loader from '~/components/common/Loader.vue';
import VisualQuestionSetComponent from '~/components/personality-test/VisualQuestionSet.vue';

@Component({
  components: { VisualQuestionSetComponent, Loader },
  mixins: [UserMixin]
})
export default class MutableQuestions extends mixins(UserAuth, UserMixin) {
  sets: VisualQuestionSet[] = [];
  responses: VisualResponse[] = [];
  loadingState: LoaderState = LoaderState.LOADING;

  get loaded() {
    return this.loadingState === LoaderState.LOADED;
  }

  async created() {
    try {
      const responses = await Promise.all([
        await this.$visualQuestionSetsService.all({ mutable: 1 }),
        await this.$visualResponsesService.all()
      ]);

      this.sets = responses[0];
      this.responses = responses[1];
      this.loadingState = LoaderState.LOADED;
    } catch {
      // The user has likely signed out
    }
  }

  responsesForSet(set: VisualQuestionSet) {
    const questionIds = new Set(set.questions.map((question) => question.id));

    return this.responses.filter((response) => questionIds.has(response.visual_question_id));
  }

  setHasLinks(set: VisualQuestionSet) {
    return set.questions.some((question) => question.link_text !== null);
  }

  handleVisualResponses(set: VisualQuestionSet, visualResponses: VisualResponse[]) {
    const currentResponses = this.responsesForSet(set);

    this.responses = [...this.responses.filter((response) => !currentResponses.includes(response)), ...visualResponses];

    // If setting the responses fails, the user has likely logged out, so do nothing
    this.$visualResponsesService.set(this.responses).catch(() => {});
  }
}
</script>
