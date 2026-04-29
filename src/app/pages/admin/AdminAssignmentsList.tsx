import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  ClipboardList, Plus, Loader2, Calendar, Trash2, Search, AlertTriangle, X, Save,
  Users, BookOpen, CheckCircle2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminAssignmentsApi, adminCoursesMiniApi, adminAreasApi,
} from "../../lib/adminApi";
import type {
  CourseAssignmentRow, AreaAdminRead, AssignmentProgressSummary,
} from "../../types/adminPanel";
import { PaginationBar } from "../../components/PaginationBar";

export function AdminAssignmentsList() {
  const [items, setItems] = useState<CourseAssignmentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [courseFilter, setCourseFilter] = useState("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [areas, setAreas] = useState<AreaAdminRead[]>([]);
  const [showBulk, setShowBulk] = useState(false);
  const [summary, setSummary] = useState<AssignmentProgressSummary | null>(null);

  useEffect(() => {
    adminCoursesMiniApi.list().then(setCourses).catch(() => {});
    adminAreasApi.list().then(setAreas).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAssignmentsApi.list({
        page, page_size: pageSize,
        search: search.trim() || undefined,
        overdue_only: overdueOnly || undefined,
        course_id: courseFilter || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, overdueOnly, courseFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
  }, [fetchData]);

  useEffect(() => {
    if (courseFilter) {
      adminAssignmentsApi.progressSummary(courseFilter).then(setSummary).catch(() => setSummary(null));
    } else {
      setSummary(null);
    }
  }, [courseFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    try {
      await adminAssignmentsApi.remove(id);
      toast.success("Asignación eliminada");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <ClipboardList size={26} style={{ color: "#E5A800" }} />
            Asignaciones de Cursos
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${total} asignaciones`}
          </p>
        </div>
        <button onClick={() => setShowBulk(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          <Plus size={16} /> Asignación masiva
        </button>
      </div>

      {/* Summary if course is selected */}
      {summary && (
        <div className="rounded-2xl p-5 mb-5 grid grid-cols-2 md:grid-cols-5 gap-4"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <SummaryStat icon={Users} label="Asignados" value={summary.total_assigned} color="#0099DC" />
          <SummaryStat icon={Clock} label="Sin iniciar" value={summary.not_started} color="#9AA5B4" />
          <SummaryStat icon={BookOpen} label="En progreso" value={summary.in_progress} color="#E5A800" />
          <SummaryStat icon={CheckCircle2} label="Completados" value={summary.completed} color="#4A8A2C" />
          <SummaryStat icon={AlertTriangle} label="Vencidos" value={summary.overdue} color="#DC2626" />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar usuario..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>
        <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todos los cursos</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: "1.5px solid #E8EAED" }}>
          <input type="checkbox" checked={overdueOnly} onChange={(e) => { setOverdueOnly(e.target.checked); setPage(1); }} />
          <span style={{ color: "#1A2332" }}>Solo vencidos</span>
        </label>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay asignaciones</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                <th className={thCls}>Usuario</th>
                <th className={thCls}>Curso</th>
                <th className={thCls}>Vence</th>
                <th className={thCls}>Progreso</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #F0F1F5" }}>
                  <td className="px-5 py-3">
                    <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.875rem" }}>{a.user_full_name}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>{a.user_email}{a.area_name ? ` • ${a.area_name}` : ""}</p>
                  </td>
                  <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.85rem" }}>{a.course_title}</td>
                  <td className="px-5 py-3 text-sm">
                    <span style={{ color: a.is_overdue ? "#DC2626" : "#1A2332", fontWeight: a.is_overdue ? 700 : 500 }}>
                      {new Date(a.due_date).toLocaleDateString()}
                    </span>
                    {a.is_overdue && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626" }}>
                        Vencido
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 w-48">
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F1F5" }}>
                      <div style={{ width: `${a.progress_percent}%`, height: "100%", backgroundColor: a.progress_percent === 100 ? "#4A8A2C" : "#E5A800" }} />
                    </div>
                    <p style={{ fontSize: "0.7rem", color: "#6B7A8D", marginTop: "0.15rem" }}>{a.progress_percent.toFixed(0)}%</p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                      <Trash2 size={14} style={{ color: "#DC2626" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 && (
        <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      )}

      {showBulk && (
        <BulkAssignModal
          courses={courses}
          areas={areas}
          onClose={() => setShowBulk(false)}
          onCreated={() => { setShowBulk(false); fetchData(); }}
        />
      )}
    </div>
  );
}

const thCls = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider";

function SummaryStat({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1" style={{ backgroundColor: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1A2332" }}>{value}</p>
      <p style={{ fontSize: "0.7rem", color: "#9AA5B4" }}>{label}</p>
    </div>
  );
}

function BulkAssignModal({ courses, areas, onClose, onCreated }: {
  courses: Array<{ id: string; title: string; status: string }>;
  areas: AreaAdminRead[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleArea = (id: string) => {
    setSelectedAreas((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!courseId) return toast.error("Selecciona un curso");
    if (!dueDate) return toast.error("Define fecha límite");
    if (selectedAreas.length === 0) return toast.error("Selecciona al menos un área");

    setSaving(true);
    try {
      const result = await adminAssignmentsApi.bulkCreate({
        course_id: courseId,
        due_date: new Date(dueDate).toISOString(),
        area_ids: selectedAreas,
      });
      toast.success(`${result.created} asignaciones creadas (${result.skipped_already_assigned} ya existían)`);
      onCreated();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>Asignación masiva</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>Curso</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
              <option value="">Selecciona un curso...</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>Fecha límite</label>
            <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#6B7A8D" }}>
              Áreas a asignar ({selectedAreas.length} seleccionadas)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {areas.map((a) => (
                <label key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm"
                  style={{
                    border: `1.5px solid ${selectedAreas.includes(a.id) ? "#E5A800" : "#E8EAED"}`,
                    backgroundColor: selectedAreas.includes(a.id) ? "rgba(229,168,0,0.06)" : "#F9FAFB",
                  }}>
                  <input type="checkbox" checked={selectedAreas.includes(a.id)} onChange={() => toggleArea(a.id)} />
                  <span style={{ color: "#1A2332" }}>{a.name}</span>
                  <span style={{ color: "#9AA5B4", fontSize: "0.75rem", marginLeft: "auto" }}>{a.users_count}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Asignar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
