import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Clock, Send, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import type { Quiz, QuizQuestion, QuizResponseSubmit, QuizSubmitResult } from "../types/quiz";

interface QuizViewProps {
  quiz: Quiz;
  attemptId: string;
  courseId: string;
  onSubmit: (result: QuizSubmitResult) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function QuizView({ quiz, attemptId, courseId, onSubmit }: QuizViewProps) {
  const [responses, setResponses] = useState<Record<string, QuizResponseSubmit>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.time_limit_seconds ?? null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoSubmitted = useRef(false);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);

  const sortedQuestions = [...quiz.questions].sort((a, b) => a.sort_order - b.sort_order);

  // Load saved responses on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/v1/courses/${courseId}/quiz-attempts/${attemptId}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.responses && data.responses.length > 0) {
            const saved: Record<string, QuizResponseSubmit> = {};
            for (const r of data.responses) {
              saved[r.question_id] = {
                question_id: r.question_id,
                selected_option_id: r.selected_option_id ?? null,
                text_response: r.text_response ?? null,
                ordering_response: r.ordering_response ?? null,
                matching_response: r.matching_response ?? null,
              };
            }
            setResponses(saved);
          }
        }
      } catch {
        // no saved responses, start fresh
      } finally {
        setLoaded(true);
      }
    })();
  }, [courseId, attemptId]);

  // Auto-save responses with debounce (3 seconds after last change)
  useEffect(() => {
    if (!loaded) return;
    const values = Object.values(responses);
    if (values.length === 0) return;

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      try {
        await fetch(
          `/api/v1/courses/${courseId}/quiz-attempts/${attemptId}/responses`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responses: values }),
          }
        );
      } catch {
        // silent
      }
    }, 3000);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [responses, loaded, courseId, attemptId]);

  const allAnswered = sortedQuestions.every((q) => {
    const r = responses[q.id];
    if (!r) return false;
    switch (q.question_type) {
      case "multiple_choice":
      case "true_false":
        return !!r.selected_option_id;
      case "short_answer":
        return !!r.text_response?.trim();
      case "ordering":
        return r.ordering_response && r.ordering_response.length === q.options.length;
      case "matching":
        return r.matching_response && Object.keys(r.matching_response).length === q.options.length;
      default:
        return false;
    }
  });

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = Object.values(responses);
      const res = await fetch(
        `/api/v1/courses/${courseId}/quiz-attempts/${attemptId}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: payload }),
        }
      );
      if (!res.ok) throw new Error("Error al enviar quiz");
      const result: QuizSubmitResult = await res.json();
      onSubmit(result);
    } catch {
      setSubmitting(false);
    }
  }, [responses, courseId, attemptId, onSubmit, submitting]);

  // Timer
  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft === null]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeLeft === 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      doSubmit();
    }
  }, [timeLeft, doSubmit]);

  const updateResponse = (questionId: string, partial: Partial<QuizResponseSubmit>) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], question_id: questionId, ...partial },
    }));
  };

  const handleOrdering = (question: QuizQuestion, fromIdx: number, toIdx: number) => {
    const current =
      responses[question.id]?.ordering_response ??
      [...question.options].sort((a, b) => a.sort_order - b.sort_order).map((o) => o.id);
    const updated = [...current];
    const [item] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, item);
    updateResponse(question.id, { ordering_response: updated });
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const bgColor = index % 2 === 0 ? "rgba(28, 58, 92, 0.02)" : "rgba(0, 153, 220, 0.03)";

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="rounded-xl p-5"
        style={{ background: bgColor }}
      >
        <div className="mb-1 flex items-baseline gap-2">
          <span
            className="text-xs font-semibold"
            style={{ color: "#0099DC" }}
          >
            Pregunta {index + 1}
          </span>
          <span className="text-xs" style={{ color: "#1C3A5C", opacity: 0.45 }}>
            {question.points} {question.points === 1 ? "punto" : "puntos"}
          </span>
        </div>
        <p className="mb-4 text-sm font-medium leading-relaxed" style={{ color: "#1C3A5C" }}>
          {question.question_text}
        </p>

        {question.question_type === "multiple_choice" && (
          <div className="flex flex-col gap-2">
            {[...question.options]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((opt) => {
                const selected = responses[question.id]?.selected_option_id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateResponse(question.id, { selected_option_id: opt.id })}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all"
                    style={{
                      borderColor: selected ? "#0099DC" : "rgba(28, 58, 92, 0.1)",
                      background: selected ? "rgba(0, 153, 220, 0.06)" : "white",
                      color: "#1C3A5C",
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: selected ? "#0099DC" : "rgba(28, 58, 92, 0.25)",
                      }}
                    >
                      {selected && (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: "#0099DC" }}
                        />
                      )}
                    </span>
                    {opt.option_text}
                  </button>
                );
              })}
          </div>
        )}

        {question.question_type === "true_false" && (
          <div className="flex gap-3">
            {question.options.map((opt) => {
              const optId = opt.id;
              const selected = responses[question.id]?.selected_option_id === optId;
              const label = opt.option_text;
              return (
                <button
                  key={optId}
                  onClick={() => updateResponse(question.id, { selected_option_id: optId })}
                  className="flex-1 rounded-xl border-2 py-3 text-center text-sm font-semibold transition-all"
                  style={{
                    borderColor: selected ? "#0099DC" : "rgba(28, 58, 92, 0.1)",
                    background: selected ? "rgba(0, 153, 220, 0.08)" : "white",
                    color: selected ? "#0099DC" : "#1C3A5C",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {question.question_type === "short_answer" && (
          <textarea
            rows={3}
            value={responses[question.id]?.text_response ?? ""}
            onChange={(e) => updateResponse(question.id, { text_response: e.target.value })}
            placeholder="Escribe tu respuesta..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:border-[#0099DC]"
            style={{
              borderColor: "rgba(28, 58, 92, 0.12)",
              color: "#1C3A5C",
            }}
          />
        )}

        {question.question_type === "ordering" && (() => {
          const currentOrder =
            responses[question.id]?.ordering_response ??
            [...question.options].sort((a, b) => a.sort_order - b.sort_order).map((o) => o.id);
          const optionsMap = Object.fromEntries(question.options.map((o) => [o.id, o]));
          return (
            <div className="flex flex-col gap-2">
              {currentOrder.map((optId, idx) => (
                <div
                  key={optId}
                  className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm"
                  style={{ borderColor: "rgba(28, 58, 92, 0.1)", color: "#1C3A5C" }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{ background: "#0099DC" }}
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1">{optionsMap[optId]?.option_text}</span>
                  <div className="flex flex-col">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleOrdering(question, idx, idx - 1)}
                      className="rounded p-0.5 transition-colors hover:bg-black/5 disabled:opacity-25"
                    >
                      <ChevronUp size={14} style={{ color: "#1C3A5C" }} />
                    </button>
                    <button
                      disabled={idx === currentOrder.length - 1}
                      onClick={() => handleOrdering(question, idx, idx + 1)}
                      className="rounded p-0.5 transition-colors hover:bg-black/5 disabled:opacity-25"
                    >
                      <ChevronDown size={14} style={{ color: "#1C3A5C" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {question.question_type === "matching" && (() => {
          const matchTargets = [...new Set(question.options.map((o) => o.match_target).filter(Boolean))] as string[];
          const currentMatching = responses[question.id]?.matching_response ?? {};
          return (
            <div className="flex flex-col gap-2">
              {[...question.options]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-3 rounded-lg border bg-white px-4 py-2.5"
                    style={{ borderColor: "rgba(28, 58, 92, 0.1)" }}
                  >
                    <span className="flex-1 text-sm" style={{ color: "#1C3A5C" }}>
                      {opt.option_text}
                    </span>
                    <select
                      value={currentMatching[opt.id] ?? ""}
                      onChange={(e) => {
                        const updated = { ...currentMatching, [opt.id]: e.target.value };
                        updateResponse(question.id, { matching_response: updated });
                      }}
                      className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-[#0099DC]"
                      style={{
                        borderColor: "rgba(28, 58, 92, 0.15)",
                        color: "#1C3A5C",
                        minWidth: 160,
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {matchTargets.map((target) => (
                        <option key={target} value={target}>
                          {target}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          );
        })()}
      </motion.div>
    );
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin" style={{ color: "#0099DC" }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 4px 24px rgba(28, 58, 92, 0.10)" }}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#1C3A5C" }}>
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="mt-1 text-sm" style={{ color: "#1C3A5C", opacity: 0.6 }}>
              {quiz.description}
            </p>
          )}
        </div>
        {timeLeft !== null && (
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={{
              background: timeLeft < 60 ? "rgba(220, 38, 38, 0.08)" : "rgba(0, 153, 220, 0.08)",
              color: timeLeft < 60 ? "#DC2626" : "#0099DC",
            }}
          >
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <p className="mb-4 text-xs font-medium" style={{ color: "#1C3A5C", opacity: 0.5 }}>
        {sortedQuestions.length} {sortedQuestions.length === 1 ? "pregunta" : "preguntas"} &middot;{" "}
        {Object.keys(responses).length} de {sortedQuestions.length} respondidas
      </p>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {sortedQuestions.map((q, i) => renderQuestion(q, i))}
      </div>

      {/* Submit */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={doSubmit}
          disabled={!allAnswered || submitting}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send size={16} />
              Enviar Quiz
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
