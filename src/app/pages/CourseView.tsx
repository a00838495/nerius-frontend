import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Headphones,
  Clock,
  BookOpen,
  X,
  LayoutList,
} from "lucide-react";
import { toast } from "sonner";
import { Sparkles, Bookmark, Award } from "lucide-react";
import { BadgeCelebrationOverlay } from "../components/BadgeCelebrationOverlay";
import QuizGate from "../components/QuizGate";
import CertificationCard from "../components/CertificationCard";
import { ClipboardCheck } from "lucide-react";
import type { EarnedBadge, LessonProgressResponse } from "../types/badges";
import type { GemCard as GemCardType } from "../types/gems";

interface Resource {
  id: string;
  resource_type: "video" | "pdf" | "slide" | "podcast";
  title: string;
  external_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  estimated_minutes: number;
  status: "not_started" | "in_progress" | "completed";
  progress_percent?: number | null;
  has_quiz?: boolean;
}

interface LessonDetail {
  id: string;
  title: string;
  description?: string;
  resources: Resource[];
  progress?: {
    lesson_id: string;
    status: "not_started" | "in_progress" | "completed";
    progress_percent: number;
    time_spent_seconds?: number;
    completed_at?: string;
    last_activity_at?: string;
  };
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  progress_percent?: number | null;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  estimated_minutes: number;
  cover_url?: string;
  enrollment?: Enrollment;
  modules: Module[];
}

export function CourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentLessonDetail, setCurrentLessonDetail] = useState<LessonDetail | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [progressTracking, setProgressTracking] = useState({ startTime: Date.now(), lastUpdate: Date.now() });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [earnedBadgeQueue, setEarnedBadgeQueue] = useState<EarnedBadge[]>([]);
  const [activeEarnedBadge, setActiveEarnedBadge] = useState<EarnedBadge | null>(null);
  const [pendingNavigationAfterBadge, setPendingNavigationAfterBadge] = useState<"next" | "prev" | null>(null);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [lessonGems, setLessonGems] = useState<GemCardType[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [hasCertification, setHasCertification] = useState(false);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousEnrollmentProgressRef = useRef<number | null>(null);

  // Fetch course overview
  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/v1/courses/${courseId}/detailed`);
      if (!response.ok) throw new Error("Failed to fetch course");
      
      const data: CourseDetail = await response.json();
      setCourse(data);
      
      // Set current module and lesson if not set
      if (!currentModuleId && data.modules.length > 0) {
        const firstModule = data.modules[0];
        setCurrentModuleId(firstModule.id);
        setExpandedModules(new Set([firstModule.id]));
        
        // Set first lesson as current
        if (firstModule.lessons.length > 0) {
          const firstLesson = firstModule.lessons[0];
          setCurrentLessonId(firstLesson.id);
          await fetchLessonDetail(firstLesson.id);
        }
      }
      // Check if course has certification
      try {
        const certRes = await fetch(`/api/v1/courses/${courseId}/certification`, { credentials: "include" });
        setHasCertification(certRes.ok);
      } catch {
        setHasCertification(false);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  // Fetch lesson detail with resources
  const fetchLessonDetail = async (lessonId: string) => {
    try {
      setLoadingLesson(true);
      const response = await fetch(`/api/v1/courses/${courseId}/lessons/${lessonId}`);
      if (!response.ok) throw new Error("Failed to fetch lesson");
      
      const data: LessonDetail = await response.json();
      setCurrentLessonDetail(data);

      // Fetch gems associated with this lesson
      try {
        const gemsRes = await fetch(`/api/v1/courses/${courseId}/lessons/${lessonId}/gems`, { credentials: "include" });
        if (gemsRes.ok) {
          const gemsData = await gemsRes.json();
          setLessonGems(Array.isArray(gemsData) ? gemsData : []);
        } else {
          setLessonGems([]);
        }
      } catch {
        setLessonGems([]);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Error al cargar la lección");
    } finally {
      setLoadingLesson(false);
    }
  };

  // Update lesson progress
  const updateProgress = async (progressPercent: number, status: "not_started" | "in_progress" | "completed") => {
    if (!currentLessonId || !courseId) return;
    
    const now = Date.now();
    const timeSpent = Math.floor((now - progressTracking.startTime) / 1000);
    
    try {
      const response = await fetch(`/api/v1/courses/${courseId}/lessons/${currentLessonId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          progress_percent: progressPercent,
          time_spent_seconds: timeSpent,
          status,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to update progress");
      
      const data: LessonProgressResponse = await response.json();

      if (data.earned_badges?.length) {
        setEarnedBadgeQueue(prev => [...prev, ...data.earned_badges!]);
      }
      
      // Update local state with data from backend
      setCourse(prevCourse => {
        if (!prevCourse) {
          return prevCourse;
        }

        return {
          ...prevCourse,
          enrollment: prevCourse.enrollment
            ? {
                ...prevCourse.enrollment,
                progress_percent:
                  data.enrollment_progress_percent !== undefined
                    ? data.enrollment_progress_percent
                    : prevCourse.enrollment.progress_percent,
              }
            : prevCourse.enrollment,
          modules: prevCourse.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === currentLessonId
                ? {
                    ...lesson,
                    progress_percent: data.progress_percent ?? 0,
                    status: data.status,
                  }
                : lesson,
            ),
          })),
        };
      });

      setCurrentLessonDetail(prevLessonDetail => {
        if (!prevLessonDetail || prevLessonDetail.id !== currentLessonId) {
          return prevLessonDetail;
        }

        return {
          ...prevLessonDetail,
          progress: {
            lesson_id: currentLessonId,
            status: data.status,
            progress_percent: data.progress_percent ?? 0,
            time_spent_seconds: data.time_spent_seconds,
            completed_at: data.completed_at,
            last_activity_at: data.last_activity_at,
          },
        };
      });

      setProgressTracking(prev => ({ ...prev, lastUpdate: now }));
      return data;
    } catch (error) {
      console.error("Error updating progress:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!activeEarnedBadge && earnedBadgeQueue.length > 0) {
      const [nextBadge, ...rest] = earnedBadgeQueue;
      setActiveEarnedBadge(nextBadge);
      setEarnedBadgeQueue(rest);
    }
  }, [activeEarnedBadge, earnedBadgeQueue]);

  useEffect(() => {
    if (!activeEarnedBadge && earnedBadgeQueue.length === 0 && pendingNavigationAfterBadge) {
      const direction = pendingNavigationAfterBadge;
      setPendingNavigationAfterBadge(null);
      navigateLesson(direction);
    }
  }, [activeEarnedBadge, earnedBadgeQueue, pendingNavigationAfterBadge]);

  // Auto-save progress every 30 seconds for videos
  useEffect(() => {
    if (currentLessonId && currentLessonDetail) {
      const hasVideo = currentLessonDetail.resources?.some(r => r.resource_type === "video");
      
      if (hasVideo) {
        progressIntervalRef.current = setInterval(() => {
          const currentProgress = currentLessonDetail.progress?.progress_percent ?? 0;
          if (currentProgress < 100) {
            updateProgress(currentProgress, "in_progress");
          }
        }, 30000); // Every 30 seconds
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentLessonId, currentLessonDetail]);

  // Initial fetch
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  useEffect(() => {
    setShowCompletionCelebration(false);
    previousEnrollmentProgressRef.current = null;
  }, [courseId]);

  useEffect(() => {
    if (!course?.enrollment) {
      return;
    }

    const currentEnrollmentProgress = course.enrollment.progress_percent ?? 0;
    const previousEnrollmentProgress = previousEnrollmentProgressRef.current;

    if (
      previousEnrollmentProgress !== null &&
      previousEnrollmentProgress < 100 &&
      currentEnrollmentProgress >= 100
    ) {
      setShowCompletionCelebration(true);
    }

    previousEnrollmentProgressRef.current = currentEnrollmentProgress;
  }, [course?.enrollment?.id, course?.enrollment?.progress_percent]);

  // Navigate to lesson
  const navigateToLesson = async (moduleId: string, lessonId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
    setProgressTracking({ startTime: Date.now(), lastUpdate: Date.now() });
    
    // Expand the module
    setExpandedModules(prev => new Set([...prev, moduleId]));
    
    // Fetch lesson detail with resources
    await fetchLessonDetail(lessonId);
  };

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Get current lesson from course overview
  const getCurrentLesson = (): Lesson | null => {
    if (!course || !currentLessonId) return null;
    
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === currentLessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  // Get all modules
  const getAllModules = (): Module[] => {
    if (!course) return [];
    return course.modules;
  };

  // Navigate to next/previous lesson
  const navigateLesson = (direction: "next" | "prev") => {
    if (!course || !currentModuleId || !currentLessonId) return;
    
    const allModules = getAllModules();
    const currentModuleIndex = allModules.findIndex(m => m.id === currentModuleId);
    const currentModule = allModules[currentModuleIndex];
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
    
    if (direction === "next") {
      // Try next lesson in current module
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        navigateToLesson(currentModuleId, currentModule.lessons[currentLessonIndex + 1].id);
      } else if (currentModuleIndex < allModules.length - 1) {
        // Move to next module, first lesson
        const nextModule = allModules[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) {
          navigateToLesson(nextModule.id, nextModule.lessons[0].id);
        }
      }
    } else {
      // Try previous lesson in current module
      if (currentLessonIndex > 0) {
        navigateToLesson(currentModuleId, currentModule.lessons[currentLessonIndex - 1].id);
      } else if (currentModuleIndex > 0) {
        // Move to previous module, last lesson
        const prevModule = allModules[currentModuleIndex - 1];
        navigateToLesson(prevModule.id, prevModule.lessons[prevModule.lessons.length - 1].id);
      }
    }
  };

  // Mark lesson as complete
  const markComplete = async () => {
    if (!currentLessonDetail) return;
    
    const progressResult = await updateProgress(100, "completed");
    toast.success("¡Lección completada!");

    if (progressResult?.earned_badges?.length) {
      setPendingNavigationAfterBadge("next");
      return;
    }

    setTimeout(() => {
      navigateLesson("next");
    }, 1000);
  };

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Curso no encontrado</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Check if course is 100% complete
  const isCourseCompleted = course.enrollment && (course.enrollment.progress_percent ?? 0) >= 100;

  if (isCourseCompleted && showCompletionCelebration) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center max-w-2xl px-8"
        >
          {/* Course image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            {course.cover_url && (
              <img
                src={course.cover_url}
                alt={course.title}
                className="w-full max-w-4xl h-64 sm:h-80 md:h-96 object-cover rounded-xl shadow-xl"
              />
            )}
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            ¡Felicitaciones! 🎓
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-gray-700 mb-2"
          >
            Has completado el curso
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-semibold text-[#0099DC] mb-6"
          >
            "{course.title}"
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-gray-600 mb-8 text-lg"
          >
            Has demostrado dedicación y esfuerzo. ¡Sigue aprendiendo y creciendo!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={() => setShowCompletionCelebration(false)}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Repasar curso
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Explorar más cursos
            </button>
            <button
              onClick={() => navigate("/progress")}
              className="px-6 py-3 bg-white text-[#0099DC] border-2 border-[#0099DC] rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Ver mi progreso
            </button>
          </motion.div>
        </motion.div>

        {/* Badge celebration overlay on top of completion screen */}
        <BadgeCelebrationOverlay
          badge={activeEarnedBadge}
          hasMoreBadges={earnedBadgeQueue.length > 0}
          onClose={() => setActiveEarnedBadge(null)}
        />
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const currentLessonHasQuiz = currentLesson?.has_quiz ?? false;
  const allModules = getAllModules();
  const sidebarContent = (
    <>
      <div className="p-5 xl:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 xl:mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0099DC] transition-colors"
          >
            <ChevronLeft size={16} />
            Volver al Inicio
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors xl:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="text-base xl:text-lg font-bold text-gray-900 line-clamp-2 mb-3 xl:mb-2">
          {course.title}
        </h2>

        {course.enrollment && (
          <div className="space-y-1.5 xl:space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progreso General</span>
              <span className="font-semibold text-[#0099DC]">
                {Math.round(course.enrollment.progress_percent ?? 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 xl:h-2">
              <div
                className="bg-[#0099DC] h-1.5 xl:h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.enrollment.progress_percent ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Certification button */}
        {hasCertification && course.enrollment?.status === "completed" && (
          <button
            onClick={() => setShowCertModal(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #E5A800, #F5D060)",
              color: "#1C3A5C",
              boxShadow: "0 4px 12px rgba(229,168,0,0.25)",
            }}
          >
            <Award size={16} />
            Obtener Certificación
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {allModules.map((module, moduleIndex) => (
          <div key={module.id} className="border-b border-gray-100">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full px-5 py-3.5 xl:px-6 xl:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs xl:text-sm font-semibold text-gray-700 flex-shrink-0">
                  {moduleIndex + 1}
                </div>
                <span className="font-semibold text-sm text-gray-900">{module.title}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform flex-shrink-0 ${
                  expandedModules.has(module.id) ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {expandedModules.has(module.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = lesson.status === "completed";
                    const isInProgress = lesson.status === "in_progress";

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          navigateToLesson(module.id, lesson.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full px-5 py-2.5 pl-14 xl:px-6 xl:py-3 xl:pl-16 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                          isActive ? "bg-blue-50" : ""
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={14} className="text-green-500 flex-shrink-0 xl:w-4 xl:h-4" />
                        ) : isInProgress ? (
                          <Circle size={14} className="text-[#0099DC] flex-shrink-0 fill-current xl:w-4 xl:h-4" />
                        ) : (
                          <Circle size={14} className="text-gray-300 flex-shrink-0 xl:w-4 xl:h-4" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate flex items-center gap-1.5 ${
                            isActive ? "text-[#0099DC]" : "text-gray-700"
                          }`}>
                            {lesson.title}
                            {lesson.has_quiz && (
                              <ClipboardCheck size={12} className="shrink-0" style={{ color: "#E5A800" }} />
                            )}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {lesson.estimated_minutes} min
                          </p>
                        </div>

                        {isActive && (
                          <Play size={12} className="text-[#0099DC] flex-shrink-0 xl:w-[14px] xl:h-[14px]" fill="currentColor" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="h-screen bg-gray-50 overflow-hidden xl:flex">
      <BadgeCelebrationOverlay
        badge={activeEarnedBadge}
        hasMoreBadges={earnedBadgeQueue.length > 0}
        onClose={() => setActiveEarnedBadge(null)}
      />

      {/* Floating Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 xl:hidden"
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col xl:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden xl:flex xl:w-80 xl:bg-white xl:border-r xl:border-gray-200 xl:flex-col xl:overflow-hidden">
        {sidebarContent}
      </div>

      {/* Main Content — Full Width */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {currentLessonDetail ? (
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 md:px-8 xl:px-8 py-4 xl:py-6 flex-shrink-0">
            <div className="max-w-5xl xl:max-w-none mx-auto xl:mx-0 flex items-start gap-4 xl:justify-between">
              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex xl:hidden items-center gap-1.5 px-3 py-2 mt-0.5 text-sm text-gray-600 hover:text-[#0099DC] hover:bg-gray-100 rounded-lg transition-colors font-medium flex-shrink-0"
                title="Ver temario del curso"
              >
                <LayoutList size={18} />
                <span className="hidden sm:inline">Temario</span>
              </button>

              {/* Lesson info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">
                  {currentLessonDetail.title}
                </h1>
                {currentLessonDetail.description && (
                  <p className="text-gray-500 text-sm mt-0.5 xl:line-clamp-none line-clamp-1">{currentLessonDetail.description}</p>
                )}
                <div className="mt-2.5 xl:mt-4 flex flex-wrap items-center gap-3 xl:gap-4">
                  <div className="flex items-center gap-2 min-w-[160px] xl:max-w-md xl:flex-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 xl:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentLessonDetail.progress?.progress_percent ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                      {Math.round(currentLessonDetail.progress?.progress_percent ?? 0)}%
                    </span>
                  </div>

                  {currentLessonDetail.progress?.status !== "completed" ? (
                    <button
                      onClick={markComplete}
                      className="px-3 py-1.5 xl:px-4 xl:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      Completar
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle2 size={15} />
                      Completada
                    </span>
                  )}
                </div>
              </div>

              {/* Overall course progress (desktop) */}
              {course.enrollment && (
                <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 mt-0.5">
                  <span className="text-xs text-gray-500">Curso</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 xl:w-28 bg-gray-200 rounded-full h-1.5 xl:h-2">
                      <div
                        className="bg-[#0099DC] h-1.5 xl:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.enrollment.progress_percent ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#0099DC]">
                      {Math.round(course.enrollment.progress_percent ?? 0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 py-6 xl:py-8 px-4 md:px-8">
            {loadingLesson ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando lección...</p>
                </div>
              </div>
            ) : currentLessonDetail.resources && currentLessonDetail.resources.length > 0 ? (
              <div className="max-w-5xl mx-auto space-y-6">
                {currentLessonDetail.resources.map((resource) => (
                  <ResourceViewer
                    key={resource.id}
                    resource={resource}
                    onProgressUpdate={(percent) =>
                      updateProgress(percent, percent >= 100 ? "completed" : "in_progress")
                    }
                  />
                ))}
              </div>
            ) : currentLessonHasQuiz ? (
              /* Quiz-only lesson: show quiz as the main content */
              <div className="max-w-5xl mx-auto">
                {courseId && currentLessonId && (
                  <QuizGate
                    courseId={courseId}
                    lessonId={currentLessonId}
                    onQuizPassed={() => {
                      if (currentLessonId) fetchLessonDetail(currentLessonId);
                      // Auto-mark lesson as completed
                      updateProgress(100, "completed");
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay recursos disponibles</h3>
                  <p className="text-gray-500">Esta lección no tiene recursos aún.</p>
                </div>
              </div>
            )}

            {/* Quiz Gate for lessons WITH resources (quiz after resources) */}
            {currentLessonDetail.resources && currentLessonDetail.resources.length > 0 && courseId && currentLessonId && (
              <div className="max-w-5xl mx-auto mt-6">
                <QuizGate
                  courseId={courseId}
                  lessonId={currentLessonId}
                  onQuizPassed={() => {
                    if (currentLessonId) fetchLessonDetail(currentLessonId);
                    // Auto-mark lesson as completed
                    updateProgress(100, "completed");
                  }}
                />
              </div>
            )}

            {/* Lesson Gems */}
            {lessonGems.length > 0 && (
              <div className="max-w-5xl mx-auto mt-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(0, 153, 220, 0.1)" }}>
                      <Sparkles size={16} color="#0099DC" />
                    </div>
                    <h3 className="text-sm font-semibold" style={{ color: "#1C3A5C" }}>Gemas sugeridas para esta lección</h3>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {lessonGems.map((gem) => (
                      <button
                        key={gem.id}
                        onClick={() => navigate(`/gems/${gem.id}`)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors shrink-0"
                        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <Sparkles size={14} color="#0099DC" />
                        <span className="text-sm font-medium" style={{ color: "#1C3A5C" }}>{gem.title}</span>
                        {gem.is_saved && <Bookmark size={12} fill="#E5A800" color="#E5A800" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="bg-white border-t border-gray-200 px-4 md:px-8 xl:px-8 py-3 xl:py-4 flex-shrink-0">
            <div className="max-w-5xl xl:max-w-none mx-auto xl:mx-0 flex items-center justify-between">
              <button
                onClick={() => navigateLesson("prev")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#0099DC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  allModules.indexOf(allModules.find(m => m.id === currentModuleId)!) === 0 &&
                  allModules[0].lessons.findIndex(l => l.id === currentLessonId) === 0
                }
              >
                <ChevronLeft size={18} />
                <span className="font-medium hidden sm:inline">Lección Anterior</span>
                <span className="font-medium sm:hidden">Anterior</span>
              </button>

              <button
                onClick={() => navigateLesson("next")}
                className="flex items-center gap-2 px-5 xl:px-6 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  allModules.indexOf(allModules.find(m => m.id === currentModuleId)!) === allModules.length - 1 &&
                  allModules[allModules.length - 1].lessons.findIndex(l => l.id === currentLessonId) === allModules[allModules.length - 1].lessons.length - 1
                }
              >
                <span className="font-medium hidden sm:inline">Siguiente Lección</span>
                <span className="font-medium sm:hidden">Siguiente</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Selecciona una lección para comenzar</p>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex xl:hidden items-center gap-2 px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity mx-auto"
            >
              <LayoutList size={16} />
              Ver Temario
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Certification Modal */}
      <AnimatePresence>
        {showCertModal && courseId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCertModal(false)}
              className="fixed inset-0 bg-black/50 z-[90]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[91] flex items-center justify-center p-4"
              onClick={() => setShowCertModal(false)}
            >
              <div
                className="w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <CertificationCard courseId={courseId} courseCompleted={course?.enrollment?.status === "completed"} />
                <button
                  onClick={() => setShowCertModal(false)}
                  className="w-full mt-3 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Resource Viewer Component
function ResourceViewer({ resource, onProgressUpdate }: { 
  resource: Resource; 
  onProgressUpdate: (percent: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video progress
  useEffect(() => {
    if (resource.resource_type === "video" && videoRef.current) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        const percent = (video.currentTime / video.duration) * 100;
        setProgress(percent);
        onProgressUpdate(percent);
      };
      
      video.addEventListener("timeupdate", handleTimeUpdate);
      
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [resource, onProgressUpdate]);

  const getResourceIcon = () => {
    switch (resource.resource_type) {
      case "video":
        return <Play size={20} className="text-red-500" />;
      case "pdf":
        return <FileText size={20} className="text-blue-500" />;
      case "slide":
        return <FileText size={20} className="text-orange-500" />;
      case "podcast":
        return <Headphones size={20} className="text-purple-500" />;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        {getResourceIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
          {resource.duration_seconds && (
            <p className="text-sm text-gray-500">
              Duración: {Math.floor(resource.duration_seconds / 60)} min
            </p>
          )}
        </div>
      </div>

      <div className="p-0" style={{ backgroundColor: "#f5f5f5", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {resource.resource_type === "video" && (
          (() => {
            // Try multiple possible URL field names from backend
            const videoUrl = resource.external_url || (resource as any).url || (resource as any).media_url || (resource as any).content_url || (resource as any).video_url;
            
            if (!videoUrl) {
              return (
                <div className="text-center p-8">
                  <p style={{ color: "#666", fontSize: "0.95rem" }}>No se pudo acceder al video. URL no disponible.</p>
                </div>
              );
            }

            // Detect YouTube URLs and convert to embed format
            const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&\n?#]+)/;
            const youtubeMatch = videoUrl.match(youtubeRegex);
            const youtubeVideoId = youtubeMatch ? youtubeMatch[1] : null;

            if (youtubeVideoId) {
              // Render YouTube iframe
              return (
                <iframe
                  width="100%"
                  height="600"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={resource.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ maxHeight: "600px" }}
                />
              );
            }

            // For non-YouTube videos, use HTML5 video element
            return (
              <video
                ref={videoRef}
                controls
                className="w-full"
                poster={resource.thumbnail_url || undefined}
                style={{ maxHeight: "600px", objectFit: "contain" }}
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/ogg" />
                Tu navegador no soporta videos.
              </video>
            );
          })()
        )}

        {resource.resource_type === "pdf" && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1" style={{ minHeight: "500px" }}>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(resource.external_url)}&embedded=true`}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "500px",
                  border: "none",
                }}
                title={resource.title}
              />
            </div>
            <div className="flex items-center justify-center gap-4 p-6 bg-white border-t border-gray-200">
              <a
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                onClick={() => onProgressUpdate(100)}
              >
                Abrir en otra pestaña
              </a>
              <button
                onClick={() => onProgressUpdate(100)}
                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Marcar como completado
              </button>
            </div>
          </div>
        )}

        {resource.resource_type === "slide" && (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-orange-500 mb-4" />
            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => onProgressUpdate(100)}
            >
              Ver Presentación
            </a>
          </div>
        )}

        {resource.resource_type === "podcast" && (
          <div className="p-8">
            <audio controls className="w-full">
              <source src={resource.external_url} type="audio/mpeg" />
              Tu navegador no soporta audio.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
