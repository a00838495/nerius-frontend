import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronLeft, Eye, EyeOff, Save, Loader2,
  FileText, Layers, FileCheck, Award, Sparkles, Stamp, Key,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminCourse } from "../../types/admin";
import { useUserRoles } from "../../components/RequireRole";
import GeneralTab from "./tabs/GeneralTab";
import ContentTab from "./tabs/ContentTab";
import QuizzesTab from "./tabs/QuizzesTab";
import BadgesTab from "./tabs/BadgesTab";
import GemsTab from "./tabs/GemsTab";
import CertificationTab from "./tabs/CertificationTab";
import AccessTab from "./tabs/AccessTab";

type TabId = "general" | "content" | "quizzes" | "badges" | "gems" | "certification" | "access";

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  draft: { label: "Borrador", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
  published: { label: "Publicado", bg: "rgba(74,138,44,0.12)", color: "#4A8A2C" },
  archived: { label: "Archivado", bg: "rgba(220,38,38,0.08)", color: "#DC2626" },
};

export function AdminCourseEdit() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { canPublishCourse } = useUserRoles();

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [togglingPublish, setTogglingPublish] = useState(false);

  const loadCourse = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}`, { credentials: "include" });
      if (res.ok) {
        setCourse(await res.json());
      } else {
        toast.error("Curso no encontrado");
        navigate("/admin/cursos");
      }
    } catch {
      toast.error("Error al cargar curso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleTogglePublish = async () => {
    if (!course) return;
    const newStatus = course.status === "published" ? "draft" : "published";
    setTogglingPublish(true);
    try {
      const res = await fetch(`/api/v1/admin/courses/${course.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCourse(updated);
        toast.success(newStatus === "published" ? "Curso publicado" : "Curso despublicado");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al cambiar estado");
      }
    } catch {
      toast.error("Error al cambiar estado");
    } finally {
      setTogglingPublish(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin" style={{ color: "#E5A800" }} />
      </div>
    );
  }

  if (!course) return null;

  const status = STATUS_LABELS[course.status];

  const tabs: Array<{ id: TabId; label: string; icon: typeof FileText }> = [
    { id: "general", label: "General", icon: FileText },
    { id: "content", label: "Contenido", icon: Layers },
    { id: "quizzes", label: "Quizzes", icon: FileCheck },
    { id: "badges", label: "Badges", icon: Award },
    { id: "gems", label: "Gemas", icon: Sparkles },
    { id: "certification", label: "Certificación", icon: Stamp },
    { id: "access", label: "Accesos", icon: Key },
  ];

  return (
    <div>
      {/* Header bar */}
      <div
        className="px-6 lg:px-10 py-4 border-b"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E8EAED" }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/cursos")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: "#1A2332" }}>
                {course.title}
              </h1>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#9AA5B4" }}>
              {course.modules_count} módulos · {course.lessons_count} lecciones · {course.total_enrolled} inscritos
            </p>
          </div>
          {canPublishCourse && course.status !== "archived" && (
            <button
              onClick={handleTogglePublish}
              disabled={togglingPublish}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: course.status === "published"
                  ? "linear-gradient(135deg, #6B7280, #4B5563)"
                  : "linear-gradient(135deg, #4A8A2C, #3a6e22)",
              }}
            >
              {togglingPublish ? (
                <Loader2 size={14} className="animate-spin" />
              ) : course.status === "published" ? (
                <><EyeOff size={14} /> Despublicar</>
              ) : (
                <><Eye size={14} /> Publicar</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="px-6 lg:px-10 border-b overflow-x-auto"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E8EAED" }}
      >
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap relative"
              style={{
                color: activeTab === id ? "#E5A800" : "#6B7A8D",
                fontWeight: activeTab === id ? 700 : 500,
              }}
            >
              <Icon size={14} />
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "#E5A800" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
        {activeTab === "general" && <GeneralTab course={course} onUpdate={setCourse} />}
        {activeTab === "content" && <ContentTab courseId={course.id} onChange={loadCourse} />}
        {activeTab === "quizzes" && <QuizzesTab courseId={course.id} />}
        {activeTab === "badges" && <BadgesTab courseId={course.id} />}
        {activeTab === "gems" && <GemsTab courseId={course.id} />}
        {activeTab === "certification" && <CertificationTab courseId={course.id} />}
        {activeTab === "access" && <AccessTab courseId={course.id} accessType={course.access_type} />}
      </div>
    </div>
  );
}
