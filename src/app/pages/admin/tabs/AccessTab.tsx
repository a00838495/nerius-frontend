import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Plus,
  X,
  Search,
  Trash2,
  Info,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminGrant, AdminGrantUser } from "../../../types/admin";

interface AccessTabProps {
  courseId: string;
  accessType: "free" | "restricted";
}

function avatarFor(user: { first_name: string; last_name: string }) {
  const name = `${user.first_name} ${user.last_name}`.trim() || "U";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5A800&color=fff&bold=true`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AccessTab({ courseId, accessType }: AccessTabProps) {
  const [loading, setLoading] = useState(true);
  const [grants, setGrants] = useState<AdminGrant[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminGrantUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Record<string, AdminGrantUser>>({});
  const [granting, setGranting] = useState(false);
  const searchDebounceRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (accessType !== "restricted") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/grants`, {
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const data: AdminGrant[] = await res.json();
      setGrants(data);
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar los accesos");
    } finally {
      setLoading(false);
    }
  }, [courseId, accessType]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchDebounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/v1/admin/users/search?q=${encodeURIComponent(searchQuery.trim())}`,
          { credentials: "include" },
        );
        if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
        const data: AdminGrantUser[] = await res.json();
        setSearchResults(data);
      } catch (err: any) {
        toast.error(err?.detail || "Error al buscar usuarios");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const revokeGrant = async (grantId: string) => {
    if (!confirm("¿Revocar el acceso de este usuario?")) return;
    try {
      const res = await fetch(`/api/v1/admin/grants/${grantId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      setGrants((prev) => prev.filter((g) => g.id !== grantId));
      toast.success("Acceso revocado");
    } catch (err: any) {
      toast.error(err?.detail || "Error al revocar acceso");
    }
  };

  const openModal = () => {
    setModalOpen(true);
    setSearchQuery("");
    setSearchResults([]);
    setSelected({});
  };

  const closeModal = () => {
    setModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelected({});
  };

  const toggleSelected = (user: AdminGrantUser) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[user.id]) delete next[user.id];
      else next[user.id] = user;
      return next;
    });
  };

  const submitGrants = async () => {
    const ids = Object.keys(selected);
    if (ids.length === 0) {
      toast.error("Selecciona al menos un usuario");
      return;
    }
    setGranting(true);
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/grants`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: ids }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const data = await res.json();
      const newGrants: AdminGrant[] = Array.isArray(data) ? data : data.items ?? [];
      if (newGrants.length > 0) {
        setGrants((prev) => [...newGrants, ...prev]);
      } else {
        await load();
      }
      toast.success(
        ids.length === 1
          ? "Acceso otorgado"
          : `Acceso otorgado a ${ids.length} usuarios`,
      );
      closeModal();
    } catch (err: any) {
      toast.error(err?.detail || "Error al otorgar acceso");
    } finally {
      setGranting(false);
    }
  };

  if (accessType === "free") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
          Control de Acceso
        </h2>
        <div
          className="rounded-2xl border p-5 flex items-start gap-3"
          style={{
            borderColor: "#BAE0F2",
            backgroundColor: "#EFF8FC",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#0099DC" }}
          >
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#0099DC" }}>
              Acceso libre
            </div>
            <p className="text-sm mt-1" style={{ color: "#1A2332" }}>
              Este curso tiene acceso libre. Todos los usuarios pueden inscribirse.
              Cambia el tipo de acceso a <strong>Restringido</strong> en la pestaña{" "}
              <strong>General</strong> para gestionar accesos individualmente.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E5A800" }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
          Control de Acceso ({grants.length})
        </h2>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: "#E5A800" }}
        >
          <Plus className="w-4 h-4" /> Otorgar acceso
        </button>
      </div>

      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {grants.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "#F8F9FA" }}
            >
              <UserCheck className="w-7 h-7" style={{ color: "#6B7A8D" }} />
            </div>
            <p className="text-sm" style={{ color: "#6B7A8D" }}>
              Ningún usuario tiene acceso todavía
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs font-semibold uppercase tracking-wide border-b"
                  style={{ color: "#6B7A8D", borderColor: "#E8EAED", backgroundColor: "#FAFBFC" }}
                >
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Otorgado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {grants.map((grant) => (
                    <motion.tr
                      key={grant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b"
                      style={{ borderColor: "#E8EAED" }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarFor(grant.user)}
                            alt=""
                            className="w-9 h-9 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div
                              className="font-medium truncate"
                              style={{ color: "#1A2332" }}
                            >
                              {grant.user.first_name} {grant.user.last_name}
                            </div>
                            <div
                              className="text-xs truncate md:hidden"
                              style={{ color: "#6B7A8D" }}
                            >
                              {grant.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 hidden md:table-cell"
                        style={{ color: "#6B7A8D" }}
                      >
                        {grant.user.email}
                      </td>
                      <td
                        className="px-4 py-3 hidden sm:table-cell text-xs"
                        style={{ color: "#6B7A8D" }}
                      >
                        {formatDate(grant.granted_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => revokeGrant(grant.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border hover:bg-red-50 transition"
                          style={{ borderColor: "#FECACA", color: "#DC2626" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Revocar
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26, 35, 50, 0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl p-5 border w-full max-w-xl flex flex-col"
              style={{ borderColor: "#E8EAED", maxHeight: "80vh" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
                  Otorgar acceso
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                  style={{ color: "#6B7A8D" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#6B7A8D" }}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email (mínimo 2 caracteres)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#E8EAED" }}
                  autoFocus
                />
              </div>

              {Object.keys(selected).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.values(selected).map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: "#FFF8E1", color: "#92400E" }}
                    >
                      {u.first_name} {u.last_name}
                      <button
                        onClick={() => toggleSelected(u)}
                        className="ml-0.5"
                        style={{ color: "#92400E" }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto -mx-1 px-1">
                {searching ? (
                  <div
                    className="flex items-center gap-2 text-sm py-6 justify-center"
                    style={{ color: "#6B7A8D" }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando...
                  </div>
                ) : searchQuery.trim().length < 2 ? (
                  <div
                    className="text-sm text-center py-8"
                    style={{ color: "#6B7A8D" }}
                  >
                    Escribe al menos 2 caracteres
                  </div>
                ) : searchResults.length === 0 ? (
                  <div
                    className="text-sm text-center py-8"
                    style={{ color: "#6B7A8D" }}
                  >
                    Sin resultados
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.map((user) => {
                      const isSelected = !!selected[user.id];
                      return (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer hover:bg-gray-50 transition"
                          style={{
                            borderColor: isSelected ? "#E5A800" : "#E8EAED",
                            backgroundColor: isSelected ? "#FFF8E1" : "#fff",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelected(user)}
                          />
                          <img
                            src={avatarFor(user)}
                            alt=""
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-sm font-medium truncate"
                              style={{ color: "#1A2332" }}
                            >
                              {user.first_name} {user.last_name}
                            </div>
                            <div
                              className="text-xs truncate"
                              style={{ color: "#6B7A8D" }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-4 border-t" style={{ borderColor: "#E8EAED" }}>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={submitGrants}
                  disabled={granting || Object.keys(selected).length === 0}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 inline-flex items-center gap-2"
                  style={{ backgroundColor: "#E5A800" }}
                >
                  {granting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Otorgar ({Object.keys(selected).length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
