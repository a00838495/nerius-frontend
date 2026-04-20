export interface AdminArea {
  id: string;
  name: string;
}

export interface AdminCreator {
  id: string;
  first_name: string;
  last_name: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  access_type: "free" | "restricted";
  estimated_minutes: number | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  area: AdminArea | null;
  created_by_user: AdminCreator;
  modules_count: number;
  lessons_count: number;
  total_enrolled: number;
  total_completed: number;
}

export interface AdminModule {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons_count: number;
}

export interface AdminLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  estimated_minutes: number | null;
  has_quiz: boolean;
  resources_count: number;
}

export type ResourceType = "video" | "pdf" | "slide" | "podcast";

export interface AdminResource {
  id: string;
  lesson_id: string;
  resource_type: ResourceType;
  title: string;
  external_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
}

export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "ordering" | "matching";

export interface AdminBadge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  main_color: string;
  secondary_color: string;
}

export interface AdminCourseBadgeLink {
  id: string;
  course_id: string;
  badge: AdminBadge;
  progress_percentage: number;
}

export interface AdminGemMini {
  id: string;
  title: string;
  description: string | null;
  icon_url: string | null;
}

export interface AdminCourseGemLink {
  id: string;
  course_id: string;
  gem: AdminGemMini;
  sort_order: number;
}

export interface AdminLessonGemLink {
  id: string;
  lesson_id: string;
  gem: AdminGemMini;
  sort_order: number;
}

export interface AdminCertification {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  cost: number | null;
  validity_days: number | null;
}

export interface AdminGrantUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AdminGrant {
  id: string;
  course_id: string;
  user: AdminGrantUser;
  granted_at: string;
}
