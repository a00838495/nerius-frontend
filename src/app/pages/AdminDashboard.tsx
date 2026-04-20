import { motion } from "motion/react";
import { BookOpen, Users, Sparkles, FileCheck, MessageSquare, Award } from "lucide-react";

export function AdminDashboard() {
  const stats = [
    { label: "Cursos Publicados", value: "—", icon: BookOpen, color: "#0099DC" },
    { label: "Usuarios Activos", value: "—", icon: Users, color: "#4A8A2C" },
    { label: "Gemas", value: "—", icon: Sparkles, color: "#E5A800" },
    { label: "Quizzes", value: "—", icon: FileCheck, color: "#7B61FF" },
    { label: "Posts del Foro", value: "—", icon: MessageSquare, color: "#E87830" },
    { label: "Certificaciones", value: "—", icon: Award, color: "#1C3A5C" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      <div className="mb-8">
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
          Gestiona el contenido, usuarios y certificaciones de la plataforma
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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
              {value}
            </p>
            <p style={{ color: "#9AA5B4", fontSize: "0.8rem", marginTop: "0.2rem" }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Placeholder welcome */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8EAED",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #E5A800, #F5D060)" }}
        >
          <Award size={28} color="#1C3A5C" />
        </div>
        <h2 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1A2332", marginBottom: "0.5rem" }}>
          Panel de Administración
        </h2>
        <p style={{ color: "#6B7A8D", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto" }}>
          Aquí podrás gestionar cursos, quizzes, certificaciones, gemas y usuarios de la plataforma.
          Las secciones de gestión se construirán en siguientes iteraciones.
        </p>
      </div>
    </div>
  );
}
