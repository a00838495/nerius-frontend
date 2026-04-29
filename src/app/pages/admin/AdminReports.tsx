import { useEffect, useState, useCallback } from "react";
import {
  BarChart3, Download, Loader2, BookOpen, Users, FileQuestion,
} from "lucide-react";
import { toast } from "sonner";
import { adminReportsApi, adminAreasApi, adminCoursesMiniApi } from "../../lib/adminApi";
import type {
  CourseProgressReportRow, UserProgressReportRow, QuizReportRow, AreaAdminRead,
} from "../../types/adminPanel";

export function AdminReports() {
  const [tab, setTab] = useState<"courses" | "users" | "quizzes">("courses");
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <BarChart3 size={26} style={{ color: "#E5A800" }} />
          Reportes
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Genera y exporta reportes de progreso y desempeño
        </p>
      </div>

      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#E8EAED" }}>
        {([["courses", "Cursos", BookOpen], ["users", "Usuarios", Users], ["quizzes", "Quizzes", FileQuestion]] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-4 py-2 text-sm font-semibold flex items-center gap-2 -mb-px"
            style={{
              borderBottom: tab === k ? "2px solid #E5A800" : "2px solid transparent",
              color: tab === k ? "#E5A800" : "#6B7A8D",
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "courses" && <CoursesReport />}
      {tab === "users" && <UsersReport />}
      {tab === "quizzes" && <QuizzesReport />}
    </div>
  );
}

// ==== Courses report ============================================

function CoursesReport() {
  const [items, setItems] = useState<CourseProgressReportRow[]>([]);
  const [areas, setAreas] = useState<AreaAdminRead[]>([]);
  const [areaFilter, setAreaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { adminAreasApi.list().then(setAreas).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminReportsApi.coursesProgress(areaFilter || undefined));
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }, [areaFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminReportsApi.exportCoursesProgress(areaFilter || undefined);
      toast.success("Exportado");
    } catch (e) { toast.error((e as Error).message); }
    finally { setExporting(false); }
  };

  return (
    <>
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none flex-1 max-w-xs"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todas las áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          {exporting ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} Exportar CSV
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>Sin datos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                  <th className={thCls}>Curso</th>
                  <th className={thCls}>Área</th>
                  <th className={thCls}>Inscritos</th>
                  <th className={thCls}>Completados</th>
                  <th className={thCls}>En curso</th>
                  <th className={thCls}>Sin iniciar</th>
                  <th className={thCls}>Tasa</th>
                  <th className={thCls}>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.course_id} className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                    <td className="px-5 py-3" style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{c.course_title}</td>
                    <td className="px-5 py-3" style={{ color: "#6B7A8D", fontSize: "0.8rem" }}>{c.area_name ?? "—"}</td>
                    <td className="px-5 py-3" style={{ color: "#1A2332" }}>{c.total_enrolled}</td>
                    <td className="px-5 py-3" style={{ color: "#4A8A2C", fontWeight: 600 }}>{c.completed}</td>
                    <td className="px-5 py-3" style={{ color: "#E5A800" }}>{c.in_progress}</td>
                    <td className="px-5 py-3" style={{ color: "#9AA5B4" }}>{c.not_started}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F1F5" }}>
                          <div style={{ width: `${c.completion_rate}%`, height: "100%", backgroundColor: "#4A8A2C" }} />
                        </div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A2332" }}>{c.completion_rate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#1A2332" }}>{c.avg_progress.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ==== Users report ============================================

function UsersReport() {
  const [items, setItems] = useState<UserProgressReportRow[]>([]);
  const [areas, setAreas] = useState<AreaAdminRead[]>([]);
  const [areaFilter, setAreaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { adminAreasApi.list().then(setAreas).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminReportsApi.usersProgress({ area_id: areaFilter || undefined, limit: 200 }));
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }, [areaFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminReportsApi.exportUsersProgress(areaFilter || undefined);
      toast.success("Exportado");
    } catch (e) { toast.error((e as Error).message); }
    finally { setExporting(false); }
  };

  return (
    <>
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none flex-1 max-w-xs"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todas las áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          {exporting ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} Exportar CSV
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>Sin datos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                  <th className={thCls}>Usuario</th>
                  <th className={thCls}>Área</th>
                  <th className={thCls}>Inscrip.</th>
                  <th className={thCls}>Compl.</th>
                  <th className={thCls}>Promedio</th>
                  <th className={thCls}>Badges</th>
                  <th className={thCls}>Cert.</th>
                  <th className={thCls}>Última act.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.user_id} className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                    <td className="px-5 py-3">
                      <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{u.full_name}</p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{u.email}</p>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#6B7A8D", fontSize: "0.8rem" }}>{u.area_name ?? "—"}</td>
                    <td className="px-5 py-3" style={{ color: "#1A2332" }}>{u.total_enrollments}</td>
                    <td className="px-5 py-3" style={{ color: "#4A8A2C", fontWeight: 600 }}>{u.completed}</td>
                    <td className="px-5 py-3" style={{ color: "#1A2332" }}>{u.avg_progress.toFixed(1)}%</td>
                    <td className="px-5 py-3" style={{ color: "#E5A800", fontWeight: 600 }}>{u.badges_count}</td>
                    <td className="px-5 py-3" style={{ color: "#7B61FF", fontWeight: 600 }}>{u.certifications_count}</td>
                    <td className="px-5 py-3" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                      {u.last_activity_at ? new Date(u.last_activity_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ==== Quizzes report ============================================

function QuizzesReport() {
  const [items, setItems] = useState<QuizReportRow[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminCoursesMiniApi.list().then(setCourses).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminReportsApi.quizzes(courseFilter || undefined));
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }, [courseFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <>
      <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none w-full max-w-md"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todos los cursos</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>Sin datos</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0F1F5" }}>
            {items.map((q) => (
              <div key={q.quiz_id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 600, color: "#1A2332", fontSize: "0.9rem" }}>{q.lesson_title}</p>
                    <p style={{ color: "#6B7A8D", fontSize: "0.78rem" }}>{q.course_title}</p>
                  </div>
                  <div className="flex gap-3 text-right">
                    <Mini label="Intentos" value={q.total_attempts} color="#0099DC" />
                    <Mini label="Aprobados" value={q.passed} color="#4A8A2C" />
                    <Mini label="Tasa" value={`${q.pass_rate}%`} color="#E5A800" />
                    <Mini label="Promedio" value={q.avg_score !== null ? `${q.avg_score.toFixed(1)}` : "—"} color="#7B61FF" />
                  </div>
                </div>
                {q.hardest_question_text && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "rgba(220,38,38,0.06)" }}>
                    <strong style={{ color: "#DC2626" }}>Pregunta más difícil ({q.hardest_question_fail_rate}% fallan):</strong>{" "}
                    <span style={{ color: "#1A2332" }}>{q.hardest_question_text}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const thCls = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#6B7A8D]";

function Mini({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="text-center min-w-[60px]">
      <p style={{ fontWeight: 700, color, fontSize: "1rem" }}>{value}</p>
      <p style={{ color: "#9AA5B4", fontSize: "0.65rem" }}>{label}</p>
    </div>
  );
}
