export interface VisualQuestionSet {
  id: number;
  text: string;
  heading?: string;
  maximum?: number;
  mutable: boolean;
  questions: VisualQuestion[];
  answers: VisualAnswer[];
}

export interface VisualQuestion {
  id: number;
  text: string;
  maximum: number;
  image?: VisualImage;
  link_url?: string;
  link_text?: string;
}

export interface VisualAnswer {
  id: number;
  code: string;
  text?: string;
}

export interface VisualImage {
  key: string;
  alt?: string;
  pool: string;
  caption?: string;
  constraints: object;
}

export interface VisualResponse {
  visual_question_id: number;
  visual_question_answer_id: Number | null;
}
