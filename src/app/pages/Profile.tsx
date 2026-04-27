import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Edit2, Camera, Mail, Building2, BookOpen, Clock, Zap, Trophy,
  MapPin, Calendar, Shield, TrendingUp, User as UserIcon, Flame,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import coverImage from "../../assets/7fd3dad4efe18ada7c508db557505a6fb72bb193.png";

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [formData, setFormData] = useState({ first_name: "", last_name: "" });

  useEffect(() => {
    if (user) {
      setFormData({ first_name: user.first_name, last_name: user.last_name });
    }
  }, [user]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const userName = `${user.first_name} ${user.last_name}`.trim() || "Usuario";
  const userAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0099DC&color=fff&size=128`;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-6"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      >
        {/* Cover */}
        <div
          className="relative h-36 lg:h-48 overflow-hidden"
        >
          <img
            src={coverImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(13,35,64,0.18) 10%, rgba(13,35,64,0.35) 50%, rgba(255,255,255,1) 100%)" }}
          />
          {/* Edit button */}
          {editing ? (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={() => {
                  setFormData({ first_name: user.first_name, last_name: user.last_name });
                  setEditing(false);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-60"
                style={{
                  backgroundColor: "#E5A800",
                  color: "#FFFFFF",
                  border: "1px solid transparent",
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          ) : (
            <button
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/20"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onClick={() => setEditing(true)}
            >
              <Edit2 size={13} /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="relative z-10 bg-white px-6 lg:px-10 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 mb-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={userAvatar}
                alt={userName}
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover"
                style={{
                  border: "4px solid #FFFFFF",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              />
              {editing && (
                <button
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#0099DC", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                >
                  <Camera size={13} color="white" />
                </button>
              )}
            </div>

            <div className="flex-1 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                   style={{
                     fontFamily: "'Nunito', sans-serif",
                     fontWeight: 800,
                     fontSize: "1.6rem",
                     color: "#1A2332",
                     lineHeight: 1.2,
                   }}
                 >
                  {userName}
                </h1>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,153,220,0.1)", border: "1px solid rgba(0,153,220,0.2)" }}
                >
                  <Shield size={11} color="#0099DC" />
                  <span style={{ color: "#0099DC", fontSize: "0.75rem", fontWeight: 600 }}>
                    Nivel {user.status || 'Nuevo'}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(229,168,0,0.1)", border: "1px solid rgba(229,168,0,0.2)" }}
                >
                  <Trophy size={11} color="#E5A800" />
                  <span style={{ color: "#E5A800", fontSize: "0.75rem", fontWeight: 600 }}>
                    Rank #{user.rank || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
                  <Building2 size={13} color="#9AA5B4" /> {user.role || 'No especificado'}
                </span>
                <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
                  <MapPin size={13} color="#9AA5B4" /> {user.department || 'No especificado'}
                </span>
                <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
                  <Calendar size={13} color="#9AA5B4" /> Miembro desde {new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 sm:ml-auto">
              {[
                { icon: Zap, value: user.points?.toLocaleString() || '0', label: "Puntos", color: "#E5A800" },
                { icon: BookOpen, value: user.completedCourses || 0, label: "Completados", color: "#0099DC" },
                { icon: Clock, value: `${user.totalHours || 0}h`, label: "Aprendido", color: "#4A8A2C" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="text-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"
                    style={{ backgroundColor: `${color}12` }}
                  >
                    <Icon size={16} color={color} />
                  </div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>
                    {value}
                  </p>
                  <p style={{ fontSize: "0.7rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, color: "#9AA5B4" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-2 border-b" style={{ borderColor: "#F0F1F5" }}>
            {(["overview", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 text-sm font-medium capitalize transition-all duration-200 relative"
                style={{ color: activeTab === tab ? "#0099DC" : "#9AA5B4" }}
              >
                {tab === "history" ? "Historial de Cursos" : "Vista General"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "#0099DC" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Edit Profile Form */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <h2
               className="mb-5"
               style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
             >
               Información Personal
             </h2>
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label style={{ fontSize: "0.75rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Nombre
                </label>
                <div
                  className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: editing ? "#FFFFFF" : "#F9FAFB", border: `1.5px solid ${editing ? "#0099DC" : "#E8EAED"}` }}
                >
                  {editing ? (
                    <input
                      value={formData.first_name}
                      onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "#1A2332", fontFamily: "'Open Sans', sans-serif" }}
                    />
                  ) : (
                    <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>{user.first_name}</span>
                  )}
                </div>
              </div>
              {/* Apellido */}
              <div>
                <label style={{ fontSize: "0.75rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Apellido
                </label>
                <div
                  className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: editing ? "#FFFFFF" : "#F9FAFB", border: `1.5px solid ${editing ? "#0099DC" : "#E8EAED"}` }}
                >
                  {editing ? (
                    <input
                      value={formData.last_name}
                      onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "#1A2332", fontFamily: "'Open Sans', sans-serif" }}
                    />
                  ) : (
                    <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>{user.last_name}</span>
                  )}
                </div>
              </div>
              {/* Correo (solo lectura) */}
              <div>
                <label style={{ fontSize: "0.75rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Correo Electrónico
                </label>
                <div
                  className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "#F9FAFB", border: "1.5px solid #E8EAED" }}
                >
                  <Mail size={14} color="#9AA5B4" />
                  <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>{user.email}</span>
                </div>
              </div>
              {/* Departamento (solo lectura) */}
              <div>
                <label style={{ fontSize: "0.75rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Departamento
                </label>
                <div
                  className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "#F9FAFB", border: "1.5px solid #E8EAED" }}
                >
                  <Building2 size={14} color="#9AA5B4" />
                  <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>{user.department || 'No especificado'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div
            className="rounded-2xl p-6 lg:col-span-2"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <h2
               className="mb-5"
               style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
             >
               Estadísticas de Aprendizaje
             </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Cursos Completados", value: user.completedCourses || 0, icon: BookOpen, color: "#0099DC" },
                { label: "Horas Aprendidas", value: `${user.totalHours || 0}h`, icon: Clock, color: "#4A8A2C" },
                { label: "Puntos Totales", value: user.points?.toLocaleString() || '0', icon: Zap, color: "#E5A800" },
                { label: "Racha Actual", value: `${user.streak || 0} días`, icon: Flame, color: "#FF6B35" },
                { label: "Promedio de Puntaje", value: `${user.avgScore || 0}%`, icon: TrendingUp, color: "#7B61FF" },
                { label: "Ranking", value: `#${user.rank || 'N/A'}`, icon: Trophy, color: "#E5A800" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
                >
                  <Icon size={20} color={color} className="mb-2" />
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "#1A2332", marginBottom: "0.25rem" }}>
                    {value}
                  </p>
                  <p style={{ fontSize: "0.75rem", fontFamily: "'Nunito', sans-serif", fontWeight: 400, color: "#6B7A8D" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Level Progress */}
            <div
              className="p-4 rounded-xl mt-6"
              style={{
                background: "linear-gradient(135deg, rgba(0,153,220,0.05), rgba(28,58,92,0.05))",
                border: "1px solid rgba(0,153,220,0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy size={16} color="#0099DC" />
                  <span style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#1A2332" }}>
                    Progreso de Nivel: {user.status || 'Nivel 1'}
                  </span>
                </div>
                <span style={{ color: "#0099DC", fontWeight: 700, fontSize: "0.85rem" }}>
                  {Math.min(((user.completedCourses || 0) * 20), 100)}%
                </span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: "rgba(0,0,0,0.07)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(((user.completedCourses || 0) * 20), 100)}%`,
                    background: "linear-gradient(to right, #0099DC, #1C3A5C)",
                  }}
                />
              </div>
              <p style={{ color: "#9AA5B4", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                Completa más cursos para alcanzar el siguiente nivel
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <h2
             className="mb-5"
             style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
           >
             Historial de Cursos
           </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen size={48} color="#9AA5B4" className="mb-4" />
            <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332", marginBottom: "0.5rem" }}>
              Tu historial de cursos aparecerá aquí
            </p>
            <p style={{ color: "#9AA5B4", fontSize: "0.875rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, maxWidth: "400px" }}>
              Completa tus cursos para ver tu progreso histórico y logros alcanzados
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}