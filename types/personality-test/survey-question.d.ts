export interface SurveyQuestion {
  id: number;
  text: string;
  answers: SurveyAnswer[];
  responses: SurveyResponse[];
}

export interface SurveyAnswer {
  id: number;
  text: string;
}

export interface SurveyResponse {
  survey_question_id: number;
  survey_question_answer_id?: number;
}
