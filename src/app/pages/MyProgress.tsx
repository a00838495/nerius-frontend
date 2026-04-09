import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Trophy, Clock, BookOpen, Award, Sparkles, GraduationCap, Gem,
  TrendingUp, Loader2, ChevronRight, FileCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { UserCertification } from "../types/certification";

// ── Types ──

interface UserStats {
  completed_courses: number;
  enrolled_courses: number;
  total_hours: number;
  rank: number | null;
  badges_count: number;
  saved_gems_count: number;
}

interface BadgeDef {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  main_color: string;
  secondary_color: string;
}

interface UserBadge {
  id: string;
  badge: BadgeDef;
  awarded_at: string;
}

interface RankingEntry {
  name: string;
  total_completed_courses: number;
  area: string;
}

interface PendingEnrollment {
  id: string;
  course_id: string;
  status: string;
  progress_percent: number;
  course: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    estimated_minutes: number | null;
    cover_url: string | null;
  } | null;
}

// ── Helpers ──

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const steps = 30;
    const stepVal = target / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(stepVal * step), target));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <>{current}</>;
}

function ProgressRing({ value, size = 100, strokeWidth = 8, color = "#0099DC" }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedValue(value), 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={`${circumference * animatedValue / 100} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: "stroke-dasharray 1.5s ease-out", filter: `drop-shadow(0 0 6px ${color}50)` }}
      />
    </svg>
  );
}

// ── Page ──

export function MyProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [pendingCourses, setPendingCourses] = useState<PendingEnrollment[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, badgesRes, rankingRes, pendingRes, certsRes] = await Promise.all([
          fetch("/api/v1/auth/me/stats", { credentials: "include" }),
          fetch("/api/v1/courses/user/badges", { credentials: "include" }),
          fetch("/api/v1/courses/ranking", { credentials: "include" }),
          fetch("/api/v1/courses/user/pending", { credentials: "include" }),
          fetch("/api/v1/certifications/my", { credentials: "include" }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (badgesRes.ok) {
          const data = await badgesRes.json();
          setBadges(Array.isArray(data) ? data : []);
        }
        if (rankingRes.ok) {
          const data = await rankingRes.json();
          setRanking(Array.isArray(data) ? data : []);
        }
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          setPendingCourses(Array.isArray(data) ? data : []);
        }
        if (certsRes.ok) {
          const data = await certsRes.json();
          setCertifications(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (!user) return <div className="p-10 text-center">Cargando...</div>;

  const userName = `${user.first_name} ${user.last_name}`;
  const userRank = ranking.findIndex((r) => r.name === userName) + 1 || stats?.rank;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={36} className="animate-spin" style={{ color: "#0099DC" }} />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ backgroundColor: "rgba(74, 138, 44, 0.1)", border: "1px solid rgba(74, 138, 44, 0.2)" }}
        >
          <TrendingUp size={13} color="#4A8A2C" />
          <span style={{ color: "#4A8A2C", fontSize: "0.78rem", fontWeight: 600 }}>MI PROGRESO</span>
        </div>
        <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "#1A2332", lineHeight: 1.2 }}>
          Tu Panel de Aprendizaje
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Sigue avanzando — ¡lo estás haciendo excelente!
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Cursos Completados", value: stats.completed_courses, icon: BookOpen, color: "#0099DC", suffix: "" },
            { label: "En Progreso", value: stats.enrolled_courses, icon: GraduationCap, color: "#7B61FF", suffix: "" },
            { label: "Horas Aprendidas", value: stats.total_hours, icon: Clock, color: "#4A8A2C", suffix: "h" },
            { label: "Badges Obtenidos", value: stats.badges_count, icon: Award, color: "#E5A800", suffix: "" },
            { label: "Gemas Guardadas", value: stats.saved_gems_count, icon: Sparkles, color: "#E87830", suffix: "" },
            { label: "Ranking Global", value: stats.rank || 0, icon: Trophy, color: "#1C3A5C", suffix: stats.rank ? "" : "" },
          ].map(({ label, value, icon: Icon, color, suffix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#1A2332", lineHeight: 1.1 }}>
                  {stats.rank === null && label === "Ranking Global" ? "—" : <><AnimatedNumber target={value} />{suffix}</>}
                </p>
                <p style={{ color: "#9AA5B4", fontSize: "0.73rem", marginTop: "0.2rem" }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Completion Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg, #0D2340, #1C3A5C)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={16} color="#0099DC" />
              <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#FFFFFF" }}>Resumen General</h2>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#FFFFFF", lineHeight: 1.1 }}>
                  {stats.completed_courses}
                </p>
                <p style={{ color: "#89B8D4", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  {stats.completed_courses === 1 ? "curso completado" : "cursos completados"}
                </p>
              </div>
              <div className="relative">
                <ProgressRing
                  value={stats.completed_courses + stats.enrolled_courses > 0
                    ? Math.round((stats.completed_courses / (stats.completed_courses + stats.enrolled_courses)) * 100)
                    : 0}
                  size={90}
                  strokeWidth={8}
                  color="#0099DC"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#FFFFFF" }}>
                    {stats.completed_courses + stats.enrolled_courses > 0
                      ? Math.round((stats.completed_courses / (stats.completed_courses + stats.enrolled_courses)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ color: "#89B8D4", fontSize: "0.8rem", lineHeight: 1.6 }}>
                {stats.total_hours}h de aprendizaje
                {stats.enrolled_courses > 0 && <> · {stats.enrolled_courses} {stats.enrolled_courses === 1 ? "curso" : "cursos"} en progreso</>}
                {userRank && <> · Ranking #{userRank}</>}
              </p>
            </div>
          </motion.div>
        )}

        {/* Courses In Progress */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-6 lg:col-span-2"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>Cursos en Progreso</h2>
              <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>Tu avance en los cursos activos</p>
            </div>
          </div>

          {pendingCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <GraduationCap size={40} color="#D1D5DB" className="mb-3" />
              <p style={{ fontWeight: 600, color: "#1A2332", marginBottom: "0.3rem" }}>Sin cursos en progreso</p>
              <p style={{ color: "#9AA5B4", fontSize: "0.85rem", maxWidth: "300px" }}>Inscríbete en un curso para empezar a aprender</p>
              <button
                onClick={() => navigate("/learning")}
                className="mt-3 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#0099DC" }}
              >
                Explorar Cursos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map((enrollment) => (
                <div
                  key={enrollment.id}
                  onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                  className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                  style={{ border: "1px solid #F0F1F5" }}
                >
                  {/* Cover */}
                  {enrollment.course?.cover_url ? (
                    <img src={enrollment.course.cover_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,153,220,0.1)" }}>
                      <BookOpen size={20} color="#0099DC" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>
                      {enrollment.course?.title || "Curso"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, backgroundColor: "rgba(0,0,0,0.06)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${enrollment.progress_percent}%`,
                            background: enrollment.progress_percent >= 80
                              ? "linear-gradient(to right, #4A8A2C, #2E7D32)"
                              : "linear-gradient(to right, #0099DC, #1C3A5C)",
                            transition: "width 1s ease-out",
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold shrink-0" style={{ color: "#0099DC" }}>
                        {Math.round(enrollment.progress_percent)}%
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} color="#9AA5B4" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award size={16} color="#E5A800" />
              <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>Badges</h2>
            </div>
            <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#E5A800" }}>
              {badges.length} {badges.length === 1 ? "obtenido" : "obtenidos"}
            </span>
          </div>

          {badges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <Award size={28} color="#9AA5B4" className="mx-auto mb-3" />
              <p style={{ color: "#1A2332", fontWeight: 600, marginBottom: "0.35rem" }}>Aún no tienes badges</p>
              <p style={{ color: "#6B7A8D", fontSize: "0.85rem" }}>Completa lecciones y cursos para desbloquearlos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((ub) => (
                <motion.div
                  key={ub.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-xl p-3"
                  style={{
                    borderColor: `${ub.badge.main_color}30`,
                    border: `1px solid ${ub.badge.main_color}25`,
                    background: `linear-gradient(135deg, ${ub.badge.main_color}12, ${ub.badge.secondary_color}08)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${ub.badge.main_color}, ${ub.badge.secondary_color})`,
                        boxShadow: `0 3px 8px ${ub.badge.main_color}40`,
                      }}
                    >
                      {ub.badge.icon_url ? (
                        <img src={ub.badge.icon_url} alt={ub.badge.name} className="w-6 h-6" />
                      ) : (
                        <Award size={18} color="#FFFFFF" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>{ub.badge.name}</p>
                      {ub.badge.description && (
                        <p className="text-[11px] line-clamp-1" style={{ color: "#6B7A8D" }}>{ub.badge.description}</p>
                      )}
                      <p className="text-[10px] mt-0.5" style={{ color: "#9AA5B4" }}>
                        {new Date(ub.awarded_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Leaderboard (real) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={16} color="#E5A800" />
            <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>Ranking</h2>
          </div>

          {ranking.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <Trophy size={28} color="#9AA5B4" className="mx-auto mb-3" />
              <p style={{ color: "#1A2332", fontWeight: 600, marginBottom: "0.35rem" }}>Ranking vacío</p>
              <p style={{ color: "#6B7A8D", fontSize: "0.85rem" }}>Completa cursos para aparecer en el ranking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.slice(0, 10).map((entry, i) => {
                const isMe = entry.name === userName;
                const rankEmojis: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: isMe ? "rgba(0, 153, 220, 0.05)" : "transparent",
                      border: isMe ? "1.5px solid rgba(0, 153, 220, 0.2)" : "1.5px solid transparent",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: i < 3 ? "#E5A800" : "#9AA5B4", width: 28, textAlign: "center" }}>
                      {rankEmojis[i] || i + 1}
                    </span>

                    {/* Generated avatar */}
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=${isMe ? "0099DC" : "E8EAED"}&color=${isMe ? "fff" : "1A2332"}&size=32`}
                      alt={entry.name}
                      className="w-8 h-8 rounded-full"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ fontWeight: isMe ? 700 : 500, color: isMe ? "#0099DC" : "#1A2332" }}>
                        {entry.name} {isMe && <span style={{ fontSize: "0.72rem", color: "#0099DC" }}>(Tú)</span>}
                      </p>
                      <p className="text-[11px]" style={{ color: "#9AA5B4" }}>{entry.area}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <BookOpen size={12} color="#0099DC" />
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1A2332" }}>
                        {entry.total_completed_courses}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <FileCheck size={16} color="#E5A800" />
            <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>Mis Certificaciones</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(229,168,0,0.12)", color: "#E5A800" }}>
              {certifications.length}
            </span>
          </div>

          <div className="space-y-3">
            {certifications.map((cert) => {
              const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                requested: { bg: "rgba(0,153,220,0.1)", text: "#0099DC", label: "Solicitada" },
                approved: { bg: "rgba(229,168,0,0.1)", text: "#E5A800", label: "Aprobada" },
                issued: { bg: "rgba(74,138,44,0.1)", text: "#4A8A2C", label: "Emitida" },
                rejected: { bg: "rgba(220,38,38,0.1)", text: "#DC2626", label: "Rechazada" },
              };
              const s = statusColors[cert.status] || statusColors.requested;
              return (
                <div
                  key={cert.id}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ border: "1px solid #F0F1F5" }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #E5A800, #1C3A5C)" }}>
                    <FileCheck size={20} color="#FFFFFF" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>{cert.course_certification.title}</p>
                    {cert.course_title && (
                      <p className="text-xs truncate" style={{ color: "#9AA5B4" }}>{cert.course_title}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
