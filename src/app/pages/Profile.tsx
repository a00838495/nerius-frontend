import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Mail, Building2, BookOpen, Clock, Trophy,
  Calendar, Shield, Flame, Award, CheckCircle2, ChevronRight,
  Sparkles, Bookmark, Loader2, GraduationCap, Gem, FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import type { UserGemCollectionEntry } from "../types/gems";
import type { UserCertification } from "../types/certification";
import coverImage from "../../assets/7fd3dad4efe18ada7c508db557505a6fb72bb193.png";

interface UserStats {
  completed_courses: number;
  enrolled_courses: number;
  total_hours: number;
  rank: number | null;
  badges_count: number;
  saved_gems_count: number;
}

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  main_color: string;
  secondary_color: string;
}

interface UserBadge {
  id: string;
  badge: Badge;
  awarded_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  content_admin: "Content Admin",
  learner: "Aprendiz",
};

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "gems">("overview");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Array<{
    id: string;
    course_id: string;
    status: string;
    progress_percent: number;
    completed_at: string | null;
    course: { id: string; title: string; description: string | null; estimated_minutes: number | null; cover_url: string | null } | null;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [gemCollection, setGemCollection] = useState<UserGemCollectionEntry[]>([]);
  const [gemsLoading, setGemsLoading] = useState(false);

  // Fetch stats and badges in parallel on mount
  useEffect(() => {
    const fetchData = async () => {
      setStatsLoading(true);
      try {
        const [statsRes, badgesRes, certsRes] = await Promise.all([
          fetch("/api/v1/auth/me/stats", { credentials: "include" }),
          fetch("/api/v1/courses/user/badges", { credentials: "include" }),
          fetch("/api/v1/certifications/my", { credentials: "include" }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (badgesRes.ok) {
          const data = await badgesRes.json();
          setBadges(Array.isArray(data) ? data : []);
        }
        if (certsRes.ok) {
          const data = await certsRes.json();
          setCertifications(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent
      } finally {
        setStatsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchGemCollection = useCallback(async () => {
    setGemsLoading(true);
    try {
      const res = await fetch("/api/v1/gems/collection", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setGemCollection(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setGemsLoading(false);
    }
  }, []);

  // Fetch completed courses when history tab is active
  const fetchCompletedCourses = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/v1/courses/user/completed", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCompletedCourses(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchCompletedCourses();
    }
    if (activeTab === "gems") {
      fetchGemCollection();
    }
  }, [activeTab, fetchGemCollection, fetchCompletedCourses]);

  const handleRemoveGem = async (gemId: string) => {
    try {
      const res = await fetch(`/api/v1/gems/${gemId}/save`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setGemCollection((prev) => prev.filter((e) => e.gem.id !== gemId));
        toast.success("Gema removida de tu colección");
      }
    } catch {
      toast.error("Error al remover la gema");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const userName = `${user.first_name} ${user.last_name}`.trim() || "Usuario";
  const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0099DC&color=fff&size=128`;
  const roleLabel = user.role_name ? (ROLE_LABELS[user.role_name] || user.role_name) : "Sin rol";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
      >
        {/* Cover */}
        <div className="relative h-36 lg:h-48 overflow-hidden">
          <img src={coverImage} alt="Profile cover" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(13,35,64,0.18) 0%, rgba(13,35,64,0.35) 55%, rgba(255,255,255,1) 100%)" }}
          />
        </div>

        {/* Profile Info */}
        <div className="bg-white px-6 lg:px-10 pb-6">
          {/* Avatar — pulled up over the cover */}
          <div className="-mt-14 mb-4 relative z-10">
            <img
              src={userAvatar}
              alt={userName}
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover"
              style={{ border: "4px solid #FFFFFF", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
            />
          </div>

          {/* Name, badges, quick stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#1A2332", lineHeight: 1.2 }}>
                  {userName}
                </h1>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,153,220,0.1)", border: "1px solid rgba(0,153,220,0.2)" }}
                >
                  <Shield size={11} color="#0099DC" />
                  <span style={{ color: "#0099DC", fontSize: "0.75rem", fontWeight: 600 }}>{roleLabel}</span>
                </div>
                {stats?.rank && (
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(229,168,0,0.1)", border: "1px solid rgba(229,168,0,0.2)" }}
                  >
                    <Trophy size={11} color="#E5A800" />
                    <span style={{ color: "#E5A800", fontSize: "0.75rem", fontWeight: 600 }}>Rank #{stats.rank}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {user.area_name && (
                  <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem" }}>
                    <Building2 size={13} color="#9AA5B4" /> {user.area_name}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem" }}>
                    <Calendar size={13} color="#9AA5B4" /> Miembro desde {memberSince}
                  </span>
                )}
              </div>
            </div>

            {/* Quick stats */}
            {stats && (
              <div className="flex gap-4 sm:ml-auto">
                {[
                  { icon: BookOpen, value: stats.completed_courses, label: "Completados", color: "#0099DC" },
                  { icon: Clock, value: `${stats.total_hours}h`, label: "Aprendido", color: "#4A8A2C" },
                  { icon: Gem, value: stats.saved_gems_count, label: "Gemas", color: "#E5A800" },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1" style={{ backgroundColor: `${color}12` }}>
                      <Icon size={16} color={color} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>{value}</p>
                    <p style={{ fontSize: "0.7rem", fontWeight: 300, color: "#9AA5B4" }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-2 border-b" style={{ borderColor: "#F0F1F5" }}>
            {(["overview", "history", "gems"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 text-sm font-medium capitalize transition-all duration-200 relative"
                style={{ color: activeTab === tab ? "#0099DC" : "#9AA5B4" }}
              >
                {tab === "history" ? "Historial de Cursos" : tab === "gems" ? "Mis Gemas" : "Vista General"}
                {activeTab === tab && (
                  <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "#0099DC" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Tab: Vista General ── */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>Información Personal</h2>
            <div className="space-y-4">
              {[
                { label: "Nombre Completo", value: userName, icon: null },
                { label: "Correo Electrónico", value: user.email, icon: Mail },
                { label: "Área", value: user.area_name || "Sin área", icon: Building2 },
                { label: "Rol", value: roleLabel, icon: Shield },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                  </label>
                  <div className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: "1.5px solid #E8EAED" }}>
                    {Icon && <Icon size={14} color="#9AA5B4" />}
                    <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Stats */}
          <div className="rounded-2xl p-6 lg:col-span-2" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>Estadísticas de Aprendizaje</h2>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin" style={{ color: "#0099DC" }} />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Cursos Completados", value: stats.completed_courses, icon: BookOpen, color: "#0099DC" },
                    { label: "Cursos en Progreso", value: stats.enrolled_courses, icon: GraduationCap, color: "#7B61FF" },
                    { label: "Horas Aprendidas", value: `${stats.total_hours}h`, icon: Clock, color: "#4A8A2C" },
                    { label: "Badges Obtenidos", value: stats.badges_count, icon: Flame, color: "#FF6B35" },
                    { label: "Gemas Guardadas", value: stats.saved_gems_count, icon: Sparkles, color: "#E5A800" },
                    { label: "Ranking", value: stats.rank ? `#${stats.rank}` : "—", icon: Trophy, color: "#1C3A5C" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="p-4 rounded-xl" style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}>
                      <Icon size={20} color={color} className="mb-2" />
                      <p style={{ fontWeight: 700, fontSize: "1.25rem", color: "#1A2332", marginBottom: "0.25rem" }}>{value}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: 400, color: "#6B7A8D" }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress summary */}
                {stats.completed_courses > 0 && (
                  <div className="p-4 rounded-xl mt-6" style={{ background: "linear-gradient(135deg, rgba(0,153,220,0.05), rgba(28,58,92,0.05))", border: "1px solid rgba(0,153,220,0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={16} color="#0099DC" />
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1A2332" }}>
                        Resumen de Progreso
                      </span>
                    </div>
                    <p style={{ color: "#6B7A8D", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      Has completado <strong style={{ color: "#1A2332" }}>{stats.completed_courses}</strong> {stats.completed_courses === 1 ? "curso" : "cursos"} con un total de <strong style={{ color: "#1A2332" }}>{stats.total_hours}h</strong> de aprendizaje
                      {stats.rank && <>, posicionándote en el <strong style={{ color: "#E5A800" }}>puesto #{stats.rank}</strong> del ranking</>}.
                      {stats.enrolled_courses > 0 && <> Tienes <strong style={{ color: "#7B61FF" }}>{stats.enrolled_courses}</strong> {stats.enrolled_courses === 1 ? "curso" : "cursos"} en progreso.</>}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: "#9AA5B4", textAlign: "center", padding: "2rem 0" }}>No se pudieron cargar las estadísticas</p>
            )}
          </div>

          {/* Badges */}
          <div className="rounded-2xl p-6 lg:col-span-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="flex items-center gap-2 mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
              <Award size={18} color="#E5A800" />
              Badges Obtenidos
              {badges.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(229,168,0,0.12)", color: "#E5A800" }}>
                  {badges.length}
                </span>
              )}
            </h2>

            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin" style={{ color: "#E5A800" }} />
              </div>
            ) : badges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Award size={44} color="#D1D5DB" className="mb-3" />
                <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1A2332", marginBottom: "0.3rem" }}>
                  Aún no tienes badges
                </p>
                <p style={{ color: "#9AA5B4", fontSize: "0.85rem", maxWidth: "360px" }}>
                  Completa cursos y lecciones para desbloquear badges y mostrar tus logros
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {badges.map((ub) => (
                  <motion.div
                    key={ub.id}
                    whileHover={{ y: -3, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center text-center p-4 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${ub.badge.main_color}10, ${ub.badge.secondary_color}10)`,
                      border: `1px solid ${ub.badge.main_color}25`,
                    }}
                  >
                    {/* Badge icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${ub.badge.main_color}, ${ub.badge.secondary_color})`,
                        boxShadow: `0 4px 12px ${ub.badge.main_color}40`,
                      }}
                    >
                      {ub.badge.icon_url ? (
                        <img src={ub.badge.icon_url} alt={ub.badge.name} className="w-7 h-7" />
                      ) : (
                        <Award size={24} color="#FFFFFF" />
                      )}
                    </div>

                    {/* Badge name */}
                    <p className="text-sm font-semibold leading-tight mb-1" style={{ color: "#1A2332" }}>
                      {ub.badge.name}
                    </p>

                    {/* Description */}
                    {ub.badge.description && (
                      <p className="text-[11px] line-clamp-2 mb-2" style={{ color: "#6B7A8D" }}>
                        {ub.badge.description}
                      </p>
                    )}

                    {/* Awarded date */}
                    <p className="text-[10px] mt-auto" style={{ color: "#9AA5B4" }}>
                      {new Date(ub.awarded_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="rounded-2xl p-6 lg:col-span-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 className="flex items-center gap-2 mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                <FileCheck size={18} color="#E5A800" />
                Mis Certificaciones
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(229,168,0,0.12)", color: "#E5A800" }}>
                  {certifications.length}
                </span>
              </h2>
              <div className="space-y-3">
                {certifications.map((cert) => {
                  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
                    requested: { bg: "rgba(0,153,220,0.1)", text: "#0099DC", label: "Solicitada" },
                    approved: { bg: "rgba(229,168,0,0.1)", text: "#E5A800", label: "Aprobada" },
                    issued: { bg: "rgba(74,138,44,0.1)", text: "#4A8A2C", label: "Emitida" },
                    rejected: { bg: "rgba(220,38,38,0.1)", text: "#DC2626", label: "Rechazada" },
                  };
                  const s = statusMap[cert.status] || statusMap.requested;
                  return (
                    <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ border: "1px solid #F0F1F5" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #E5A800, #1C3A5C)" }}>
                        <FileCheck size={20} color="#FFFFFF" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>{cert.course_certification.title}</p>
                        {cert.course_title && <p className="text-xs truncate" style={{ color: "#9AA5B4" }}>{cert.course_title}</p>}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Historial ── */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h2 className="flex items-center gap-2 mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
            <CheckCircle2 size={18} color="#4A8A2C" />
            Cursos Completados
            {completedCourses.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(74,138,44,0.12)", color: "#4A8A2C" }}>
                {completedCourses.length}
              </span>
            )}
          </h2>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin" style={{ color: "#0099DC" }} />
            </div>
          ) : completedCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen size={48} color="#9AA5B4" className="mb-4" />
              <p style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332", marginBottom: "0.5rem" }}>
                Aún no has completado ningún curso
              </p>
              <p style={{ color: "#9AA5B4", fontSize: "0.875rem", maxWidth: "400px" }}>
                Completa tus cursos para ver tu historial de logros
              </p>
              <button
                onClick={() => navigate("/learning")}
                className="mt-4 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#0099DC" }}
              >
                Explorar Cursos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {completedCourses.map((enrollment) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                  style={{ border: "1px solid #F0F1F5" }}
                >
                  {/* Cover */}
                  {enrollment.course?.cover_url ? (
                    <img src={enrollment.course.cover_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(74,138,44,0.1)" }}>
                      <CheckCircle2 size={24} color="#4A8A2C" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>
                      {enrollment.course?.title || "Curso"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#4A8A2C" }}>
                        <CheckCircle2 size={12} />
                        Completado
                      </span>
                      {enrollment.completed_at && (
                        <span className="text-xs" style={{ color: "#9AA5B4" }}>
                          {new Date(enrollment.completed_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {enrollment.course?.estimated_minutes && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#9AA5B4" }}>
                          <Clock size={11} />
                          {enrollment.course.estimated_minutes >= 60
                            ? `${Math.floor(enrollment.course.estimated_minutes / 60)}h ${enrollment.course.estimated_minutes % 60}min`
                            : `${enrollment.course.estimated_minutes}min`}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={16} color="#9AA5B4" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Mis Gemas ── */}
      {activeTab === "gems" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
              <Sparkles size={18} color="#0099DC" />
              Mi Colección de Gemas
            </h2>
            <button onClick={() => navigate("/gems")} className="text-sm font-medium transition-opacity hover:opacity-80" style={{ color: "#0099DC" }}>
              Explorar más gemas
            </button>
          </div>

          {gemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white p-5 h-48" style={{ border: "1px solid #E8EAED" }} />
              ))}
            </div>
          ) : gemCollection.length === 0 ? (
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles size={48} color="#9AA5B4" className="mb-4" />
                <p style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332", marginBottom: "0.5rem" }}>
                  Tu colección de gemas está vacía
                </p>
                <p style={{ color: "#9AA5B4", fontSize: "0.875rem", maxWidth: "400px", marginBottom: "1rem" }}>
                  Explora el banco de gemas y guarda las que más te interesen
                </p>
                <button onClick={() => navigate("/gems")} className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90" style={{ backgroundColor: "#0099DC" }}>
                  Explorar Gemas
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gemCollection.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-2xl p-5 cursor-pointer relative group"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: entry.gem.is_featured ? "1px solid rgba(229,168,0,0.3)" : "1px solid #E8EAED",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                  onClick={() => navigate(`/gems/${entry.gem.id}`)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveGem(entry.gem.id); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
                    title="Quitar de colección"
                  >
                    <Bookmark size={16} fill="#E5A800" color="#E5A800" />
                  </button>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(0, 153, 220, 0.1)" }}>
                      <Sparkles size={18} color="#0099DC" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>{entry.gem.title}</h3>
                      {entry.gem.category && (
                        <span className="text-xs" style={{ color: "#9AA5B4" }}>{entry.gem.category.name}</span>
                      )}
                    </div>
                  </div>

                  {entry.gem.description && (
                    <p className="text-xs line-clamp-2 mb-3" style={{ color: "#6B7280" }}>{entry.gem.description}</p>
                  )}

                  <div className="flex gap-1.5 flex-wrap">
                    {entry.gem.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0, 153, 220, 0.08)", color: "#0099DC" }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
