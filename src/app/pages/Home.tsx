import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  ArrowRight,
  ChevronRight,
  Clock,
  CalendarClock,
  Star,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Trophy,
  Building2,
  ClipboardList,
  Award,
  Users,
  BookOpen,
  Layers3,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

function ProgressBar({ value, color = "#0099DC", animate = true, height = 6 }: {
  value: number; color?: string; animate?: boolean; height?: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(value), 300);
      return () => clearTimeout(t);
    } else {
      setWidth(value);
    }
  }, [value, animate]);

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, backgroundColor: "rgba(0,0,0,0.07)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  progress: number;
  completed: boolean;
}

interface CourseExpandedDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  estimated_minutes: number;
  cover_url?: string;
  area?: {
    id: string;
    name: string;
  } | null;
  created_by_name?: string;
  modules_count: number;
  lessons_count: number;
  total_enrolled: number;
  total_completed: number;
  is_enrolled: boolean;
  enrollment: {
    id: string;
    course_id: string;
    status: string;
    progress_percent: number;
  } | null;
}

interface PendingAssignedCourse {
  assignmentId: string;
  courseId: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  assignedByName: string;
  dueDate: string | null;
}

function CourseCard({
  course,
  onEnroll,
  onSelect,
  isSelected,
}: {
  course: RecommendedCourse;
  onEnroll: (courseId: string) => Promise<void>;
  onSelect: (courseId: string) => void;
  isSelected: boolean;
}) {
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If course is not enrolled yet (no progress and not completed)
    if (course.progress === 0 && !course.completed) {
      setEnrolling(true);
      try {
        await onEnroll(course.id);
        // Show success animation
        setShowSuccess(true);
        
        // Wait a bit for the animation before navigating
        setTimeout(() => {
          navigate(`/courses/${course.id}`);
        }, 800);
      } catch (error) {
        console.error("Failed to enroll in course", error);
        setEnrolling(false);
      }
    } else {
      // If already enrolled or completed, just navigate
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
      style={{
        width: 280,
        backgroundColor: "#FFFFFF",
        boxShadow: isSelected ? "0 16px 36px rgba(0,153,220,0.16)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: isSelected ? "1px solid rgba(0,153,220,0.24)" : "1px solid rgba(0,0,0,0.05)",
      }}
      onClick={() => onSelect(course.id)}
    >
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
        />
        
        {/* Enrollment Loading Overlay */}
        <AnimatePresence>
          {(enrolling || showSuccess) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                backgroundColor: showSuccess ? "rgba(74, 138, 44, 0.95)" : "rgba(0, 153, 220, 0.95)",
                backdropFilter: "blur(4px)"
              }}
            >
              {showSuccess ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-white"
                >
                  <CheckCircle2 size={48} strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-white"
                >
                  <Loader2 size={48} strokeWidth={2} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {course.completed && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: "#4A8A2C", fontSize: "0.7rem", fontWeight: 600 }}
          >
            ✓ Completado
          </div>
        )}

        {isSelected && (
          <div
            className="absolute left-3 top-3 rounded-full px-2 py-1 text-[0.68rem] font-semibold text-white"
            style={{ backgroundColor: "rgba(0,153,220,0.92)" }}
          >
            Viendo detalle
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 text-xs" style={{ color: "#9AA5B4" }}>
            <Clock size={11} /> {course.duration}
          </span>
        </div>

        <h3
          className="mb-3 line-clamp-2"
          style={{
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#1A2332",
            lineHeight: 1.4,
          }}
        >
          {course.title}
        </h3>

        {course.progress > 0 && !course.completed && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: "0.72rem", color: "#9AA5B4" }}>Progress</span>
              <span style={{ fontSize: "0.72rem", color: "#0099DC", fontWeight: 600 }}>{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} color="#0099DC" />
          </div>
        )}

        <div className="mb-3 flex items-center justify-between text-[0.72rem] font-semibold">
          <span style={{ color: isSelected ? "#0099DC" : "#6B7A8D" }}>
            {isSelected ? "Detalle abierto" : "Haz clic para expandir"}
          </span>
          <ChevronRight
            size={14}
            style={{
              color: isSelected ? "#0099DC" : "#9AA5B4",
              transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </div>

        <button
          onClick={handleButtonClick}
          disabled={enrolling || showSuccess}
          className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 relative overflow-hidden flex items-center justify-center gap-2"
          style={{
            backgroundColor: showSuccess 
              ? "#4A8A2C" 
              : course.progress > 0 && !course.completed 
                ? "#0099DC" 
                : course.completed 
                  ? "#F4F6F9" 
                  : "#1C3A5C",
            color: course.completed && !showSuccess ? "#4A8A2C" : "#FFFFFF",
            border: course.completed && !showSuccess ? "1px solid #A5D6A7" : "none",
          }}
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.span
                key="success"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                ¡Inscrito Exitosamente!
              </motion.span>
            ) : enrolling ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 size={16} className="animate-spin" />
                Inscribiendo...
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {course.completed ? "Revisar Curso" : course.progress > 0 ? "Continuar →" : "Iniciar Curso"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

interface CourseRankingEntry {
  name: string;
  total_completed_courses: number;
  area: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}

function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatDurationFromMinutes(estimatedMinutes: number) {
  const safeMinutes = Number.isFinite(estimatedMinutes) ? Math.max(0, estimatedMinutes) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function getDueDateLabel(dueDate: string | null) {
  if (!dueDate) {
    return { label: "Sin fecha limite", urgent: false };
  }

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return { label: "Sin fecha limite", urgent: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueAt = new Date(due);
  dueAt.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil((dueAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    return { label: "Vencido", urgent: true };
  }

  if (daysUntilDue === 0) {
    return { label: "Vence hoy", urgent: true };
  }

  if (daysUntilDue <= 3) {
    return { label: `Vence en ${daysUntilDue} dia${daysUntilDue === 1 ? "" : "s"}`, urgent: true };
  }

  return {
    label: `Vence ${due.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}`,
    urgent: false,
  };
}

function RankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-100 bg-gray-50 p-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-white" />
              <div className="h-3 w-1/2 rounded bg-white" />
            </div>
            <div className="h-8 w-14 rounded-full bg-white" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingRow({
  employee,
  rank,
  isCurrentUser,
}: {
  employee: CourseRankingEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const accentColors = ["#E5A800", "#0099DC", "#C85A2A"];
  const accentColor = accentColors[rank - 1] || "#1C3A5C";
  const isTopThree = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: isCurrentUser
          ? "linear-gradient(135deg, rgba(0,153,220,0.10) 0%, rgba(255,255,255,1) 65%)"
          : "#FFFFFF",
        borderColor: isCurrentUser ? "rgba(0,153,220,0.18)" : "#E8EAED",
        boxShadow: isCurrentUser ? "0 10px 24px rgba(0,153,220,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {isTopThree && (
        <div
          className="absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: `${accentColor}20` }}
        />
      )}

      <div className="relative flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${isTopThree ? accentColor : "#1C3A5C"} 0%, ${isTopThree ? "#0D2340" : "#36536f"} 100%)`,
              boxShadow: `0 10px 20px ${accentColor}22`,
            }}
          >
            {getInitials(employee.name)}
          </div>
          <div
            className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold"
            style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
          >
            {rank}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className="truncate"
              style={{
                color: isCurrentUser ? "#0099DC" : "#1A2332",
                fontWeight: 700,
                fontSize: "0.95rem",
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              {employee.name}
            </h3>
            {isCurrentUser && (
              <span
                className="rounded-full px-2 py-0.5 text-[0.68rem] font-semibold"
                style={{ backgroundColor: "rgba(0,153,220,0.1)", color: "#0099DC" }}
              >
                Tú
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: "#6B7A8D" }}>
            <Building2 size={12} />
            <span className="truncate">{employee.area}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
          <div
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{
              backgroundColor: `${accentColor}12`,
              color: accentColor,
              border: `1px solid ${accentColor}20`,
            }}
          >
            {employee.total_completed_courses} curso{employee.total_completed_courses === 1 ? "" : "s"}
          </div>
          <span style={{ color: "#9AA5B4", fontSize: "0.72rem", fontWeight: 600 }}>
            completados
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [pendingAssignedCourses, setPendingAssignedCourses] = useState<PendingAssignedCourse[]>([]);
  const [pendingAssignedLoading, setPendingAssignedLoading] = useState(true);
  const [pendingAssignedError, setPendingAssignedError] = useState(false);
  const [courseRanking, setCourseRanking] = useState<CourseRankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [rankingError, setRankingError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedCourseDetail, setExpandedCourseDetail] = useState<CourseExpandedDetail | null>(null);
  const [expandedCourseLoading, setExpandedCourseLoading] = useState(false);
  const [expandedCourseError, setExpandedCourseError] = useState(false);
  const courseDetailCacheRef = useRef<Map<string, CourseExpandedDetail>>(new Map());

  const handleEnroll = async (courseId: string) => {
    // Show loading toast
    const toastId = toast.loading("Inscribiendo en el curso...");
    
    try {
      const response = await fetch(`/api/v1/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }

      // Get course name for the success message
      const course = recommendedCourses.find(c => c.id === courseId);
      
      // Refresh courses after enrollment
      await fetchCourses();
      if (expandedCourseId === courseId) {
        await fetchCourseDetail(courseId, true);
      }

      // Show success toast
      toast.success(`Te inscribiste en ${course?.title || "el curso"} con exito.`, {
        id: toastId,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      
      // Show error toast
      toast.error("No se pudo completar la inscripcion. Intenta de nuevo.", {
        id: toastId,
        duration: 4000,
      });
      
      throw error;
    }
  };

  const fetchCourseDetail = async (courseId: string, forceRefresh = false) => {
    try {
      const cachedDetail = courseDetailCacheRef.current.get(courseId);
      if (cachedDetail && !forceRefresh) {
        setExpandedCourseError(false);
        setExpandedCourseDetail(cachedDetail);
        return;
      }

      setExpandedCourseLoading(true);
      setExpandedCourseError(false);

      const response = await fetch(`/api/v1/courses/${courseId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course detail');
      }

      const courseDetail: CourseExpandedDetail = await response.json();
  courseDetailCacheRef.current.set(courseId, courseDetail);
      setExpandedCourseDetail(courseDetail);
    } catch (error) {
      console.error('Failed to fetch course detail', error);
      setExpandedCourseError(true);
      setExpandedCourseDetail(null);
    } finally {
      setExpandedCourseLoading(false);
    }
  };

  const closeExpandedCourseModal = () => {
    setExpandedCourseId(null);
    setExpandedCourseDetail(null);
    setExpandedCourseError(false);
    setExpandedCourseLoading(false);
  };

  const handleSelectRecommendedCourse = async (courseId: string) => {
    if (expandedCourseId === courseId) {
      closeExpandedCourseModal();
      return;
    }

    setExpandedCourseId(courseId);
    await fetchCourseDetail(courseId);
  };

  const fetchCourses = async () => {
    setPendingAssignedLoading(true);
    setPendingAssignedError(false);

    try {
      const [pendingRes, recommendedRes, pendingAssignedRes] = await Promise.all([
        fetch('/api/v1/courses/user/pending', { credentials: 'include' }),
        fetch('/api/v1/courses/user/recommended', { credentials: 'include' }),
        fetch('/api/v1/courses/user/assigned/pending', { credentials: 'include' }),
      ]);

      const pendingData = pendingRes.ok ? await pendingRes.json() : [];
      const recommendedData = recommendedRes.ok ? await recommendedRes.json() : [];
      const pendingAssignedData = pendingAssignedRes.ok ? await pendingAssignedRes.json() : [];

      if (!pendingAssignedRes.ok) {
        setPendingAssignedError(true);
      }

      // Map pending courses
      const mappedPending = pendingData.map((enrollment: any) => {
        return {
          id: enrollment.course_id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          image: enrollment.course.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          duration: formatDurationFromMinutes(enrollment.course.estimated_minutes),
          progress: enrollment.progress_percent || 0,
          completed: enrollment.status === 'completed',
        };
      }).filter((c: any) => !c.completed); // All enrolled courses except completed

      // Map recommended courses
      const mappedRecommended = recommendedData.map((c: any) => {
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          duration: formatDurationFromMinutes(c.estimated_minutes),
          progress: 0,
          completed: false,
        };
      });

      const mappedPendingAssigned: PendingAssignedCourse[] = pendingAssignedData
        .map((assignment: any) => ({
          assignmentId: assignment.id,
          courseId: assignment.course_id,
          title: assignment.course?.title || "Curso asignado",
          description: assignment.course?.description || "",
          image: assignment.course?.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          duration: formatDurationFromMinutes(assignment.course?.estimated_minutes || 0),
          assignedByName: assignment.assigned_by_name || "Administrador",
          dueDate: assignment.due_date || null,
        }))
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      
      setPendingCourses(mappedPending);
      setRecommendedCourses(mappedRecommended);
      setPendingAssignedCourses(mappedPendingAssigned);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      setPendingAssignedError(true);
      setPendingAssignedCourses([]);
    } finally {
      setPendingAssignedLoading(false);
      setLoading(false);
    }
  };

  const fetchRanking = async () => {
    try {
      setRankingLoading(true);
      setRankingError(false);

      const response = await fetch('/api/v1/courses/ranking', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ranking');
      }

      const rankingData: CourseRankingEntry[] = await response.json();
      setCourseRanking(rankingData);
    } catch (error) {
      console.error('Failed to fetch ranking', error);
      setRankingError(true);
      setCourseRanking([]);
    } finally {
      setRankingLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchRanking();
  }, [user]); // Re-fetch if user changes, though mainly on mount

  useEffect(() => {
    if (!expandedCourseId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpandedCourseModal();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedCourseId]);

  // Keyboard navigation for pending courses
  useEffect(() => {
    const totalPending = pendingCourses.length;
    if (totalPending <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPendingIndex((prev) => (prev > 0 ? prev - 1 : totalPending - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPendingIndex((prev) => (prev < totalPending - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingCourses.length]);

  if (!user || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Limit dots to max 5
  const maxDots = 5;
  const totalPending = pendingCourses.length;
  const showDots = totalPending > 1;
  const currentUserName = `${user.first_name} ${user.last_name}`.trim();
  const currentUserRankIndex = courseRanking.findIndex((employee) => normalizeName(employee.name) === normalizeName(currentUserName));
  const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : null;
  const currentUserEntry = currentUserRankIndex >= 0 ? courseRanking[currentUserRankIndex] : null;
  const featuredRanking = courseRanking.slice(0, 5);
  const expandedCoursePreview = expandedCourseId
    ? recommendedCourses.find(course => course.id === expandedCourseId) ?? null
    : null;
  
  // Calculate which courses to show in dots based on current index
  const getVisibleDotRange = () => {
    if (totalPending <= maxDots) {
      return { start: 0, end: totalPending };
    }
    
    // If we're showing more than maxDots, calculate sliding window
    const halfWindow = Math.floor(maxDots / 2);
    let start = Math.max(0, currentPendingIndex - halfWindow);
    let end = Math.min(totalPending, start + maxDots);
    
    // Adjust start if we're at the end
    if (end === totalPending) {
      start = Math.max(0, end - maxDots);
    }
    
    return { start, end };
  };

  const { start: dotStart, end: dotEnd } = getVisibleDotRange();

  return (
    <>
      <div className="max-w-[1440px] mx-auto">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0D2340 0%, #1C3A5C 45%, #0F4D7A 100%)",
          minHeight: 320,
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full opacity-10"
            style={{ width: 600, height: 600, background: "#0099DC", top: -200, right: -100, filter: "blur(80px)" }}
          />
          <div
            className="absolute rounded-full opacity-8"
            style={{ width: 400, height: 400, background: "#E5A800", bottom: -200, left: -100, filter: "blur(80px)" }}
          />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" style={{ color: "white" }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative px-6 lg:px-10 py-16 lg:py-20">
          <div className="flex flex-col items-start justify-center">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p
                className="mb-2"
                style={{ color: "#89B8D4", fontSize: "0.9rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, letterSpacing: "0.05em" }}
              >
                BIENVENIDO DE NUEVO
              </p>
              <h1
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: "#FFFFFF",
                  lineHeight: 1.15,
                  marginBottom: "0.75rem",
                }}
              >
                Hola, {user.first_name}.<br />
                <span style={{ color: "#0099DC" }}>¿Listo para seguir aprendiendo?</span>
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Continue Learning */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="flex items-center gap-2 text-xl font-bold"
                  style={{ color: "#1A2332", fontFamily: "'Nunito', sans-serif" }}
                >
                  <Play size={20} className="fill-current text-[#0099DC]" />
                  Continuar Aprendiendo
                </h2>
                {totalPending > 1 && (
                  <span className="text-sm text-gray-500">
                    {currentPendingIndex + 1} de {totalPending}
                  </span>
                )}
              </div>

              {totalPending > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPendingIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                      className="rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center cursor-pointer"
                      style={{
                        background: "linear-gradient(145deg, #1C3A5C 0%, #0D2340 100%)",
                        color: "white",
                      }}
                      onClick={() => navigate(`/courses/${pendingCourses[currentPendingIndex].id}`)}
                    >
                      <div className="relative flex-shrink-0 w-full md:w-48 aspect-video rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                        <img
                          src={pendingCourses[currentPendingIndex].image}
                          alt={pendingCourses[currentPendingIndex].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50">
                            <Play size={16} fill="white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-[#0099DC] text-white">
                            CONTINUAR
                          </span>
                          <span className="text-xs text-[#89B8D4] font-medium flex items-center gap-1">
                            <Clock size={12} /> {pendingCourses[currentPendingIndex].duration}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-1 leading-tight">{pendingCourses[currentPendingIndex].title}</h3>
                        <p className="text-sm text-[#89B8D4] mb-4 line-clamp-1">{pendingCourses[currentPendingIndex].description}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-white">{pendingCourses[currentPendingIndex].progress}% Completado</span>
                          </div>
                          <ProgressBar value={pendingCourses[currentPendingIndex].progress} color="#0099DC" height={8} />
                        </div>
                      </div>

                      <div className="hidden md:flex items-center justify-center bg-white/10 rounded-full w-12 h-12 flex-shrink-0 hover:bg-[#0099DC] transition-colors cursor-pointer">
                        <ArrowRight size={20} />
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Pagination Dots with Navigation */}
                  {totalPending > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      {/* Previous Arrow */}
                      <button
                        onClick={() => setCurrentPendingIndex((prev) => (prev > 0 ? prev - 1 : totalPending - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-[#0099DC] hover:text-white text-gray-600 flex items-center justify-center transition-all"
                        aria-label="Previous course"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      {/* Dots */}
                      {showDots && (
                        <div className="flex items-center gap-2">
                          {dotStart > 0 && (
                            <span className="text-xs text-gray-400 mr-1">...</span>
                          )}
                          {pendingCourses.slice(dotStart, dotEnd).map((_, idx) => {
                            const actualIndex = dotStart + idx;
                            return (
                              <button
                                key={actualIndex}
                                onClick={() => setCurrentPendingIndex(actualIndex)}
                                className="transition-all duration-200"
                                style={{
                                  width: currentPendingIndex === actualIndex ? '32px' : '8px',
                                  height: '8px',
                                  borderRadius: '4px',
                                  backgroundColor: currentPendingIndex === actualIndex ? '#0099DC' : '#D1D5DB',
                                }}
                                aria-label={`Go to course ${actualIndex + 1}`}
                              />
                            );
                          })}
                          {dotEnd < totalPending && (
                            <span className="text-xs text-gray-400 ml-1">...</span>
                          )}
                        </div>
                      )}
                      
                      {/* Next Arrow */}
                      <button
                        onClick={() => setCurrentPendingIndex((prev) => (prev < totalPending - 1 ? prev + 1 : 0))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-[#0099DC] hover:text-white text-gray-600 flex items-center justify-center transition-all"
                        aria-label="Next course"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl p-10 text-center"
                  style={{
                    background: "linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)",
                    border: "2px dashed #0099DC",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="text-6xl mb-4"
                  >
                    📚
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No tienes cursos en progreso
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    ¡Es el momento perfecto para comenzar algo nuevo! Explora nuestros cursos recomendados abajo y empieza tu próximo aprendizaje.
                  </p>
                </motion.div>
              )}
            </section>

            {/* Pending Assigned Courses */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2
                  className="flex items-center gap-2 text-xl font-bold"
                  style={{ color: "#1A2332", fontFamily: "'Nunito', sans-serif" }}
                >
                  <ClipboardList size={20} className="text-[#1C3A5C]" />
                  Cursos Pendientes
                </h2>

                {!pendingAssignedLoading && !pendingAssignedError && pendingAssignedCourses.length > 0 && (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "#EEF6FB", color: "#1C3A5C" }}>
                    {pendingAssignedCourses.length} pendiente{pendingAssignedCourses.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              {pendingAssignedLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="h-20 w-28 rounded-xl bg-gray-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-4/5 rounded bg-gray-100" />
                          <div className="h-3 w-full rounded bg-gray-100" />
                          <div className="h-3 w-3/4 rounded bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingAssignedError ? (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "rgba(212,24,61,0.15)",
                    backgroundColor: "rgba(212,24,61,0.04)",
                    color: "#9F1239",
                  }}
                >
                  <p className="mb-2 font-semibold">No se pudieron cargar los cursos asignados pendientes.</p>
                  <button
                    onClick={fetchCourses}
                    className="rounded-xl px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : pendingAssignedCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                  <ClipboardList size={28} className="mx-auto mb-3 text-gray-300" />
                  <p className="mb-2 text-sm font-semibold text-gray-700">No tienes cursos asignados pendientes</p>
                  <p className="text-sm text-gray-500">Cuando te asignen nuevos cursos, apareceran aqui.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingAssignedCourses.map((assignment) => {
                    const dueDateInfo = getDueDateLabel(assignment.dueDate);

                    return (
                      <motion.button
                        key={assignment.assignmentId}
                        whileHover={{ y: -3, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
                        transition={{ duration: 0.18 }}
                        onClick={() => {
                          void handleSelectRecommendedCourse(assignment.courseId);
                        }}
                        className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
                      >
                        <div className="flex gap-4 p-4">
                          <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            <img src={assignment.image} alt={assignment.title} className="h-full w-full object-cover" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-bold text-[#1A2332]">{assignment.title}</h3>
                            <p className="mt-1 line-clamp-2 text-xs text-[#6B7A8D]">{assignment.description}</p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1 rounded-full bg-[#EEF6FB] px-2.5 py-1 text-[0.68rem] font-semibold text-[#1C3A5C]">
                                <Clock size={11} /> {assignment.duration}
                              </span>
                              <span
                                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold"
                                style={{
                                  backgroundColor: dueDateInfo.urgent ? "rgba(212,24,61,0.08)" : "#F4F6F9",
                                  color: dueDateInfo.urgent ? "#9F1239" : "#4B5563",
                                }}
                              >
                                <CalendarClock size={11} /> {dueDateInfo.label}
                              </span>
                            </div>

                            <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9AA5B4]">
                              Asignado por {assignment.assignedByName}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 ? (
              <section id="recommended-courses">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="flex items-center gap-2 text-xl font-bold"
                    style={{ color: "#1A2332", fontFamily: "'Nunito', sans-serif" }}
                  >
                    <Star size={20} className="fill-current text-[#E5A800]" />
                    Recomendados para Ti
                  </h2>
                  <button
                    onClick={() => navigate("/search")}
                    className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: "#0099DC" }}
                  >
                    Ver Todo <ChevronRight size={16} />
                  </button>
                </div>

                <div className="overflow-x-auto pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
                  <div className="flex gap-5 w-max">
                    {recommendedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onEnroll={handleEnroll}
                        onSelect={handleSelectRecommendedCourse}
                        isSelected={expandedCourseId === course.id}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-100">
                  <Star size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin recomendaciones aún</h3>
                  <p className="text-sm text-gray-500 mb-4">¡Comienza a explorar cursos para obtener recomendaciones personalizadas!</p>
                  <button
                    onClick={() => navigate("/search")}
                    className="px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Explorar Cursos
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="overflow-hidden rounded-3xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8EAED",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                className="relative overflow-hidden px-6 py-6"
                style={{ background: "linear-gradient(135deg, #0D2340 0%, #1C3A5C 55%, #0F4D7A 100%)" }}
              >
                <div
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
                  style={{ backgroundColor: "rgba(0,153,220,0.35)" }}
                />
                <div
                  className="absolute -left-10 bottom-0 h-24 w-24 rounded-full blur-3xl"
                  style={{ backgroundColor: "rgba(229,168,0,0.18)" }}
                />

                <div className="relative">
                  <div
                    className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <Trophy size={14} color="#E5A800" />
                    <span style={{ color: "#E5A800", fontSize: "0.78rem", fontWeight: 700 }}>
                      RANKING
                    </span>
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.55rem",
                      color: "#FFFFFF",
                      lineHeight: 1.15,
                    }}
                  >
                    Maestros del Aprendizaje
                  </h2>

                  <p style={{ color: "#89B8D4", fontSize: "0.86rem", marginTop: "0.7rem", lineHeight: 1.6 }}>
                    Reconoce a quienes están marcando el ritmo del aprendizaje dentro de la plataforma.
                  </p>

                  {currentUserRank && currentUserEntry && (
                    <div
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2"
                      style={{ backgroundColor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)" }}
                    >
                      <Award size={14} color="#FFFFFF" />
                      <span style={{ color: "#FFFFFF", fontSize: "0.82rem", fontWeight: 700 }}>
                        Vas en #{currentUserRank} con {currentUserEntry.total_completed_courses} curso{currentUserEntry.total_completed_courses === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {rankingLoading ? (
                  <RankingSkeleton />
                ) : rankingError ? (
                  <div
                    className="rounded-2xl border p-5 text-sm"
                    style={{
                      borderColor: "rgba(212,24,61,0.15)",
                      backgroundColor: "rgba(212,24,61,0.04)",
                      color: "#9F1239",
                    }}
                  >
                    <p className="font-semibold mb-2">No se pudo cargar el ranking.</p>
                    <button
                      onClick={fetchRanking}
                      className="mt-1 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : courseRanking.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                    <Trophy size={28} className="mx-auto mb-3 text-gray-300" />
                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      Aún no hay datos de ranking
                    </p>
                    <p className="text-sm text-gray-500">
                      Cuando existan cursos completados, aquí se mostrará el leaderboard.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {featuredRanking.map((employee, index) => (
                      <RankingRow
                        key={`${employee.name}-${employee.area}-${index}`}
                        employee={employee}
                        rank={index + 1}
                        isCurrentUser={normalizeName(employee.name) === normalizeName(currentUserName)}
                      />
                    ))}

                    {currentUserEntry && currentUserRank && currentUserRank > featuredRanking.length && (
                      <>
                        <div className="flex items-center gap-3 py-1">
                          <div className="h-px flex-1 bg-gray-100" />
                          <span style={{ color: "#9AA5B4", fontSize: "0.72rem", fontWeight: 700 }}>
                            TU POSICIÓN
                          </span>
                          <div className="h-px flex-1 bg-gray-100" />
                        </div>

                        <RankingRow
                          employee={currentUserEntry}
                          rank={currentUserRank}
                          isCurrentUser={true}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
      </div>

      {expandedCourseId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[70] bg-[#0d2340]/50 backdrop-blur-[2px]"
            onClick={closeExpandedCourseModal}
          />

          <div
            className="fixed inset-0 z-[71] overflow-y-auto px-4 py-6 md:px-8 md:py-10"
            onClick={closeExpandedCourseModal}
          >
            <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
              <motion.div
                initial={{ y: 16, scale: 0.985 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.9 }}
                className="w-full overflow-hidden rounded-3xl border"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "rgba(0,0,0,0.06)",
                  boxShadow: "0 30px 65px rgba(0,0,0,0.22)",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                  {expandedCourseLoading ? (
                    <div className="p-6 md:p-8">
                      <div className="animate-pulse space-y-5">
                        <div className="h-52 rounded-2xl bg-gray-100" />
                        <div className="space-y-3">
                          <div className="h-6 w-2/3 rounded bg-gray-100" />
                          <div className="h-4 w-full rounded bg-gray-100" />
                          <div className="h-4 w-5/6 rounded bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-20 rounded-2xl bg-gray-100" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : expandedCourseError || !expandedCourseDetail ? (
                    <div className="p-6 md:p-8">
                      <div
                        className="rounded-2xl border p-5 text-sm"
                        style={{
                          borderColor: "rgba(212,24,61,0.15)",
                          backgroundColor: "rgba(212,24,61,0.04)",
                          color: "#9F1239",
                        }}
                      >
                        <p className="mb-2 font-semibold">No se pudo cargar el detalle del curso.</p>
                        <button
                          onClick={() => fetchCourseDetail(expandedCourseId)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
                        >
                          Reintentar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0D2340] via-[#1C3A5C] to-[#0F4D7A]" />
                      <div
                        className="absolute -right-20 top-0 h-56 w-56 rounded-full blur-3xl"
                        style={{ backgroundColor: "rgba(0,153,220,0.32)" }}
                      />
                      <div className="relative grid gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)] md:p-8">
                        <div className="relative w-fit max-w-full self-center overflow-hidden rounded-2xl border border-white/12 shadow-2xl bg-white/95">
                          <img
                            src={expandedCourseDetail.cover_url || expandedCoursePreview?.image}
                            alt={expandedCourseDetail.title}
                            className="block h-auto w-auto max-h-[220px] max-w-full object-contain bg-white md:max-h-[320px] md:max-w-[320px]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            {expandedCourseDetail.area?.name && (
                              <span
                                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                                style={{ backgroundColor: "rgba(0,153,220,0.92)" }}
                              >
                                {expandedCourseDetail.area.name}
                              </span>
                            )}
                            <span
                              className="rounded-full px-3 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor: expandedCourseDetail.is_enrolled ? "rgba(74,138,44,0.92)" : "rgba(255,255,255,0.16)",
                                color: "#FFFFFF",
                                border: expandedCourseDetail.is_enrolled ? "none" : "1px solid rgba(255,255,255,0.16)",
                              }}
                            >
                              {expandedCourseDetail.is_enrolled ? "Inscrito" : "Recomendado"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between text-white">
                          <div>
                            <div className="mb-3 flex items-start justify-between gap-4">
                              <div>
                                <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#89B8D4]">
                                  CURSO DESTACADO
                                </p>
                                <h3
                                  style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 800,
                                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                                    lineHeight: 1.12,
                                  }}
                                >
                                  {expandedCourseDetail.title}
                                </h3>
                              </div>

                              <button
                                onClick={closeExpandedCourseModal}
                                className="rounded-full border border-white/14 bg-white/10 p-2 text-white transition-colors hover:bg-white/16"
                                aria-label="Cerrar detalle"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <p className="max-w-3xl text-sm leading-7 text-white/80 md:text-[0.96rem]">
                              {expandedCourseDetail.description}
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                              {[
                                { label: "Modulos", value: expandedCourseDetail.modules_count, icon: Layers3 },
                                { label: "Lecciones", value: expandedCourseDetail.lessons_count, icon: BookOpen },
                                { label: "Inscritos", value: expandedCourseDetail.total_enrolled, icon: Users },
                                { label: "Completados", value: expandedCourseDetail.total_completed, icon: GraduationCap },
                              ].map(({ label, value, icon: Icon }) => (
                                <div
                                  key={label}
                                  className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm"
                                >
                                  <Icon size={16} className="mb-2 text-[#8ed8ff]" />
                                  <div className="text-xl font-bold text-white">{value}</div>
                                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                                    {label}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3 text-sm text-white/82">
                                <span className="flex items-center gap-2">
                                  <Clock size={14} className="text-[#8ed8ff]" />
                                  {Math.floor(expandedCourseDetail.estimated_minutes / 60)}h {expandedCourseDetail.estimated_minutes % 60}m
                                </span>
                                {expandedCourseDetail.created_by_name && (
                                  <span className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-[#E5A800]" />
                                    Creado por {expandedCourseDetail.created_by_name}
                                  </span>
                                )}
                              </div>

                              {expandedCourseDetail.is_enrolled && expandedCourseDetail.enrollment && (
                                <div className="max-w-md">
                                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/72">
                                    <span>Tu progreso</span>
                                    <span>{Math.round(expandedCourseDetail.enrollment.progress_percent ?? 0)}%</span>
                                  </div>
                                  <ProgressBar value={expandedCourseDetail.enrollment.progress_percent ?? 0} color="#0099DC" height={8} />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={async () => {
                                  if (expandedCourseDetail.is_enrolled) {
                                    navigate(`/courses/${expandedCourseDetail.id}`);
                                    return;
                                  }

                                  await handleEnroll(expandedCourseDetail.id);
                                }}
                                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
                              >
                                {expandedCourseDetail.is_enrolled ? "Continuar aprendizaje" : "Inscribirme ahora"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

