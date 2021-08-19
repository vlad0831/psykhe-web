<template>
  <div class="visual-question" :class="[`visual-question-code-${set.code}`, { 'visual-question-complete': answered }]">
    <h2 v-if="showTitle" class="visual-question-title">{{ set.text }}</h2>

    <form class="row">
      <template v-for="(question, index) in set.questions">
        <div
          :key="question.id"
          class="col-sm visual-question-answer"
          :class="[
            `visual-question-responsive-${getAnswerCount}`,
            {
              'visual-question-answer-selected': questionSelected(question) && hasBooleanAnswers
            }
          ]"
        >
          <div class="form-group">
            <input
              :id="`visual_question_set_${set.id}_question_${question.id}`"
              :name="`visual_question_set_${question.id}`"
              :disabled="questionDisabled(question)"
              :checked="questionSelected(question)"
              :value="question.id"
              class="form-control"
              type="checkbox"
              @change="setResponse(question, null, $event)"
            />

            <label
              :for="`visual_question_set_${set.id}_question_${question.id}`"
              :class="{ 'is-boolean-option': hasBooleanAnswers }"
            >
              <deferred-figure
                v-if="question.image"
                :aspect-x="1024"
                :aspect-y="1200"
                :pool="question.image.pool"
                :asset-key="question.image.key"
                :constraints="question.image.constraints"
              />

              <div>
                <span>{{ question.text }}</span>
              </div>
            </label>

            <a v-if="question.link_url && question.link_text" :href="question.link_url" target="_blank">
              {{ question.link_text }}
            </a>
            <span v-else class="link-text">{{ question.link_text }}</span>

            <div
              v-for="answer in set.answers"
              :key="answer.id"
              :class="{ 'visual-question-answer-selected': answerSelected(question, answer) }"
            >
              <input
                :id="`visual_question_${question.id}_answer_${answer.id}`"
                :name="`visual_question_${question.id}`"
                :checked="answerSelected(question, answer)"
                :value="`visual_question_${question.id}_answer_${answer.id}`"
                :disabled="answerDisabled(question, answer)"
                :type="questionInputType(question)"
                class="form-control"
                @change="setResponse(question, answer, $event)"
              />

              <label :for="`visual_question_${question.id}_answer_${answer.id}`" class="is-boolean-option">
                <span> {{ answer.text }}</span>
              </label>
            </div>
          </div>
        </div>

        <div
          v-if="set.questions.length == 9 ? !((index + 1) % 3) : set.questions.length > 6 ? !((index + 1) % 4) : 0"
          :key="question.id + 10"
          class="w-100"
        ></div>
      </template>

      <template
        v-for="fakeQuesiton in Array(
          set.questions.length > 8 ? 9 - set.questions.length : set.questions.length > 6 ? 8 - set.questions.length : 0
        )"
      >
        <div :key="fakeQuesiton" class="col-sm visual-question-answer-fake" />
      </template>
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import {
  VisualQuestionSet,
  VisualQuestion,
  VisualResponse,
  VisualAnswer
} from 'types/personality-test/visual-question';

import DeferredFigure from '~/components/common/DeferredFigure.vue';

@Component({
  components: { DeferredFigure }
})
export default class VisualQuestionSetComponent extends Vue {
  @Prop({ type: Object, required: true })
  readonly set!: VisualQuestionSet;

  @Prop({ type: Array, required: true })
  readonly responses!: VisualResponse[];

  @Prop({ type: Boolean, default: true })
  readonly showTitle!: boolean;

  answered = false;

  get hasBooleanAnswers() {
    return this.set.answers.length === 0;
  }

  @Watch('responses', { immediate: true })
  handleResponsesChanged() {
    this.answered = false;
  }

  markAsAnswered() {
    this.answered = true;
  }

  get getAnswerCount(): number {
    return this.set.questions.length;
  }

  questionInputType(question: VisualQuestion) {
    // If the maximum number of answers for this question is 1, the answers will behave as radio buttons.
    // Otherwise they will behave as checkboxes, requiring an option to be deselected before another can be selected.
    return question.maximum === 1 ? 'radio' : 'checkbox';
  }

  questionDisabled(question: VisualQuestion) {
    if (!this.hasBooleanAnswers) {
      return true;
    }

    if (this.questionSelected(question)) {
      return false;
    }

    return this.set.maximum ? this.responses.length >= this.set.maximum : false;
  }

  answerDisabled(question: VisualQuestion, answer: VisualAnswer) {
    if (!question.maximum) {
      return false;
    }

    const responsesForQuestion = this.responses.filter((response) => response.visual_question_id === question.id);

    return responsesForQuestion.length >= question.maximum && question.maximum !== 1
      ? !this.responses.some(
          (response) => response.visual_question_answer_id === answer.id && response.visual_question_id === question.id
        )
      : false;
  }

  questionSelected(question: VisualQuestion) {
    return this.responses.some((response) => response.visual_question_id === question.id);
  }

  answerSelected(question: VisualQuestion, answer: VisualAnswer) {
    return this.responses.some(
      (response) => response.visual_question_id === question.id && response.visual_question_answer_id === answer.id
    );
  }

  setResponse(question: VisualQuestion, answer: VisualAnswer | null, event: any) {
    // Firstly remove all existing answers for this question, unless the following conditions are met:
    //   - This question is non-boolean
    //   - The answer is not the same as the one that is being updated
    //   - The maximum allowed answers for the question is > 1, ie it is non behaving as a radio button
    const updatedResponses = this.responses.filter(
      (response) =>
        response.visual_question_id !== question.id ||
        (answer && answer.id !== response.visual_question_answer_id && question.maximum !== 1)
    );

    // With the all responses for the current question/answer removed, add the response back if it was checked
    if (event.target.checked) {
      updatedResponses.push({
        visual_question_id: question.id,
        visual_question_answer_id: answer ? answer.id : null
      });
    }

    this.$emit('input', updatedResponses);
  }
}
</script>
