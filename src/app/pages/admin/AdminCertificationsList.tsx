import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  FileCheck, Loader2, Search, Check, X, Ban, RotateCcw, Clock, Award, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { adminCertificationsApi } from "../../lib/adminApi";
import type { UserCertificationAdminRead, CertificationStats } from "../../types/adminPanel";
import { PaginationBar } from "../../components/PaginationBar";

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  requested: { label: "Pendiente", bg: "rgba(229,168,0,0.12)", color: "#E5A800" },
  approved: { label: "Aprobada", bg: "rgba(0,153,220,0.12)", color: "#0099DC" },
  issued: { label: "Emitida", bg: "rgba(74,138,44,0.12)", color: "#4A8A2C" },
  rejected: { label: "Rechazada", bg: "rgba(220,38,38,0.12)", color: "#DC2626" },
  revoked: { label: "Revocada", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
};

export function AdminCertificationsList() {
  const [tab, setTab] = useState<string>("requested");
  const [items, setItems] = useState<UserCertificationAdminRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<CertificationStats | null>(null);
  const [approving, setApproving] = useState<UserCertificationAdminRead | null>(null);
  const [rejecting, setRejecting] = useState<UserCertificationAdminRead | null>(null);

  useEffect(() => {
    adminCertificationsApi.stats().then(setStats).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCertificationsApi.list({
        page, page_size: pageSize,
        status: tab,
        search: search.trim() || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, tab, search]);

  useEffect(() => { const t = setTimeout(fetchData, 250); return () => clearTimeout(t); }, [fetchData]);

  useEffect(() => { setPage(1); }, [tab]);

  const handleRevoke = async (c: UserCertificationAdminRead) => {
    if (!confirm("¿Revocar esta certificación?")) return;
    try {
      await adminCertificationsApi.revoke(c.id);
      toast.success("Certificación revocada");
      fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <FileCheck size={26} style={{ color: "#E5A800" }} />
          Certificaciones
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Aprueba, rechaza y emite certificaciones para los usuarios
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard icon={Clock} label="Pendientes" value={stats.total_requested} color="#E5A800" />
          <StatCard icon={Check} label="Aprobadas" value={stats.total_approved} color="#0099DC" />
          <StatCard icon={Award} label="Emitidas" value={stats.total_issued} color="#4A8A2C" />
          <StatCard icon={X} label="Rechazadas" value={stats.total_rejected} color="#DC2626" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#E8EAED" }}>
        {[
          ["requested", "Pendientes"],
          ["approved", "Aprobadas"],
          ["issued", "Emitidas"],
          ["rejected", "Rechazadas"],
          ["revoked", "Revocadas"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-4 py-2 text-sm font-semibold -mb-px"
            style={{
              borderBottom: tab === k ? "2px solid #E5A800" : "2px solid transparent",
              color: tab === k ? "#E5A800" : "#6B7A8D",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por usuario o curso..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay certificaciones</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0F1F5" }}>
            {items.map((c) => {
              const meta = STATUS_META[c.status] ?? STATUS_META.requested;
              return (
                <div key={c.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontWeight: 600, color: "#1A2332", fontSize: "0.95rem" }} className="truncate">
                        {c.user_full_name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{ backgroundColor: meta.bg, color: meta.color }}>{meta.label}</span>
                    </div>
                    <p style={{ color: "#6B7A8D", fontSize: "0.85rem" }} className="truncate">
                      <strong>{c.certification_title}</strong> · {c.course_title}
                    </p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.75rem", marginTop: "0.15rem" }}>
                      Solicitada: {new Date(c.requested_at).toLocaleDateString()}
                      {c.issued_at && ` · Emitida: ${new Date(c.issued_at).toLocaleDateString()}`}
                      {c.rejected_at && ` · Rechazada: ${new Date(c.rejected_at).toLocaleDateString()}`}
                    </p>
                    {c.rejection_reason && (
                      <p className="mt-2 px-2 py-1 rounded text-xs" style={{ backgroundColor: "rgba(220,38,38,0.06)", color: "#DC2626" }}>
                        <strong>Motivo:</strong> {c.rejection_reason}
                      </p>
                    )}
                    {c.certificate_code && (
                      <p style={{ color: "#4A8A2C", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                        <Award size={11} className="inline" /> {c.certificate_code}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.status === "requested" && (
                      <>
                        <button onClick={() => setApproving(c)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                          style={{ backgroundColor: "rgba(74,138,44,0.12)", color: "#4A8A2C" }}>
                          <Check size={12} /> Aprobar
                        </button>
                        <button onClick={() => setRejecting(c)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                          style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626" }}>
                          <X size={12} /> Rechazar
                        </button>
                      </>
                    )}
                    {(c.status === "approved" || c.status === "issued") && (
                      <button onClick={() => handleRevoke(c)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                        style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626" }}>
                        <Ban size={12} /> Revocar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && total > 0 && <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}

      {approving && <ApproveModal cert={approving} onClose={() => setApproving(null)} onSaved={() => { setApproving(null); fetchData(); }} />}
      {rejecting && <RejectModal cert={rejecting} onClose={() => setRejecting(null)} onSaved={() => { setRejecting(null); fetchData(); }} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: number; color: string }) {
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

function ApproveModal({ cert, onClose, onSaved }: { cert: UserCertificationAdminRead; onClose: () => void; onSaved: () => void }) {
  const [issueNow, setIssueNow] = useState(true);
  const [expirationDate, setExpirationDate] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await adminCertificationsApi.approve(cert.id, {
        issue_now: issueNow,
        expiration_date: expirationDate || undefined,
        certificate_url: certificateUrl || undefined,
      });
      toast.success(issueNow ? "Certificación emitida" : "Certificación aprobada");
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>Aprobar certificación</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: "#FAFBFC" }}>
          <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1A2332" }}>{cert.user_full_name}</p>
          <p style={{ fontSize: "0.78rem", color: "#6B7A8D" }}>{cert.certification_title}</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={issueNow} onChange={(e) => setIssueNow(e.target.checked)} />
            Emitir inmediatamente (genera código y url)
          </label>
          <Field label="Fecha de expiración (opcional)">
            <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="URL del certificado (opcional)">
            <input value={certificateUrl} onChange={(e) => setCertificateUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#4A8A2C", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Aprobar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RejectModal({ cert, onClose, onSaved }: { cert: UserCertificationAdminRead; onClose: () => void; onSaved: () => void }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.error("Indica el motivo");
    setSaving(true);
    try {
      await adminCertificationsApi.reject(cert.id, reason.trim());
      toast.success("Certificación rechazada");
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>Rechazar certificación</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="rounded-xl p-3 mb-4 flex items-start gap-2" style={{ backgroundColor: "rgba(220,38,38,0.06)" }}>
          <AlertCircle size={16} style={{ color: "#DC2626", marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1A2332" }}>{cert.user_full_name}</p>
            <p style={{ fontSize: "0.78rem", color: "#6B7A8D" }}>{cert.certification_title}</p>
          </div>
        </div>

        <Field label="Motivo del rechazo (será visible para el usuario)">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} rows={4} />
        </Field>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />} Rechazar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none border";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>{label}</label>
      {children}
    </div>
  );
}
