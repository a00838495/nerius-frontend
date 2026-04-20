import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { LayoutGrid, User, Shield, Crown, ChevronDown, Check } from "lucide-react";
import { useUserRoles } from "./RequireRole";

/**
 * Dropdown button to switch between user / admin / superadmin panels.
 * Only visible for users with admin or super_admin role.
 */
export function PanelSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessAdminPanel, canAccessSuperAdminPanel } = useUserRoles();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If user has no admin/superadmin access, hide the button entirely
  if (!canAccessAdminPanel) return null;

  // Determine current panel
  const currentPanel = location.pathname.startsWith("/superadmin")
    ? "superadmin"
    : location.pathname.startsWith("/admin")
    ? "admin"
    : "user";

  const panels: Array<{
    id: "user" | "admin" | "superadmin";
    label: string;
    icon: typeof User;
    path: string;
    color: string;
    available: boolean;
  }> = [
    { id: "user", label: "Usuario", icon: User, path: "/", color: "#0099DC", available: true },
    { id: "admin", label: "Admin", icon: Shield, path: "/admin", color: "#E5A800", available: canAccessAdminPanel },
    { id: "superadmin", label: "Super Admin", icon: Crown, path: "/superadmin", color: "#7B61FF", available: canAccessSuperAdminPanel },
  ];

  const current = panels.find((p) => p.id === currentPanel) ?? panels[0];
  const CurrentIcon = current.icon;

  const handleSelect = (panel: typeof panels[0]) => {
    setOpen(false);
    navigate(panel.path);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] transition-all duration-200 hover:bg-black/5"
        style={{
          border: `1.5px solid ${current.color}40`,
          backgroundColor: `${current.color}0A`,
        }}
        title="Cambiar panel"
      >
        <LayoutGrid size={14} style={{ color: current.color }} />
        <span className="hidden lg:block text-xs font-semibold" style={{ color: current.color }}>
          {current.label}
        </span>
        <ChevronDown size={12} style={{ color: current.color }} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8EAED",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: "#F0F1F5", backgroundColor: "#FAFBFC" }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9AA5B4" }}>
                Cambiar Panel
              </span>
            </div>
            <div className="py-1">
              {panels.filter((p) => p.available).map((panel) => {
                const Icon = panel.icon;
                const isActive = panel.id === currentPanel;
                return (
                  <button
                    key={panel.id}
                    onClick={() => handleSelect(panel)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: isActive ? `${panel.color}08` : undefined,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${panel.color}15` }}
                    >
                      <Icon size={14} style={{ color: panel.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium" style={{ color: "#1A2332" }}>
                        Panel {panel.label}
                      </p>
                    </div>
                    {isActive && <Check size={14} style={{ color: panel.color }} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
