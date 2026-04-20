import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Award, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminBadge, AdminCourseBadgeLink } from "../../../types/admin";

interface BadgesTabProps {
  courseId: string;
}

export default function BadgesTab({ courseId }: BadgesTabProps) {
  const [linked, setLinked] = useState<AdminCourseBadgeLink[]>([]);
  const [allBadges, setAllBadges] = useState<AdminBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalBadge, setModalBadge] = useState<AdminBadge | null>(null);
  const [modalProgress, setModalProgress] = useState<string>("100");
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [linkedRes, allRes] = await Promise.all([
        fetch(`/api/v1/admin/courses/${courseId}/badges`, {
          credentials: "include",
        }),
        fetch(`/api/v1/admin/badges`, { credentials: "include" }),
      ]);
      if (!linkedRes.ok)
        throw await linkedRes.json().catch(() => ({ detail: "Error cargando" }));
      if (!allRes.ok)
        throw await allRes.json().catch(() => ({ detail: "Error cargando" }));
      const linkedData: AdminCourseBadgeLink[] = await linkedRes.json();
      const allData: AdminBadge[] = await allRes.json();
      setLinked(linkedData);
      setAllBadges(Array.isArray(allData) ? allData : (allData as any).items ?? []);
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar los badges");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const linkedIds = new Set(linked.map((l) => l.badge.id));
  const unlinked = allBadges.filter((b) => !linkedIds.has(b.id));

  const saveProgress = async (linkId: string, value: number) => {
    try {
      const res = await fetch(`/api/v1/admin/course-badges/${linkId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress_percentage: value }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const updated: AdminCourseBadgeLink = await res.json();
      setLinked((prev) => prev.map((l) => (l.id === linkId ? updated : l)));
      toast.success("Progreso actualizado");
    } catch (err: any) {
      toast.error(err?.detail || "Error al actualizar progreso");
    }
  };

  const unlinkBadge = async (linkId: string) => {
    if (!confirm("¿Desvincular este badge del curso?")) return;
    try {
      const res = await fetch(`/api/v1/admin/course-badges/${linkId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      setLinked((prev) => prev.filter((l) => l.id !== linkId));
      toast.success("Badge desvinculado");
    } catch (err: any) {
      toast.error(err?.detail || "Error al desvincular badge");
    }
  };

  const openLinkModal = (badge: AdminBadge) => {
    setModalBadge(badge);
    setModalProgress("100");
  };

  const submitLink = async () => {
    if (!modalBadge) return;
    const pct = Number(modalProgress);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("El progreso debe estar entre 0 y 100");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/badges`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: modalBadge.id, progress_percentage: pct }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const created: AdminCourseBadgeLink = await res.json();
      setLinked((prev) => [...prev, created]);
      toast.success("Badge vinculado");
      setModalBadge(null);
    } catch (err: any) {
      toast.error(err?.detail || "Error al vincular badge");
    } finally {
      setSaving(false);
    }
  };

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
      <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
        Badges del Curso
      </h2>

      <div className="grid lg:grid-cols-2 gap-4">
        <div
          className="bg-white rounded-2xl border p-5"
          style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#1A2332" }}>
            Badges del Curso ({linked.length})
          </h3>
          {linked.length === 0 ? (
            <div
              className="text-sm text-center py-8"
              style={{ color: "#6B7A8D" }}
            >
              Aún no hay badges vinculados
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {linked.map((link) => (
                  <LinkedBadgeCard
                    key={link.id}
                    link={link}
                    onSaveProgress={saveProgress}
                    onUnlink={unlinkBadge}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div
          className="bg-white rounded-2xl border p-5"
          style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#1A2332" }}>
            Agregar Badge ({unlinked.length} disponibles)
          </h3>
          {unlinked.length === 0 ? (
            <div
              className="text-sm text-center py-8"
              style={{ color: "#6B7A8D" }}
            >
              No hay más badges disponibles
            </div>
          ) : (
            <div className="space-y-2">
              {unlinked.map((b) => (
                <button
                  key={b.id}
                  onClick={() => openLinkModal(b)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border hover:bg-gray-50 transition text-left"
                  style={{ borderColor: "#E8EAED" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: b.secondary_color || "#F8F9FA" }}
                  >
                    {b.icon_url ? (
                      <img
                        src={b.icon_url}
                        alt={b.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Award
                        className="w-5 h-5"
                        style={{ color: b.main_color || "#E5A800" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: "#1A2332" }}
                    >
                      {b.name}
                    </div>
                    {b.description && (
                      <div
                        className="text-xs truncate"
                        style={{ color: "#6B7A8D" }}
                      >
                        {b.description}
                      </div>
                    )}
                  </div>
                  <Plus
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "#E5A800" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalBadge && (
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
              className="bg-white rounded-2xl p-6 border w-full max-w-md"
              style={{ borderColor: "#E8EAED" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
                  Vincular Badge
                </h3>
                <button
                  onClick={() => setModalBadge(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                  style={{ color: "#6B7A8D" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div
                className="flex items-center gap-3 p-3 rounded-xl border mb-4"
                style={{ borderColor: "#E8EAED" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: modalBadge.secondary_color || "#F8F9FA" }}
                >
                  {modalBadge.icon_url ? (
                    <img
                      src={modalBadge.icon_url}
                      alt={modalBadge.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Award
                      className="w-7 h-7"
                      style={{ color: modalBadge.main_color || "#E5A800" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "#1A2332" }}>
                    {modalBadge.name}
                  </div>
                  {modalBadge.description && (
                    <div className="text-xs" style={{ color: "#6B7A8D" }}>
                      {modalBadge.description}
                    </div>
                  )}
                </div>
              </div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
                Progreso requerido (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={modalProgress}
                onChange={(e) => setModalProgress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm"
                style={{ borderColor: "#E8EAED" }}
              />
              <p className="mt-1 text-xs" style={{ color: "#6B7A8D" }}>
                El usuario recibirá el badge al alcanzar este porcentaje de progreso.
              </p>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => setModalBadge(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={submitLink}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 inline-flex items-center gap-2"
                  style={{ backgroundColor: "#E5A800" }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Vincular
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LinkedBadgeCard({
  link,
  onSaveProgress,
  onUnlink,
}: {
  link: AdminCourseBadgeLink;
  onSaveProgress: (id: string, value: number) => void;
  onUnlink: (id: string) => void;
}) {
  const [value, setValue] = useState(String(link.progress_percentage));
  useEffect(() => {
    setValue(String(link.progress_percentage));
  }, [link.progress_percentage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ borderColor: "#E8EAED" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: link.badge.secondary_color || "#F8F9FA" }}
      >
        {link.badge.icon_url ? (
          <img
            src={link.badge.icon_url}
            alt={link.badge.name}
            className="w-7 h-7 object-contain"
          />
        ) : (
          <Award
            className="w-6 h-6"
            style={{ color: link.badge.main_color || "#E5A800" }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: "#1A2332" }}>
          {link.badge.name}
        </div>
        {link.badge.description && (
          <div className="text-xs truncate" style={{ color: "#6B7A8D" }}>
            {link.badge.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            const v = Number(value);
            if (!isNaN(v) && v !== link.progress_percentage) {
              onSaveProgress(link.id, v);
            }
          }}
          className="w-16 px-2 py-1 rounded-lg border text-xs text-right"
          style={{ borderColor: "#E8EAED" }}
        />
        <span className="text-xs" style={{ color: "#6B7A8D" }}>
          %
        </span>
      </div>
      <button
        onClick={() => onUnlink(link.id)}
        className="p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0"
        style={{ color: "#DC2626" }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
