import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, PlayCircle, RotateCcw, Loader2, Eye } from "lucide-react";
import type { Quiz, QuizAttemptSummary, QuizSubmitResult } from "../types/quiz";
import QuizView from "./QuizView";
import QuizResult from "./QuizResult";

interface QuizGateProps {
  courseId: string;
  lessonId: string;
  onQuizPassed: () => void;
}

type GateState =
  | "loading"
  | "no_quiz"
  | "passed"
  | "failed_with_retries"
  | "failed_no_retries"
  | "not_started"
  | "in_progress"
  | "taking"
  | "result"
  | "reviewing";

export default function QuizGate({ courseId, lessonId, onQuizPassed }: QuizGateProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [gateState, setGateState] = useState<GateState>("loading");
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(null);

  const determineState = useCallback(
    (q: Quiz, atts: QuizAttemptSummary[]) => {
      const passedAttempt = atts.find((a) => a.passed === true);
      if (passedAttempt) {
        setGateState("passed");
        return;
      }

      const inProgressAttempt = atts.find((a) => a.status === "in_progress");
      if (inProgressAttempt) {
        setCurrentAttemptId(inProgressAttempt.id);
        setGateState("in_progress");
        return;
      }

      const completedAttempts = atts.filter(
        (a) => a.status === "completed" || a.status === "timed_out"
      );
      if (completedAttempts.length === 0) {
        setGateState("not_started");
        return;
      }

      if (q.max_attempts !== null && completedAttempts.length >= q.max_attempts) {
        setGateState("failed_no_retries");
      } else {
        setGateState("failed_with_retries");
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const quizRes = await fetch(
          `/api/v1/courses/${courseId}/lessons/${lessonId}/quiz`,
          { credentials: "include" }
        );
        if (!quizRes.ok) {
          if (!cancelled) setGateState("no_quiz");
          return;
        }
        const quizData: Quiz = await quizRes.json();
        if (cancelled) return;
        setQuiz(quizData);

        const attemptsRes = await fetch(
          `/api/v1/courses/${courseId}/lessons/${lessonId}/quiz/attempts`,
          { credentials: "include" }
        );
        const attemptsData: QuizAttemptSummary[] = attemptsRes.ok
          ? await attemptsRes.json()
          : [];
        if (cancelled) return;
        setAttempts(attemptsData);
        determineState(quizData, attemptsData);
      } catch {
        if (!cancelled) setGateState("no_quiz");
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, lessonId, determineState]);

  const startAttempt = async () => {
    if (!quiz) return;
    try {
      const res = await fetch(
        `/api/v1/courses/${courseId}/lessons/${lessonId}/quiz/attempts`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Error al iniciar intento");
      const attempt: QuizAttemptSummary = await res.json();
      setCurrentAttemptId(attempt.id);
      setGateState("taking");
    } catch {
      // silently fail
    }
  };

  const handleSubmitResult = (result: QuizSubmitResult) => {
    setSubmitResult(result);
    setAttempts((prev) => [...prev, result.attempt]);
    setGateState("result");
    // Don't call onQuizPassed here — wait for user to click "Continuar"
  };

  const handleRetry = () => {
    setSubmitResult(null);
    startAttempt();
  };

  const handleContinue = () => {
    setGateState("passed");
    onQuizPassed();
  };

  const reviewLastAttempt = () => {
    if (!quiz || !lastAttempt) return;
    // Build a QuizSubmitResult from the last attempt to show in QuizResult
    setSubmitResult({
      attempt: lastAttempt,
      total_points: quiz.questions.reduce((s, q) => s + q.points, 0),
      earned_points: (lastAttempt.score ?? 0) / 100 * quiz.questions.reduce((s, q) => s + q.points, 0),
      passed: lastAttempt.passed ?? false,
    });
    setGateState("reviewing");
  };

  const lastAttempt = [...attempts]
    .filter((a) => a.status === "completed" || a.status === "timed_out")
    .sort((a, b) => b.attempt_number - a.attempt_number)[0];

  if (gateState === "loading") {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 size={20} className="animate-spin" style={{ color: "#0099DC" }} />
      </div>
    );
  }

  if (gateState === "no_quiz") return null;

  if (gateState === "taking" && quiz && currentAttemptId) {
    return (
      <QuizView
        quiz={quiz}
        attemptId={currentAttemptId}
        courseId={courseId}
        onSubmit={handleSubmitResult}
      />
    );
  }

  const completedCount = attempts.filter(
    (a) => a.status === "completed" || a.status === "timed_out"
  ).length;
  const canRetry = quiz
    ? quiz.max_attempts === null || completedCount < quiz.max_attempts
    : false;

  if ((gateState === "result" || gateState === "reviewing") && submitResult && quiz) {
    return (
      <QuizResult
        result={submitResult}
        quiz={quiz}
        courseId={courseId}
        onRetry={handleRetry}
        onContinue={gateState === "result" ? handleContinue : () => setGateState("passed")}
        canRetry={canRetry}
      />
    );
  }

  const remainingAttempts =
    quiz?.max_attempts !== null && quiz?.max_attempts !== undefined
      ? quiz.max_attempts - completedCount
      : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gateState}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-xl border p-4"
        style={{
          borderColor:
            gateState === "passed"
              ? "rgba(74, 138, 44, 0.25)"
              : gateState === "failed_no_retries"
              ? "rgba(220, 38, 38, 0.2)"
              : "rgba(0, 153, 220, 0.15)",
          background:
            gateState === "passed"
              ? "rgba(74, 138, 44, 0.04)"
              : gateState === "failed_no_retries"
              ? "rgba(220, 38, 38, 0.03)"
              : "rgba(0, 153, 220, 0.03)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {gateState === "passed" && (
              <>
                <CheckCircle size={20} style={{ color: "#4A8A2C" }} />
                <div>
                  <span className="text-sm font-semibold" style={{ color: "#4A8A2C" }}>
                    Quiz aprobado
                  </span>
                  {lastAttempt?.score !== null && lastAttempt?.score !== undefined && (
                    <span className="ml-2 text-xs" style={{ color: "#4A8A2C", opacity: 0.7 }}>
                      {lastAttempt.score}%
                    </span>
                  )}
                </div>
              </>
            )}

            {gateState === "failed_with_retries" && (
              <>
                <XCircle size={20} style={{ color: "#E5A800" }} />
                <div>
                  <span className="text-sm font-semibold" style={{ color: "#1C3A5C" }}>
                    Quiz reprobado
                  </span>
                  {lastAttempt?.score !== null && lastAttempt?.score !== undefined && (
                    <span className="ml-2 text-xs" style={{ color: "#1C3A5C", opacity: 0.5 }}>
                      {lastAttempt.score}%
                    </span>
                  )}
                  {remainingAttempts !== null && (
                    <p className="text-xs" style={{ color: "#1C3A5C", opacity: 0.5 }}>
                      {remainingAttempts} {remainingAttempts === 1 ? "intento restante" : "intentos restantes"}
                    </p>
                  )}
                </div>
              </>
            )}

            {gateState === "failed_no_retries" && (
              <>
                <XCircle size={20} style={{ color: "#DC2626" }} />
                <span className="text-sm font-semibold" style={{ color: "#DC2626" }}>
                  Sin intentos restantes
                </span>
              </>
            )}

            {gateState === "not_started" && (
              <>
                <PlayCircle size={20} style={{ color: "#0099DC" }} />
                <span className="text-sm font-semibold" style={{ color: "#1C3A5C" }}>
                  {quiz?.title ?? "Quiz"}
                </span>
              </>
            )}

            {gateState === "in_progress" && (
              <>
                <PlayCircle size={20} style={{ color: "#E5A800" }} />
                <span className="text-sm font-semibold" style={{ color: "#1C3A5C" }}>
                  Quiz en progreso
                </span>
              </>
            )}
          </div>

          <div>
            {gateState === "not_started" && (
              <button
                onClick={startAttempt}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
              >
                <PlayCircle size={14} />
                Tomar Quiz
              </button>
            )}

            {gateState === "in_progress" && (
              <button
                onClick={() => setGateState("taking")}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #E5A800 0%, #1C3A5C 100%)" }}
              >
                <PlayCircle size={14} />
                Continuar Quiz
              </button>
            )}

            {gateState === "failed_with_retries" && (
              <button
                onClick={startAttempt}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
              >
                <RotateCcw size={14} />
                Reintentar
              </button>
            )}

            {(gateState === "passed" || gateState === "failed_no_retries") && lastAttempt && (
              <button
                onClick={reviewLastAttempt}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-transform hover:scale-[1.02]"
                style={{ background: "rgba(0,153,220,0.1)", color: "#0099DC" }}
              >
                <Eye size={14} />
                Ver Quiz
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
