// API client for the Super Admin endpoints (system, sessions, metrics, audit).

import { apiDelete, apiGet, apiPost, downloadCsv } from "./apiClient";
import type {
  ActiveUsersMetric,
  AdminActivityRow,
  AuditLogList,
  AuditLogRow,
  DatabaseHealth,
  DatabaseMetrics,
  ErrorMetric,
  HealthSummary,
  RequestMetricsBucket,
  SessionRecord,
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

export const superadminSessionsApi = {
  list: (filters: { user_id?: string; limit?: number } = {}) =>
    apiGet<SessionRecord[]>(`${BASE}/sessions`, filters),
  stats: () => apiGet<SessionStats>(`${BASE}/sessions/stats`),
  suspicious: () => apiGet<SuspiciousSession[]>(`${BASE}/sessions/suspicious`),
  revoke: (sessionId: string) => apiDelete(`${BASE}/sessions/${sessionId}`),
  revokeAllForUser: (userId: string) => apiDelete(`${BASE}/sessions/user/${userId}`),
  cleanup: () => apiPost<{ removed: number }>(`${BASE}/sessions/cleanup`),
};

export const superadminMetricsApi = {
  requests: (hours = 24) =>
    apiGet<RequestMetricsBucket[]>(`${BASE}/metrics/requests`, { hours }),
  errors: (hours = 24, limit = 50) =>
    apiGet<ErrorMetric[]>(`${BASE}/metrics/errors`, { hours, limit }),
  activeUsers: () => apiGet<ActiveUsersMetric>(`${BASE}/metrics/active-users`),
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
  actions: () => apiGet<string[]>(`${BASE}/audit-logs/actions`),
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
  activity: () => apiGet<AdminActivityRow[]>(`${BASE}/admins/activity`),
  history: (userId: string, limit = 50) =>
    apiGet<AuditLogRow[]>(`${BASE}/admins/${userId}/history`, { limit }),
  actions: (userId: string) =>
    apiGet<Record<string, number>>(`${BASE}/admins/${userId}/actions`),
};
