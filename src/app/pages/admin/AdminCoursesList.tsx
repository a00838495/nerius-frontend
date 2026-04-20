import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Plus, Search, Edit2, Archive, Eye, EyeOff, BookOpen,
  Clock, Users, Loader2, Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminCourse } from "../../types/admin";
import { useUserRoles } from "../../components/RequireRole";

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  draft: { label: "Borrador", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
  published: { label: "Publicado", bg: "rgba(74,138,44,0.12)", color: "#4A8A2C" },
  archived: { label: "Archivado", bg: "rgba(220,38,38,0.08)", color: "#DC2626" },
};

export function AdminCoursesList() {
  const navigate = useNavigate();
  const { canCreateCourse, canPublishCourse, canDeleteCourse } = useUserRoles();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/v1/admin/courses?${params}`, { credentials: "include" });
      if (res.ok) {
        setCourses(await res.json());
      } else {
        toast.error("Error al cargar cursos");
      }
    } catch {
      toast.error("Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const handleArchive = async (course: AdminCourse) => {
    if (!confirm(`¿Archivar el curso "${course.title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/courses/${course.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Curso archivado");
        fetchCourses();
      }
    } catch {
      toast.error("Error al archivar");
    }
  };

  const handleTogglePublish = async (course: AdminCourse) => {
    const newStatus = course.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/v1/admin/courses/${course.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === "published" ? "Curso publicado" : "Curso despublicado");
        fetchCourses();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al cambiar estado");
      }
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            Gestión de Cursos
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${courses.length} cursos`}
          </p>
        </div>
        {canCreateCourse && (
          <button
            onClick={() => navigate("/admin/cursos/nuevo")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #E5A800, #F5D060)", boxShadow: "0 4px 12px rgba(229,168,0,0.3)", color: "#1C3A5C" }}
          >
            <Plus size={16} />
            Crear Curso
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 mb-5 flex flex-col md:flex-row gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "#9AA5B4" }} />
          {(["all", "draft", "published", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: statusFilter === s ? "#E5A800" : "transparent",
                color: statusFilter === s ? "#FFFFFF" : "#6B7A8D",
                border: `1px solid ${statusFilter === s ? "#E5A800" : "#E8EAED"}`,
              }}
            >
              {s === "all" ? "Todos" : STATUS_LABELS[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: "#E5A800" }} />
        </div>
      ) : courses.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}
        >
          <BookOpen size={48} color="#D1D5DB" className="mx-auto mb-3" />
          <p style={{ fontWeight: 600, color: "#1A2332" }}>Sin cursos</p>
          <p className="text-sm mt-1" style={{ color: "#9AA5B4" }}>
            Crea tu primer curso para empezar
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          {courses.map((course, i) => {
            const status = STATUS_LABELS[course.status];
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ borderColor: "#F0F1F5" }}
                onClick={() => navigate(`/admin/cursos/${course.id}/editar`)}
              >
                {/* Cover */}
                {course.cover_url ? (
                  <img src={course.cover_url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(229,168,0,0.08)" }}>
                    <BookOpen size={18} color="#E5A800" />
                  </div>
                )}

                {/* Title + area */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "#9AA5B4" }}>
                    {course.area && <span>{course.area.name}</span>}
                    {course.estimated_minutes && (
                      <>
                        {course.area && <span>·</span>}
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {course.estimated_minutes}min
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-5 text-xs shrink-0" style={{ color: "#6B7A8D" }}>
                  <span>{course.modules_count} módulos</span>
                  <span>{course.lessons_count} lecciones</span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {course.total_enrolled}
                  </span>
                </div>

                {/* Status */}
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                  style={{ backgroundColor: status.bg, color: status.color }}
                >
                  {status.label}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/admin/cursos/${course.id}/editar`)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={14} style={{ color: "#0099DC" }} />
                  </button>
                  {canPublishCourse && course.status !== "archived" && (
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={course.status === "published" ? "Despublicar" : "Publicar"}
                    >
                      {course.status === "published" ? (
                        <EyeOff size={14} style={{ color: "#6B7A8D" }} />
                      ) : (
                        <Eye size={14} style={{ color: "#4A8A2C" }} />
                      )}
                    </button>
                  )}
                  {canDeleteCourse && course.status !== "archived" && (
                    <button
                      onClick={() => handleArchive(course)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Archivar"
                    >
                      <Archive size={14} style={{ color: "#DC2626" }} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
