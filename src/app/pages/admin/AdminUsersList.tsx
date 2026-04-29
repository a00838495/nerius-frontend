import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  Users, Search, Loader2, Plus, MoreVertical, Edit, Key,
  UserX, UserCheck, X, Save, GraduationCap, Award, FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { adminUsersApi, adminAreasApi } from "../../lib/adminApi";
import type { UserAdminListItem, UserAdminRead } from "../../types/adminPanel";
import type { AreaAdminRead } from "../../types/adminPanel";
import { PaginationBar } from "../../components/PaginationBar";

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "Activo", bg: "rgba(74,138,44,0.12)", color: "#4A8A2C" },
  inactive: { label: "Inactivo", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
  suspended: { label: "Suspendido", bg: "rgba(220,38,38,0.12)", color: "#DC2626" },
};

export function AdminUsersList() {
  const [users, setUsers] = useState<UserAdminListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("");
  const [areas, setAreas] = useState<AreaAdminRead[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserAdminRead | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  useEffect(() => {
    adminAreasApi.list().then(setAreas).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminUsersApi.list({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        area_id: areaFilter || undefined,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, roleFilter, areaFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleStatusChange = async (u: UserAdminListItem, newStatus: "active" | "inactive" | "suspended") => {
    try {
      await adminUsersApi.setStatus(u.id, newStatus);
      toast.success("Estado actualizado");
      fetchUsers();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <Users size={26} style={{ color: "#E5A800" }} />
            Gestión de Usuarios
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${total} usuarios`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}
      >
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
        >
          <option value="">Todos los roles</option>
          <option value="learners">Solo aprendices</option>
          <option value="admins">Solo administradores</option>
        </select>
        <select
          value={areaFilter}
          onChange={(e) => { setAreaFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay usuarios</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}>Usuario</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}>Área</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}>Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}>Inscrip.</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}>Roles</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A8D" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const meta = STATUS_META[u.status] ?? STATUS_META.inactive;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #F0F1F5" }}>
                    <td className="px-5 py-3">
                      <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.875rem" }}>{u.first_name} {u.last_name}</p>
                      <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>{u.email}</p>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#6B7A8D", fontSize: "0.85rem" }}>
                      {u.area_name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{ backgroundColor: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.85rem" }}>{u.enrollments_count}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#B8830A" }}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => adminUsersApi.get(u.id).then(setEditing)}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setResettingId(u.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                          title="Resetear contraseña"
                        >
                          <Key size={14} />
                        </button>
                        {u.status !== "suspended" ? (
                          <button
                            onClick={() => handleStatusChange(u, "suspended")}
                            className="p-1.5 rounded-lg hover:bg-red-50"
                            title="Suspender"
                          >
                            <UserX size={14} style={{ color: "#DC2626" }} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u, "active")}
                            className="p-1.5 rounded-lg hover:bg-green-50"
                            title="Reactivar"
                          >
                            <UserCheck size={14} style={{ color: "#4A8A2C" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 && (
        <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      )}

      {showCreate && <CreateUserModal areas={areas} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchUsers(); }} />}
      {editing && <EditUserModal user={editing} areas={areas} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchUsers(); }} />}
      {resettingId && <ResetPasswordModal userId={resettingId} onClose={() => setResettingId(null)} />}
    </div>
  );
}

// =============================================================================
// MODAL: Create user
// =============================================================================

const ALLOWED_LOGIN_DOMAIN = "whirpool.com";

type AssignableAdminRole = "content_admin" | "content_editor" | "content_viewer";

const ROLE_OPTIONS: { value: "" | AssignableAdminRole; label: string; help: string }[] = [
  { value: "", label: "Aprendiz (learner)", help: "Solo accede a cursos como estudiante." },
  { value: "content_viewer", label: "Content Viewer", help: "Acceso de solo lectura al panel admin." },
  { value: "content_editor", label: "Content Editor", help: "Puede editar cursos existentes." },
  { value: "content_admin", label: "Content Admin", help: "Crea, publica y administra contenido." },
];

function CreateUserModal({ areas, onClose, onCreated }: { areas: AreaAdminRead[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    gender: string;
    area_id: string;
    role: "" | AssignableAdminRole;
  }>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    gender: "",
    area_id: "",
    role: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      toast.error("Todos los campos obligatorios");
      return;
    }
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(`@${ALLOWED_LOGIN_DOMAIN}`)) {
      toast.error(`El email debe pertenecer al dominio @${ALLOWED_LOGIN_DOMAIN}`);
      return;
    }
    setSaving(true);
    try {
      await adminUsersApi.create({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        gender: form.gender || null,
        area_id: form.area_id || null,
        role: form.role || null,
      });
      toast.success(
        form.role
          ? `Usuario creado con rol ${form.role}`
          : "Usuario creado",
      );
      onCreated();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleHelp = ROLE_OPTIONS.find((r) => r.value === form.role)?.help;

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nombre">
          <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Apellido">
          <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className={inputCls} />
        </Field>
        <Field label={`Email (debe ser @${ALLOWED_LOGIN_DOMAIN})`}>
          <input
            type="email"
            value={form.email}
            placeholder={`tu.usuario@${ALLOWED_LOGIN_DOMAIN}`}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputCls}
          />
        </Field>
        <Field label="Contraseña inicial">
          <input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Género (opcional)">
          <input value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Área (opcional)">
          <select value={form.area_id} onChange={(e) => setForm((f) => ({ ...f, area_id: e.target.value }))} className={inputCls}>
            <option value="">Sin área</option>
            {areas.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
          </select>
        </Field>
        <Field label="Rol / permisos">
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "" | AssignableAdminRole }))}
            className={inputCls}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value || "learner"} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {selectedRoleHelp && (
            <p className="mt-1 text-[11px]" style={{ color: "#6B7A8D" }}>{selectedRoleHelp}</p>
          )}
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Crear
        </button>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, areas, onClose, onSaved }: { user: UserAdminRead; areas: AreaAdminRead[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    gender: user.gender ?? "",
    area_id: user.area_id ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await adminUsersApi.update(user.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        gender: form.gender || null,
        area_id: form.area_id || null,
      });
      toast.success("Usuario actualizado");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Editar ${user.first_name} ${user.last_name}`} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat icon={GraduationCap} label="Inscripciones" value={user.enrollments_count} color="#0099DC" />
        <Stat icon={Award} label="Badges" value={user.badges_count} color="#E5A800" />
        <Stat icon={FileCheck} label="Certificaciones" value={user.certifications_count} color="#4A8A2C" />
      </div>
      <div className="space-y-3">
        <Field label="Nombre"><input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className={inputCls} /></Field>
        <Field label="Apellido"><input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className={inputCls} /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} /></Field>
        <Field label="Género"><input value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputCls} /></Field>
        <Field label="Área">
          <select value={form.area_id} onChange={(e) => setForm((f) => ({ ...f, area_id: e.target.value }))} className={inputCls}>
            <option value="">Sin área</option>
            {areas.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
          </select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
        <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Guardar
        </button>
      </div>
    </Modal>
  );
}

function ResetPasswordModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (pwd.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      await adminUsersApi.resetPassword(userId, pwd);
      toast.success("Contraseña actualizada");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Resetear contraseña" onClose={onClose}>
      <Field label="Nueva contraseña">
        <input type="text" value={pwd} onChange={(e) => setPwd(e.target.value)} className={inputCls} />
      </Field>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
        <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Key size={14} />} Resetear
        </button>
      </div>
    </Modal>
  );
}

// =============================================================================
// SHARED MODAL HELPERS
// =============================================================================

const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none border focus:ring-2";
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>{label}</label>
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${color}10` }}>
      <Icon size={16} style={{ color, margin: "0 auto" }} />
      <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332", marginTop: "0.2rem" }}>{value}</p>
      <p style={{ fontSize: "0.65rem", color: "#6B7A8D" }}>{label}</p>
    </div>
  );
}
