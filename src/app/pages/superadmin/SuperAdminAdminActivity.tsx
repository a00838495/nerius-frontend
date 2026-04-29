import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Activity, Loader2, Crown, Shield, Edit3, Eye, X, History, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { superadminAdminsApi } from "../../lib/superadminApi";
import type { AdminActivityRow } from "../../types/superadminPanel";
import type { AuditLogRow } from "../../types/superadminPanel";

const ROLE_META: Record<string, { label: string; icon: typeof Crown; color: string; bg: string }> = {
  super_admin: { label: "Super Admin", icon: Crown, color: "#7B61FF", bg: "rgba(123,97,255,0.12)" },
  content_admin: { label: "Admin", icon: Shield, color: "#E5A800", bg: "rgba(229,168,0,0.12)" },
  content_editor: { label: "Editor", icon: Edit3, color: "#0099DC", bg: "rgba(0,153,220,0.12)" },
  content_viewer: { label: "Observador", icon: Eye, color: "#6B7A8D", bg: "rgba(107,122,141,0.12)" },
  learner: { label: "Aprendiz", icon: GraduationCap, color: "#4A8A2C", bg: "rgba(74,138,44,0.12)" },
};

export function SuperAdminAdminActivity() {
  const [items, setItems] = useState<AdminActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<AdminActivityRow | null>(null);

  useEffect(() => {
    superadminAdminsApi.activity()
      .then(setItems)
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <Activity size={26} style={{ color: "#7B61FF" }} />
          Actividad de Administradores
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Conteo de acciones por administrador en los últimos 30 días
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <p style={{ color: "#9AA5B4" }}>No hay actividad reciente</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                <th className={thCls}>Administrador</th>
                <th className={thCls}>Roles</th>
                <th className={thCls}>Acciones 30d</th>
                <th className={thCls}>Hoy</th>
                <th className={thCls}>Acción más común</th>
                <th className={thCls}>Última actividad</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase" style={{ color: "#6B7A8D" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => (
                <motion.tr key={a.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                  <td className="px-5 py-3">
                    <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{a.user_full_name}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{a.user_email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.roles.map((r) => {
                        const meta = ROLE_META[r];
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                          <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"
                            style={{ backgroundColor: meta.bg, color: meta.color }}>
                            <Icon size={9} /> {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: "#7B61FF", fontWeight: 800, fontSize: "1.05rem" }}>{a.total_actions_30d}</td>
                  <td className="px-5 py-3" style={{ color: a.actions_today > 0 ? "#4A8A2C" : "#9AA5B4", fontWeight: 700 }}>{a.actions_today}</td>
                  <td className="px-5 py-3">
                    {a.most_common_action ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono"
                        style={{ backgroundColor: "rgba(123,97,255,0.08)", color: "#7B61FF" }}>{a.most_common_action}</span>
                    ) : <span style={{ color: "#9AA5B4" }}>—</span>}
                  </td>
                  <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                    {a.last_action_at ? new Date(a.last_action_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setViewing(a)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Ver historial">
                      <History size={14} style={{ color: "#7B61FF" }} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <HistoryDrawer admin={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

const thCls = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B7A8D]";

function HistoryDrawer({ admin, onClose }: { admin: AdminActivityRow; onClose: () => void }) {
  const [history, setHistory] = useState<AuditLogRow[]>([]);
  const [actions, setActions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      superadminAdminsApi.history(admin.user_id, 50),
      superadminAdminsApi.actions(admin.user_id),
    ])
      .then(([h, a]) => { setHistory(h); setActions(a); })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }, [admin.user_id]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ x: 300 }} animate={{ x: 0 }}
        className="w-full max-w-lg overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-5 border-b"
          style={{ backgroundColor: "linear-gradient(180deg, #1C3A5C, #0D2340)", background: "linear-gradient(180deg, #1C3A5C, #0D2340)", color: "#FFF" }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: "1.1rem" }}>{admin.user_full_name}</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>{admin.user_email}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X size={18} color="#FFF" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>
        ) : (
          <div className="p-5">
            {/* Action breakdown */}
            <h3 style={{ fontWeight: 700, color: "#1A2332", marginBottom: "0.75rem" }}>Resumen de acciones</h3>
            {Object.keys(actions).length === 0 ? (
              <p style={{ color: "#9AA5B4" }}>Sin actividad registrada</p>
            ) : (
              <div className="space-y-1 mb-6">
                {Object.entries(actions).sort((a, b) => b[1] - a[1]).map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "#FAFBFC" }}>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono"
                      style={{ backgroundColor: "rgba(123,97,255,0.1)", color: "#7B61FF" }}>{action}</span>
                    <span style={{ fontWeight: 700, color: "#1A2332" }}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontWeight: 700, color: "#1A2332", marginBottom: "0.75rem" }}>Últimos eventos</h3>
            {history.length === 0 ? (
              <p style={{ color: "#9AA5B4" }}>Sin eventos</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="rounded-xl p-3" style={{ backgroundColor: "#FAFBFC", border: "1px solid #F0F1F5" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                        style={{ backgroundColor: "rgba(123,97,255,0.1)", color: "#7B61FF" }}>{h.action}</span>
                      <span style={{ color: "#9AA5B4", fontSize: "0.72rem", marginLeft: "auto" }}>
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    {h.description && <p style={{ color: "#1A2332", fontSize: "0.8rem" }}>{h.description}</p>}
                    {h.resource_type && (
                      <p style={{ color: "#6B7A8D", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                        {h.resource_type}{h.resource_id && ` · ${h.resource_id.substring(0, 12)}…`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
