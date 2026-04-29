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

/** Normalize backend payload to a plain array. Backend may return:
 *  - a plain array
 *  - an object with `items` / `results` / `sessions` / `data`
 *  - null/undefined  → []
 */
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["items", "results", "sessions", "data", "errors", "logs"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

/** Normalize an audit-action listing to a string[] of action keys.
 *  Backend may return ["action_a", ...] or [{value, label, category}, ...]. */
function toStringList(data: unknown): string[] {
  const arr = toArray<unknown>(data);
  return arr
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        if (typeof obj.value === "string") return obj.value;
        if (typeof obj.action === "string") return obj.action;
        if (typeof obj.name === "string") return obj.name;
      }
      return "";
    })
    .filter(Boolean);
}

export const superadminHealthApi = {
  system: () => apiGet<SystemHealth>(`${BASE}/health/system`),
  database: () => apiGet<DatabaseHealth>(`${BASE}/health/database`),
  summary: () => apiGet<HealthSummary>(`${BASE}/health/summary`),
};

export const superadminSessionsApi = {
  list: async (filters: { user_id?: string; limit?: number } = {}) =>
    toArray<SessionRecord>(await apiGet<unknown>(`${BASE}/sessions`, filters)),
  stats: () => apiGet<SessionStats>(`${BASE}/sessions/stats`),
  suspicious: async () =>
    toArray<SuspiciousSession>(await apiGet<unknown>(`${BASE}/sessions/suspicious`)),
  revoke: (sessionId: string) => apiDelete(`${BASE}/sessions/${sessionId}`),
  revokeAllForUser: (userId: string) => apiDelete(`${BASE}/sessions/user/${userId}`),
  cleanup: () => apiPost<{ removed: number }>(`${BASE}/sessions/cleanup`),
};

export const superadminMetricsApi = {
  requests: async (hours = 24) =>
    toArray<RequestMetricsBucket>(await apiGet<unknown>(`${BASE}/metrics/requests`, { hours })),
  errors: async (hours = 24, limit = 50) =>
    toArray<ErrorMetric>(await apiGet<unknown>(`${BASE}/metrics/errors`, { hours, limit })),
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
  list: async (filters: AuditFilters = {}) => {
    const raw = await apiGet<unknown>(`${BASE}/audit-logs`, filters);
    // Backend may return { total, page, page_size, items } OR a plain array
    if (Array.isArray(raw)) {
      return {
        total: raw.length,
        page: filters.page ?? 1,
        page_size: filters.page_size ?? raw.length,
        items: raw as AuditLogRow[],
      } as AuditLogList;
    }
    const obj = (raw ?? {}) as Partial<AuditLogList> & { items?: unknown };
    return {
      total: typeof obj.total === "number" ? obj.total : 0,
      page: typeof obj.page === "number" ? obj.page : (filters.page ?? 1),
      page_size: typeof obj.page_size === "number" ? obj.page_size : (filters.page_size ?? 25),
      items: Array.isArray(obj.items) ? (obj.items as AuditLogRow[]) : [],
    };
  },
  get: (id: string) => apiGet<AuditLogRow>(`${BASE}/audit-logs/${id}`),
  actions: async () => toStringList(await apiGet<unknown>(`${BASE}/audit-logs/actions`)),
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
  activity: async () =>
    toArray<AdminActivityRow>(await apiGet<unknown>(`${BASE}/admins/activity`)),
  history: async (userId: string, limit = 50) =>
    toArray<AuditLogRow>(await apiGet<unknown>(`${BASE}/admins/${userId}/history`, { limit })),
  actions: (userId: string) =>
    apiGet<Record<string, number>>(`${BASE}/admins/${userId}/actions`),
};