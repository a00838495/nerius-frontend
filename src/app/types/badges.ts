export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  main_color: string;
  secondary_color: string;
}

export interface EarnedBadge {
  badge: BadgeDefinition;
  awarded_at: string;
}

export interface UserBadge extends EarnedBadge {
  id: string;
}

export interface LessonProgressResponse {
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
  time_spent_seconds?: number;
  completed_at?: string;
  last_activity_at?: string;
  enrollment_progress_percent?: number;
  earned_badges?: EarnedBadge[];
}