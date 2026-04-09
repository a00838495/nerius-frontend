export interface QuizQuestionOption {
  id: string;
  option_text: string;
  sort_order: number;
  match_target: string | null;
}

export interface QuizQuestion {
  id: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "ordering" | "matching";
  question_text: string;
  points: number;
  sort_order: number;
  options: QuizQuestionOption[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number | null;
  time_limit_seconds: number | null;
  is_required: boolean;
  questions: QuizQuestion[];
}

export interface QuizAttemptSummary {
  id: string;
  quiz_id: string;
  attempt_number: number;
  status: "in_progress" | "completed" | "timed_out";
  score: number | null;
  passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
}

export interface QuizResponseSubmit {
  question_id: string;
  selected_option_id?: string | null;
  text_response?: string | null;
  ordering_response?: string[] | null;
  matching_response?: Record<string, string> | null;
}

export interface QuizSubmitResult {
  attempt: QuizAttemptSummary;
  total_points: number;
  earned_points: number;
  passed: boolean;
}
