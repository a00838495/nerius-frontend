// Types for super admin endpoints (system, sessions, metrics, audit, admin activity)

// =============================================================================
// HEALTH
// =============================================================================

export interface SystemHealth {
  status: string;
  uptime_seconds: number;
  cpu_percent: number;
  memory_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  python_version?: string;
  platform?: string;
}

export interface DatabaseHealth {
  status: string;
  dialect: string;
  connection_pool_size?: number | null;
  active_connections?: number | null;
  total_tables?: number | null;
  database_size_mb?: number | null;
  latency_ms?: number | null;
}

export interface HealthSummary {
  status: string;
  system: SystemHealth;
  database: DatabaseHealth;
  timestamp: string;
}

// =============================================================================
// SESSIONS
// =============================================================================

export interface SessionRecord {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
  last_activity_at: string | null;
  is_current: boolean;
}

export interface SessionStats {
  total_active: number;
  unique_users: number;
  expiring_soon: number;
  by_user_agent: Array<{ user_agent: string; count: number }>;
}

export interface SuspiciousSession {
  user_id: string;
  user_email: string;
  user_full_name: string;
  active_sessions: number;
  unique_ips: number;
  ips: string[];
}

// =============================================================================
// METRICS
// =============================================================================

export interface RequestMetricsBucket {
  timestamp: string;
  requests: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  errors: number;
}

export interface ErrorMetric {
  status_code: number;
  count: number;
  endpoint: string;
  last_seen: string;
}

export interface ActiveUsersMetric {
  active_now: number;
  active_today: number;
  active_last_7d: number;
}

export interface DatabaseMetrics {
  total_users: number;
  total_sessions: number;
  total_courses: number;
  total_enrollments: number;
  database_size_mb: number | null;
  latency_ms: number | null;
}

// =============================================================================
// AUDIT
// =============================================================================

export interface AuditLogRow {
  id: string;
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
  created_at: string;
}

export interface AuditLogList {
  total: number;
  page: number;
  page_size: number;
  items: AuditLogRow[];
}

// =============================================================================
// ADMINS ACTIVITY
// =============================================================================

export interface AdminActivityRow {
  user_id: string;
  user_email: string;
  user_full_name: string;
  roles: string[];
  total_actions_30d: number;
  actions_today: number;
  last_action_at: string | null;
  most_common_action: string | null;
}
