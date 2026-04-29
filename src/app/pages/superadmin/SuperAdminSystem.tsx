import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Server, Loader2, Cpu, MemoryStick, HardDrive, Database, RefreshCw, CheckCircle,
  AlertTriangle, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { superadminHealthApi } from "../../lib/superadminApi";
import type { SystemHealth, DatabaseHealth } from "../../types/superadminPanel";

export function SuperAdminSystem() {
  const [system, setSystem] = useState<SystemHealth | null>(null);
  const [database, setDatabase] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [s, d] = await Promise.all([superadminHealthApi.system(), superadminHealthApi.database()]);
      setSystem(s);
      setDatabase(d);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => fetchAll(false), 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>;
  }
  if (!system || !database) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <Server size={26} style={{ color: "#7B61FF" }} />
            Sistema y Base de Datos
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Auto-refresca cada 30 segundos
          </p>
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing}
          className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{ border: "1px solid #E8EAED", backgroundColor: "#FFF", color: "#1A2332" }}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {/* Status banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl p-5 mb-5"
        style={{ backgroundColor: system.status === "healthy" ? "rgba(74,138,44,0.08)" : "rgba(220,38,38,0.08)", border: `1px solid ${system.status === "healthy" ? "rgba(74,138,44,0.25)" : "rgba(220,38,38,0.25)"}` }}>
        <div className="flex items-center gap-3">
          {system.status === "healthy" ? (
            <CheckCircle size={24} style={{ color: "#4A8A2C" }} />
          ) : (
            <AlertTriangle size={24} style={{ color: "#DC2626" }} />
          )}
          <div>
            <p style={{ fontWeight: 700, color: "#1A2332" }}>
              Sistema: <span style={{ color: system.status === "healthy" ? "#4A8A2C" : "#DC2626", textTransform: "capitalize" }}>{system.status}</span>
            </p>
            <p style={{ color: "#6B7A8D", fontSize: "0.8rem", marginTop: "0.15rem" }} className="flex items-center gap-1">
              <Clock size={12} /> Uptime: {formatUptime(system.uptime_seconds)}
              {system.platform && <> · {system.platform}</>}
              {system.python_version && <> · Python {system.python_version}</>}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Resource bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <ResourceCard icon={Cpu} label="CPU" percent={system.cpu_percent} subtitle={`${system.cpu_percent.toFixed(1)}% en uso`} color="#0099DC" />
        <ResourceCard icon={MemoryStick} label="Memoria" percent={system.memory_percent} subtitle={`${system.memory_used_mb.toFixed(0)} / ${system.memory_total_mb.toFixed(0)} MB`} color="#7B61FF" />
        <ResourceCard icon={HardDrive} label="Disco" percent={system.disk_percent} subtitle={`${system.disk_used_gb.toFixed(1)} / ${system.disk_total_gb.toFixed(1)} GB`} color="#E5A800" />
      </div>

      {/* Database details */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <Database size={18} style={{ color: "#7B61FF" }} /> Base de datos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DbRow label="Estado" value={database.status} highlight={database.status === "healthy"} />
          <DbRow label="Dialect" value={database.dialect} />
          <DbRow label="Latencia" value={database.latency_ms !== null && database.latency_ms !== undefined ? `${database.latency_ms.toFixed(2)} ms` : "—"} />
          <DbRow label="Pool size" value={String(database.connection_pool_size ?? "—")} />
          <DbRow label="Conexiones activas" value={String(database.active_connections ?? "—")} />
          <DbRow label="Total tablas" value={String(database.total_tables ?? "—")} />
          <DbRow label="Tamaño de BD" value={database.database_size_mb !== null && database.database_size_mb !== undefined ? `${database.database_size_mb.toFixed(2)} MB` : "—"} />
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ icon: Icon, label, percent, subtitle, color }: { icon: typeof Cpu; label: string; percent: number; subtitle: string; color: string }) {
  const danger = percent > 90;
  const warn = percent > 75;
  const barColor = danger ? "#DC2626" : warn ? "#E87830" : color;
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{ color: "#1A2332", fontWeight: 700, fontSize: "0.95rem" }}>{label}</span>
      </div>
      <p style={{ fontWeight: 800, fontSize: "2rem", color: barColor, lineHeight: 1 }}>{percent.toFixed(1)}%</p>
      <div className="h-2 rounded-full overflow-hidden mt-2 mb-2" style={{ backgroundColor: "#F0F1F5" }}>
        <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", backgroundColor: barColor, transition: "width 300ms" }} />
      </div>
      <p style={{ color: "#6B7A8D", fontSize: "0.78rem" }}>{subtitle}</p>
    </div>
  );
}

function DbRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFBFC" }}>
      <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{label}</p>
      <p style={{ color: highlight ? "#4A8A2C" : "#1A2332", fontWeight: 700, fontSize: "0.95rem", textTransform: highlight ? "capitalize" : undefined }}>
        {value}
      </p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (!seconds) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
