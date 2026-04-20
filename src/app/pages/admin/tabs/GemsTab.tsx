import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles, Plus, X, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type {
  AdminCourseGemLink,
  AdminLessonGemLink,
  AdminGemMini,
  AdminModule,
  AdminLesson,
} from "../../../types/admin";

interface GemsTabProps {
  courseId: string;
}

type ModalTarget =
  | { kind: "course" }
  | { kind: "lesson"; lessonId: string; lessonTitle: string };

export default function GemsTab({ courseId }: GemsTabProps) {
  const [loading, setLoading] = useState(true);
  const [courseGems, setCourseGems] = useState<AdminCourseGemLink[]>([]);
  const [lessons, setLessons] = useState<{ module: AdminModule; lessons: AdminLesson[] }[]>(
    [],
  );
  const [lessonGems, setLessonGems] = useState<Record<string, AdminLessonGemLink[]>>({});
  const [allGems, setAllGems] = useState<AdminGemMini[]>([]);
  const [modal, setModal] = useState<ModalTarget | null>(null);
  const [search, setSearch] = useState("");
  const [linking, setLinking] = useState(false);

  const loadEverything = useCallback(async () => {
    setLoading(true);
    try {
      const [cgRes, modsRes] = await Promise.all([
        fetch(`/api/v1/admin/courses/${courseId}/gems`, { credentials: "include" }),
        fetch(`/api/v1/admin/courses/${courseId}/modules`, { credentials: "include" }),
      ]);
      if (!cgRes.ok) throw await cgRes.json().catch(() => ({ detail: "Error" }));
      if (!modsRes.ok) throw await modsRes.json().catch(() => ({ detail: "Error" }));
      const cg: AdminCourseGemLink[] = await cgRes.json();
      const mods: AdminModule[] = await modsRes.json();
      const groups = await Promise.all(
        mods.map(async (m) => {
          const r = await fetch(`/api/v1/admin/modules/${m.id}/lessons`, {
            credentials: "include",
          });
          const ls: AdminLesson[] = r.ok ? await r.json() : [];
          return { module: m, lessons: ls };
        }),
      );
      setCourseGems(cg);
      setLessons(groups);

      const allLessonIds = groups.flatMap((g) => g.lessons.map((l) => l.id));
      const lessonGemResults = await Promise.all(
        allLessonIds.map(async (id) => {
          const r = await fetch(`/api/v1/admin/lessons/${id}/gems`, {
            credentials: "include",
          });
          const data: AdminLessonGemLink[] = r.ok ? await r.json() : [];
          return [id, data] as const;
        }),
      );
      const nextLessonGems: Record<string, AdminLessonGemLink[]> = {};
      for (const [id, data] of lessonGemResults) nextLessonGems[id] = data;
      setLessonGems(nextLessonGems);
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar las gemas");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadEverything();
  }, [loadEverything]);

  const loadAllGems = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/gems/all`, { credentials: "include" });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const data: AdminGemMini[] = await res.json();
      setAllGems(data);
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar las gemas disponibles");
    }
  }, []);

  const openModal = async (target: ModalTarget) => {
    setModal(target);
    setSearch("");
    if (allGems.length === 0) {
      await loadAllGems();
    }
  };

  const closeModal = () => {
    setModal(null);
    setSearch("");
  };

  const filteredGems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const excludedIds = new Set<string>();
    if (modal?.kind === "course") {
      courseGems.forEach((g) => excludedIds.add(g.gem.id));
    } else if (modal?.kind === "lesson") {
      (lessonGems[modal.lessonId] ?? []).forEach((g) => excludedIds.add(g.gem.id));
    }
    return allGems
      .filter((g) => !excludedIds.has(g.id))
      .filter((g) => q === "" || g.title.toLowerCase().includes(q));
  }, [allGems, search, modal, courseGems, lessonGems]);

  const linkCourseGem = async (gem: AdminGemMini) => {
    setLinking(true);
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/gems`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gem_id: gem.id, sort_order: 0 }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const created: AdminCourseGemLink = await res.json();
      setCourseGems((prev) => [...prev, created]);
      toast.success("Gema añadida al curso");
    } catch (err: any) {
      toast.error(err?.detail || "Error al vincular gema");
    } finally {
      setLinking(false);
    }
  };

  const linkLessonGem = async (lessonId: string, gem: AdminGemMini) => {
    setLinking(true);
    try {
      const res = await fetch(`/api/v1/admin/lessons/${lessonId}/gems`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gem_id: gem.id, sort_order: 0 }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const created: AdminLessonGemLink = await res.json();
      setLessonGems((prev) => ({
        ...prev,
        [lessonId]: [...(prev[lessonId] ?? []), created],
      }));
      toast.success("Gema añadida a la lección");
    } catch (err: any) {
      toast.error(err?.detail || "Error al vincular gema");
    } finally {
      setLinking(false);
    }
  };

  const unlinkCourseGem = async (linkId: string) => {
    if (!confirm("¿Quitar esta gema del curso?")) return;
    try {
      const res = await fetch(`/api/v1/admin/course-gems/${linkId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      setCourseGems((prev) => prev.filter((g) => g.id !== linkId));
      toast.success("Gema desvinculada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al desvincular gema");
    }
  };

  const unlinkLessonGem = async (lessonId: string, linkId: string) => {
    if (!confirm("¿Quitar esta gema de la lección?")) return;
    try {
      const res = await fetch(`/api/v1/admin/lesson-gems/${linkId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      setLessonGems((prev) => ({
        ...prev,
        [lessonId]: (prev[lessonId] ?? []).filter((g) => g.id !== linkId),
      }));
      toast.success("Gema desvinculada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al desvincular gema");
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
      className="space-y-5"
    >
      <div
        className="bg-white rounded-2xl border p-5"
        style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "#1A2332" }}>
            Gemas del curso ({courseGems.length})
          </h3>
          <button
            onClick={() => openModal({ kind: "course" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white"
            style={{ backgroundColor: "#E5A800" }}
          >
            <Plus className="w-3.5 h-3.5" /> Agregar gema
          </button>
        </div>
        {courseGems.length === 0 ? (
          <div
            className="text-sm text-center py-8"
            style={{ color: "#6B7A8D" }}
          >
            Este curso aún no tiene gemas
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <AnimatePresence initial={false}>
              {courseGems.map((link) => (
                <GemCard
                  key={link.id}
                  title={link.gem.title}
                  description={link.gem.description}
                  iconUrl={link.gem.icon_url}
                  onRemove={() => unlinkCourseGem(link.id)}
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
          Gemas por lección
        </h3>
        {lessons.length === 0 ? (
          <div className="text-sm text-center py-6" style={{ color: "#6B7A8D" }}>
            Este curso aún no tiene módulos ni lecciones.
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((group, mi) => (
              <div key={group.module.id}>
                <div
                  className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6B7A8D" }}
                >
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold text-white"
                    style={{ backgroundColor: "#E5A800" }}
                  >
                    {mi + 1}
                  </span>
                  {group.module.title}
                </div>
                {group.lessons.length === 0 ? (
                  <div
                    className="ml-7 text-xs"
                    style={{ color: "#6B7A8D" }}
                  >
                    Sin lecciones
                  </div>
                ) : (
                  <div className="space-y-2 ml-7">
                    {group.lessons.map((lesson, li) => {
                      const gems = lessonGems[lesson.id] ?? [];
                      return (
                        <div
                          key={lesson.id}
                          className="rounded-xl border p-3"
                          style={{ borderColor: "#E8EAED", backgroundColor: "#FAFBFC" }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className="text-sm font-medium"
                              style={{ color: "#1A2332" }}
                            >
                              {mi + 1}.{li + 1} {lesson.title}
                            </div>
                            <button
                              onClick={() =>
                                openModal({
                                  kind: "lesson",
                                  lessonId: lesson.id,
                                  lessonTitle: lesson.title,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                              style={{ backgroundColor: "#0099DC" }}
                            >
                              <Plus className="w-3 h-3" /> Gema
                            </button>
                          </div>
                          {gems.length === 0 ? (
                            <div className="text-xs" style={{ color: "#6B7A8D" }}>
                              Sin gemas
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <AnimatePresence initial={false}>
                                {gems.map((link) => (
                                  <GemCard
                                    key={link.id}
                                    title={link.gem.title}
                                    description={link.gem.description}
                                    iconUrl={link.gem.icon_url}
                                    compact
                                    onRemove={() => unlinkLessonGem(lesson.id, link.id)}
                                  />
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
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
                  {modal.kind === "course"
                    ? "Agregar gema al curso"
                    : `Agregar gema a "${modal.lessonTitle}"`}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                  style={{ color: "#6B7A8D" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mb-4">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#6B7A8D" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar gema por título..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#E8EAED" }}
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredGems.length === 0 ? (
                  <div
                    className="text-sm text-center py-8"
                    style={{ color: "#6B7A8D" }}
                  >
                    Sin resultados
                  </div>
                ) : (
                  filteredGems.map((gem) => (
                    <button
                      key={gem.id}
                      disabled={linking}
                      onClick={() => {
                        if (modal.kind === "course") linkCourseGem(gem);
                        else linkLessonGem(modal.lessonId, gem);
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border hover:bg-gray-50 transition text-left disabled:opacity-50"
                      style={{ borderColor: "#E8EAED" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#F0F8EA" }}
                      >
                        {gem.icon_url ? (
                          <img
                            src={gem.icon_url}
                            alt={gem.title}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5" style={{ color: "#4A8A2C" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: "#1A2332" }}
                        >
                          {gem.title}
                        </div>
                        {gem.description && (
                          <div
                            className="text-xs truncate"
                            style={{ color: "#6B7A8D" }}
                          >
                            {gem.description}
                          </div>
                        )}
                      </div>
                      <Plus
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "#4A8A2C" }}
                      />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GemCard({
  title,
  description,
  iconUrl,
  compact,
  onRemove,
}: {
  title: string;
  description: string | null;
  iconUrl: string | null;
  compact?: boolean;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-2.5 rounded-xl border p-2.5"
      style={{ borderColor: "#E8EAED", backgroundColor: "#fff" }}
    >
      <div
        className={`rounded-lg flex items-center justify-center flex-shrink-0 ${
          compact ? "w-8 h-8" : "w-9 h-9"
        }`}
        style={{ backgroundColor: "#F0F8EA" }}
      >
        {iconUrl ? (
          <img src={iconUrl} alt={title} className="w-6 h-6 object-contain" />
        ) : (
          <Sparkles
            className={compact ? "w-4 h-4" : "w-5 h-5"}
            style={{ color: "#4A8A2C" }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium truncate ${compact ? "text-xs" : "text-sm"}`}
          style={{ color: "#1A2332" }}
        >
          {title}
        </div>
        {description && (
          <div
            className={`truncate ${compact ? "text-[10px]" : "text-xs"}`}
            style={{ color: "#6B7A8D" }}
          >
            {description}
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded hover:bg-red-50 flex-shrink-0"
        style={{ color: "#DC2626" }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
