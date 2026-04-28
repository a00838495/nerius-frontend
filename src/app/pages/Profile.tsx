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

function getLevel(completed: number): string {
  if (completed === 0) return "Principiante";
  if (completed <= 2) return "Explorador";
  if (completed <= 5) return "Aprendiz";
  if (completed <= 10) return "Avanzado";
  return "Experto";
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
  }, [activeTab, fetchCompletedCourses, fetchGemCollection]);

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

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT SIDEBAR ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4"
        >
          {/* Avatar card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="relative h-24 overflow-hidden">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(28,58,92,0.35), rgba(28,58,92,0.7))" }}
              />
            </div>

            <div className="flex flex-col items-center px-6 pb-6 -mt-10">
              <div className="relative mb-3">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: "3px solid #FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
                />
                {editing && (
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#E5A800", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                  >
                    <Camera size={12} color="white" />
                  </button>
                )}
                <span
                  className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: "#22C55E" }}
                />
              </div>

              {editing ? (
                <div className="w-full space-y-2 mb-3">
                  <input
                    value={formData.first_name}
                    onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                    placeholder="Nombre"
                    className="w-full text-center text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ border: "1.5px solid #0099DC", color: "#1A2332", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                  />
                  <input
                    value={formData.last_name}
                    onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                    placeholder="Apellido"
                    className="w-full text-center text-sm px-3 py-2 rounded-xl outline-none"
                    style={{ border: "1.5px solid #0099DC", color: "#1A2332", fontFamily: "'Open Sans', sans-serif" }}
                  />
                </div>
              ) : (
                <h1
                  className="text-center"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#1A2332", marginBottom: "0.15rem" }}
                >
                  {userName}
                </h1>
              )}

              <p style={{ color: "#9AA5B4", fontSize: "0.8rem", fontFamily: "'Open Sans', sans-serif" }}>
                {user.role || "Aprendiz"}
              </p>

              <div className="flex gap-2 mt-3">
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "rgba(0,153,220,0.1)", color: "#0099DC" }}
                >
                  <Shield size={10} /> {level}
                </span>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#E5A800" }}
                >
                  <Trophy size={10} /> {stats.rank ? `#${stats.rank}` : "N/A"}
                </span>
              </div>

              {editing ? (
                <div className="flex gap-2 mt-4 w-full">
                  <button
                    onClick={() => { setFormData({ first_name: user.first_name, last_name: user.last_name }); setEditing(false); }}
                    disabled={saving}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ border: "1px solid #E8EAED", color: "#6B7A8D", backgroundColor: "#F9FAFB" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                    style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all hover:bg-gray-50 active:scale-[0.98]"
                  style={{ border: "1px solid #E8EAED", color: "#1C3A5C" }}
                >
                  <Edit2 size={13} /> Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Info card */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            <h3
              className="mb-4"
              style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#1A2332", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              Información
            </h3>
            <div className="space-y-3">
              {[
                { icon: Mail, label: user.email },
                { icon: Building2, label: user.department || "Sin departamento" },
                { icon: Shield, label: user.role || "Aprendiz" },
                { icon: Calendar, label: `Miembro desde ${new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#F4F6F9" }}>
                    <Icon size={13} color="#6B7A8D" />
                  </div>
                  <span className="text-sm leading-snug break-all" style={{ color: "#4A5568", fontFamily: "'Open Sans', sans-serif" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: "1px solid #F0F1F5" }}>
              <p className="mb-3" style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#1A2332", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Información confirmada
              </p>
              {["Correo electrónico", "Identidad"].map((item) => (
                <div key={item} className="flex items-center gap-2 mb-2">
                  <Check size={13} color="#22C55E" strokeWidth={2.5} />
                  <span style={{ fontSize: "0.82rem", color: "#4A5568", fontFamily: "'Open Sans', sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT MAIN AREA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex-1 min-w-0"
        >
          {/* Tab switcher */}
          <div
            className="inline-flex gap-1 p-1 rounded-xl mb-6"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
          >
            {(["overview", "history", "gems"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: activeTab === tab ? "#FFFFFF" : "#9AA5B4",
                  backgroundColor: activeTab === tab ? "#1C3A5C" : "transparent",
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                {tab === "history" ? "Historial de Cursos" : tab === "gems" ? "Mis Gemas" : "Vista General"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── VISTA GENERAL ── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: BookOpen, value: stats.completed_courses, label: "Cursos Completados", color: "#0099DC", bg: "rgba(0,153,220,0.08)" },
                    { icon: Clock, value: `${stats.total_hours}h`, label: "Horas Aprendidas", color: "#4A8A2C", bg: "rgba(74,138,44,0.08)" },
                    { icon: Award, value: stats.badges_count, label: "Insignias", color: "#E5A800", bg: "rgba(229,168,0,0.08)" },
                    { icon: Trophy, value: stats.rank ? `#${stats.rank}` : "N/A", label: "Ranking Global", color: "#1C3A5C", bg: "rgba(28,58,92,0.08)" },
                  ].map(({ icon: Icon, value, label, color, bg }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-2xl p-5"
                      style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                      {statsLoading ? (
                        <>
                          <div className="w-10 h-10 rounded-xl mb-3 animate-pulse" style={{ backgroundColor: "#F0F1F5" }} />
                          <div className="h-7 w-16 rounded-lg mb-2 animate-pulse" style={{ backgroundColor: "#F0F1F5" }} />
                          <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: "#F0F1F5" }} />
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
                            <Icon size={18} color={color} />
                          </div>
                          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: "1.55rem", color: "#1A2332", lineHeight: 1 }}>
                            {value}
                          </p>
                          <p style={{ fontSize: "0.76rem", color: "#9AA5B4", marginTop: "0.3rem", fontFamily: "'Open Sans', sans-serif" }}>
                            {label}
                          </p>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Progress + secondary stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Level progress */}
                  <div className="md:col-span-2 rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#1A2332" }}>
                          Progreso de Nivel
                        </p>
                        <p style={{ fontSize: "0.76rem", color: "#9AA5B4", marginTop: "0.2rem" }}>
                          {level} → {getLevel(stats.completed_courses + 1) !== level ? getLevel(stats.completed_courses + 1) : "Nivel Máximo"}
                        </p>
                      </div>
                      {statsLoading ? (
                        <div className="h-8 w-14 rounded-lg animate-pulse" style={{ backgroundColor: "#F0F1F5" }} />
                      ) : (
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0099DC", lineHeight: 1 }}>
                          {levelProgress}%
                        </span>
                      )}
                    </div>
                    <div className="relative w-full rounded-full overflow-hidden" style={{ height: 10, backgroundColor: "#F0F1F5" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: statsLoading ? "0%" : `${levelProgress}%` }}
                        transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
                        style={{ background: "linear-gradient(to right, #0099DC, #1C3A5C)" }}
                      />
                    </div>
                    <div className="flex justify-between mt-3">
                      {[0, 25, 50, 75, 100].map((m) => (
                        <div key={m} className="flex flex-col items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: levelProgress >= m ? "#0099DC" : "#E0E4EA" }} />
                          <span style={{ fontSize: "0.62rem", color: "#9AA5B4" }}>{m}%</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: "#B0B9C6", fontSize: "0.73rem", marginTop: "0.75rem", fontFamily: "'Open Sans', sans-serif" }}>
                      Cada 5 cursos completados avanzas al siguiente nivel
                    </p>
                  </div>

                  {/* En progreso + Gemas */}
                  <div className="flex flex-col gap-4">
                    <div
                      className="flex-1 rounded-2xl p-5"
                      style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)", boxShadow: "0 4px 16px rgba(0,153,220,0.22)" }}
                    >
                      <TrendingUp size={20} color="rgba(255,255,255,0.8)" className="mb-2" />
                      {statsLoading ? (
                        <div className="h-8 w-10 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                      ) : (
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#FFFFFF", lineHeight: 1 }}>
                          {stats.enrolled_courses}
                        </p>
                      )}
                      <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.75)", marginTop: "0.2rem" }}>
                        cursos en progreso
                      </p>
                    </div>
                    <div
                      className="flex-1 rounded-2xl p-5"
                      style={{ background: "linear-gradient(135deg, #7B61FF 0%, #A08BFF 100%)", boxShadow: "0 4px 16px rgba(123,97,255,0.22)" }}
                    >
                      <Gem size={20} color="rgba(255,255,255,0.8)" className="mb-2" />
                      {statsLoading ? (
                        <div className="h-8 w-10 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                      ) : (
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#FFFFFF", lineHeight: 1 }}>
                          {stats.saved_gems_count}
                        </p>
                      )}
                      <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.75)", marginTop: "0.2rem" }}>
                        gemas guardadas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#1A2332" }}>
                      Logros e Insignias
                    </p>
                    {!statsLoading && stats.badges_count > 0 && (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#E5A800" }}
                      >
                        {stats.badges_count} obtenidas
                      </span>
                    )}
                  </div>
                  <div
                    className="flex flex-col items-center py-8 rounded-xl"
                    style={{ backgroundColor: "#F9FAFB", border: "1px dashed #E8EAED" }}
                  >
                    <Star size={30} color="#D1D9E6" className="mb-2" />
                    <p style={{ fontSize: "0.85rem", color: "#9AA5B4", fontFamily: "'Open Sans', sans-serif" }}>
                      {statsLoading ? "Cargando insignias..." : "Completa cursos para ganar insignias"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── HISTORIAL DE CURSOS ── */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Summary banner */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "linear-gradient(135deg, #1C3A5C 0%, #0099DC 100%)", boxShadow: "0 4px 24px rgba(28,58,92,0.22)" }}
                >
                  <p className="mb-4" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Resumen de Aprendizaje
                  </p>
                  <div className="flex flex-wrap gap-8">
                    {[
                      { icon: BookOpen, value: statsLoading ? "—" : String(stats.completed_courses), label: "Completados" },
                      { icon: Clock, value: statsLoading ? "—" : `${stats.total_hours}h`, label: "Horas totales" },
                      { icon: Award, value: statsLoading ? "—" : String(stats.badges_count), label: "Insignias" },
                      { icon: Trophy, value: statsLoading ? "—" : (stats.rank ? `#${stats.rank}` : "N/A"), label: "Ranking" },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                          <Icon size={17} color="white" />
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#FFFFFF", lineHeight: 1 }}>
                            {value}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", marginTop: "0.15rem" }}>{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cursos completados */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h3 className="flex items-center gap-2 mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                    <CheckCircle2 size={18} color="#4A8A2C" />
                    Cursos Completados
                    {completedCourses.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(74,138,44,0.12)", color: "#4A8A2C" }}>
                        {completedCourses.length}
                      </span>
                    )}
                  </h3>

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
                </div>

                {/* Certificaciones */}
                {certifications.length > 0 && (
                  <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h3 className="flex items-center gap-2 mb-5" style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                      <FileCheck size={18} color="#E5A800" />
                      Mis Certificaciones
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(229,168,0,0.12)", color: "#E5A800" }}>
                        {certifications.length}
                      </span>
                    </h3>
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

            {/* ── MIS GEMAS ── */}
            {activeTab === "gems" && (
              <motion.div
                key="gems"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
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
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}