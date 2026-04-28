import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Edit2, Camera, Mail, Building2, BookOpen, Clock, Trophy,
  Calendar, Shield, TrendingUp, Gem, Check, Star, Award,
  Sparkles, Bookmark, Loader2, CheckCircle2, ChevronRight, FileCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import coverImage from "../../assets/7fd3dad4efe18ada7c508db557505a6fb72bb193.png";
import type { UserGemCollectionEntry } from "../types/gems";
import type { UserCertification } from "../types/certification";

interface ProfileStats {
  completed_courses: number;
  enrolled_courses: number;
  total_hours: number;
  rank: number | null;
  badges_count: number;
  saved_gems_count: number;
}

const EMPTY_STATS: ProfileStats = {
  completed_courses: 0,
  enrolled_courses: 0,
  total_hours: 0,
  rank: null,
  badges_count: 0,
  saved_gems_count: 0,
};

function getLevel(completed: number): { level: number; label: string; nextAt: number; progressPct: number; color: string } {
  const tiers = [
    { level: 1, label: "Novato", min: 0, nextAt: 5, color: "#4A8A2C" },
    { level: 2, label: "Aprendiz", min: 5, nextAt: 10, color: "#0099DC" },
    { level: 3, label: "Intermedio", min: 10, nextAt: 20, color: "#7B61FF" },
    { level: 4, label: "Avanzado", min: 20, nextAt: 50, color: "#FF6B35" },
    { level: 5, label: "Experto", min: 50, nextAt: Infinity, color: "#E5A800" },
  ];
  const tier = tiers.findLast((t) => completed >= t.min) ?? tiers[0];
  const progressPct =
    tier.nextAt === Infinity ? 100 : Math.min(100, ((completed - tier.min) / (tier.nextAt - tier.min)) * 100);
  return { ...tier, progressPct };
}

export function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "gems">("overview");
  const [formData, setFormData] = useState({ first_name: "", last_name: "" });
  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
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

  useEffect(() => {
    if (user) setFormData({ first_name: user.first_name, last_name: user.last_name });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    Promise.all([
      fetch("/api/v1/auth/me/stats", { credentials: "include" }),
      fetch("/api/v1/certifications/my", { credentials: "include" }),
    ])
      .then(async ([statsRes, certsRes]) => {
        if (statsRes.ok) setStats(await statsRes.json());
        else setStats(EMPTY_STATS);
        if (certsRes.ok) {
          const data = await certsRes.json();
          setCertifications(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => setStats(EMPTY_STATS))
      .finally(() => setStatsLoading(false));
  }, [user]);

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
    if (activeTab === "history") fetchCompletedCourses();
    if (activeTab === "gems") fetchGemCollection();
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setEditing(false);
      toast.success("Perfil actualizado correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
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
  const userAvatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1C3A5C&color=fff&size=128`;

  const level = getLevel(stats.completed_courses);
  const levelProgress = Math.min(stats.completed_courses * 20, 100);

  const levelInfo = getLevel(stats?.completed_courses ?? 0);
  const milestones = [0, 25, 50, 75, 100];

  const TABS = [
    { key: "overview" as const, label: "Vista General" },
    { key: "history" as const, label: "Historial" },
    { key: "gems" as const, label: "Mis Gemas" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left Sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4"
        >
          {/* Avatar Card */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            {/* Mini cover */}
            <div className="relative h-24 overflow-hidden">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,35,64,0.1) 0%, rgba(13,35,64,0.5) 100%)" }} />
            </div>

            {/* Avatar + info */}
            <div className="px-5 pb-5">
              {/* Avatar pulled up */}
              <div className="relative -mt-10 mb-3 inline-block">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: "3px solid #FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                />
                {/* Online indicator */}
                <span
                  className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#4A8A2C", border: "2.5px solid #FFFFFF" }}
                />
              </div>

              <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#1A2332", lineHeight: 1.25 }}>
                {userName}
              </h2>
              <p className="text-sm mt-0.5 mb-3" style={{ color: "#9AA5B4" }}>{user.email}</p>

              {/* Level badge */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color, border: `1px solid ${levelInfo.color}30` }}
                >
                  <Trophy size={11} />
                  Nivel {levelInfo.level} · {levelInfo.label}
                </span>
                {stats?.rank && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#E5A800", border: "1px solid rgba(229,168,0,0.25)" }}
                  >
                    <Flame size={11} />
                    Rank #{stats.rank}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.8rem", color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
              Información
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(0,153,220,0.1)" }}>
                  <Mail size={13} color="#0099DC" />
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9AA5B4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Correo</p>
                  <p className="text-sm break-all" style={{ color: "#1A2332", fontWeight: 500 }}>{user.email}</p>
                </div>
              </div>

              {user.area_name && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(74,138,44,0.1)" }}>
                    <Building2 size={13} color="#4A8A2C" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "#9AA5B4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Área</p>
                    <p className="text-sm" style={{ color: "#1A2332", fontWeight: 500 }}>{user.area_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(123,97,255,0.1)" }}>
                  <Shield size={13} color="#7B61FF" />
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9AA5B4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Rol</p>
                  <p className="text-sm" style={{ color: "#1A2332", fontWeight: 500 }}>{roleLabel}</p>
                </div>
              </div>

              {memberSince && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(229,168,0,0.1)" }}>
                    <Calendar size={13} color="#E5A800" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "#9AA5B4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Miembro desde</p>
                    <p className="text-sm capitalize" style={{ color: "#1A2332", fontWeight: 500 }}>{memberSince}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmed info */}
            <div className="pt-3 mt-3" style={{ borderTop: "1px solid #F0F1F5" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1A2332", marginBottom: "0.6rem" }}>
                Información confirmada
              </p>
              {[
                { label: "Dirección de correo", done: true },
                { label: "Área de trabajo", done: !!user.area_name },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 size={14} color={done ? "#4A8A2C" : "#D1D5DB"} />
                  <span style={{ fontSize: "0.8rem", color: done ? "#1A2332" : "#9AA5B4" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Right Area ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 min-w-0 space-y-4"
        >
          {/* Pill Tab Switcher */}
          <div className="inline-flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#F0F1F5" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab.key ? "#1C3A5C" : "transparent",
                  color: activeTab === tab.key ? "#FFFFFF" : "#6B7A8D",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* ── Vista General ── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Stat Cards */}
                {statsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl bg-white p-5 h-28" style={{ border: "1px solid #E8EAED" }} />
                    ))}
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Completados", value: stats.completed_courses, icon: BookOpen, color: "#0099DC" },
                      { label: "Horas Aprendidas", value: `${stats.total_hours}h`, icon: Clock, color: "#4A8A2C" },
                      { label: "Badges", value: stats.badges_count, icon: Award, color: "#FF6B35" },
                      { label: "Ranking", value: stats.rank ? `#${stats.rank}` : "—", icon: Trophy, color: "#E5A800" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div
                        key={label}
                        className="rounded-2xl p-5"
                        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}12` }}>
                          <Icon size={17} color={color} />
                        </div>
                        <p style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1A2332", lineHeight: 1 }}>{value}</p>
                        <p className="mt-1" style={{ fontSize: "0.75rem", color: "#9AA5B4", fontWeight: 500 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Level Progress */}
                {stats && (
                  <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1A2332" }}>
                          Nivel {levelInfo.level} · {levelInfo.label}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color }}
                        >
                          {stats.completed_courses} curso{stats.completed_courses !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {levelInfo.nextAt !== Infinity && (
                        <span style={{ fontSize: "0.75rem", color: "#9AA5B4" }}>
                          Siguiente nivel en {levelInfo.nextAt - stats.completed_courses} curso{levelInfo.nextAt - stats.completed_courses !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Progress bar with milestones */}
                    <div className="relative h-3 rounded-full mb-2" style={{ backgroundColor: "#F0F1F5" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: levelInfo.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progressPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      {milestones.map((m) => (
                        <div
                          key={m}
                          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                          style={{
                            left: `${m}%`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor: levelInfo.progressPct >= m ? levelInfo.color : "#D1D5DB",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {milestones.map((m) => (
                        <span key={m} style={{ fontSize: "0.65rem", color: "#9AA5B4" }}>{m}%</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gradient Cards: enrolled + gems */}
                {stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #0099DC, #0066A2)", boxShadow: "0 4px 20px rgba(0,153,220,0.25)" }}
                      onClick={() => navigate("/learning")}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                        <GraduationCap size={22} color="#FFFFFF" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: "1.6rem", color: "#FFFFFF", lineHeight: 1 }}>{stats.enrolled_courses}</p>
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginTop: "0.15rem" }}>Cursos en Progreso</p>
                      </div>
                    </div>
                    <div
                      className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #7B61FF, #5B41DF)", boxShadow: "0 4px 20px rgba(123,97,255,0.25)" }}
                      onClick={() => navigate("/gems")}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                        <Gem size={22} color="#FFFFFF" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: "1.6rem", color: "#FFFFFF", lineHeight: 1 }}>{stats.saved_gems_count}</p>
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginTop: "0.15rem" }}>Gemas Guardadas</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h2 className="flex items-center gap-2 mb-5" style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>
                    <Award size={17} color="#E5A800" />
                    Logros e Insignias
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
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Award size={40} color="#D1D5DB" className="mb-3" />
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A2332", marginBottom: "0.3rem" }}>
                        Aún no tienes badges
                      </p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.8rem", maxWidth: "320px" }}>
                        Completa cursos y lecciones para desbloquear insignias
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
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                            style={{
                              background: `linear-gradient(135deg, ${ub.badge.main_color}, ${ub.badge.secondary_color})`,
                              boxShadow: `0 4px 12px ${ub.badge.main_color}40`,
                            }}
                          >
                            {ub.badge.icon_url ? (
                              <img src={ub.badge.icon_url} alt={ub.badge.name} className="w-7 h-7" />
                            ) : (
                              <Award size={20} color="#FFFFFF" />
                            )}
                          </div>
                          <p className="text-xs font-semibold leading-tight mb-1" style={{ color: "#1A2332" }}>
                            {ub.badge.name}
                          </p>
                          {ub.badge.description && (
                            <p className="text-[10px] line-clamp-2 mb-1" style={{ color: "#6B7A8D" }}>
                              {ub.badge.description}
                            </p>
                          )}
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
                  <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h2 className="flex items-center gap-2 mb-5" style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>
                      <FileCheck size={17} color="#E5A800" />
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
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #E5A800, #1C3A5C)" }}>
                              <FileCheck size={18} color="#FFFFFF" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>{cert.course_certification.title}</p>
                              {cert.course_title && <p className="text-xs truncate" style={{ color: "#9AA5B4" }}>{cert.course_title}</p>}
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Historial ── */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <h2 className="flex items-center gap-2 mb-5" style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>
                  <CheckCircle2 size={17} color="#4A8A2C" />
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
                    <p style={{ color: "#9AA5B4", fontSize: "0.875rem", maxWidth: "360px" }}>
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

            {/* ── Mis Gemas ── */}
            {activeTab === "gems" && (
              <motion.div
                key="gems"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>
                    <Sparkles size={17} color="#0099DC" />
                    Mi Colección de Gemas
                  </h2>
                  <button onClick={() => navigate("/gems")} className="text-sm font-medium transition-opacity hover:opacity-80" style={{ color: "#0099DC" }}>
                    Explorar más →
                  </button>
                </div>

                {gemsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl bg-white p-5 h-44" style={{ border: "1px solid #E8EAED" }} />
                    ))}
                  </div>
                ) : gemCollection.length === 0 ? (
                  <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles size={48} color="#9AA5B4" className="mb-4" />
                      <p style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332", marginBottom: "0.5rem" }}>
                        Tu colección de gemas está vacía
                      </p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.875rem", maxWidth: "360px", marginBottom: "1rem" }}>
                        Explora el banco de gemas y guarda las que más te interesen
                      </p>
                      <button onClick={() => navigate("/gems")} className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90" style={{ backgroundColor: "#0099DC" }}>
                        Explorar Gemas
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                          <Bookmark size={15} fill="#E5A800" color="#E5A800" />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(0,153,220,0.1)" }}>
                            <Sparkles size={17} color="#0099DC" />
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
                            <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,153,220,0.08)", color: "#0099DC" }}>
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
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
