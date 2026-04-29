// Types for super admin endpoints — aligned to the actual backend shapes
// (`src/schemas/superadmin.py`).

// =============================================================================
// HEALTH
// =============================================================================

export interface CPUInfo {
  percent: number;
  count_logical: number;
  count_physical: number | null;
}

export interface MemoryInfo {
  total_mb: number;
  available_mb: number;
  used_mb: number;
  percent: number;
}

export interface DiskInfo {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

export interface ProcessInfo {
  pid: number;
  memory_mb: number;
  cpu_percent: number;
  threads: number;
  started_at: string;
  uptime_seconds: number;
}

export interface SystemHealth {
  status: string; // "ok" | "degraded" | "error"
  timestamp: string;
  cpu: CPUInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  process: ProcessInfo;
  platform: Record<string, unknown>; // { system, release, machine, python_version, ... }
}

export interface LargestTable {
  table_name: string;
  size_mb: number;
  row_count?: number | null;
}

export interface DatabaseHealth {
  status: string;
  timestamp: string;
  connected: boolean;
  latency_ms: number | null;
  dialect: string;
  total_size_mb: number | null;
  table_count: number | null;
  largest_tables: LargestTable[];
  error: string | null;
}

export interface HealthSummary {
  status: string;
  timestamp: string;
  system: SystemHealth;
  database: DatabaseHealth;
}

// =============================================================================
// SESSIONS
// =============================================================================

export interface SessionRecord {
  id: string;
  user_id: string;
  user_email: string | null;
  user_full_name: string | null;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  user_agent: string | null;
  ip_address: string | null;
  is_expired: boolean;
}

export interface SessionList {
  total: number;
  page: number;
  page_size: number;
  items: SessionRecord[];
}

export interface SessionStats {
  total_active: number;
  total_expired: number;
  unique_users: number;
  sessions_last_24h: number;
  sessions_last_7d: number;
  sessions_by_day: Array<{ date: string; count: number }>;
}

export interface SuspiciousSession {
  user_id: string;
  user_email: string | null;
  user_full_name: string | null;
  reason: string;
  session_count: number;
  unique_ips: number;
  sessions: SessionRecord[];
}

export interface CleanupResponse {
  deleted: number;
  message: string;
}

// =============================================================================
// METRICS
// =============================================================================

export interface EndpointMetric {
  method: string;
  path: string;
  request_count: number;
  avg_duration_ms: number;
  p95_duration_ms?: number | null;
  error_rate: number;
  last_called_at: string | null;
}

export interface RequestsMetrics {
  period_hours: number;
  total_requests: number;
  avg_duration_ms: number;
  error_rate: number;
  top_endpoints: EndpointMetric[];
  slowest_endpoints: EndpointMetric[];
}

export interface ErrorMetric {
  method: string;
  path: string;
  status_code: number;
  count: number;
  last_seen_at: string;
}

export interface ErrorsMetrics {
  period_hours: number;
  total_errors: number;
  errors_4xx: number;
  errors_5xx: number;
  by_endpoint: ErrorMetric[];
}

export interface ActiveUsersBucket {
  bucket: string;
  unique_users: number;
  request_count: number;
}

export interface ActiveUsers {
  granularity: string; // "hour" | "day"
  period_hours: number;
  buckets: ActiveUsersBucket[];
}

export interface TableMetric {
  table_name: string;
  row_count: number;
  growth_24h: number | null;
}

export interface DatabaseMetrics {
  timestamp: string;
  tables: TableMetric[];
}

// =============================================================================
// AUDIT
// =============================================================================

export interface AuditLogRow {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  user_full_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  description: string | null;
  extra_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuditLogList {
  total: number;
  page: number;
  page_size: number;
  items: AuditLogRow[];
}

export interface AuditAction {
  value: string;
  label: string;
  category: string;
}

// =============================================================================
// ADMINS ACTIVITY
// =============================================================================

export interface AdminActivityRow {
  user_id: string;
  email: string;
  full_name: string;
  role_names: string[];
  last_login_at: string | null;
  actions_last_7d: number;
  last_action_at: string | null;
}

export interface AdminRoleHistoryRow {
  timestamp: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  description: string | null;
  extra_data: Record<string, unknown> | null;
}