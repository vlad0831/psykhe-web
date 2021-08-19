<template>
  <div class="survey-question" :class="{ 'survey-question-complete': answered }">
    <h2 class="survey-question-title">{{ question.text }}</h2>

    <form class="row">
      <div
        v-for="answer in question.answers"
        :key="answer.id"
        :class="{
          'col-sm': true,
          'survey-question-answer': true,
          'survey-question-answer-selected': answerId == answer.id
        }"
      >
        <div class="form-group">
          <input
            :id="`survey_question_${question.id}_answer_${answer.id}`"
            v-model="answerId"
            :value="answer.id"
            type="radio"
            class="form-control"
            :name="`survey_question_${question.id}`"
          />

          <label :for="`survey_question_${question.id}_answer_${answer.id}`">
            <span>
              {{ answer.text }}
            </span>
          </label>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import { SurveyQuestion, SurveyResponse } from 'types/personality-test/survey-question';

@Component
export default class SurveyQuestionComponent extends Vue {
  @Prop({ type: Object, required: true })
  readonly question!: SurveyQuestion;

  @Prop({ type: Object, required: false })
  readonly response!: SurveyResponse;

  emit: boolean = false;
  answered: boolean = false;
  answerId: number | null = null;

  @Watch('question')
  questionChanged() {
    this.answered = false;
  }

  @Watch('response', { immediate: true })
  responseChanged(response: SurveyResponse) {
    this.emit = false;

    if (!response || !response.survey_question_answer_id) {
      this.answerId = null;
      return;
    }

    this.answerId = response.survey_question_answer_id;
  }

  @Watch('answerId', { immediate: true })
  answerIdChanged(answerId: number) {
    if (!this.emit) {
      this.emit = true;
      return;
    }

    this.answered = true;

    this.$emit('input', {
      survey_question_id: this.question.id,
      survey_question_answer_id: answerId
    });
  }
}
</script>
