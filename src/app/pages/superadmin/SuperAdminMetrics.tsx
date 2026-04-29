import { useEffect, useState } from "react";
import {
  Gauge, Loader2, Activity, AlertTriangle, Database as DbIcon, Users as UsersIcon, RefreshCw,
  Zap, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import { toast } from "sonner";
import { superadminMetricsApi } from "../../lib/superadminApi";
import type {
  ActiveUsers, DatabaseMetrics, ErrorsMetrics, RequestsMetrics,
} from "../../types/superadminPanel";

export function SuperAdminMetrics() {
  const [requests, setRequests] = useState<RequestsMetrics | null>(null);
  const [errors, setErrors] = useState<ErrorsMetrics | null>(null);
  const [active, setActive] = useState<ActiveUsers | null>(null);
  const [db, setDb] = useState<DatabaseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(24);
  const [granularity, setGranularity] = useState<"hour" | "day">("hour");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, e, a, d] = await Promise.all([
        superadminMetricsApi.requests(hours, 10),
        superadminMetricsApi.errors(hours, 20),
        superadminMetricsApi.activeUsers(hours, granularity),
        superadminMetricsApi.database(),
      ]);
      setRequests(r);
      setErrors(e);
      setActive(a);
      setDb(d);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours, granularity]);

  if (loading && !requests) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>;
  }

  const topEndpoints = requests?.top_endpoints ?? [];
  const slowestEndpoints = requests?.slowest_endpoints ?? [];
  const errorRows = errors?.by_endpoint ?? [];
  const buckets = active?.buckets ?? [];
  const tables = (db?.tables ?? []).slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <Gauge size={26} style={{ color: "#7B61FF" }} />
            Métricas del Sistema
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Auto-refresca cada minuto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={hours} onChange={(e) => setHours(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
            <option value={1}>Última hora</option>
            <option value={6}>Últimas 6h</option>
            <option value={24}>Últimas 24h</option>
            <option value={168}>Última semana</option>
          </select>
          <select value={granularity} onChange={(e) => setGranularity(e.target.value as "hour" | "day")}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
            <option value="hour">Por hora</option>
            <option value="day">Por día</option>
          </select>
          <button onClick={fetchAll} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ border: "1px solid #E8EAED", backgroundColor: "#FFF", color: "#1A2332" }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI icon={Activity} label={`Requests (${hours}h)`} value={requests?.total_requests ?? 0} color="#7B61FF" />
        <KPI icon={Clock} label="Latencia promedio" value={`${fmt(requests?.avg_duration_ms, 0)} ms`} color="#0099DC" />
        <KPI icon={AlertTriangle} label="Tasa de error" value={`${fmt((requests?.error_rate ?? 0) * 100, 2)}%`} color={(requests?.error_rate ?? 0) > 0.05 ? "#DC2626" : "#4A8A2C"} />
        <KPI icon={UsersIcon} label="Total errores" value={errors?.total_errors ?? 0} color="#E87830" />
      </div>

      {/* Active users chart */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <UsersIcon size={18} style={{ color: "#7B61FF" }} /> Usuarios activos por {granularity === "hour" ? "hora" : "día"}
        </h3>
        {buckets.length === 0 ? (
          <p style={{ color: "#9AA5B4", textAlign: "center", padding: "2rem 0" }}>
            Sin datos. Las métricas se generan a medida que llegan requests.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#9AA5B4" }}
                tickFormatter={(t) => granularity === "hour" ? new Date(t).toLocaleTimeString().slice(0, 5) : t.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9AA5B4" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9AA5B4" }} />
              <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="unique_users" name="Usuarios únicos" stroke="#7B61FF" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="request_count" name="Requests" stroke="#0099DC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Top endpoints */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
            <Zap size={18} style={{ color: "#E5A800" }} /> Endpoints más usados
          </h3>
          {topEndpoints.length === 0 ? (
            <p style={{ color: "#9AA5B4", textAlign: "center", padding: "1rem 0" }}>Sin datos</p>
          ) : (
            <div className="space-y-1">
              {topEndpoints.map((ep, i) => (
                <div key={`${ep.method}-${ep.path}-${i}`} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "#FAFBFC" }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: methodBg(ep.method), color: methodColor(ep.method) }}>{ep.method}</span>
                    <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#1A2332" }} className="truncate">{ep.path}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span style={{ color: "#7B61FF", fontWeight: 700, fontSize: "0.85rem" }}>{ep.request_count.toLocaleString()}</span>
                    <span style={{ color: "#9AA5B4", fontSize: "0.7rem" }}>{fmt(ep.avg_duration_ms, 0)}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slowest endpoints */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
            <Clock size={18} style={{ color: "#E87830" }} /> Endpoints más lentos
          </h3>
          {slowestEndpoints.length === 0 ? (
            <p style={{ color: "#9AA5B4", textAlign: "center", padding: "1rem 0" }}>Sin datos</p>
          ) : (
            <div className="space-y-1">
              {slowestEndpoints.map((ep, i) => (
                <div key={`${ep.method}-${ep.path}-${i}`} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "#FAFBFC" }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: methodBg(ep.method), color: methodColor(ep.method) }}>{ep.method}</span>
                    <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#1A2332" }} className="truncate">{ep.path}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span style={{ color: "#E87830", fontWeight: 700, fontSize: "0.85rem" }}>{fmt(ep.avg_duration_ms, 0)}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Errors */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
            <AlertTriangle size={18} style={{ color: "#DC2626" }} /> Errores
          </h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded" style={{ backgroundColor: "rgba(232,120,48,0.12)", color: "#E87830", fontWeight: 700 }}>
              4xx: {errors?.errors_4xx ?? 0}
            </span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626", fontWeight: 700 }}>
              5xx: {errors?.errors_5xx ?? 0}
            </span>
          </div>
        </div>

        {errorRows.length === 0 ? (
          <p style={{ color: "#4A8A2C", textAlign: "center", padding: "1rem 0" }}>✓ Sin errores en este periodo</p>
        ) : (
          <div className="space-y-1">
            {errorRows.slice(0, 10).map((er, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.04)" }}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626" }}>{er.status_code}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: methodBg(er.method), color: methodColor(er.method) }}>{er.method}</span>
                  <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#1A2332" }} className="truncate">{er.path}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ color: "#DC2626", fontWeight: 700, fontSize: "0.85rem" }}>{er.count}</span>
                  <span style={{ color: "#9AA5B4", fontSize: "0.7rem" }}>{new Date(er.last_seen_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DB tables */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-3" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <DbIcon size={18} style={{ color: "#7B61FF" }} /> Tablas con más filas
        </h3>
        {tables.length === 0 ? (
          <p style={{ color: "#9AA5B4", textAlign: "center", padding: "1rem 0" }}>Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, tables.length * 28)}>
            <BarChart data={tables} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9AA5B4" }} />
              <YAxis type="category" dataKey="table_name" width={140} tick={{ fontSize: 11, fill: "#1A2332" }} />
              <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="row_count" name="Filas" radius={[0, 6, 6, 0]}>
                {tables.map((_, i) => (
                  <Cell key={i} fill={["#7B61FF", "#0099DC", "#4A8A2C", "#E5A800", "#E87830"][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color }} />
        <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>{label}</p>
      </div>
      <p style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1A2332" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function methodColor(method: string): string {
  const m = method.toUpperCase();
  if (m === "GET") return "#0099DC";
  if (m === "POST") return "#4A8A2C";
  if (m === "PUT") return "#E5A800";
  if (m === "DELETE") return "#DC2626";
  if (m === "PATCH") return "#7B61FF";
  return "#6B7A8D";
}

function methodBg(method: string): string {
  const m = method.toUpperCase();
  if (m === "GET") return "rgba(0,153,220,0.12)";
  if (m === "POST") return "rgba(74,138,44,0.12)";
  if (m === "PUT") return "rgba(229,168,0,0.12)";
  if (m === "DELETE") return "rgba(220,38,38,0.12)";
  if (m === "PATCH") return "rgba(123,97,255,0.12)";
  return "rgba(107,122,141,0.12)";
}