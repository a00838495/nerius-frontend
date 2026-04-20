import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Plus,
  Trash2,
  X,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminModule,
  AdminLesson,
  QuestionType,
} from "../../../types/admin";

interface QuizzesTabProps {
  courseId: string;
}

interface QuizOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
  match_target?: string | null;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_type: QuestionType;
  question_text: string;
  explanation: string | null;
  points: number;
  sort_order: number;
  options: QuizOption[];
  _dirty?: boolean;
  _optionsDirty?: boolean;
}

interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number | null;
  time_limit_seconds: number | null;
  is_required: boolean;
  questions: QuizQuestion[];
}

interface LessonRow {
  lesson: AdminLesson;
  moduleTitle: string;
  moduleIndex: number;
  lessonIndex: number;
}

const QUESTION_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Opción múltiple",
  true_false: "Verdadero / Falso",
  short_answer: "Respuesta corta",
  ordering: "Ordenamiento",
  matching: "Emparejamiento",
};

export default function QuizzesTab({ courseId }: QuizzesTabProps) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<
    { module: AdminModule; lessons: AdminLesson[] }[]
  >([]);
  const [createModal, setCreateModal] = useState<{ open: boolean; lessonId: string | null }>({
    open: false,
    lessonId: null,
  });
  const [newQuizForm, setNewQuizForm] = useState({
    title: "",
    description: "",
    passing_score: "70",
    max_attempts: "",
    time_limit_seconds: "",
    is_required: true,
  });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [savingQuizSettings, setSavingQuizSettings] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/courses/${courseId}/modules`, {
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const mods: AdminModule[] = await res.json();
      const nextGroups = await Promise.all(
        mods.map(async (m) => {
          const r = await fetch(`/api/v1/admin/modules/${m.id}/lessons`, {
            credentials: "include",
          });
          const lessons: AdminLesson[] = r.ok ? await r.json() : [];
          return { module: m, lessons };
        }),
      );
      setGroups(nextGroups);
    } catch (err: any) {
      toast.error(err?.detail || "No se pudo cargar el contenido");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const lessonId = window.location.hash.match(/^#quizzes:([^&]+)/)?.[1];
    if (lessonId) {
      setEditingLessonId(lessonId);
    }
  }, []);

  const rows: LessonRow[] = groups.flatMap((g, mi) =>
    g.lessons.map((l, li) => ({
      lesson: l,
      moduleTitle: g.module.title,
      moduleIndex: mi + 1,
      lessonIndex: li + 1,
    })),
  );

  const openCreateQuiz = (lessonId: string) => {
    setNewQuizForm({
      title: "",
      description: "",
      passing_score: "70",
      max_attempts: "",
      time_limit_seconds: "",
      is_required: true,
    });
    setCreateModal({ open: true, lessonId });
  };

  const submitCreateQuiz = async () => {
    if (!createModal.lessonId) return;
    if (!newQuizForm.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    const payload = {
      title: newQuizForm.title.trim(),
      description:
        newQuizForm.description.trim() === "" ? null : newQuizForm.description.trim(),
      passing_score: Number(newQuizForm.passing_score) || 70,
      max_attempts:
        newQuizForm.max_attempts.trim() === "" ? null : Number(newQuizForm.max_attempts),
      time_limit_seconds:
        newQuizForm.time_limit_seconds.trim() === ""
          ? null
          : Number(newQuizForm.time_limit_seconds),
      is_required: newQuizForm.is_required,
    };
    try {
      const res = await fetch(
        `/api/v1/admin/lessons/${createModal.lessonId}/quiz`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error creando quiz" }));
      toast.success("Quiz creado");
      setCreateModal({ open: false, lessonId: null });
      await loadAll();
      setEditingLessonId(createModal.lessonId);
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear quiz");
    }
  };

  const openEditQuiz = async (lessonId: string) => {
    setEditingLessonId(lessonId);
    setLoadingQuiz(true);
    try {
      const res = await fetch(
        `/api/v1/courses/${courseId}/lessons/${lessonId}/quiz`,
        { credentials: "include" },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error cargando quiz" }));
      const q: Quiz = await res.json();
      setEditingQuiz({
        ...q,
        questions: (q.questions ?? []).map((qq) => ({
          ...qq,
          options: qq.options ?? [],
        })),
      });
    } catch (err: any) {
      toast.error(err?.detail || "Error al cargar quiz");
      setEditingQuiz(null);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const closeEditor = () => {
    setEditingLessonId(null);
    setEditingQuiz(null);
  };

  const saveQuizSettings = async () => {
    if (!editingQuiz) return;
    setSavingQuizSettings(true);
    try {
      const res = await fetch(`/api/v1/admin/quizzes/${editingQuiz.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingQuiz.title,
          description: editingQuiz.description,
          passing_score: editingQuiz.passing_score,
          max_attempts: editingQuiz.max_attempts,
          time_limit_seconds: editingQuiz.time_limit_seconds,
          is_required: editingQuiz.is_required,
        }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error guardando" }));
      toast.success("Configuración del quiz guardada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al guardar configuración");
    } finally {
      setSavingQuizSettings(false);
    }
  };

  const deleteQuiz = async () => {
    if (!editingQuiz) return;
    if (!confirm("¿Eliminar el quiz completo? Se perderán todas las preguntas.")) return;
    try {
      const res = await fetch(`/api/v1/admin/quizzes/${editingQuiz.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error eliminando" }));
      toast.success("Quiz eliminado");
      closeEditor();
      loadAll();
    } catch (err: any) {
      toast.error(err?.detail || "Error al eliminar quiz");
    }
  };

  const addQuestion = async () => {
    if (!editingQuiz) return;
    try {
      const res = await fetch(
        `/api/v1/admin/quizzes/${editingQuiz.id}/questions`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_type: "multiple_choice",
            question_text: "Nueva pregunta",
            explanation: null,
            points: 1,
          }),
        },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error creando pregunta" }));
      const q: QuizQuestion = await res.json();
      setEditingQuiz((prev) =>
        prev
          ? { ...prev, questions: [...prev.questions, { ...q, options: q.options ?? [] }] }
          : prev,
      );
      toast.success("Pregunta creada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear pregunta");
    }
  };

  const updateQuestionField = (idx: number, patch: Partial<QuizQuestion>) => {
    setEditingQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === idx ? { ...q, ...patch, _dirty: true } : q,
            ),
          }
        : prev,
    );
  };

  const changeQuestionType = (idx: number, type: QuestionType) => {
    setEditingQuiz((prev) => {
      if (!prev) return prev;
      const q = prev.questions[idx];
      let options: QuizOption[] = [];
      if (type === "true_false") {
        options = [
          { option_text: "Verdadero", is_correct: true, sort_order: 0 },
          { option_text: "Falso", is_correct: false, sort_order: 1 },
        ];
      } else if (type === "multiple_choice") {
        options = q.options.length
          ? q.options
          : [
              { option_text: "", is_correct: true, sort_order: 0 },
              { option_text: "", is_correct: false, sort_order: 1 },
            ];
      } else if (type === "ordering" || type === "matching") {
        options = q.options.length
          ? q.options.map((o) => ({
              ...o,
              is_correct: type === "ordering" ? true : o.is_correct,
            }))
          : [{ option_text: "", is_correct: true, sort_order: 0 }];
      }
      return {
        ...prev,
        questions: prev.questions.map((qq, i) =>
          i === idx
            ? { ...qq, question_type: type, options, _dirty: true, _optionsDirty: true }
            : qq,
        ),
      };
    });
  };

  const saveQuestion = async (idx: number) => {
    if (!editingQuiz) return;
    const q = editingQuiz.questions[idx];
    try {
      const res = await fetch(`/api/v1/admin/questions/${q.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_type: q.question_type,
          question_text: q.question_text,
          explanation: q.explanation,
          points: q.points,
        }),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      toast.success("Pregunta guardada");
      setEditingQuiz((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((qq, i) =>
                i === idx ? { ...qq, _dirty: false } : qq,
              ),
            }
          : prev,
      );
    } catch (err: any) {
      toast.error(err?.detail || "Error al guardar pregunta");
    }
  };

  const deleteQuestion = async (idx: number) => {
    if (!editingQuiz) return;
    const q = editingQuiz.questions[idx];
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      const res = await fetch(`/api/v1/admin/questions/${q.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      setEditingQuiz((prev) =>
        prev
          ? { ...prev, questions: prev.questions.filter((_, i) => i !== idx) }
          : prev,
      );
      toast.success("Pregunta eliminada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al eliminar pregunta");
    }
  };

  const updateOption = (
    qIdx: number,
    oIdx: number,
    patch: Partial<QuizOption>,
  ) => {
    setEditingQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === qIdx
                ? {
                    ...q,
                    _optionsDirty: true,
                    options: q.options.map((o, j) =>
                      j === oIdx ? { ...o, ...patch } : o,
                    ),
                  }
                : q,
            ),
          }
        : prev,
    );
  };

  const setSingleCorrect = (qIdx: number, oIdx: number) => {
    setEditingQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === qIdx
                ? {
                    ...q,
                    _optionsDirty: true,
                    options: q.options.map((o, j) => ({
                      ...o,
                      is_correct: j === oIdx,
                    })),
                  }
                : q,
            ),
          }
        : prev,
    );
  };

  const addOption = (qIdx: number) => {
    setEditingQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === qIdx
                ? {
                    ...q,
                    _optionsDirty: true,
                    options: [
                      ...q.options,
                      {
                        option_text: "",
                        is_correct: q.question_type === "ordering",
                        sort_order: q.options.length,
                        match_target: q.question_type === "matching" ? "" : null,
                      },
                    ],
                  }
                : q,
            ),
          }
        : prev,
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setEditingQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === qIdx
                ? {
                    ...q,
                    _optionsDirty: true,
                    options: q.options
                      .filter((_, j) => j !== oIdx)
                      .map((o, k) => ({ ...o, sort_order: k })),
                  }
                : q,
            ),
          }
        : prev,
    );
  };

  const saveOptions = async (qIdx: number) => {
    if (!editingQuiz) return;
    const q = editingQuiz.questions[qIdx];
    const payload = {
      options: q.options.map((o, idx) => {
        const base: any = {
          option_text: o.option_text,
          is_correct: q.question_type === "ordering" ? true : o.is_correct,
          sort_order: idx,
        };
        if (q.question_type === "matching") {
          base.match_target = o.match_target ?? "";
        }
        return base;
      }),
    };
    try {
      const res = await fetch(
        `/api/v1/admin/questions/${q.id}/options/bulk`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      toast.success("Opciones guardadas");
      setEditingQuiz((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((qq, i) =>
                i === qIdx ? { ...qq, _optionsDirty: false } : qq,
              ),
            }
          : prev,
      );
    } catch (err: any) {
      toast.error(err?.detail || "Error al guardar opciones");
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
        Quizzes del Curso
      </h2>

      {groups.length === 0 && (
        <div
          className="bg-white rounded-2xl p-10 border text-center text-sm"
          style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
        >
          Este curso aún no tiene módulos o lecciones.
        </div>
      )}

      {groups.map((g, mi) => (
        <div
          key={g.module.id}
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div
            className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: "#E8EAED", backgroundColor: "#FAFBFC" }}
          >
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-semibold text-white"
              style={{ backgroundColor: "#E5A800" }}
            >
              {mi + 1}
            </span>
            <h3 className="text-sm font-semibold" style={{ color: "#1A2332" }}>
              {g.module.title}
            </h3>
          </div>
          {g.lessons.length === 0 ? (
            <div className="px-4 py-6 text-sm text-center" style={{ color: "#6B7A8D" }}>
              Sin lecciones
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#E8EAED" }}>
              {g.lessons.map((lesson, li) => (
                <div key={lesson.id} style={{ borderColor: "#E8EAED" }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="text-xs font-medium w-10 flex-shrink-0"
                      style={{ color: "#6B7A8D" }}
                    >
                      {mi + 1}.{li + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: "#1A2332" }}
                      >
                        {lesson.title}
                      </div>
                      {lesson.has_quiz && (
                        <div
                          className="text-[11px] flex items-center gap-1 mt-0.5"
                          style={{ color: "#4A8A2C" }}
                        >
                          <HelpCircle className="w-3 h-3" /> Quiz configurado
                        </div>
                      )}
                    </div>
                    {lesson.has_quiz ? (
                      <button
                        onClick={() =>
                          editingLessonId === lesson.id
                            ? closeEditor()
                            : openEditQuiz(lesson.id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                        style={{
                          borderColor: "#4A8A2C",
                          color: editingLessonId === lesson.id ? "#fff" : "#4A8A2C",
                          backgroundColor:
                            editingLessonId === lesson.id ? "#4A8A2C" : "#F0F8EA",
                        }}
                      >
                        {editingLessonId === lesson.id ? (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> Cerrar
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3.5 h-3.5" /> Editar preguntas
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => openCreateQuiz(lesson.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ backgroundColor: "#0099DC" }}
                      >
                        <Plus className="w-3.5 h-3.5" /> Crear Quiz
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {editingLessonId === lesson.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                        style={{ backgroundColor: "#FAFBFC" }}
                      >
                        <div
                          className="p-4 border-t"
                          style={{ borderColor: "#E8EAED" }}
                        >
                          {loadingQuiz ? (
                            <div
                              className="flex items-center gap-2 text-sm"
                              style={{ color: "#6B7A8D" }}
                            >
                              <Loader2 className="w-4 h-4 animate-spin" /> Cargando quiz...
                            </div>
                          ) : editingQuiz ? (
                            <QuizEditor
                              quiz={editingQuiz}
                              setQuiz={setEditingQuiz}
                              saving={savingQuizSettings}
                              onSaveSettings={saveQuizSettings}
                              onDeleteQuiz={deleteQuiz}
                              onAddQuestion={addQuestion}
                              onUpdateQuestion={updateQuestionField}
                              onChangeQuestionType={changeQuestionType}
                              onSaveQuestion={saveQuestion}
                              onDeleteQuestion={deleteQuestion}
                              onUpdateOption={updateOption}
                              onSetSingleCorrect={setSingleCorrect}
                              onAddOption={addOption}
                              onRemoveOption={removeOption}
                              onSaveOptions={saveOptions}
                            />
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <AnimatePresence>
        {createModal.open && (
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
              className="bg-white rounded-2xl p-6 border w-full max-w-lg"
              style={{ borderColor: "#E8EAED" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
                  Nuevo Quiz
                </h3>
                <button
                  onClick={() => setCreateModal({ open: false, lessonId: null })}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                  style={{ color: "#6B7A8D" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#1A2332" }}>
                    Título
                  </label>
                  <input
                    value={newQuizForm.title}
                    onChange={(e) =>
                      setNewQuizForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: "#E8EAED" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#1A2332" }}>
                    Descripción
                  </label>
                  <textarea
                    value={newQuizForm.description}
                    onChange={(e) =>
                      setNewQuizForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
                    style={{ borderColor: "#E8EAED" }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#1A2332" }}
                    >
                      Calificación mínima
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newQuizForm.passing_score}
                      onChange={(e) =>
                        setNewQuizForm((f) => ({ ...f, passing_score: e.target.value }))
                      }
                      className="w-full px-2.5 py-2 rounded-xl border text-sm"
                      style={{ borderColor: "#E8EAED" }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#1A2332" }}
                    >
                      Intentos máx.
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newQuizForm.max_attempts}
                      onChange={(e) =>
                        setNewQuizForm((f) => ({ ...f, max_attempts: e.target.value }))
                      }
                      className="w-full px-2.5 py-2 rounded-xl border text-sm"
                      style={{ borderColor: "#E8EAED" }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#1A2332" }}
                    >
                      Tiempo (seg)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newQuizForm.time_limit_seconds}
                      onChange={(e) =>
                        setNewQuizForm((f) => ({
                          ...f,
                          time_limit_seconds: e.target.value,
                        }))
                      }
                      className="w-full px-2.5 py-2 rounded-xl border text-sm"
                      style={{ borderColor: "#E8EAED" }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm" style={{ color: "#1A2332" }}>
                  <input
                    type="checkbox"
                    checked={newQuizForm.is_required}
                    onChange={(e) =>
                      setNewQuizForm((f) => ({ ...f, is_required: e.target.checked }))
                    }
                  />
                  Requerido para completar la lección
                </label>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => setCreateModal({ open: false, lessonId: null })}
                  className="px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={submitCreateQuiz}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: "#E5A800" }}
                >
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface QuizEditorProps {
  quiz: Quiz;
  setQuiz: React.Dispatch<React.SetStateAction<Quiz | null>>;
  saving: boolean;
  onSaveSettings: () => void;
  onDeleteQuiz: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (idx: number, patch: Partial<QuizQuestion>) => void;
  onChangeQuestionType: (idx: number, type: QuestionType) => void;
  onSaveQuestion: (idx: number) => void;
  onDeleteQuestion: (idx: number) => void;
  onUpdateOption: (qIdx: number, oIdx: number, patch: Partial<QuizOption>) => void;
  onSetSingleCorrect: (qIdx: number, oIdx: number) => void;
  onAddOption: (qIdx: number) => void;
  onRemoveOption: (qIdx: number, oIdx: number) => void;
  onSaveOptions: (qIdx: number) => void;
}

function QuizEditor({
  quiz,
  setQuiz,
  saving,
  onSaveSettings,
  onDeleteQuiz,
  onAddQuestion,
  onUpdateQuestion,
  onChangeQuestionType,
  onSaveQuestion,
  onDeleteQuestion,
  onUpdateOption,
  onSetSingleCorrect,
  onAddOption,
  onRemoveOption,
  onSaveOptions,
}: QuizEditorProps) {
  return (
    <div className="space-y-4">
      <div
        className="bg-white rounded-xl border p-4 space-y-3"
        style={{ borderColor: "#E8EAED" }}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold" style={{ color: "#1A2332" }}>
            Configuración del Quiz
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#E5A800" }}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Guardar
            </button>
            <button
              onClick={onDeleteQuiz}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: "#DC2626", color: "#DC2626" }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar quiz
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={quiz.title}
            onChange={(e) =>
              setQuiz((q) => (q ? { ...q, title: e.target.value } : q))
            }
            placeholder="Título"
            className="px-3 py-2 rounded-xl border text-sm"
            style={{ borderColor: "#E8EAED" }}
          />
          <input
            value={quiz.description ?? ""}
            onChange={(e) =>
              setQuiz((q) =>
                q ? { ...q, description: e.target.value === "" ? null : e.target.value } : q,
              )
            }
            placeholder="Descripción"
            className="px-3 py-2 rounded-xl border text-sm"
            style={{ borderColor: "#E8EAED" }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs" style={{ color: "#6B7A8D" }}>
            Calificación mínima
            <input
              type="number"
              min={0}
              max={100}
              value={quiz.passing_score}
              onChange={(e) =>
                setQuiz((q) =>
                  q ? { ...q, passing_score: Number(e.target.value) } : q,
                )
              }
              className="mt-1 w-full px-2 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: "#E8EAED" }}
            />
          </label>
          <label className="text-xs" style={{ color: "#6B7A8D" }}>
            Intentos máximos
            <input
              type="number"
              min={0}
              value={quiz.max_attempts ?? ""}
              onChange={(e) =>
                setQuiz((q) =>
                  q
                    ? {
                        ...q,
                        max_attempts:
                          e.target.value === "" ? null : Number(e.target.value),
                      }
                    : q,
                )
              }
              className="mt-1 w-full px-2 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: "#E8EAED" }}
            />
          </label>
          <label className="text-xs" style={{ color: "#6B7A8D" }}>
            Tiempo (segundos)
            <input
              type="number"
              min={0}
              value={quiz.time_limit_seconds ?? ""}
              onChange={(e) =>
                setQuiz((q) =>
                  q
                    ? {
                        ...q,
                        time_limit_seconds:
                          e.target.value === "" ? null : Number(e.target.value),
                      }
                    : q,
                )
              }
              className="mt-1 w-full px-2 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: "#E8EAED" }}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: "#1A2332" }}>
          <input
            type="checkbox"
            checked={quiz.is_required}
            onChange={(e) =>
              setQuiz((q) => (q ? { ...q, is_required: e.target.checked } : q))
            }
          />
          Requerido
        </label>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold" style={{ color: "#1A2332" }}>
          Preguntas ({quiz.questions.length})
        </h4>
        <button
          onClick={onAddQuestion}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: "#0099DC" }}
        >
          <Plus className="w-3.5 h-3.5" /> Agregar pregunta
        </button>
      </div>

      <AnimatePresence initial={false}>
        {quiz.questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="bg-white rounded-xl border p-4 space-y-3"
            style={{ borderColor: "#E8EAED" }}
          >
            <div className="flex items-start gap-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: "#0099DC" }}
              >
                {idx + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={q.question_type}
                    onChange={(e) =>
                      onChangeQuestionType(idx, e.target.value as QuestionType)
                    }
                    className="px-2 py-1.5 rounded-lg border text-xs bg-white"
                    style={{ borderColor: "#E8EAED" }}
                  >
                    {(Object.keys(QUESTION_LABELS) as QuestionType[]).map((t) => (
                      <option key={t} value={t}>
                        {QUESTION_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={q.points}
                    onChange={(e) =>
                      onUpdateQuestion(idx, { points: Number(e.target.value) })
                    }
                    placeholder="Puntos"
                    className="w-20 px-2 py-1.5 rounded-lg border text-xs"
                    style={{ borderColor: "#E8EAED" }}
                  />
                  {q._dirty && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full"
                      style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                    >
                      <AlertCircle className="w-3 h-3" /> Sin guardar
                    </span>
                  )}
                </div>
                <textarea
                  value={q.question_text}
                  onChange={(e) =>
                    onUpdateQuestion(idx, { question_text: e.target.value })
                  }
                  rows={2}
                  placeholder="Texto de la pregunta"
                  className="w-full px-2.5 py-2 rounded-lg border text-sm resize-none"
                  style={{ borderColor: "#E8EAED" }}
                />
                <textarea
                  value={q.explanation ?? ""}
                  onChange={(e) =>
                    onUpdateQuestion(idx, {
                      explanation: e.target.value === "" ? null : e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Explicación (opcional)"
                  className="w-full px-2.5 py-2 rounded-lg border text-xs resize-none"
                  style={{ borderColor: "#E8EAED", color: "#6B7A8D" }}
                />

                <QuestionOptionsEditor
                  question={q}
                  qIdx={idx}
                  onUpdateOption={onUpdateOption}
                  onSetSingleCorrect={onSetSingleCorrect}
                  onAddOption={onAddOption}
                  onRemoveOption={onRemoveOption}
                  onSaveOptions={onSaveOptions}
                />
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => onSaveQuestion(idx)}
                  disabled={!q._dirty}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  style={{ color: "#4A8A2C" }}
                  title="Guardar pregunta"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteQuestion(idx)}
                  className="p-1.5 rounded-lg hover:bg-red-50"
                  style={{ color: "#DC2626" }}
                  title="Eliminar pregunta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function QuestionOptionsEditor({
  question,
  qIdx,
  onUpdateOption,
  onSetSingleCorrect,
  onAddOption,
  onRemoveOption,
  onSaveOptions,
}: {
  question: QuizQuestion;
  qIdx: number;
  onUpdateOption: (qIdx: number, oIdx: number, patch: Partial<QuizOption>) => void;
  onSetSingleCorrect: (qIdx: number, oIdx: number) => void;
  onAddOption: (qIdx: number) => void;
  onRemoveOption: (qIdx: number, oIdx: number) => void;
  onSaveOptions: (qIdx: number) => void;
}) {
  if (question.question_type === "short_answer") {
    return (
      <div
        className="text-xs p-2 rounded-lg"
        style={{ backgroundColor: "#F8F9FA", color: "#6B7A8D" }}
      >
        Las respuestas cortas se califican manualmente. No se requieren opciones.
      </div>
    );
  }

  return (
    <div
      className="border-t pt-3 space-y-2"
      style={{ borderColor: "#E8EAED" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "#6B7A8D" }}>
          Opciones
        </span>
        <div className="flex items-center gap-2">
          {question._optionsDirty && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              Sin guardar
            </span>
          )}
          <button
            onClick={() => onSaveOptions(qIdx)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-white"
            style={{ backgroundColor: "#4A8A2C" }}
          >
            <Save className="w-3 h-3" /> Guardar opciones
          </button>
        </div>
      </div>

      {question.question_type === "true_false" ? (
        <div className="space-y-1.5">
          {question.options.map((o, oIdx) => (
            <label
              key={oIdx}
              className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer"
              style={{
                borderColor: o.is_correct ? "#4A8A2C" : "#E8EAED",
                backgroundColor: o.is_correct ? "#F0F8EA" : "#fff",
              }}
            >
              <input
                type="radio"
                checked={o.is_correct}
                onChange={() => onSetSingleCorrect(qIdx, oIdx)}
              />
              <span className="text-sm font-medium" style={{ color: "#1A2332" }}>
                {o.option_text}
              </span>
            </label>
          ))}
        </div>
      ) : question.question_type === "multiple_choice" ? (
        <div className="space-y-1.5">
          {question.options.map((o, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <input
                type="radio"
                checked={o.is_correct}
                onChange={() => onSetSingleCorrect(qIdx, oIdx)}
              />
              <input
                value={o.option_text}
                onChange={(e) =>
                  onUpdateOption(qIdx, oIdx, { option_text: e.target.value })
                }
                placeholder={`Opción ${oIdx + 1}`}
                className="flex-1 px-2 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "#E8EAED" }}
              />
              <button
                onClick={() => onRemoveOption(qIdx, oIdx)}
                className="p-1 rounded hover:bg-red-50"
                style={{ color: "#DC2626" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onAddOption(qIdx)}
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: "#0099DC" }}
          >
            <Plus className="w-3 h-3" /> Añadir opción
          </button>
        </div>
      ) : question.question_type === "ordering" ? (
        <div className="space-y-1.5">
          {question.options.map((o, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: "#6B7A8D" }}
              >
                {oIdx + 1}
              </span>
              <input
                value={o.option_text}
                onChange={(e) =>
                  onUpdateOption(qIdx, oIdx, { option_text: e.target.value })
                }
                placeholder={`Elemento ${oIdx + 1}`}
                className="flex-1 px-2 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "#E8EAED" }}
              />
              <button
                onClick={() => onRemoveOption(qIdx, oIdx)}
                className="p-1 rounded hover:bg-red-50"
                style={{ color: "#DC2626" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onAddOption(qIdx)}
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: "#0099DC" }}
          >
            <Plus className="w-3 h-3" /> Añadir elemento
          </button>
        </div>
      ) : question.question_type === "matching" ? (
        <div className="space-y-1.5">
          {question.options.map((o, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <input
                value={o.option_text}
                onChange={(e) =>
                  onUpdateOption(qIdx, oIdx, { option_text: e.target.value })
                }
                placeholder="Término"
                className="flex-1 px-2 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "#E8EAED" }}
              />
              <span className="text-xs" style={{ color: "#6B7A8D" }}>
                →
              </span>
              <input
                value={o.match_target ?? ""}
                onChange={(e) =>
                  onUpdateOption(qIdx, oIdx, { match_target: e.target.value })
                }
                placeholder="Coincidencia"
                className="flex-1 px-2 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "#E8EAED" }}
              />
              <button
                onClick={() => onRemoveOption(qIdx, oIdx)}
                className="p-1 rounded hover:bg-red-50"
                style={{ color: "#DC2626" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onAddOption(qIdx)}
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: "#0099DC" }}
          >
            <Plus className="w-3 h-3" /> Añadir par
          </button>
        </div>
      ) : null}
    </div>
  );
}
