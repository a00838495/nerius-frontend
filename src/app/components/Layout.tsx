import { useState, useEffect } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router";
import {
  Home,
  BookOpen,
  TrendingUp,
  User,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import whirlpoolLogo from "../../assets/c1344ad5145e3dcee746b700b0a6ef41f0a04829.png";
import { Button } from "./ui/button";
import { Toaster } from "./ui/sonner";

const navItems = [
  { path: "/", label: "Inicio", icon: Home, exact: true },
  { path: "/learning", label: "Aprendizaje", icon: BookOpen },
  { path: "/forum", label: "Foro", icon: MessageSquare },
  { path: "/progress", label: "Mi Progreso", icon: TrendingUp },
  { path: "/profile", label: "Perfil", icon: User },
  { path: "/search", label: "Buscar", icon: Search },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  if (!user) return null;
  const showAvatarImage = Boolean(user.avatar?.trim()) && !avatarError;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#F4F6F9",
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      {/* Top Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: scrolled
            ? "0 2px 16px rgba(0,0,0,0.10)"
            : "0 1px 0 rgba(0,0,0,0.08)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center group transition-opacity duration-200 hover:opacity-80"
            >
              <img
                src={whirlpoolLogo}
                alt="Whirlpool Learning"
                style={{ height: "34px", width: "auto", display: "block" }}
              />
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(
                ({ path, label, icon: Icon, exact }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={exact}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-[10px] transition-all duration-200 text-sm ${
                        isActive
                          ? "text-white"
                          : "hover:bg-black/5"
                      }`
                    }
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? "#E5A800" : undefined,
                      color: isActive ? "#FFFFFF" : "#1A2332",
                      fontWeight: 500,
                    })}
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ),
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notification */}
              {/* <button
                className="relative w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 hover:bg-black/5"
                style={{ color: "#1A2332" }}
              >
                <Bell size={16} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#E5A800" }}
                />
              </button> */}

              {/* User Avatar */}
              <button
                className="flex items-center gap-2 px-2 py-1.5 rounded-[10px] hover:bg-black/5 active:bg-black/10 transition-all duration-200 cursor-pointer group/avatar"
                onClick={() => navigate("/profile")}
                title="Go to Profile"
              >
                {showAvatarImage ? (
                  <img
                    src={user.avatar}
                    alt={user.first_name}
                    onError={() => setAvatarError(true)}
                    className="w-7 h-7 rounded-full object-cover transition-transform duration-200 group-hover/avatar:scale-110"
                    style={{ border: "2px solid #E5A800" }}
                  />
                ) : (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover/avatar:scale-110"
                    style={{
                      border: "2px solid #E5A800",
                      backgroundColor: "#F4F6F9",
                      color: "#1C3A5C",
                    }}
                  >
                    <User size={14} />
                  </span>
                )}
                <span
                  className="hidden lg:block text-sm transition-colors duration-200 group-hover/avatar:text-[#E5A800]"
                  style={{ color: "#1A2332", fontWeight: 500 }}
                >
                  {user.first_name}
                </span>
                <ChevronDown size={12} color="#89B8D4" />
              </button>
              
               {/* Desktop Logout - Simplified for now */}
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                title="Logout"
                className="hidden md:flex"
               >
                 <LogOut className="h-4 w-4" />
               </Button>

              {/* Mobile menu button */}
              <button
                className="md:hidden w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-black/5 transition-all"
                style={{ color: "#1A2332" }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X size={18} />
                ) : (
                  <Menu size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 py-3"
            style={{
              borderColor: "rgba(0,0,0,0.08)",
              backgroundColor: "#FFFFFF",
            }}
          >
            {navItems.map(
              ({ path, label, icon: Icon, exact }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-sm transition-all ${
                      isActive ? "text-white" : ""
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? "#E5A800" : undefined,
                    color: isActive ? "#FFFFFF" : "#1A2332",
                    fontWeight: 500,
                  })}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ),
            )}
            <div className="border-t my-2 pt-2 border-gray-100">
               <button 
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] w-full text-left text-sm text-red-600 hover:bg-red-50"
               >
                 <LogOut size={16} />
                 Sign Out
               </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
