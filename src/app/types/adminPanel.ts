// Types for the new admin panel modules (10 features).

// =============================================================================
// Common
// =============================================================================

export interface PaginatedList<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

// =============================================================================
// 1. DASHBOARD
// =============================================================================

export interface DashboardCounters {
  total_users: number;
  active_users: number;
  total_courses: number;
  published_courses: number;
  total_enrollments: number;
  completed_enrollments: number;
  total_areas: number;
  total_certifications_issued: number;
  total_forum_posts: number;
  total_gems: number;
  total_badges_earned: number;
  new_users_last_7d: number;
  new_enrollments_last_7d: number;
}

export interface DashboardCoursePopularity {
  course_id: string;
  title: string;
  enrollments: number;
  completed: number;
  completion_rate: number;
}

export interface DashboardCompletionByArea {
  area_id: string | null;
  area_name: string;
  enrollments: number;
  completed: number;
  completion_rate: number;
}

export interface DashboardActivityBucket {
  date: string;
  enrollments: number;
  completions: number;
  new_users: number;
}

export interface DashboardOverview {
  counters: DashboardCounters;
  popular_courses: DashboardCoursePopularity[];
  completion_by_area: DashboardCompletionByArea[];
  activity_last_30d: DashboardActivityBucket[];
}

// =============================================================================
// 2. USERS
// =============================================================================

export interface UserAdminListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  area_name: string | null;
  roles: string[];
  last_login_at: string | null;
  created_at: string;
  enrollments_count: number;
}

export interface UserAdminRead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  gender: string | null;
  area_id: string | null;
  area_name: string | null;
  roles: string[];
  is_admin: boolean;
  last_login_at: string | null;
  created_at: string;
  enrollments_count: number;
  completed_courses_count: number;
  badges_count: number;
  certifications_count: number;
}

// =============================================================================
// 3. AREAS
// =============================================================================

export interface AreaAdminRead {
  id: string;
  name: string;
  created_at: string;
  users_count: number;
  courses_count: number;
  forum_posts_count: number;
}

// =============================================================================
// 4. ASSIGNMENTS
// =============================================================================

export interface CourseAssignmentRow {
  id: string;
  course_id: string;
  course_title: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  area_name: string | null;
  due_date: string;
  assigned_by_user_id: string | null;
  assigned_by_user_name: string | null;
  created_at: string;
  progress_percent: number;
  enrollment_status: string | null;
  is_overdue: boolean;
}

export interface BulkAssignmentResult {
  created: number;
  skipped_already_assigned: number;
  skipped_not_found: number;
  course_id: string;
  due_date: string;
  affected_user_ids: string[];
}

export interface AssignmentProgressSummary {
  course_id: string;
  course_title: string;
  total_assigned: number;
  not_started: number;
  in_progress: number;
  completed: number;
  overdue: number;
  avg_progress: number;
}

// =============================================================================
// 5. FORUM
// =============================================================================

export interface ForumPostAdminRead {
  id: string;
  title: string;
  content: string;
  multimedia_url: string | null;
  status: string;
  author_id: string;
  author_email: string;
  author_full_name: string;
  area_id: string | null;
  area_name: string | null;
  comments_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ForumCommentAdminRead {
  id: string;
  post_id: string;
  post_title: string;
  parent_comment_id: string | null;
  content: string;
  author_id: string;
  author_email: string;
  author_full_name: string;
  created_at: string;
  updated_at: string | null;
}

export interface ForumStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  archived_posts: number;
  total_comments: number;
  posts_last_7d: number;
  posts_without_comments: number;
  top_authors: Array<{
    user_id: string;
    full_name: string;
    email: string;
    posts_count: number;
  }>;
}

// =============================================================================
// 6. GEMS
// =============================================================================

export interface GemAdminListItem {
  id: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  visibility: string;
  status: string;
  is_featured: boolean;
  usage_count: number;
  saved_count: number;
  category_id: string | null;
  category_name: string | null;
  area_id: string | null;
  area_name: string | null;
  created_by_user_id: string;
  created_by_user_name: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface GemCategoryRead {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  gems_count: number;
}

export interface GemTagRead {
  id: string;
  name: string;
  gems_count: number;
}

// =============================================================================
// 7. BADGES
// =============================================================================

export interface BadgeAdminRead {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  main_color: string;
  secondary_color: string;
  awarded_count: number;
  courses_linked: number;
  created_at: string;
}

export interface BadgeAwardItem {
  id: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  awarded_at: string;
}

// =============================================================================
// 8. CERTIFICATIONS
// =============================================================================

export interface UserCertificationAdminRead {
  id: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  course_certification_id: string;
  certification_title: string;
  course_id: string;
  course_title: string;
  status: string;
  requested_at: string;
  approved_at: string | null;
  issued_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  expiration_date: string | null;
  certificate_code: string | null;
  certificate_url: string | null;
}

export interface CertificationStats {
  total_requested: number;
  total_approved: number;
  total_issued: number;
  total_rejected: number;
  avg_approval_time_hours: number | null;
}

// =============================================================================
// 9. REPORTS
// =============================================================================

export interface CourseProgressReportRow {
  course_id: string;
  course_title: string;
  area_name: string | null;
  total_enrolled: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
  avg_progress: number;
  avg_score: number | null;
}

export interface UserProgressReportRow {
  user_id: string;
  full_name: string;
  email: string;
  area_name: string | null;
  total_enrollments: number;
  completed: number;
  in_progress: number;
  avg_progress: number;
  badges_count: number;
  certifications_count: number;
  last_activity_at: string | null;
}

export interface QuizReportRow {
  quiz_id: string;
  lesson_title: string;
  course_title: string;
  total_attempts: number;
  passed: number;
  failed: number;
  pass_rate: number;
  avg_score: number | null;
  hardest_question_id: string | null;
  hardest_question_text: string | null;
  hardest_question_fail_rate: number | null;
}

// =============================================================================
// 10. ENROLLMENTS
// =============================================================================

export interface EnrollmentAdminRead {
  id: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  course_id: string;
  course_title: string;
  status: string;
  progress_percent: number;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  created_at: string;
}
