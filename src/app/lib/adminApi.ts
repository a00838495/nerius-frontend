// API client for the Admin panel modules (10 features).

import { apiDelete, apiGet, apiPost, apiPut, downloadCsv } from "./apiClient";
import type {
  AreaAdminRead,
  AssignmentProgressSummary,
  BadgeAdminRead,
  BadgeAwardItem,
  BulkAssignmentResult,
  CertificationStats,
  CourseAssignmentRow,
  CourseProgressReportRow,
  DashboardActivityBucket,
  DashboardCompletionByArea,
  DashboardCounters,
  DashboardCoursePopularity,
  DashboardOverview,
  EnrollmentAdminRead,
  ForumCommentAdminRead,
  ForumPostAdminRead,
  ForumStats,
  GemAdminListItem,
  GemCategoryRead,
  GemTagRead,
  PaginatedList,
  QuizReportRow,
  UserAdminListItem,
  UserAdminRead,
  UserCertificationAdminRead,
  UserProgressReportRow,
} from "../types/adminPanel";

const BASE = "/api/v1/admin";

// =============================================================================
// 1. DASHBOARD
// =============================================================================

export const adminDashboardApi = {
  counters: () => apiGet<DashboardCounters>(`${BASE}/dashboard/counters`),
  popularCourses: (limit = 10) =>
    apiGet<DashboardCoursePopularity[]>(`${BASE}/dashboard/popular-courses`, { limit }),
  completionByArea: () =>
    apiGet<DashboardCompletionByArea[]>(`${BASE}/dashboard/completion-by-area`),
  activity: (days = 30) =>
    apiGet<DashboardActivityBucket[]>(`${BASE}/dashboard/activity`, { days }),
  overview: () => apiGet<DashboardOverview>(`${BASE}/dashboard/overview`),
};

// =============================================================================
// 2. USERS
// =============================================================================

export interface UsersFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  area_id?: string;
  role?: string;
  has_admin_role?: boolean;
}

export const adminUsersApi = {
  list: (filters: UsersFilters = {}) =>
    apiGet<PaginatedList<UserAdminListItem>>(`${BASE}/users-management`, filters),
  get: (id: string) => apiGet<UserAdminRead>(`${BASE}/users-management/${id}`),
  create: (body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    gender?: string | null;
    area_id?: string | null;
  }) => apiPost<UserAdminRead>(`${BASE}/users-management`, body),
  update: (
    id: string,
    body: {
      first_name?: string;
      last_name?: string;
      email?: string;
      gender?: string | null;
      area_id?: string | null;
    },
  ) => apiPut<UserAdminRead>(`${BASE}/users-management/${id}`, body),
  setStatus: (id: string, status: "active" | "inactive" | "suspended") =>
    apiPut<UserAdminRead>(`${BASE}/users-management/${id}/status`, { status }),
  resetPassword: (id: string, new_password: string) =>
    apiPost<{ user_id: string; message: string }>(
      `${BASE}/users-management/${id}/reset-password`,
      { new_password },
    ),
  enrollments: (id: string) =>
    apiGet<
      Array<{
        id: string;
        course_id: string;
        course_title: string | null;
        status: string;
        progress_percent: number;
        score: number | null;
        started_at: string | null;
        completed_at: string | null;
        created_at: string;
      }>
    >(`${BASE}/users-management/${id}/enrollments`),
};

// =============================================================================
// 3. AREAS
// =============================================================================

export const adminAreasApi = {
  list: () => apiGet<AreaAdminRead[]>(`${BASE}/areas-management`),
  get: (id: string) => apiGet<AreaAdminRead>(`${BASE}/areas-management/${id}`),
  create: (name: string) => apiPost<AreaAdminRead>(`${BASE}/areas-management`, { name }),
  update: (id: string, name: string) =>
    apiPut<AreaAdminRead>(`${BASE}/areas-management/${id}`, { name }),
  remove: (id: string) => apiDelete(`${BASE}/areas-management/${id}`),
};

// =============================================================================
// 4. ASSIGNMENTS
// =============================================================================

export interface AssignmentsFilters {
  page?: number;
  page_size?: number;
  course_id?: string;
  user_id?: string;
  area_id?: string;
  overdue_only?: boolean;
  search?: string;
}

export const adminAssignmentsApi = {
  list: (filters: AssignmentsFilters = {}) =>
    apiGet<PaginatedList<CourseAssignmentRow>>(`${BASE}/assignments`, filters),
  bulkCreate: (body: {
    course_id: string;
    due_date: string;
    user_ids?: string[];
    area_ids?: string[];
    notify?: boolean;
  }) => apiPost<BulkAssignmentResult>(`${BASE}/assignments/bulk`, body),
  remove: (id: string) => apiDelete(`${BASE}/assignments/${id}`),
  progressSummary: (course_id: string) =>
    apiGet<AssignmentProgressSummary>(
      `${BASE}/assignments/courses/${course_id}/progress-summary`,
    ),
};

// =============================================================================
// 5. FORUM
// =============================================================================

export interface ForumPostsFilters {
  page?: number;
  page_size?: number;
  status?: string;
  area_id?: string;
  author_id?: string;
  search?: string;
  no_comments?: boolean;
}

export const adminForumApi = {
  posts: (filters: ForumPostsFilters = {}) =>
    apiGet<PaginatedList<ForumPostAdminRead>>(`${BASE}/forum-moderation/posts`, filters),
  getPost: (id: string) =>
    apiGet<ForumPostAdminRead>(`${BASE}/forum-moderation/posts/${id}`),
  updatePost: (id: string, body: { title?: string; content?: string; multimedia_url?: string | null }) =>
    apiPut<ForumPostAdminRead>(`${BASE}/forum-moderation/posts/${id}`, body),
  setPostStatus: (id: string, status: string) =>
    apiPut<ForumPostAdminRead>(`${BASE}/forum-moderation/posts/${id}/status`, { status }),
  deletePost: (id: string) => apiDelete(`${BASE}/forum-moderation/posts/${id}`),
  comments: (filters: { page?: number; page_size?: number; post_id?: string; author_id?: string; search?: string } = {}) =>
    apiGet<PaginatedList<ForumCommentAdminRead>>(`${BASE}/forum-moderation/comments`, filters),
  deleteComment: (id: string) => apiDelete(`${BASE}/forum-moderation/comments/${id}`),
  stats: () => apiGet<ForumStats>(`${BASE}/forum-moderation/stats`),
};

// =============================================================================
// 6. GEMS
// =============================================================================

export interface GemsFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  category_id?: string;
  area_id?: string;
  is_featured?: boolean;
  sort_by?: string;
}

export const adminGemsApi = {
  list: (filters: GemsFilters = {}) =>
    apiGet<PaginatedList<GemAdminListItem>>(`${BASE}/gems-global/gems`, filters),
  get: (id: string) => apiGet<GemAdminListItem>(`${BASE}/gems-global/gems/${id}`),
  create: (body: Record<string, unknown>) =>
    apiPost<GemAdminListItem>(`${BASE}/gems-global/gems`, body),
  update: (id: string, body: Record<string, unknown>) =>
    apiPut<GemAdminListItem>(`${BASE}/gems-global/gems/${id}`, body),
  remove: (id: string) => apiDelete(`${BASE}/gems-global/gems/${id}`),

  // Categories
  categories: () => apiGet<GemCategoryRead[]>(`${BASE}/gems-global/categories`),
  createCategory: (body: { name: string; description?: string; icon?: string; sort_order?: number }) =>
    apiPost<GemCategoryRead>(`${BASE}/gems-global/categories`, body),
  updateCategory: (id: string, body: Record<string, unknown>) =>
    apiPut<GemCategoryRead>(`${BASE}/gems-global/categories/${id}`, body),
  removeCategory: (id: string) => apiDelete(`${BASE}/gems-global/categories/${id}`),

  // Tags
  tags: () => apiGet<GemTagRead[]>(`${BASE}/gems-global/tags`),
  createTag: (name: string) => apiPost<GemTagRead>(`${BASE}/gems-global/tags`, { name }),
  removeTag: (id: string) => apiDelete(`${BASE}/gems-global/tags/${id}`),
};

// =============================================================================
// 7. BADGES
// =============================================================================

export const adminBadgesApi = {
  list: (search?: string) =>
    apiGet<BadgeAdminRead[]>(`${BASE}/badges-global`, { search }),
  get: (id: string) => apiGet<BadgeAdminRead>(`${BASE}/badges-global/${id}`),
  create: (body: {
    name: string;
    description?: string;
    icon_url?: string;
    main_color?: string;
    secondary_color?: string;
  }) => apiPost<BadgeAdminRead>(`${BASE}/badges-global`, body),
  update: (id: string, body: Record<string, unknown>) =>
    apiPut<BadgeAdminRead>(`${BASE}/badges-global/${id}`, body),
  remove: (id: string) => apiDelete(`${BASE}/badges-global/${id}`),
  awards: (id: string, limit = 100) =>
    apiGet<BadgeAwardItem[]>(`${BASE}/badges-global/${id}/awards`, { limit }),
};

// =============================================================================
// 8. CERTIFICATIONS
// =============================================================================

export interface CertificationsFilters {
  page?: number;
  page_size?: number;
  status?: string;
  course_id?: string;
  user_id?: string;
  search?: string;
}

export const adminCertificationsApi = {
  list: (filters: CertificationsFilters = {}) =>
    apiGet<PaginatedList<UserCertificationAdminRead>>(
      `${BASE}/certifications-issued`,
      filters,
    ),
  get: (id: string) =>
    apiGet<UserCertificationAdminRead>(`${BASE}/certifications-issued/${id}`),
  approve: (
    id: string,
    body: { issue_now?: boolean; expiration_date?: string; certificate_url?: string },
  ) =>
    apiPost<UserCertificationAdminRead>(
      `${BASE}/certifications-issued/${id}/approve`,
      body,
    ),
  reject: (id: string, reason: string) =>
    apiPost<UserCertificationAdminRead>(
      `${BASE}/certifications-issued/${id}/reject`,
      { reason },
    ),
  revoke: (id: string) =>
    apiPost<UserCertificationAdminRead>(`${BASE}/certifications-issued/${id}/revoke`),
  stats: () => apiGet<CertificationStats>(`${BASE}/certifications-issued/stats/summary`),
};

// =============================================================================
// 9. REPORTS
// =============================================================================

export const adminReportsApi = {
  coursesProgress: (area_id?: string) =>
    apiGet<CourseProgressReportRow[]>(`${BASE}/reports/courses-progress`, { area_id }),
  exportCoursesProgress: (area_id?: string) => {
    const url = area_id
      ? `${BASE}/reports/courses-progress/export?area_id=${encodeURIComponent(area_id)}`
      : `${BASE}/reports/courses-progress/export`;
    return downloadCsv(url, `cursos_progreso_${Date.now()}.csv`);
  },
  usersProgress: (filters: { area_id?: string; limit?: number } = {}) =>
    apiGet<UserProgressReportRow[]>(`${BASE}/reports/users-progress`, filters),
  exportUsersProgress: (area_id?: string) => {
    const url = area_id
      ? `${BASE}/reports/users-progress/export?area_id=${encodeURIComponent(area_id)}`
      : `${BASE}/reports/users-progress/export`;
    return downloadCsv(url, `usuarios_progreso_${Date.now()}.csv`);
  },
  quizzes: (course_id?: string) =>
    apiGet<QuizReportRow[]>(`${BASE}/reports/quizzes`, { course_id }),
};

// =============================================================================
// 10. ENROLLMENTS
// =============================================================================

export interface EnrollmentsFilters {
  page?: number;
  page_size?: number;
  course_id?: string;
  user_id?: string;
  status?: string;
  search?: string;
}

export const adminEnrollmentsApi = {
  list: (filters: EnrollmentsFilters = {}) =>
    apiGet<PaginatedList<EnrollmentAdminRead>>(`${BASE}/enrollments-management`, filters),
  get: (id: string) =>
    apiGet<EnrollmentAdminRead>(`${BASE}/enrollments-management/${id}`),
  setStatus: (id: string, status: string) =>
    apiPut<EnrollmentAdminRead>(`${BASE}/enrollments-management/${id}/status`, { status }),
  cancel: (id: string) => apiDelete(`${BASE}/enrollments-management/${id}`),
};

// =============================================================================
// COURSES MINI (helper para selects/filtros)
// =============================================================================

export const adminCoursesMiniApi = {
  list: () =>
    apiGet<Array<{ id: string; title: string; status: string }>>(`${BASE}/courses`),
};
