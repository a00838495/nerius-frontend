import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  UserCog, Search, Loader2, Crown, Shield, Edit3, Eye,
  GraduationCap, MoreVertical, Check, X,
} from "lucide-react";
import { toast } from "sonner";

interface UserWithRoles {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  area_name: string | null;
  roles: string[];
  admin_role: string | null;
  is_learner: boolean;
  created_at: string;
}

interface AssignableRole {
  value: string;
  label: string;
  description: string;
}

type FilterRole = "all" | "admins" | "super_admin" | "content_admin" | "content_editor" | "content_viewer" | "learner";

const ROLE_META: Record<string, { label: string; icon: typeof Crown; color: string; bg: string }> = {
  super_admin: { label: "Super Admin", icon: Crown, color: "#7B61FF", bg: "rgba(123,97,255,0.12)" },
  content_admin: { label: "Admin", icon: Shield, color: "#E5A800", bg: "rgba(229,168,0,0.12)" },
  content_editor: { label: "Editor", icon: Edit3, color: "#0099DC", bg: "rgba(0,153,220,0.12)" },
  content_viewer: { label: "Observador", icon: Eye, color: "#6B7A8D", bg: "rgba(107,122,141,0.12)" },
  learner: { label: "Aprendiz", icon: GraduationCap, color: "#4A8A2C", bg: "rgba(74,138,44,0.12)" },
};

export function SuperAdminUsersManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterRole>("all");
  const [assignableRoles, setAssignableRoles] = useState<AssignableRole[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Fetch assignable roles (once)
  useEffect(() => {
    fetch("/api/v1/admin/roles", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then(setAssignableRoles)
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("role", filter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/v1/admin/users?${params}`, { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleSetRole = async (userId: string, role: string | null) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/admin-role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast.success(role ? "Rol actualizado" : "Rol admin removido");
        fetchUsers();
        setEditingUserId(null);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al actualizar rol");
      }
    } catch {
      toast.error("Error al actualizar rol");
    }
  };

  const filterButtons: Array<{ value: FilterRole; label: string }> = [
    { value: "all", label: "Todos" },
    { value: "admins", label: "Administradores" },
    { value: "content_admin", label: "Admin" },
    { value: "content_editor", label: "Editor" },
    { value: "content_viewer", label: "Observador" },
    { value: "learner", label: "Aprendices" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.25)" }}
        >
          <Crown size={13} style={{ color: "#7B61FF" }} />
          <span style={{ color: "#7B61FF", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            SUPER ADMIN
          </span>
        </div>
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <UserCog size={28} style={{ color: "#7B61FF" }} />
          Gestión de Administradores
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Asigna o remueve roles de administrador a los usuarios
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
      >
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: filter === f.value ? "#7B61FF" : "transparent",
                color: filter === f.value ? "#FFFFFF" : "#6B7A8D",
                border: `1px solid ${filter === f.value ? "#7B61FF" : "#E8EAED"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: "#7B61FF" }} />
        </div>
      ) : users.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}
        >
          <UserCog size={48} color="#D1D5DB" className="mx-auto mb-3" />
          <p style={{ fontWeight: 600, color: "#1A2332" }}>Sin usuarios</p>
          <p className="text-sm mt-1" style={{ color: "#9AA5B4" }}>
            No se encontraron usuarios con los filtros aplicados
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          {users.map((user, i) => {
            const adminRole = user.admin_role;
            const roleMeta = adminRole ? ROLE_META[adminRole] : null;
            const RoleIcon = roleMeta?.icon;
            const isSuperAdmin = adminRole === "super_admin";
            const isEditing = editingUserId === user.id;
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + " " + user.last_name)}&background=${(roleMeta?.color || "0099DC").replace("#", "")}&color=fff&size=64`;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#F0F1F5" }}
              >
                <img src={avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#9AA5B4" }}>
                    {user.email}
                    {user.area_name && <span> · {user.area_name}</span>}
                  </p>
                </div>

                {/* Current role badge */}
                {roleMeta && RoleIcon ? (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: roleMeta.bg, color: roleMeta.color }}
                  >
                    <RoleIcon size={11} />
                    {roleMeta.label}
                  </span>
                ) : user.is_learner ? (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                    style={{ backgroundColor: ROLE_META.learner.bg, color: ROLE_META.learner.color }}
                  >
                    <GraduationCap size={11} />
                    Aprendiz
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] shrink-0" style={{ color: "#9AA5B4", border: "1px solid #E8EAED" }}>
                    Sin rol
                  </span>
                )}

                {/* Action */}
                {isSuperAdmin ? (
                  <span className="text-[11px] px-2 py-1 rounded-lg shrink-0" style={{ color: "#7B61FF", fontWeight: 600 }}>
                    Protegido
                  </span>
                ) : !isEditing ? (
                  <button
                    onClick={() => setEditingUserId(user.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-100 shrink-0"
                    style={{ color: "#6B7A8D", border: "1px solid #E8EAED" }}
                  >
                    <MoreVertical size={12} />
                    Cambiar rol
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {assignableRoles.map((r) => {
                      const meta = ROLE_META[r.value];
                      const Icon = meta?.icon;
                      const isCurrent = adminRole === r.value;
                      return (
                        <button
                          key={r.value}
                          onClick={() => handleSetRole(user.id, r.value)}
                          disabled={isCurrent}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40"
                          style={{
                            backgroundColor: isCurrent ? meta?.bg : "transparent",
                            color: meta?.color,
                            border: `1px solid ${meta?.color}40`,
                          }}
                          title={r.description}
                        >
                          {Icon && <Icon size={10} />}
                          {meta?.label}
                        </button>
                      );
                    })}
                    {adminRole && (
                      <button
                        onClick={() => handleSetRole(user.id, null)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:bg-red-50"
                        style={{ color: "#DC2626", border: "1px solid rgba(220,38,38,0.3)" }}
                        title="Quitar rol admin"
                      >
                        <X size={10} />
                        Quitar admin
                      </button>
                    )}
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Cancelar"
                    >
                      <Check size={12} style={{ color: "#6B7A8D" }} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
