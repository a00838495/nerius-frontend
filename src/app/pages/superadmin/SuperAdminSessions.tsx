import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  KeyRound, Loader2, Trash2, AlertTriangle, ShieldOff, RefreshCw, Users, Search,
} from "lucide-react";
import { toast } from "sonner";
import { superadminSessionsApi } from "../../lib/superadminApi";
import type {
  SessionRecord, SessionStats, SuspiciousSession,
} from "../../types/superadminPanel";
import { PaginationBar } from "../../components/PaginationBar";
import { formatServerDateTime } from "./utils/serverTime";

export function SuperAdminSessions() {
  const [tab, setTab] = useState<"active" | "suspicious">("active");
  const [items, setItems] = useState<SessionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [suspicious, setSuspicious] = useState<SuspiciousSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  const fetchActive = useCallback(async () => {
    try {
      const data = await superadminSessionsApi.list({
        page,
        page_size: pageSize,
        email: search.trim() || undefined,
        only_active: onlyActive || undefined,
      });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [page, pageSize, search, onlyActive]);

  const fetchSecondary = useCallback(async () => {
    try {
      const [st, sus] = await Promise.all([
        superadminSessionsApi.stats(),
        superadminSessionsApi.suspicious(),
      ]);
      setStats(st);
      setSuspicious(Array.isArray(sus) ? sus : []);
    } catch {
      // silent for secondary data
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchActive(), fetchSecondary()]).finally(() => setLoading(false));
  }, [fetchActive, fetchSecondary]);

  const refreshAll = () => {
    setLoading(true);
    Promise.all([fetchActive(), fetchSecondary()]).finally(() => setLoading(false));
  };

  const handleRevoke = async (s: SessionRecord) => {
    const name = s.user_full_name ?? s.user_email ?? s.user_id;
    if (!confirm(`¿Revocar la sesión de ${name}?`)) return;
    try {
      await superadminSessionsApi.revoke(s.id);
      toast.success("Sesión revocada");
      refreshAll();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleRevokeAll = async (userId: string, name: string) => {
    if (!confirm(`¿Revocar TODAS las sesiones de ${name}?`)) return;
    try {
      await superadminSessionsApi.revokeAllForUser(userId);
      toast.success("Sesiones revocadas");
      refreshAll();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleCleanup = async () => {
    if (!confirm("¿Eliminar todas las sesiones expiradas?")) return;
    try {
      const result = await superadminSessionsApi.cleanup();
      toast.success(`${result.deleted} sesiones eliminadas`);
      refreshAll();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <KeyRound size={26} style={{ color: "#7B61FF" }} />
            Sesiones
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Gestión de sesiones de usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshAll} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <Stat label="Activas" value={stats.total_active ?? 0} color="#4A8A2C" />
          <Stat label="Expiradas" value={stats.total_expired ?? 0} color="#9AA5B4" />
          <Stat label="Usuarios únicos" value={stats.unique_users ?? 0} color="#0099DC" />
          <Stat label="Últimas 24h" value={stats.sessions_last_24h ?? 0} color="#7B61FF" />
          <Stat label="Última semana" value={stats.sessions_last_7d ?? 0} color="#E5A800" />
        </div>
      )}

      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#E8EAED" }}>
        <button onClick={() => setTab("active")} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 -mb-px"
          style={{ borderBottom: tab === "active" ? "2px solid #7B61FF" : "2px solid transparent", color: tab === "active" ? "#7B61FF" : "#6B7A8D" }}>
          <Users size={14} /> Sesiones ({total})
        </button>
        <button onClick={() => setTab("suspicious")} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 -mb-px"
          style={{ borderBottom: tab === "suspicious" ? "2px solid #7B61FF" : "2px solid transparent", color: tab === "suspicious" ? "#7B61FF" : "#6B7A8D" }}>
          <AlertTriangle size={14} /> Sospechosas ({suspicious.length})
        </button>
      </div>

      {tab === "active" ? (
        <>
          <div className="rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: "1.5px solid #E8EAED" }}>
              <input type="checkbox" checked={onlyActive} onChange={(e) => { setOnlyActive(e.target.checked); setPage(1); }} />
              <span style={{ color: "#1A2332" }}>Solo activas</span>
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
              <p style={{ color: "#9AA5B4" }}>No hay sesiones</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                    <th className={thCls}>Usuario</th>
                    <th className={thCls}>IP</th>
                    <th className={thCls}>Navegador</th>
                    <th className={thCls}>Última actividad</th>
                    <th className={thCls}>Expira</th>
                    <th className={thCls}>Estado</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase" style={{ color: "#6B7A8D" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                      <td className="px-5 py-3">
                        <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{s.user_full_name ?? "—"}</p>
                        <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{s.user_email ?? s.user_id}</p>
                      </td>
                      <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.78rem", fontFamily: "monospace" }}>{s.ip_address ?? "—"}</td>
                      <td className="px-5 py-3 truncate" style={{ color: "#6B7A8D", fontSize: "0.75rem", maxWidth: 200 }}>
                        {(s.user_agent ?? "").substring(0, 50) || "—"}
                      </td>
                      <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                        {formatServerDateTime(s.last_activity_at)}
                      </td>
                      <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                        {formatServerDateTime(s.expires_at)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                          style={{
                            backgroundColor: s.is_expired ? "rgba(220,38,38,0.12)" : "rgba(74,138,44,0.12)",
                            color: s.is_expired ? "#DC2626" : "#4A8A2C",
                          }}>
                          {s.is_expired ? "Expirada" : "Activa"}
                        </span>
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
          )}

          {!loading && total > 0 && (
            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} accent="#7B61FF" />
          )}
        </>
      ) : (
        loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>
        ) : suspicious.length === 0 ? (
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
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>
                      <AlertTriangle size={16} style={{ color: "#DC2626" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 700, color: "#1A2332" }}>{s.user_full_name ?? s.user_email ?? s.user_id}</p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.75rem" }}>{s.user_email ?? "—"}</p>
                      <p style={{ color: "#DC2626", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        {s.reason}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(s.sessions ?? []).slice(0, 8).map((sess) => (
                          sess.ip_address && (
                            <span key={sess.id} className="px-2 py-0.5 rounded text-[11px] font-mono"
                              style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#DC2626" }}>{sess.ip_address}</span>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRevokeAll(s.user_id, s.user_full_name ?? s.user_email ?? s.user_id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
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