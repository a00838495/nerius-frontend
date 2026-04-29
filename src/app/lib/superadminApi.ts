// API client for the Super Admin endpoints (system, sessions, metrics, audit).
// Matches the actual backend in `src/api/routes/superadmin.py`.

import { apiDelete, apiGet, apiPost, downloadCsv } from "./apiClient";
import type {
  ActiveUsers,
  AdminActivityRow,
  AdminRoleHistoryRow,
  AuditAction,
  AuditLogList,
  AuditLogRow,
  CleanupResponse,
  DatabaseHealth,
  DatabaseMetrics,
  ErrorsMetrics,
  HealthSummary,
  RequestsMetrics,
  SessionList,
  SessionStats,
  SuspiciousSession,
  SystemHealth,
} from "../types/superadminPanel";

const BASE = "/api/v1/superadmin";

export const superadminHealthApi = {
  system: () => apiGet<SystemHealth>(`${BASE}/health/system`),
  database: () => apiGet<DatabaseHealth>(`${BASE}/health/database`),
  summary: () => apiGet<HealthSummary>(`${BASE}/health/summary`),
};

export interface SessionsFilters {
  page?: number;
  page_size?: number;
  user_id?: string;
  email?: string;
  only_active?: boolean;
  only_expired?: boolean;
}

export const superadminSessionsApi = {
  list: (filters: SessionsFilters = {}) =>
    apiGet<SessionList>(`${BASE}/sessions`, filters),
  stats: () => apiGet<SessionStats>(`${BASE}/sessions/stats`),
  suspicious: (min_unique_ips = 3) =>
    apiGet<SuspiciousSession[]>(`${BASE}/sessions/suspicious`, { min_unique_ips }),
  revoke: (sessionId: string) => apiDelete(`${BASE}/sessions/${sessionId}`),
  revokeAllForUser: (userId: string) => apiDelete(`${BASE}/sessions/user/${userId}`),
  cleanup: () => apiPost<CleanupResponse>(`${BASE}/sessions/cleanup`),
};

export const superadminMetricsApi = {
  requests: (hours = 24, top_n = 10) =>
    apiGet<RequestsMetrics>(`${BASE}/metrics/requests`, { hours, top_n }),
  errors: (hours = 24, top_n = 20) =>
    apiGet<ErrorsMetrics>(`${BASE}/metrics/errors`, { hours, top_n }),
  activeUsers: (hours = 24, granularity: "hour" | "day" = "hour") =>
    apiGet<ActiveUsers>(`${BASE}/metrics/active-users`, { hours, granularity }),
  database: () => apiGet<DatabaseMetrics>(`${BASE}/metrics/database`),
};

export interface AuditFilters {
  page?: number;
  page_size?: number;
  action?: string;
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const superadminAuditApi = {
  list: (filters: AuditFilters = {}) =>
    apiGet<AuditLogList>(`${BASE}/audit-logs`, filters),
  get: (id: string) => apiGet<AuditLogRow>(`${BASE}/audit-logs/${id}`),
  actions: () => apiGet<AuditAction[]>(`${BASE}/audit-logs/actions`),
  exportCsv: (filters: AuditFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    const url = `${BASE}/audit-logs/export${params.toString() ? `?${params}` : ""}`;
    return downloadCsv(url, `audit_logs_${Date.now()}.csv`);
  },
};

export const superadminAdminsApi = {
  activity: (days = 7) =>
    apiGet<AdminActivityRow[]>(`${BASE}/admins/activity`, { days }),
  history: (userId: string) =>
    apiGet<AdminRoleHistoryRow[]>(`${BASE}/admins/${userId}/history`),
  actions: (userId: string, limit = 50) =>
    apiGet<AuditLogRow[]>(`${BASE}/admins/${userId}/actions`, { limit }),
};