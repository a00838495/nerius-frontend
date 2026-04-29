import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Crown, Cpu, MemoryStick, HardDrive, Database, Users as UsersIcon, KeyRound, Activity,
  CheckCircle, AlertTriangle, Loader2, Server,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  superadminHealthApi, superadminMetricsApi, superadminSessionsApi,
} from "../lib/superadminApi";
import type {
  HealthSummary, ActiveUsers, DatabaseMetrics, SessionStats,
} from "../types/superadminPanel";

export function SuperAdminDashboard() {
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUsers | null>(null);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [h, a, d, s] = await Promise.all([
        superadminHealthApi.summary(),
        superadminMetricsApi.activeUsers(24, "hour"),
        superadminMetricsApi.database(),
        superadminSessionsApi.stats(),
      ]);
      setHealth(h);
      setActiveUsers(a);
      setDbMetrics(d);
      setSessionStats(s);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} />
      </div>
    );
  }

  const isHealthy = health?.status === "ok" || health?.status === "healthy";

  // Active users: last bucket = "now", sum of all buckets = period total
  const buckets = activeUsers?.buckets ?? [];
  const activeNow = buckets.length > 0 ? buckets[buckets.length - 1]?.unique_users ?? 0 : 0;
  const activeToday = buckets.reduce((sum, b) => Math.max(sum, b.unique_users), 0);

  // DB metrics: derive totals from tables array
  const tables = dbMetrics?.tables ?? [];
  const findTable = (name: string) =>
    tables.find((t) => t.table_name.toLowerCase() === name.toLowerCase())?.row_count ?? 0;

  const totalUsers = findTable("users");
  const totalCourses = findTable("courses");
  const totalEnrollments = findTable("enrollments");
  const totalSessions = findTable("sessions");

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.25)" }}>
          <Crown size={13} style={{ color: "#7B61FF" }} />
          <span style={{ color: "#7B61FF", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            SUPER ADMIN
          </span>
        </div>
        <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#1A2332" }}>
          Control Total de la Plataforma
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Sistema, sesiones, métricas y auditoría — datos en tiempo real
        </p>
      </div>

      {/* Health summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-5 flex items-center justify-between"
        style={{
          background: isHealthy ? "linear-gradient(135deg, #4A8A2C, #6FB845)" : "linear-gradient(135deg, #DC2626, #F87171)",
          color: "#FFF",
        }}>
        <div className="flex items-center gap-3">
          {isHealthy ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          <div>
            <p style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              Sistema {isHealthy ? "saludable" : "requiere atención"}
            </p>
            <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              Último check: {new Date(health?.timestamp ?? Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p style={{ fontSize: "0.78rem", opacity: 0.8 }}>UPTIME</p>
          <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>
            {formatUptime(health?.system?.process?.uptime_seconds ?? 0)}
          </p>
        </div>
      </motion.div>

      {/* Resource gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Gauge
          label="CPU"
          value={health?.system?.cpu?.percent ?? 0}
          icon={Cpu}
          color="#0099DC"
          subtitle={`${fmt(health?.system?.cpu?.percent, 1)}% • ${health?.system?.cpu?.count_logical ?? "—"} cores`}
        />
        <Gauge
          label="Memoria"
          value={health?.system?.memory?.percent ?? 0}
          icon={MemoryStick}
          color="#7B61FF"
          subtitle={`${fmt(health?.system?.memory?.used_mb, 0)} / ${fmt(health?.system?.memory?.total_mb, 0)} MB`}
        />
        <Gauge
          label="Disco"
          value={health?.system?.disk?.percent ?? 0}
          icon={HardDrive}
          color="#E5A800"
          subtitle={`${fmt(health?.system?.disk?.used_gb, 1)} / ${fmt(health?.system?.disk?.total_gb, 1)} GB`}
        />
      </div>

      {/* Stats counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Stat icon={UsersIcon} label="Activos ahora" value={activeNow} color="#4A8A2C" />
        <Stat icon={Activity} label="Pico hoy" value={activeToday} color="#0099DC" />
        <Stat icon={KeyRound} label="Sesiones activas" value={sessionStats?.total_active ?? 0} color="#7B61FF" />
        <Stat icon={AlertTriangle} label="Sesiones expiradas" value={sessionStats?.total_expired ?? 0} color="#E87830" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* DB metrics */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <h3 className="flex items-center gap-2" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
            <Database size={18} style={{ color: "#7B61FF" }} /> Base de datos
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <DbStat label="Usuarios" value={totalUsers} />
            <DbStat label="Cursos" value={totalCourses} />
            <DbStat label="Inscripciones" value={totalEnrollments} />
            <DbStat label="Sesiones (todas)" value={totalSessions} />
            <DbStat label="Tamaño BD" value={health?.database?.total_size_mb != null ? `${fmt(health.database.total_size_mb, 1)} MB` : "—"} />
            <DbStat label="Latencia" value={health?.database?.latency_ms != null ? `${health.database.latency_ms} ms` : "—"} />
          </div>
        </div>

        {/* System info */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <h3 className="flex items-center gap-2" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
            <Server size={18} style={{ color: "#7B61FF" }} /> Sistema
          </h3>
          <div className="space-y-2 text-sm">
            <Row label="Estado" value={health?.system?.status ?? "—"} />
            <Row label="Python" value={getPlatform(health, "python_version")} />
            <Row label="Plataforma" value={formatPlatformLabel(health?.system?.platform)} />
            <Row label="DB Dialect" value={health?.database?.dialect ?? "—"} />
            <Row label="DB Conectada" value={health?.database?.connected ? "Sí" : "No"} />
            <Row label="Total tablas" value={String(health?.database?.table_count ?? "—")} />
            <Row label="Hilos del proceso" value={String(health?.system?.process?.threads ?? "—")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Gauge({ label, value, icon: Icon, color, subtitle }: {
  label: string; value: number; icon: typeof Cpu; color: string; subtitle: string;
}) {
  const pct = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const danger = pct > 90;
  const warn = pct > 75;
  const barColor = danger ? "#DC2626" : warn ? "#E87830" : color;
  const data = [{ name: "used", value: pct }, { name: "free", value: 100 - pct }];

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{ color: "#1A2332", fontWeight: 700, fontSize: "0.95rem" }}>{label}</span>
      </div>
      <div className="relative" style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={45} outerRadius={60} startAngle={90} endAngle={-270}>
              <Cell fill={barColor} />
              <Cell fill="#F0F1F5" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <p style={{ fontWeight: 800, fontSize: "1.5rem", color: barColor }}>{pct.toFixed(0)}%</p>
        </div>
      </div>
      <p style={{ color: "#6B7A8D", fontSize: "0.78rem", textAlign: "center", marginTop: "0.5rem" }}>{subtitle}</p>
    </div>
  );
}

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function getPlatform(health: HealthSummary | null, key: string): string {
  const pf = health?.system?.platform;
  if (pf && typeof pf === "object") {
    const v = (pf as Record<string, unknown>)[key];
    if (typeof v === "string") return v;
  }
  return "—";
}

function formatPlatformLabel(platform: unknown): string {
  if (!platform || typeof platform !== "object") return "—";
  const p = platform as Record<string, unknown>;
  const system = typeof p.system === "string" ? p.system : "";
  const release = typeof p.release === "string" ? p.release : "";
  const machine = typeof p.machine === "string" ? p.machine : "";
  const label = [system, release, machine].filter(Boolean).join(" ");
  return label || "—";
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof UsersIcon; label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color }} />
        <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>{label}</p>
      </div>
      <p style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1A2332" }}>{value.toLocaleString()}</p>
    </div>
  );
}

function DbStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFBFC" }}>
      <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{label}</p>
      <p style={{ color: "#1A2332", fontWeight: 700, fontSize: "1rem" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "#F0F1F5" }}>
      <span style={{ color: "#6B7A8D", fontSize: "0.85rem" }}>{label}</span>
      <span style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{value}</span>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (!seconds) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}