import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Sparkles,
  Award,
  FileCheck,
  LogOut,
  Menu,
  X,
  Shield,
  Building2,
  ClipboardList,
  MessageSquare,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserRoles } from "./RequireRole";
import { PanelSwitcher } from "./PanelSwitcher";
import whirlpoolLogo from "../../assets/c1344ad5145e3dcee746b700b0a6ef41f0a04829.png";
import { Toaster } from "./ui/sonner";

const allAdminNavItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, requiresCourseAccess: false },
  { path: "/admin/cursos", label: "Cursos", icon: BookOpen, exact: false, requiresCourseAccess: true },
  { path: "/admin/usuarios", label: "Usuarios", icon: Users, exact: false, requiresCourseAccess: false },
  { path: "/admin/areas", label: "Áreas", icon: Building2, exact: false, requiresCourseAccess: false },
  { path: "/admin/asignaciones", label: "Asignaciones", icon: ClipboardList, exact: false, requiresCourseAccess: false },
  { path: "/admin/inscripciones", label: "Inscripciones", icon: GraduationCap, exact: false, requiresCourseAccess: false },
  { path: "/admin/foro", label: "Foro", icon: MessageSquare, exact: false, requiresCourseAccess: false },
  { path: "/admin/gemas", label: "Gemas", icon: Sparkles, exact: false, requiresCourseAccess: false },
  { path: "/admin/badges", label: "Badges", icon: Award, exact: false, requiresCourseAccess: false },
  { path: "/admin/certificaciones", label: "Certificaciones", icon: FileCheck, exact: false, requiresCourseAccess: false },
  { path: "/admin/reportes", label: "Reportes", icon: BarChart3, exact: false, requiresCourseAccess: false },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canAccessCoursesSection } = useUserRoles();
  const navigate = useNavigate();

  if (!user) return null;

  const adminNavItems = allAdminNavItems.filter((item) => {
    if (item.requiresCourseAccess) return canAccessCoursesSection;
    return true;
  });

  const userName = `${user.first_name} ${user.last_name}`.trim();
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E5A800&color=fff&size=64`;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#F4F6F9", fontFamily: "'Open Sans', sans-serif" }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E8EAED",
        }}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "#F0F1F5" }}>
            <button onClick={() => navigate("/admin")} className="flex items-center gap-2">
              <img src={whirlpoolLogo} alt="Logo" style={{ height: 26 }} />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 pt-4 pb-2">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: "rgba(229,168,0,0.12)", color: "#E5A800" }}
            >
              <Shield size={11} />
              Admin Panel
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2">
            {adminNavItems.map(({ path, label, icon: Icon, exact }) => (
              <NavLink
                key={path}
                to={path}
                end={exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[10px] mb-1 text-sm transition-all ${
                    isActive ? "text-white" : "hover:bg-gray-50"
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#E5A800" : undefined,
                  color: isActive ? "#FFFFFF" : "#1A2332",
                  fontWeight: isActive ? 600 : 500,
                })}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t" style={{ borderColor: "#F0F1F5" }}>
            <div className="flex items-center gap-2 px-2 py-2 rounded-[10px]">
              <img src={avatar} alt={userName} className="w-8 h-8 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#1A2332" }}>
                  {userName}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#9AA5B4" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3"
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E8EAED",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <PanelSwitcher />
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} style={{ color: "#1A2332" }} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <Toaster />
      </div>
    </div>
  );
}
