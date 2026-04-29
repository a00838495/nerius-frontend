import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  GraduationCap, Loader2, Search, X, Save, Ban, Edit,
} from "lucide-react";
import { toast } from "sonner";
import { adminEnrollmentsApi, adminCoursesMiniApi } from "../../lib/adminApi";
import type { EnrollmentAdminRead } from "../../types/adminPanel";
import { PaginationBar } from "../../components/PaginationBar";

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "Activo", bg: "rgba(229,168,0,0.12)", color: "#E5A800" },
  in_progress: { label: "En curso", bg: "rgba(229,168,0,0.12)", color: "#E5A800" },
  completed: { label: "Completado", bg: "rgba(74,138,44,0.12)", color: "#4A8A2C" },
  dropped: { label: "Abandonado", bg: "rgba(220,38,38,0.08)", color: "#DC2626" },
  cancelled: { label: "Cancelado", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
  not_started: { label: "Sin iniciar", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
};

export function AdminEnrollmentsList() {
  const [items, setItems] = useState<EnrollmentAdminRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [editing, setEditing] = useState<EnrollmentAdminRead | null>(null);

  useEffect(() => { adminCoursesMiniApi.list().then(setCourses).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminEnrollmentsApi.list({
        page, page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        course_id: courseFilter || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }, [page, pageSize, search, statusFilter, courseFilter]);

  useEffect(() => { const t = setTimeout(fetchData, 250); return () => clearTimeout(t); }, [fetchData]);

  const handleCancel = async (e: EnrollmentAdminRead) => {
    if (!confirm(`¿Cancelar la inscripción de ${e.user_full_name} en ${e.course_title}?`)) return;
    try {
      await adminEnrollmentsApi.cancel(e.id);
      toast.success("Inscripción cancelada");
      fetchData();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <GraduationCap size={26} style={{ color: "#E5A800" }} />
          Inscripciones
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          {loading ? "Cargando..." : `${total} inscripciones`}
        </p>
      </div>

      <div className="rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar usuario..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
        <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todos los cursos</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="in_progress">En curso</option>
          <option value="completed">Completadas</option>
          <option value="dropped">Abandonadas</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay inscripciones</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                <th className={thCls}>Usuario</th>
                <th className={thCls}>Curso</th>
                <th className={thCls}>Estado</th>
                <th className={thCls}>Progreso</th>
                <th className={thCls}>Score</th>
                <th className={thCls}>Última act.</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => {
                const meta = STATUS_META[e.status] ?? STATUS_META.not_started;
                return (
                  <tr key={e.id} className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                    <td className="px-5 py-3">
                      <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{e.user_full_name}</p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{e.user_email}</p>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.85rem" }}>{e.course_title}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{ backgroundColor: meta.bg, color: meta.color }}>{meta.label}</span>
                    </td>
                    <td className="px-5 py-3 w-40">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F1F5" }}>
                        <div style={{ width: `${e.progress_percent}%`, height: "100%", backgroundColor: e.progress_percent === 100 ? "#4A8A2C" : "#E5A800" }} />
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "#6B7A8D", marginTop: "0.15rem" }}>{e.progress_percent.toFixed(0)}%</p>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.85rem" }}>
                      {e.score !== null ? e.score.toFixed(1) : "—"}
                    </td>
                    <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                      {e.last_activity_at ? new Date(e.last_activity_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(e)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Cambiar estado"><Edit size={14} /></button>
                        <button onClick={() => handleCancel(e)} className="p-1.5 rounded-lg hover:bg-red-50" title="Cancelar"><Ban size={14} style={{ color: "#DC2626" }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 && <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}

      {editing && <StatusModal enrollment={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
    </div>
  );
}

const thCls = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B7A8D]";

function StatusModal({ enrollment, onClose, onSaved }: { enrollment: EnrollmentAdminRead; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState(enrollment.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await adminEnrollmentsApi.setStatus(enrollment.id, status);
      toast.success("Estado actualizado");
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
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>Cambiar estado</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: "#FAFBFC" }}>
          <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1A2332" }}>{enrollment.user_full_name}</p>
          <p style={{ fontSize: "0.78rem", color: "#6B7A8D" }}>{enrollment.course_title}</p>
        </div>

        <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>Estado</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none border">
          <option value="active">Activo</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completado</option>
          <option value="dropped">Abandonado</option>
        </select>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Guardar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
