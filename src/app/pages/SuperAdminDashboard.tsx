import { motion } from "motion/react";
import { Users, UserCog, Building2, Key, ShieldCheck, BarChart3, Crown } from "lucide-react";

export function SuperAdminDashboard() {
  const stats = [
    { label: "Usuarios Totales", value: "—", icon: Users, color: "#0099DC" },
    { label: "Administradores", value: "—", icon: UserCog, color: "#E5A800" },
    { label: "Áreas", value: "—", icon: Building2, color: "#4A8A2C" },
    { label: "Accesos Otorgados", value: "—", icon: Key, color: "#7B61FF" },
    { label: "Eventos Registrados", value: "—", icon: ShieldCheck, color: "#E87830" },
    { label: "Sesiones Activas", value: "—", icon: BarChart3, color: "#1C3A5C" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.25)" }}
        >
          <Crown size={13} style={{ color: "#7B61FF" }} />
          <span style={{ color: "#7B61FF", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            SUPER ADMIN
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            color: "#1A2332",
          }}
        >
          Control Total de la Plataforma
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Gestiona roles, accesos, configuración global y analytics del sistema
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
        className="rounded-2xl p-8 text-center overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #1C3A5C 0%, #0D2340 100%)",
          boxShadow: "0 8px 32px rgba(28,58,92,0.2)",
        }}
      >
        <div className="h-1 absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg, #7B61FF, #C9B8FF, #7B61FF)" }} />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #7B61FF, #C9B8FF)", boxShadow: "0 4px 16px rgba(123,97,255,0.4)" }}
        >
          <Crown size={28} color="#FFFFFF" />
        </div>
        <h2 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
          Panel de Super Administración
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", maxWidth: "520px", margin: "0 auto" }}>
          Acceso completo a la gestión de usuarios, roles, áreas organizacionales, auditoría y configuración global.
          Las herramientas de gestión se construirán en siguientes iteraciones.
        </p>
      </div>
    </div>
  );
}
