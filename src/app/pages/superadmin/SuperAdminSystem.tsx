import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Server, Loader2, Cpu, MemoryStick, HardDrive, Database, RefreshCw, CheckCircle,
  AlertTriangle, Clock, Table2,
} from "lucide-react";
import { toast } from "sonner";
import { superadminHealthApi } from "../../lib/superadminApi";
import type { SystemHealth, DatabaseHealth } from "../../types/superadminPanel";
import { formatServerDateTime } from "./utils/serverTime";

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

  const sysHealthy = system.status === "ok" || system.status === "healthy";
  const dbHealthy = database.status === "ok" || database.status === "healthy";

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
          <p className="flex items-center gap-1" style={{ color: "#6B7A8D", marginTop: "0.15rem", fontSize: "0.8rem" }}>
            <Clock size={12} /> Hora del servidor: {formatServerDateTime(system.timestamp)}
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
        style={{
          backgroundColor: sysHealthy ? "rgba(74,138,44,0.08)" : "rgba(220,38,38,0.08)",
          border: `1px solid ${sysHealthy ? "rgba(74,138,44,0.25)" : "rgba(220,38,38,0.25)"}`,
        }}>
        <div className="flex items-center gap-3">
          {sysHealthy ? (
            <CheckCircle size={24} style={{ color: "#4A8A2C" }} />
          ) : (
            <AlertTriangle size={24} style={{ color: "#DC2626" }} />
          )}
          <div className="flex-1">
            <p style={{ fontWeight: 700, color: "#1A2332" }}>
              Sistema: <span style={{ color: sysHealthy ? "#4A8A2C" : "#DC2626", textTransform: "capitalize" }}>{system.status}</span>
            </p>
            <p style={{ color: "#6B7A8D", fontSize: "0.8rem", marginTop: "0.15rem" }} className="flex items-center gap-1 flex-wrap">
              <Clock size={12} /> Uptime: {formatUptime(system.process?.uptime_seconds ?? 0)}
              {(() => {
                const label = formatPlatformLabel(system.platform);
                const py = getPlatformValue(system.platform, "python_version");
                return (
                  <>
                    {label !== "—" && <> · {label}</>}
                    {py && <> · Python {py}</>}
                  </>
                );
              })()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Resource bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <ResourceCard
          icon={Cpu}
          label="CPU"
          percent={system.cpu?.percent ?? 0}
          subtitle={`${fmt(system.cpu?.percent, 1)}% • ${system.cpu?.count_logical ?? "—"} cores lógicos${system.cpu?.count_physical ? ` (${system.cpu.count_physical} físicos)` : ""}`}
          color="#0099DC"
        />
        <ResourceCard
          icon={MemoryStick}
          label="Memoria"
          percent={system.memory?.percent ?? 0}
          subtitle={`${fmt(system.memory?.used_mb, 0)} / ${fmt(system.memory?.total_mb, 0)} MB`}
          color="#7B61FF"
        />
        <ResourceCard
          icon={HardDrive}
          label="Disco"
          percent={system.disk?.percent ?? 0}
          subtitle={`${fmt(system.disk?.used_gb, 1)} / ${fmt(system.disk?.total_gb, 1)} GB`}
          color="#E5A800"
        />
      </div>

      {/* Process info */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <Server size={18} style={{ color: "#7B61FF" }} /> Proceso del backend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ProcRow label="PID" value={String(system.process?.pid ?? "—")} />
          <ProcRow label="Memoria proceso" value={system.process?.memory_mb != null ? `${fmt(system.process.memory_mb, 1)} MB` : "—"} />
          <ProcRow label="CPU proceso" value={system.process?.cpu_percent != null ? `${fmt(system.process.cpu_percent, 1)}%` : "—"} />
          <ProcRow label="Hilos" value={String(system.process?.threads ?? "—")} />
        </div>
      </div>

      {/* Database details */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem" }}>
          <Database size={18} style={{ color: "#7B61FF" }} /> Base de datos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <DbRow label="Estado" value={database.status} highlight={dbHealthy} />
          <DbRow label="Conectada" value={database.connected ? "Sí" : "No"} highlight={database.connected} />
          <DbRow label="Dialect" value={database.dialect} />
          <DbRow label="Latencia" value={database.latency_ms != null ? `${database.latency_ms} ms` : "—"} />
          <DbRow label="Total tablas" value={String(database.table_count ?? "—")} />
          <DbRow label="Tamaño total" value={database.total_size_mb != null ? `${fmt(database.total_size_mb, 2)} MB` : "—"} />
        </div>

        {database.error && (
          <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: "rgba(220,38,38,0.06)", color: "#DC2626", fontSize: "0.85rem" }}>
            <strong>Error:</strong> {database.error}
          </div>
        )}

        {(database.largest_tables?.length ?? 0) > 0 && (
          <>
            <h4 className="flex items-center gap-2 mb-3 mt-4" style={{ color: "#1A2332", fontWeight: 700, fontSize: "0.95rem" }}>
              <Table2 size={14} style={{ color: "#7B61FF" }} /> Tablas más grandes
            </h4>
            <div className="space-y-1">
              {database.largest_tables.map((t) => (
                <div key={t.table_name} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "#FAFBFC" }}>
                  <span style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem", fontFamily: "monospace" }}>{t.table_name}</span>
                  <div className="flex items-center gap-3">
                    {t.row_count != null && (
                      <span style={{ color: "#6B7A8D", fontSize: "0.78rem" }}>{t.row_count.toLocaleString()} filas</span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "rgba(123,97,255,0.1)", color: "#7B61FF" }}>
                      {fmt(t.size_mb, 2)} MB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ icon: Icon, label, percent, subtitle, color }: { icon: typeof Cpu; label: string; percent: number; subtitle: string; color: string }) {
  const safePct = Number.isFinite(percent) ? percent : 0;
  const danger = safePct > 90;
  const warn = safePct > 75;
  const barColor = danger ? "#DC2626" : warn ? "#E87830" : color;
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{ color: "#1A2332", fontWeight: 700, fontSize: "0.95rem" }}>{label}</span>
      </div>
      <p style={{ fontWeight: 800, fontSize: "2rem", color: barColor, lineHeight: 1 }}>{safePct.toFixed(1)}%</p>
      <div className="h-2 rounded-full overflow-hidden mt-2 mb-2" style={{ backgroundColor: "#F0F1F5" }}>
        <div style={{ width: `${Math.min(safePct, 100)}%`, height: "100%", backgroundColor: barColor, transition: "width 300ms" }} />
      </div>
      <p style={{ color: "#6B7A8D", fontSize: "0.78rem" }}>{subtitle}</p>
    </div>
  );
}

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function getPlatformValue(platform: unknown, key: string): string | undefined {
  if (!platform || typeof platform !== "object") return undefined;
  const v = (platform as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
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

function ProcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFBFC" }}>
      <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{label}</p>
      <p style={{ color: "#1A2332", fontWeight: 700, fontSize: "0.95rem" }}>{value}</p>
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