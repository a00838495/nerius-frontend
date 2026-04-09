import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle, XCircle, RotateCcw, ArrowRight, Loader2,
  HelpCircle, MessageSquare,
} from "lucide-react";
import type { Quiz, QuizSubmitResult } from "../types/quiz";

interface GradedOption {
  id: string;
  option_text: string;
  sort_order: number;
  match_target: string | null;
  is_correct: boolean;
}

interface GradedQuestion {
  id: string;
  question_type: string;
  question_text: string;
  explanation: string | null;
  points: number;
  sort_order: number;
  options: GradedOption[];
}

interface GradedResponse {
  id: string;
  question_id: string;
  selected_option_id: string | null;
  text_response: string | null;
  ordering_response: string[] | null;
  matching_response: Record<string, string> | null;
  is_correct: boolean | null;
  points_earned: number | null;
}

interface AttemptDetail {
  score: number | null;
  passed: boolean | null;
  responses: GradedResponse[];
  questions: GradedQuestion[];
}

interface QuizResultProps {
  result: QuizSubmitResult;
  quiz: Quiz;
  courseId: string;
  onRetry: () => void;
  onContinue: () => void;
  canRetry: boolean;
}

export default function QuizResult({
  result,
  quiz,
  courseId,
  onRetry,
  onContinue,
  canRetry,
}: QuizResultProps) {
  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Use detail from backend as source of truth when available
  const actualScore = detail?.score ?? result.attempt.score ?? 0;
  const actualPassed = detail?.passed ?? result.passed;
  const totalPoints = detail
    ? detail.questions.reduce((s, q) => s + q.points, 0)
    : result.total_points;
  const earnedPoints = detail
    ? detail.responses.reduce((s, r) => s + (r.points_earned ?? 0), 0)
    : result.earned_points;
  const percentage = Math.round(actualScore);
  const passed = actualPassed;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  // Fetch graded detail
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/v1/courses/${courseId}/quiz-attempts/${result.attempt.id}`,
          { credentials: "include" }
        );
        if (res.ok) {
          setDetail(await res.json());
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, result.attempt.id]);

  const responseMap = new Map(
    detail?.responses.map((r) => [r.question_id, r]) ?? []
  );

  const sortedQuestions = [...(detail?.questions ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 4px 24px rgba(28, 58, 92, 0.10)" }}
    >
      {/* Score Header */}
      <div
        className="flex flex-col sm:flex-row items-center gap-6 p-8"
        style={{
          background: passed
            ? "linear-gradient(135deg, rgba(74,138,44,0.06), rgba(74,138,44,0.02))"
            : "linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02))",
          borderBottom: `2px solid ${passed ? "rgba(74,138,44,0.15)" : "rgba(220,38,38,0.15)"}`,
        }}
      >
        {/* Circular score */}
        <div className="relative flex h-28 w-28 items-center justify-center shrink-0">
          <svg className="absolute inset-0" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(28, 58, 92, 0.08)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={passed ? "#4A8A2C" : "#DC2626"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-2xl font-extrabold"
            style={{ color: passed ? "#4A8A2C" : "#DC2626" }}
          >
            {percentage}%
          </motion.span>
        </div>

        <div className="text-center sm:text-left flex-1">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-2"
            style={{ background: passed ? "#4A8A2C" : "#DC2626" }}
          >
            {passed ? <><CheckCircle size={14} /> Aprobado</> : <><XCircle size={14} /> Reprobado</>}
          </div>
          <p className="text-base font-medium" style={{ color: "#1C3A5C" }}>
            {earnedPoints} / {totalPoints} puntos
          </p>
          {!passed && (
            <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>
              Necesitas {quiz.passing_score}% para aprobar
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 shrink-0">
          {percentage < 100 && canRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
            >
              <RotateCcw size={14} /> Reintentar
            </button>
          )}
          {passed && (
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #4A8A2C 0%, #3a6e22 100%)" }}
            >
              Continuar <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Graded Questions */}
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "#1C3A5C" }}>
          <MessageSquare size={16} color="#0099DC" />
          Retroalimentación por pregunta
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin" style={{ color: "#0099DC" }} />
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQuestions.map((q, i) => {
              const resp = responseMap.get(q.id);
              const isCorrect = resp?.is_correct;
              const pointsEarned = resp?.points_earned ?? 0;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="rounded-xl p-4"
                  style={{
                    border: `1px solid ${isCorrect === true ? "rgba(74,138,44,0.2)" : isCorrect === false ? "rgba(220,38,38,0.2)" : "rgba(0,153,220,0.15)"}`,
                    background: isCorrect === true ? "rgba(74,138,44,0.03)" : isCorrect === false ? "rgba(220,38,38,0.03)" : "rgba(0,153,220,0.02)",
                  }}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 mt-0.5">
                      {isCorrect === true ? (
                        <CheckCircle size={16} style={{ color: "#4A8A2C" }} />
                      ) : isCorrect === false ? (
                        <XCircle size={16} style={{ color: "#DC2626" }} />
                      ) : (
                        <HelpCircle size={16} style={{ color: "#0099DC" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#1C3A5C" }}>
                        <span style={{ color: "#9AA5B4" }}>{i + 1}.</span> {q.question_text}
                      </p>
                      <span className="text-xs" style={{ color: "#9AA5B4" }}>
                        {pointsEarned}/{q.points} pts · {q.question_type.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* User's answer vs correct */}
                  {(q.question_type === "multiple_choice" || q.question_type === "true_false") && (
                    <div className="ml-6 space-y-1 mt-2">
                      {q.options.map((opt) => {
                        const wasSelected = resp?.selected_option_id === opt.id;
                        // Only reveal correct answer if quiz was passed or this specific answer was correct
                        const showAsCorrect = passed && opt.is_correct;
                        const showAsWrong = wasSelected && !opt.is_correct;
                        return (
                          <div
                            key={opt.id}
                            className="flex items-center gap-2 text-xs rounded-lg px-3 py-1.5"
                            style={{
                              backgroundColor: showAsCorrect
                                ? "rgba(74,138,44,0.08)"
                                : showAsWrong
                                ? "rgba(220,38,38,0.08)"
                                : wasSelected && opt.is_correct
                                ? "rgba(74,138,44,0.08)"
                                : "transparent",
                              fontWeight: wasSelected || showAsCorrect ? 600 : 400,
                              color: showAsCorrect ? "#4A8A2C"
                                : wasSelected && opt.is_correct ? "#4A8A2C"
                                : showAsWrong ? "#DC2626"
                                : "#6B7A8D",
                            }}
                          >
                            {showAsCorrect || (wasSelected && opt.is_correct) ? (
                              <CheckCircle size={12} />
                            ) : showAsWrong ? (
                              <XCircle size={12} />
                            ) : (
                              <span className="w-3" />
                            )}
                            {opt.option_text}
                            {showAsWrong && (
                              <span className="ml-auto text-[10px]" style={{ color: "#DC2626" }}>
                                {passed ? "Tu respuesta" : "Incorrecto"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.question_type === "short_answer" && resp?.text_response && (
                    <div className="ml-6 mt-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "rgba(0,153,220,0.06)", color: "#1C3A5C" }}>
                      <span style={{ color: "#9AA5B4" }}>Tu respuesta:</span> {resp.text_response}
                    </div>
                  )}

                  {q.question_type === "ordering" && (
                    <div className="ml-6 mt-2 space-y-1">
                      {(resp?.ordering_response ?? []).map((optId, idx) => {
                        const opt = q.options.find((o) => o.id === optId);
                        const correctAtIdx = q.options.find((o) => o.sort_order === idx + 1);
                        const isRight = correctAtIdx?.id === optId;
                        return (
                          <div key={optId} className="flex items-center gap-2 text-xs rounded-lg px-3 py-1.5" style={{
                            backgroundColor: isRight ? "rgba(74,138,44,0.08)" : "rgba(220,38,38,0.08)",
                            color: isRight ? "#4A8A2C" : "#DC2626",
                          }}>
                            <span className="font-bold w-5">{idx + 1}.</span>
                            {opt?.option_text ?? optId}
                            {!isRight && !passed && (
                              <span className="ml-auto text-[10px]" style={{ color: "#DC2626" }}>Incorrecto</span>
                            )}
                            {!isRight && passed && correctAtIdx && (
                              <span className="ml-auto text-[10px]" style={{ color: "#4A8A2C" }}>→ {correctAtIdx.option_text}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.question_type === "matching" && resp?.matching_response && (
                    <div className="ml-6 mt-2 space-y-1">
                      {q.options.map((opt) => {
                        const userMatch = resp.matching_response?.[opt.id];
                        const isRight = userMatch === opt.match_target;
                        return (
                          <div key={opt.id} className="flex items-center gap-2 text-xs rounded-lg px-3 py-1.5" style={{
                            backgroundColor: isRight ? "rgba(74,138,44,0.08)" : "rgba(220,38,38,0.08)",
                            color: isRight ? "#4A8A2C" : "#DC2626",
                          }}>
                            <span className="font-semibold">{opt.option_text}</span>
                            <span>→</span>
                            <span>{userMatch || "—"}</span>
                            {!isRight && !passed && (
                              <span className="ml-auto text-[10px]" style={{ color: "#DC2626" }}>Incorrecto</span>
                            )}
                            {!isRight && passed && (
                              <span className="ml-auto text-[10px]" style={{ color: "#4A8A2C" }}>Correcto: {opt.match_target}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation — only show if passed */}
                  {q.explanation && passed && (
                    <div className="ml-6 mt-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "rgba(229,168,0,0.06)", color: "#1C3A5C", borderLeft: "3px solid #E5A800" }}>
                      {q.explanation}
                    </div>
                  )}
                  {/* Hint for failed — encourage retry */}
                  {isCorrect === false && !passed && (
                    <div className="ml-6 mt-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "rgba(220,38,38,0.04)", color: "#9AA5B4" }}>
                      Revisa el material de la lección e intenta de nuevo
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </motion.div>
  );
}
