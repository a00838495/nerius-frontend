import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen, Users, Sparkles, FileCheck, MessageSquare, Award,
  Building2, GraduationCap, TrendingUp, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { adminDashboardApi } from "../lib/adminApi";
import type { DashboardOverview } from "../types/adminPanel";

export function AdminDashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi
      .overview()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} />
      </div>
    );
  }
  if (!data) return null;

  const c = data.counters;

  const stats = [
    { label: "Cursos publicados", value: c.published_courses, total: c.total_courses, icon: BookOpen, color: "#0099DC" },
    { label: "Usuarios activos", value: c.active_users, total: c.total_users, icon: Users, color: "#4A8A2C" },
    { label: "Inscripciones", value: c.total_enrollments, total: null, icon: GraduationCap, color: "#E87830" },
    { label: "Completadas", value: c.completed_enrollments, total: c.total_enrollments, icon: TrendingUp, color: "#7B61FF" },
    { label: "Áreas", value: c.total_areas, total: null, icon: Building2, color: "#1C3A5C" },
    { label: "Posts del foro", value: c.total_forum_posts, total: null, icon: MessageSquare, color: "#E87830" },
    { label: "Gemas", value: c.total_gems, total: null, icon: Sparkles, color: "#E5A800" },
    { label: "Badges otorgados", value: c.total_badges_earned, total: null, icon: Award, color: "#DC2626" },
    { label: "Certificaciones emitidas", value: c.total_certifications_issued, total: null, icon: FileCheck, color: "#4A8A2C" },
  ];

  const completionRate =
    c.total_enrollments > 0 ? Math.round((c.completed_enrollments / c.total_enrollments) * 100) : 0;

  // Data ya viene ordenada
  const popular = data.popular_courses.slice(0, 5);
  const byArea = data.completion_by_area.slice(0, 8);
  const activity = data.activity_last_30d;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            color: "#1A2332",
          }}
        >
          Dashboard de Administración
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Métricas globales de la plataforma —{" "}
          <strong style={{ color: "#4A8A2C" }}>+{c.new_users_last_7d}</strong> usuarios nuevos esta semana,{" "}
          <strong style={{ color: "#0099DC" }}>+{c.new_enrollments_last_7d}</strong> inscripciones nuevas
        </p>
      </div>

      {/* Highlight: completion rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1C3A5C 0%, #0D2340 100%)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", letterSpacing: "0.08em", fontWeight: 600 }}>
              TASA DE FINALIZACIÓN
            </p>
            <p style={{ fontSize: "3rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>{completionRate}%</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
              {c.completed_enrollments} de {c.total_enrollments} inscripciones completadas
            </p>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            {byArea.slice(0, 3).map((a) => (
              <div key={a.area_id ?? a.area_name} className="flex items-center gap-3">
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", minWidth: 100 }} className="truncate">
                  {a.area_name}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <div
                    style={{
                      width: `${a.completion_rate}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #E5A800, #F5D060)",
                    }}
                  />
                </div>
                <span style={{ color: "#E5A800", fontWeight: 700, fontSize: "0.78rem", minWidth: 40 }} className="text-right">
                  {a.completion_rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Counters grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, total, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8EAED",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon size={18} color={color} />
            </div>
            <p style={{ fontWeight: 800, fontSize: "1.6rem", color: "#1A2332", lineHeight: 1.1 }}>
              {value.toLocaleString()}
            </p>
            <p style={{ color: "#9AA5B4", fontSize: "0.8rem", marginTop: "0.2rem" }}>
              {label}
              {total !== null && total !== value && (
                <span style={{ color: "#6B7A8D", fontWeight: 600 }}> / {total.toLocaleString()}</span>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Activity chart */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <h3 style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
          Actividad últimos 30 días
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={activity}>
            <defs>
              <linearGradient id="gEnroll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E5A800" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#E5A800" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A8A2C" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4A8A2C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0099DC" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0099DC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9AA5B4" }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: "#9AA5B4" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8EAED",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="enrollments" name="Inscripciones" stroke="#E5A800" fill="url(#gEnroll)" strokeWidth={2} />
            <Area type="monotone" dataKey="completions" name="Completadas" stroke="#4A8A2C" fill="url(#gComp)" strokeWidth={2} />
            <Area type="monotone" dataKey="new_users" name="Usuarios nuevos" stroke="#0099DC" fill="url(#gUsers)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular courses */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <h3 style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
            Cursos más populares
          </h3>
          {popular.length === 0 ? (
            <p style={{ color: "#9AA5B4", fontSize: "0.85rem" }}>Sin datos aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={popular} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9AA5B4" }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={140}
                  tick={{ fontSize: 11, fill: "#1A2332" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8EAED",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="enrollments" name="Inscripciones" radius={[0, 6, 6, 0]}>
                  {popular.map((_, i) => (
                    <Cell key={i} fill={["#E5A800", "#0099DC", "#4A8A2C", "#7B61FF", "#E87830"][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Completion by area */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <h3 style={{ color: "#1A2332", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
            Finalización por área
          </h3>
          {byArea.length === 0 ? (
            <p style={{ color: "#9AA5B4", fontSize: "0.85rem" }}>Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {byArea.map((a) => (
                <div key={a.area_id ?? a.area_name}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: "#1A2332", fontSize: "0.85rem", fontWeight: 600 }}>
                      {a.area_name}
                    </span>
                    <span style={{ color: "#6B7A8D", fontSize: "0.78rem" }}>
                      {a.completed}/{a.enrollments} ({a.completion_rate}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F1F5" }}>
                    <div
                      style={{
                        width: `${a.completion_rate}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #E5A800, #F5D060)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
