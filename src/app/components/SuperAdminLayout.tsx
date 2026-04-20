import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  Settings,
  BarChart3,
  ShieldCheck,
  Key,
  LogOut,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { PanelSwitcher } from "./PanelSwitcher";
import whirlpoolLogo from "../../assets/c1344ad5145e3dcee746b700b0a6ef41f0a04829.png";
import { Toaster } from "./ui/sonner";

const superAdminNavItems = [
  { path: "/superadmin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/superadmin/administradores", label: "Administradores", icon: UserCog },
];

export function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const userName = `${user.first_name} ${user.last_name}`.trim();
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7B61FF&color=fff&size=64`;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#F4F6F9", fontFamily: "'Open Sans', sans-serif" }}
    >
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "linear-gradient(180deg, #1C3A5C 0%, #0D2340 100%)",
          color: "#FFFFFF",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <button onClick={() => navigate("/superadmin")} className="flex items-center gap-2">
              <img src={whirlpoolLogo} alt="Logo" style={{ height: 26, filter: "brightness(0) invert(1)" }} />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-white/10"
            >
              <X size={18} color="#FFFFFF" />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-5 pt-4 pb-2">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: "rgba(123,97,255,0.25)", color: "#C9B8FF", border: "1px solid rgba(123,97,255,0.4)" }}
            >
              <Crown size={11} />
              Super Admin
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-2">
            {superAdminNavItems.map(({ path, label, icon: Icon, exact }) => (
              <NavLink
                key={path}
                to={path}
                end={exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-sm transition-all ${
                    isActive ? "" : "hover:bg-white/5"
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "rgba(123,97,255,0.2)" : undefined,
                  color: isActive ? "#C9B8FF" : "rgba(255,255,255,0.75)",
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? "1px solid rgba(123,97,255,0.35)" : "1px solid transparent",
                })}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-2 px-2 py-2 rounded-[10px]">
              <img src={avatar} alt={userName} className="w-8 h-8 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#FFFFFF" }}>
                  {userName}
                </p>
                <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
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
