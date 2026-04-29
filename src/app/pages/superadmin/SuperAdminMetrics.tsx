import { useEffect, useState } from "react";
import {
  Gauge, Loader2, Activity, AlertTriangle, Database, Users as UsersIcon, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
} from "recharts";
import { toast } from "sonner";
import { superadminMetricsApi } from "../../lib/superadminApi";
import type {
  ActiveUsersMetric, DatabaseMetrics, ErrorMetric, RequestMetricsBucket,
} from "../../types/superadminPanel";

export function SuperAdminMetrics() {
  const [requests, setRequests] = useState<RequestMetricsBucket[]>([]);
  const [errors, setErrors] = useState<ErrorMetric[]>([]);
  const [active, setActive] = useState<ActiveUsersMetric | null>(null);
  const [db, setDb] = useState<DatabaseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(24);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, e, a, d] = await Promise.all([
        superadminMetricsApi.requests(hours),
        superadminMetricsApi.errors(hours, 50),
        superadminMetricsApi.activeUsers(),
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
  }, [hours]);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>;
  }

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
          <button onClick={fetchAll} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ border: "1px solid #E8EAED", backgroundColor: "#FFF", color: "#1A2332" }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat icon={UsersIcon} label="Activos ahora" value={active?.active_now ?? 0} color="#4A8A2C" />
        <Stat icon={Activity} label="Activos hoy" value={active?.active_today ?? 0} color="#0099DC" />
        <Stat icon={Activity} label="Activos 7d" value={active?.active_last_7d ?? 0} color="#7B61FF" />
        <Stat icon={Database} label="Total inscripciones" value={db?.total_enrollments ?? 0} color="#E5A800" />
      </div>

      {/* Requests chart */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <Activity size={18} style={{ color: "#7B61FF" }} /> Solicitudes y latencia
        </h3>
        {(requests ?? []).length === 0 ? (
          <p style={{ color: "#9AA5B4", textAlign: "center", padding: "2rem 0" }}>
            Sin datos. Las métricas se generan a medida que llegan requests.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={requests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#9AA5B4" }} tickFormatter={(t) => new Date(t).toLocaleTimeString().slice(0, 5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9AA5B4" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9AA5B4" }} />
              <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="requests" name="Requests" stroke="#7B61FF" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="avg_latency_ms" name="Lat. promedio (ms)" stroke="#0099DC" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="p95_latency_ms" name="Lat. p95 (ms)" stroke="#E87830" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Errors */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <AlertTriangle size={18} style={{ color: "#DC2626" }} /> Errores recientes
        </h3>
        {(requests ?? []).length > 0 && (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={requests}>
              <defs>
                <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#9AA5B4" }} tickFormatter={(t) => new Date(t).toLocaleTimeString().slice(0, 5)} />
              <YAxis tick={{ fontSize: 10, fill: "#9AA5B4" }} />
              <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="errors" name="Errores" stroke="#DC2626" fill="url(#gErr)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {errors.length === 0 ? (
          <p className="mt-4" style={{ color: "#4A8A2C", textAlign: "center" }}>✓ Sin errores en este periodo</p>
        ) : (
          <div className="mt-4 space-y-1">
            {errors.slice(0, 10).map((er, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.04)" }}>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626" }}>
                    {er.status_code}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#1A2332" }} className="truncate">{er.endpoint}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ color: "#DC2626", fontWeight: 700, fontSize: "0.78rem" }}>{er.count}</span>
                  <span style={{ color: "#9AA5B4", fontSize: "0.7rem" }}>{new Date(er.last_seen).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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