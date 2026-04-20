import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Presentation,
  Headphones,
  HelpCircle,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminModule,
  AdminLesson,
  AdminResource,
  ResourceType,
} from "../../../types/admin";

interface ContentTabProps {
  courseId: string;
  onChange: () => void;
}

interface LessonNode extends AdminLesson {
  resources?: AdminResource[];
  resourcesLoaded?: boolean;
  expanded?: boolean;
}

interface ModuleNode extends AdminModule {
  lessons?: LessonNode[];
  lessonsLoaded?: boolean;
}

interface ResourceModalState {
  open: boolean;
  lessonId: string | null;
  editing: AdminResource | null;
  form: {
    resource_type: ResourceType;
    title: string;
    external_url: string;
    thumbnail_url: string;
    duration_seconds: string;
  };
}

const RESOURCE_ICONS: Record<ResourceType, typeof Video> = {
  video: Video,
  pdf: FileText,
  slide: Presentation,
  podcast: Headphones,
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  video: "Video",
  pdf: "PDF",
  slide: "Diapositiva",
  podcast: "Podcast",
};

function emptyResourceForm() {
  return {
    resource_type: "video" as ResourceType,
    title: "",
    external_url: "",
    thumbnail_url: "",
    duration_seconds: "",
  };
}

export default function ContentTab({ courseId, onChange }: ContentTabProps) {
  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [resourceModal, setResourceModal] = useState<ResourceModalState>({
    open: false,
    lessonId: null,
    editing: null,
    form: emptyResourceForm(),
  });

  const loadModules = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/modules`, {
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error cargando módulos" }));
      const data: AdminModule[] = await res.json();
      setModules(
        data.map((m) => ({ ...m, lessons: undefined, lessonsLoaded: false })),
      );
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar los módulos");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const loadLessons = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/modules/${moduleId}/lessons`, {
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error cargando lecciones" }));
      const data: AdminLesson[] = await res.json();
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: data, lessonsLoaded: true } : m,
        ),
      );
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar las lecciones");
    }
  };

  useEffect(() => {
    modules.forEach((m) => {
      if (!m.lessonsLoaded) loadLessons(m.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules.length]);

  const loadResources = async (moduleId: string, lessonId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/lessons/${lessonId}/resources`, {
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error cargando recursos" }));
      const data: AdminResource[] = await res.json();
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons?.map((l) =>
                  l.id === lessonId
                    ? { ...l, resources: data, resourcesLoaded: true }
                    : l,
                ),
              }
            : m,
        ),
      );
    } catch (err: any) {
      toast.error(err?.detail || "No se pudieron cargar los recursos");
    }
  };

  const addModule = async () => {
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/modules`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nuevo módulo" }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error creando módulo" }));
      const created: AdminModule = await res.json();
      setModules((prev) => [...prev, { ...created, lessons: [], lessonsLoaded: true }]);
      setEditingTitle(`module:${created.id}`);
      setTitleDraft(created.title);
      toast.success("Módulo creado");
      onChange();
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear módulo");
    }
  };

  const deleteModule = async (id: string) => {
    if (!confirm("¿Eliminar este módulo? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/v1/admin/modules/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error eliminando módulo" }));
      setModules((prev) => prev.filter((m) => m.id !== id));
      toast.success("Módulo eliminado");
      onChange();
    } catch (err: any) {
      toast.error(err?.detail || "Error al eliminar módulo");
    }
  };

  const saveModuleTitle = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      toast.error("El título no puede estar vacío");
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/modules/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error guardando módulo" }));
      const updated: AdminModule = await res.json();
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, title: updated.title } : m)),
      );
      toast.success("Módulo actualizado");
    } catch (err: any) {
      toast.error(err?.detail || "Error al actualizar módulo");
    }
  };

  const reorderModules = async (index: number, dir: -1 | 1) => {
    const next = [...modules];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setModules(next);
    try {
      const res = await fetch(
        `/api/v1/admin/courses/${courseId}/modules/reorder`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module_ids: next.map((m) => m.id) }),
        },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error reordenando" }));
      toast.success("Orden actualizado");
    } catch (err: any) {
      toast.error(err?.detail || "Error al reordenar");
      loadModules();
    }
  };

  const addLesson = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nueva lección" }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error creando lección" }));
      const created: AdminLesson = await res.json();
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons ?? []), created] }
            : m,
        ),
      );
      setEditingTitle(`lesson:${created.id}`);
      setTitleDraft(created.title);
      toast.success("Lección creada");
      onChange();
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear lección");
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("¿Eliminar esta lección?")) return;
    try {
      const res = await fetch(`/api/v1/admin/lessons/${lessonId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error eliminando lección" }));
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons?.filter((l) => l.id !== lessonId) }
            : m,
        ),
      );
      toast.success("Lección eliminada");
      onChange();
    } catch (err: any) {
      toast.error(err?.detail || "Error al eliminar lección");
    }
  };

  const updateLessonField = async (
    moduleId: string,
    lessonId: string,
    field: "title" | "description" | "estimated_minutes",
    value: string,
  ) => {
    let payload: Record<string, unknown>;
    if (field === "estimated_minutes") {
      payload = { estimated_minutes: value.trim() === "" ? null : Number(value) };
    } else if (field === "description") {
      payload = { description: value.trim() === "" ? null : value };
    } else {
      if (!value.trim()) {
        toast.error("El título no puede estar vacío");
        return;
      }
      payload = { title: value.trim() };
    }
    try {
      const res = await fetch(`/api/v1/admin/lessons/${lessonId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error guardando lección" }));
      const updated: AdminLesson = await res.json();
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons?.map((l) =>
                  l.id === lessonId ? { ...l, ...updated } : l,
                ),
              }
            : m,
        ),
      );
      toast.success("Lección actualizada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al actualizar lección");
    }
  };

  const reorderLessons = async (
    moduleId: string,
    index: number,
    dir: -1 | 1,
  ) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod?.lessons) return;
    const next = [...mod.lessons];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons: next } : m)),
    );
    try {
      const res = await fetch(
        `/api/v1/admin/modules/${moduleId}/lessons/reorder`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_ids: next.map((l) => l.id) }),
        },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error reordenando" }));
      toast.success("Orden actualizado");
    } catch (err: any) {
      toast.error(err?.detail || "Error al reordenar lecciones");
      loadLessons(moduleId);
    }
  };

  const toggleLessonExpand = (moduleId: string, lessonId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    const lesson = mod?.lessons?.find((l) => l.id === lessonId);
    if (!lesson) return;
    const nextExpanded = !lesson.expanded;
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons?.map((l) =>
                l.id === lessonId ? { ...l, expanded: nextExpanded } : l,
              ),
            }
          : m,
      ),
    );
    if (nextExpanded && !lesson.resourcesLoaded) {
      loadResources(moduleId, lessonId);
    }
  };

  const openResourceModal = (lessonId: string, editing: AdminResource | null = null) => {
    setResourceModal({
      open: true,
      lessonId,
      editing,
      form: editing
        ? {
            resource_type: editing.resource_type,
            title: editing.title,
            external_url: editing.external_url,
            thumbnail_url: editing.thumbnail_url ?? "",
            duration_seconds:
              editing.duration_seconds !== null && editing.duration_seconds !== undefined
                ? String(editing.duration_seconds)
                : "",
          }
        : emptyResourceForm(),
    });
  };

  const closeResourceModal = () => {
    setResourceModal({
      open: false,
      lessonId: null,
      editing: null,
      form: emptyResourceForm(),
    });
  };

  const saveResource = async () => {
    const { lessonId, editing, form } = resourceModal;
    if (!lessonId) return;
    if (!form.title.trim() || !form.external_url.trim()) {
      toast.error("Título y URL son obligatorios");
      return;
    }
    const payload = {
      resource_type: form.resource_type,
      title: form.title.trim(),
      external_url: form.external_url.trim(),
      thumbnail_url: form.thumbnail_url.trim() === "" ? null : form.thumbnail_url.trim(),
      duration_seconds:
        form.duration_seconds.trim() === "" ? null : Number(form.duration_seconds),
    };
    try {
      const url = editing
        ? `/api/v1/admin/resources/${editing.id}`
        : `/api/v1/admin/lessons/${lessonId}/resources`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error guardando recurso" }));
      const saved: AdminResource = await res.json();
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons?.map((l) => {
            if (l.id !== lessonId) return l;
            const list = l.resources ?? [];
            return {
              ...l,
              resources: editing
                ? list.map((r) => (r.id === saved.id ? saved : r))
                : [...list, saved],
            };
          }),
        })),
      );
      toast.success(editing ? "Recurso actualizado" : "Recurso creado");
      closeResourceModal();
      onChange();
    } catch (err: any) {
      toast.error(err?.detail || "Error al guardar recurso");
    }
  };

  const deleteResource = async (lessonId: string, resourceId: string) => {
    if (!confirm("¿Eliminar este recurso?")) return;
    try {
      const res = await fetch(`/api/v1/admin/resources/${resourceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error eliminando recurso" }));
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons?.map((l) =>
            l.id === lessonId
              ? { ...l, resources: l.resources?.filter((r) => r.id !== resourceId) }
              : l,
          ),
        })),
      );
      toast.success("Recurso eliminado");
      onChange();
    } catch (err: any) {
      toast.error(err?.detail || "Error al eliminar recurso");
    }
  };

  const goToQuizzesTab = (lessonId: string) => {
    window.location.hash = `#quizzes:${lessonId}`;
    window.dispatchEvent(new CustomEvent("admin:go-tab", { detail: { tab: "quizzes", lessonId } }));
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
          Contenido del Curso
        </h2>
        <button
          onClick={addModule}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: "#E5A800" }}
        >
          <Plus className="w-4 h-4" />
          Agregar módulo
        </button>
      </div>

      {modules.length === 0 && (
        <div
          className="bg-white rounded-2xl p-10 border text-center text-sm"
          style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
        >
          Aún no hay módulos. Empieza creando uno.
        </div>
      )}

      <AnimatePresence initial={false}>
        {modules.map((mod, mIdx) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-2xl p-4 border mb-3"
            style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: "#6B7A8D" }} />
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: "#E5A800" }}
              >
                {mIdx + 1}
              </span>
              {editingTitle === `module:${mod.id}` ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={() => {
                    saveModuleTitle(mod.id, titleDraft);
                    setEditingTitle(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setEditingTitle(null);
                  }}
                  className="flex-1 px-2 py-1 rounded-lg border text-sm font-semibold"
                  style={{ borderColor: "#E5A800", color: "#1A2332" }}
                />
              ) : (
                <button
                  onClick={() => {
                    setEditingTitle(`module:${mod.id}`);
                    setTitleDraft(mod.title);
                  }}
                  className="flex-1 text-left text-sm font-semibold hover:underline truncate"
                  style={{ color: "#1A2332" }}
                >
                  {mod.title}
                </button>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => reorderModules(mIdx, -1)}
                  disabled={mIdx === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  style={{ color: "#6B7A8D" }}
                  title="Subir"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => reorderModules(mIdx, 1)}
                  disabled={mIdx === modules.length - 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  style={{ color: "#6B7A8D" }}
                  title="Bajar"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteModule(mod.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50"
                  style={{ color: "#DC2626" }}
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pl-10 mt-3 space-y-2">
              {!mod.lessonsLoaded ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: "#6B7A8D" }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando lecciones...
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {(mod.lessons ?? []).map((lesson, lIdx) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-xl border p-3"
                      style={{ borderColor: "#E8EAED", backgroundColor: "#FAFBFC" }}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLessonExpand(mod.id, lesson.id)}
                          className="p-1 rounded"
                          style={{ color: "#6B7A8D" }}
                        >
                          <ChevronRight
                            className="w-4 h-4 transition-transform"
                            style={{
                              transform: lesson.expanded ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                          />
                        </button>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#6B7A8D" }}
                        >
                          {mIdx + 1}.{lIdx + 1}
                        </span>
                        {editingTitle === `lesson:${lesson.id}` ? (
                          <input
                            autoFocus
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onBlur={() => {
                              updateLessonField(mod.id, lesson.id, "title", titleDraft);
                              setEditingTitle(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              if (e.key === "Escape") setEditingTitle(null);
                            }}
                            className="flex-1 px-2 py-1 rounded-lg border text-sm"
                            style={{ borderColor: "#E5A800" }}
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTitle(`lesson:${lesson.id}`);
                              setTitleDraft(lesson.title);
                            }}
                            className="flex-1 text-left text-sm font-medium hover:underline truncate"
                            style={{ color: "#1A2332" }}
                          >
                            {lesson.title}
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => reorderLessons(mod.id, lIdx, -1)}
                            disabled={lIdx === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                            style={{ color: "#6B7A8D" }}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reorderLessons(mod.id, lIdx, 1)}
                            disabled={lIdx === (mod.lessons?.length ?? 0) - 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                            style={{ color: "#6B7A8D" }}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLesson(mod.id, lesson.id)}
                            className="p-1 rounded hover:bg-red-50"
                            style={{ color: "#DC2626" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {lesson.expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 pl-7 space-y-2.5">
                              <div>
                                <label
                                  className="block text-xs font-medium mb-1"
                                  style={{ color: "#6B7A8D" }}
                                >
                                  Descripción
                                </label>
                                <InlineTextarea
                                  value={lesson.description ?? ""}
                                  onSave={(v) =>
                                    updateLessonField(mod.id, lesson.id, "description", v)
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  className="block text-xs font-medium mb-1"
                                  style={{ color: "#6B7A8D" }}
                                >
                                  Duración (minutos)
                                </label>
                                <InlineNumber
                                  value={
                                    lesson.estimated_minutes !== null &&
                                    lesson.estimated_minutes !== undefined
                                      ? String(lesson.estimated_minutes)
                                      : ""
                                  }
                                  onSave={(v) =>
                                    updateLessonField(
                                      mod.id,
                                      lesson.id,
                                      "estimated_minutes",
                                      v,
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className="text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: "#6B7A8D" }}
                                  >
                                    Recursos
                                  </span>
                                  <button
                                    onClick={() => openResourceModal(lesson.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                    style={{ backgroundColor: "#0099DC", color: "#fff" }}
                                  >
                                    <Plus className="w-3 h-3" /> Recurso
                                  </button>
                                </div>
                                {!lesson.resourcesLoaded ? (
                                  <div
                                    className="text-xs flex items-center gap-1.5"
                                    style={{ color: "#6B7A8D" }}
                                  >
                                    <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
                                  </div>
                                ) : (lesson.resources ?? []).length === 0 ? (
                                  <div className="text-xs" style={{ color: "#6B7A8D" }}>
                                    Sin recursos
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    {lesson.resources!.map((r) => {
                                      const Icon = RESOURCE_ICONS[r.resource_type];
                                      return (
                                        <div
                                          key={r.id}
                                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border"
                                          style={{ borderColor: "#E8EAED" }}
                                        >
                                          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#0099DC" }} />
                                          <div className="flex-1 min-w-0">
                                            <div
                                              className="text-xs font-medium truncate"
                                              style={{ color: "#1A2332" }}
                                            >
                                              {r.title}
                                            </div>
                                            <div
                                              className="text-[10px] truncate"
                                              style={{ color: "#6B7A8D" }}
                                            >
                                              {r.external_url}
                                              {r.duration_seconds
                                                ? ` · ${r.duration_seconds}s`
                                                : ""}
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => openResourceModal(lesson.id, r)}
                                            className="p-1 rounded hover:bg-gray-100"
                                            style={{ color: "#6B7A8D" }}
                                          >
                                            <Save className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => deleteResource(lesson.id, r.id)}
                                            className="p-1 rounded hover:bg-red-50"
                                            style={{ color: "#DC2626" }}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => goToQuizzesTab(lesson.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                  style={{
                                    borderColor: lesson.has_quiz ? "#4A8A2C" : "#E8EAED",
                                    color: lesson.has_quiz ? "#4A8A2C" : "#6B7A8D",
                                    backgroundColor: lesson.has_quiz ? "#F0F8EA" : "#fff",
                                  }}
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  {lesson.has_quiz ? "Editar Quiz" : "Crear Quiz"}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <button
                onClick={() => addLesson(mod.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed"
                style={{ borderColor: "#E5A800", color: "#E5A800" }}
              >
                <Plus className="w-3.5 h-3.5" /> Agregar lección
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {resourceModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26, 35, 50, 0.5)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl p-6 border w-full max-w-lg"
              style={{ borderColor: "#E8EAED" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
                  {resourceModal.editing ? "Editar Recurso" : "Nuevo Recurso"}
                </h3>
                <button
                  onClick={closeResourceModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                  style={{ color: "#6B7A8D" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
                    Tipo
                  </label>
                  <select
                    value={resourceModal.form.resource_type}
                    onChange={(e) =>
                      setResourceModal((s) => ({
                        ...s,
                        form: { ...s.form, resource_type: e.target.value as ResourceType },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                    style={{ borderColor: "#E8EAED" }}
                  >
                    {(Object.keys(RESOURCE_LABELS) as ResourceType[]).map((t) => (
                      <option key={t} value={t}>
                        {RESOURCE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
                    Título
                  </label>
                  <input
                    value={resourceModal.form.title}
                    onChange={(e) =>
                      setResourceModal((s) => ({
                        ...s,
                        form: { ...s.form, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: "#E8EAED" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
                    URL externa
                  </label>
                  <input
                    type="url"
                    value={resourceModal.form.external_url}
                    onChange={(e) =>
                      setResourceModal((s) => ({
                        ...s,
                        form: { ...s.form, external_url: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: "#E8EAED" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
                    URL de miniatura
                  </label>
                  <input
                    type="url"
                    value={resourceModal.form.thumbnail_url}
                    onChange={(e) =>
                      setResourceModal((s) => ({
                        ...s,
                        form: { ...s.form, thumbnail_url: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: "#E8EAED" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
                    Duración (segundos)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={resourceModal.form.duration_seconds}
                    onChange={(e) =>
                      setResourceModal((s) => ({
                        ...s,
                        form: { ...s.form, duration_seconds: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: "#E8EAED" }}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={closeResourceModal}
                  className="px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveResource}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: "#E5A800" }}
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InlineTextarea({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full text-left text-xs px-2 py-1.5 rounded-lg border hover:bg-white transition"
        style={{
          borderColor: "#E8EAED",
          color: value ? "#1A2332" : "#6B7A8D",
          backgroundColor: "#fff",
          minHeight: 32,
        }}
      >
        {value || "Sin descripción (click para editar)"}
      </button>
    );
  }
  return (
    <textarea
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) onSave(draft);
      }}
      rows={3}
      className="w-full px-2 py-1.5 rounded-lg border text-xs resize-none"
      style={{ borderColor: "#E5A800" }}
    />
  );
}

function InlineNumber({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  return (
    <input
      type="number"
      min={0}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onSave(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-28 px-2 py-1 rounded-lg border text-xs"
      style={{ borderColor: "#E8EAED" }}
    />
  );
}
