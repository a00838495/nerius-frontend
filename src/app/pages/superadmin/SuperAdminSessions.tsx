import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  KeyRound, Loader2, Trash2, AlertTriangle, ShieldOff, RefreshCw, Users,
} from "lucide-react";
import { toast } from "sonner";
import { superadminSessionsApi } from "../../lib/superadminApi";
import type {
  SessionRecord, SessionStats, SuspiciousSession,
} from "../../types/superadminPanel";

export function SuperAdminSessions() {
  const [tab, setTab] = useState<"active" | "suspicious">("active");
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [suspicious, setSuspicious] = useState<SuspiciousSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, st, sus] = await Promise.all([
        superadminSessionsApi.list({ limit: 200 }),
        superadminSessionsApi.stats(),
        superadminSessionsApi.suspicious(),
      ]);
      setSessions(s);
      setStats(st);
      setSuspicious(sus);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRevoke = async (s: SessionRecord) => {
    if (!confirm(`¿Revocar la sesión de ${s.user_full_name}?`)) return;
    try {
      await superadminSessionsApi.revoke(s.id);
      toast.success("Sesión revocada");
      fetchAll();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleRevokeAll = async (userId: string, name: string) => {
    if (!confirm(`¿Revocar TODAS las sesiones de ${name}?`)) return;
    try {
      await superadminSessionsApi.revokeAllForUser(userId);
      toast.success("Sesiones revocadas");
      fetchAll();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleCleanup = async () => {
    if (!confirm("¿Limpiar todas las sesiones expiradas?")) return;
    try {
      const result = await superadminSessionsApi.cleanup();
      toast.success(`${result.removed} sesiones eliminadas`);
      fetchAll();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <KeyRound size={26} style={{ color: "#7B61FF" }} />
            Sesiones Activas
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Gestión de sesiones de usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ border: "1px solid #E8EAED", backgroundColor: "#FFF", color: "#1A2332" }}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button onClick={handleCleanup} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: "#7B61FF", color: "#FFF" }}>
            <ShieldOff size={14} /> Limpiar expiradas
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <Stat label="Sesiones activas" value={stats.total_active} color="#4A8A2C" />
          <Stat label="Usuarios únicos" value={stats.unique_users} color="#0099DC" />
          <Stat label="Por expirar" value={stats.expiring_soon} color="#E87830" />
        </div>
      )}

      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#E8EAED" }}>
        <button onClick={() => setTab("active")} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 -mb-px"
          style={{ borderBottom: tab === "active" ? "2px solid #7B61FF" : "2px solid transparent", color: tab === "active" ? "#7B61FF" : "#6B7A8D" }}>
          <Users size={14} /> Activas ({sessions.length})
        </button>
        <button onClick={() => setTab("suspicious")} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 -mb-px"
          style={{ borderBottom: tab === "suspicious" ? "2px solid #7B61FF" : "2px solid transparent", color: tab === "suspicious" ? "#7B61FF" : "#6B7A8D" }}>
          <AlertTriangle size={14} /> Sospechosas ({suspicious.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>
      ) : tab === "active" ? (
        sessions.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
            <p style={{ color: "#9AA5B4" }}>No hay sesiones activas</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                  <th className={thCls}>Usuario</th>
                  <th className={thCls}>IP</th>
                  <th className={thCls}>Navegador</th>
                  <th className={thCls}>Creada</th>
                  <th className={thCls}>Expira</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase" style={{ color: "#6B7A8D" }}></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                    <td className="px-5 py-3">
                      <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>
                        {s.user_full_name}
                        {s.is_current && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: "rgba(123,97,255,0.12)", color: "#7B61FF" }}>actual</span>}
                      </p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{s.user_email}</p>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.78rem", fontFamily: "monospace" }}>{s.ip_address ?? "—"}</td>
                    <td className="px-5 py-3 truncate" style={{ color: "#6B7A8D", fontSize: "0.75rem", maxWidth: 200 }}>
                      {(s.user_agent ?? "").substring(0, 50) || "—"}
                    </td>
                    <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                      {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                      {new Date(s.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleRevoke(s)} className="p-1.5 rounded-lg hover:bg-red-50" title="Revocar">
                        <Trash2 size={14} style={{ color: "#DC2626" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        suspicious.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
            <p style={{ color: "#9AA5B4" }}>No se detectaron sesiones sospechosas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suspicious.map((s) => (
              <motion.div key={s.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(220,38,38,0.25)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>
                      <AlertTriangle size={16} style={{ color: "#DC2626" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 700, color: "#1A2332" }}>{s.user_full_name}</p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.75rem" }}>{s.user_email}</p>
                      <p style={{ color: "#DC2626", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        <strong>{s.active_sessions}</strong> sesiones activas desde <strong>{s.unique_ips}</strong> IPs
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.ips.map((ip) => (
                          <span key={ip} className="px-2 py-0.5 rounded text-[11px] font-mono"
                            style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#DC2626" }}>{ip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRevokeAll(s.user_id, s.user_full_name)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626" }}>
                    Revocar todas
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

const thCls = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B7A8D]";

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
      <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>{label}</p>
      <p style={{ fontWeight: 800, fontSize: "1.5rem", color }}>{value.toLocaleString()}</p>
    </div>
  );
}
