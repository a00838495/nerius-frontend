import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  GraduationCap,
  Layers3,
  Loader2,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface CourseArea {
  id: string;
  name: string;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  status: string;
  progress_percent: number;
}

interface CourseCatalogItem {
  id: string;
  title: string;
  description: string;
  status: string;
  estimated_minutes: number;
  cover_url?: string;
  area?: CourseArea | null;
  created_by_name?: string;
  modules_count: number;
  lessons_count: number;
  total_enrolled: number;
  total_completed: number;
  is_enrolled: boolean;
  enrollment: CourseEnrollment | null;
}

const durationOptions = ["Cualquiera", "Menos de 4h", "4h - 8h", "8h+"];
const enrollmentOptions = ["Todos", "Inscritos", "No inscritos", "Completados"];
const sortOptions = ["Mas inscritos", "Mas completados", "Duracion corta", "Duracion larga", "A-Z"];
const MAX_COURSES = 50;

function extractCoursesPayload(payload: unknown): CourseCatalogItem[] {
  if (Array.isArray(payload)) {
    return payload as CourseCatalogItem[];
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;

    if (Array.isArray(objectPayload.items)) {
      return objectPayload.items as CourseCatalogItem[];
    }

    if (Array.isArray(objectPayload.data)) {
      return objectPayload.data as CourseCatalogItem[];
    }

    if (Array.isArray(objectPayload.results)) {
      return objectPayload.results as CourseCatalogItem[];
    }
  }

  return [];
}

function formatDuration(estimatedMinutes: number) {
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getCourseProgress(course: CourseCatalogItem) {
  return course.enrollment?.progress_percent ?? 0;
}

function isCourseCompleted(course: CourseCatalogItem) {
  return course.enrollment?.status === "completed" || (course.enrollment?.progress_percent ?? 0) >= 100;
}

function ProgressBar({ value, color = "#0099DC", height = 5 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: "rgba(0,0,0,0.07)" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color, transition: "width 0.5s ease" }}
      />
    </div>
  );
}

function CatalogCourseCard({
  course,
  index,
  onOpenDetail,
  isSelected,
}: {
  course: CourseCatalogItem;
  index: number;
  onOpenDetail: (courseId: string) => void;
  isSelected: boolean;
}) {
  const progress = getCourseProgress(course);
  const completed = isCourseCompleted(course);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: isSelected ? "0 16px 36px rgba(0,153,220,0.14)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: isSelected ? "1px solid rgba(0,153,220,0.24)" : "1px solid rgba(0,0,0,0.05)",
      }}
      onClick={() => onOpenDetail(course.id)}
    >
      <div className="relative overflow-hidden" style={{ height: 190 }}>
        <img
          src={course.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {completed && (
            <span className="rounded-full px-2 py-1 text-[0.66rem] font-semibold text-white" style={{ backgroundColor: "#4A8A2C" }}>
              Completado
            </span>
          )}

          {course.is_enrolled && !completed && (
            <span className="rounded-full px-2 py-1 text-[0.66rem] font-semibold text-white" style={{ backgroundColor: "#0099DC" }}>
              En progreso
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-black/35 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {course.area?.name || "General"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3
          className="mb-2 line-clamp-2"
          style={{
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1A2332",
            lineHeight: 1.4,
          }}
        >
          {course.title}
        </h3>

        <p className="mb-3 line-clamp-2" style={{ fontSize: "0.82rem", color: "#6B7A8D", lineHeight: 1.5 }}>
          {course.description}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2 text-[0.76rem]" style={{ color: "#6B7A8D" }}>
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> {formatDuration(course.estimated_minutes)}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers3 size={12} /> {course.modules_count} modulos
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} /> {course.lessons_count} lecciones
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={12} /> {course.total_enrolled.toLocaleString()}
          </span>
        </div>

        {course.is_enrolled && !completed && (
          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-[0.72rem]">
              <span style={{ color: "#9AA5B4" }}>Tu progreso</span>
              <span style={{ color: "#0099DC", fontWeight: 700 }}>{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}

        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetail(course.id);
          }}
          className="w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#1C3A5C",
            color: "#FFFFFF",
          }}
        >
          Ver detalles
        </button>
      </div>
    </motion.div>
  );
}

export function LearningContent() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCoursesError, setLoadingCoursesError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todas");
  const [selectedDuration, setSelectedDuration] = useState("Cualquiera");
  const [selectedEnrollmentFilter, setSelectedEnrollmentFilter] = useState("Todos");
  const [selectedSort, setSelectedSort] = useState("Mas inscritos");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseCatalogItem | null>(null);
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(false);
  const [loadingCourseDetailError, setLoadingCourseDetailError] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const courseDetailCacheRef = useRef<Map<string, CourseCatalogItem>>(new Map());

  const fetchCourses = async (silent = false) => {
    try {
      if (!silent) {
        setLoadingCourses(true);
      }

      setLoadingCoursesError(false);

      const response = await fetch(`/api/v1/courses?limit=${MAX_COURSES}&skip=0`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const payload = await response.json();
      const fetchedCourses = extractCoursesPayload(payload);
      setCourses(fetchedCourses.slice(0, MAX_COURSES));
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoadingCoursesError(true);
      setCourses([]);
    } finally {
      if (!silent) {
        setLoadingCourses(false);
      }
    }
  };

  const fetchCourseDetail = async (courseId: string, forceRefresh = false) => {
    try {
      const cachedCourse = courseDetailCacheRef.current.get(courseId);
      if (cachedCourse && !forceRefresh) {
        setSelectedCourseDetail(cachedCourse);
        setLoadingCourseDetailError(false);
        return;
      }

      setLoadingCourseDetail(true);
      setLoadingCourseDetailError(false);

      const response = await fetch(`/api/v1/courses/${courseId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch course detail");
      }

      const courseDetail: CourseCatalogItem = await response.json();
      courseDetailCacheRef.current.set(courseId, courseDetail);
      setSelectedCourseDetail(courseDetail);
    } catch (error) {
      console.error("Error fetching course detail:", error);
      setLoadingCourseDetailError(true);
      setSelectedCourseDetail(null);
    } finally {
      setLoadingCourseDetail(false);
    }
  };

  const openCourseDetail = async (courseId: string, forceRefresh = false) => {
    setSelectedCourseId(courseId);
    await fetchCourseDetail(courseId, forceRefresh);
  };

  const closeCourseDetailModal = () => {
    setSelectedCourseId(null);
    setSelectedCourseDetail(null);
    setLoadingCourseDetailError(false);
    setLoadingCourseDetail(false);
  };

  const enrollInCourse = async (courseId: string) => {
    const toastId = toast.loading("Inscribiendo en el curso...");
    setEnrollingCourseId(courseId);

    try {
      const response = await fetch(`/api/v1/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to enroll in course");
      }

      courseDetailCacheRef.current.delete(courseId);
      await fetchCourses(true);
      await openCourseDetail(courseId, true);

      toast.success("Inscripcion realizada con exito", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("No se pudo completar la inscripcion", {
        id: toastId,
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCourseDetailModal();
      }
    };

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
  }, [selectedCourseId]);

  const areaOptions = useMemo(() => {
    const areas = Array.from(new Set(courses.map(course => course.area?.name).filter(Boolean))) as string[];
    return ["Todas", ...areas];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = courses.filter(course => {
      if (normalizedSearch) {
        const searchableText = `${course.title} ${course.description} ${course.area?.name || ""}`.toLowerCase();
        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      if (selectedArea !== "Todas" && course.area?.name !== selectedArea) {
        return false;
      }

      if (selectedDuration === "Menos de 4h" && course.estimated_minutes >= 240) {
        return false;
      }

      if (selectedDuration === "4h - 8h" && (course.estimated_minutes < 240 || course.estimated_minutes > 480)) {
        return false;
      }

      if (selectedDuration === "8h+" && course.estimated_minutes <= 480) {
        return false;
      }

      if (selectedEnrollmentFilter === "Inscritos" && !course.is_enrolled) {
        return false;
      }

      if (selectedEnrollmentFilter === "No inscritos" && course.is_enrolled) {
        return false;
      }

      if (selectedEnrollmentFilter === "Completados" && !isCourseCompleted(course)) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((firstCourse, secondCourse) => {
      if (selectedSort === "Mas inscritos") {
        return secondCourse.total_enrolled - firstCourse.total_enrolled;
      }

      if (selectedSort === "Mas completados") {
        return secondCourse.total_completed - firstCourse.total_completed;
      }

      if (selectedSort === "Duracion corta") {
        return firstCourse.estimated_minutes - secondCourse.estimated_minutes;
      }

      if (selectedSort === "Duracion larga") {
        return secondCourse.estimated_minutes - firstCourse.estimated_minutes;
      }

      return firstCourse.title.localeCompare(secondCourse.title, "es");
    });
  }, [courses, searchTerm, selectedArea, selectedDuration, selectedEnrollmentFilter, selectedSort]);

  const activeFilters = [
    selectedArea !== "Todas" ? selectedArea : null,
    selectedDuration !== "Cualquiera" ? selectedDuration : null,
    selectedEnrollmentFilter !== "Todos" ? selectedEnrollmentFilter : null,
  ].filter(Boolean) as string[];
  const selectedCourseIsCompleted = !!(selectedCourseDetail && isCourseCompleted(selectedCourseDetail));

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
              color: "#1A2332",
              lineHeight: 1.2,
            }}
          >
            Explora los Cursos
          </h1>

          <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem", fontWeight: 400 }}>
            {loadingCourses ? "Cargando catalogo..." : `${filteredCourses.length} cursos disponibles para tu siguiente aprendizaje`}
          </p>
        </div>

        <div
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5B4]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por titulo, descripcion o area..."
                className="w-full rounded-xl border border-[#E8EAED] bg-[#F4F6F9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0099DC]"
              />
            </div>

            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: filtersOpen ? "#1C3A5C" : "#F4F6F9",
                color: filtersOpen ? "#FFFFFF" : "#4A5568",
              }}
              onClick={() => setFiltersOpen(previous => !previous)}
            >
              <Filter size={14} /> Filtros
              {activeFilters.length > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
                >
                  {activeFilters.length}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={selectedSort}
                onChange={(event) => setSelectedSort(event.target.value)}
                className="appearance-none rounded-xl border border-[#E8EAED] bg-[#F4F6F9] py-2 pl-3 pr-7 text-sm font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA5B4]" />
            </div>

            <span className="text-sm text-[#9AA5B4]">
              {filteredCourses.length} resultado{filteredCourses.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtersOpen && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                  className="appearance-none w-full rounded-xl border border-[#E8EAED] bg-[#F4F6F9] py-2 pl-3 pr-8 text-sm"
                >
                  {areaOptions.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA5B4]" />
              </div>

              <div className="relative">
                <select
                  value={selectedDuration}
                  onChange={(event) => setSelectedDuration(event.target.value)}
                  className="appearance-none w-full rounded-xl border border-[#E8EAED] bg-[#F4F6F9] py-2 pl-3 pr-8 text-sm"
                >
                  {durationOptions.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA5B4]" />
              </div>

              <div className="relative">
                <select
                  value={selectedEnrollmentFilter}
                  onChange={(event) => setSelectedEnrollmentFilter(event.target.value)}
                  className="appearance-none w-full rounded-xl border border-[#E8EAED] bg-[#F4F6F9] py-2 pl-3 pr-8 text-sm"
                >
                  {enrollmentOptions.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA5B4]" />
              </div>
            </div>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span
                key={filter}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: "rgba(0,153,220,0.1)", color: "#0099DC", border: "1px solid rgba(0,153,220,0.2)" }}
              >
                {filter}
                <button
                  onClick={() => {
                    if (filter === selectedArea) setSelectedArea("Todas");
                    if (filter === selectedDuration) setSelectedDuration("Cualquiera");
                    if (filter === selectedEnrollmentFilter) setSelectedEnrollmentFilter("Todos");
                  }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}

            <button
              onClick={() => {
                setSelectedArea("Todas");
                setSelectedDuration("Cualquiera");
                setSelectedEnrollmentFilter("Todos");
              }}
              className="rounded-full border border-[#E8EAED] px-3 py-1.5 text-xs font-medium text-[#9AA5B4]"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {loadingCourses ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
                <div className="mb-4 h-40 rounded-xl bg-gray-100" />
                <div className="space-y-2">
                  <div className="h-5 rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : loadingCoursesError ? (
          <div className="rounded-2xl border p-6 text-sm" style={{ borderColor: "rgba(212,24,61,0.15)", backgroundColor: "rgba(212,24,61,0.04)", color: "#9F1239" }}>
            <p className="mb-3 font-semibold">No se pudieron cargar los cursos.</p>
            <button
              onClick={() => fetchCourses()}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "#0099DC" }}
            >
              Reintentar
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F6F9]">
              <BookOpen size={28} color="#9AA5B4" />
            </div>
            <h3 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>
              No encontramos cursos con estos filtros
            </h3>
            <p style={{ color: "#9AA5B4", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Prueba ajustando la busqueda o los filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course, index) => (
              <CatalogCourseCard
                key={course.id}
                course={course}
                index={index}
                onOpenDetail={(courseId) => {
                  void openCourseDetail(courseId);
                }}
                isSelected={selectedCourseId === course.id}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCourseId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[70] bg-[#0d2340]/50 backdrop-blur-[2px]"
            onClick={closeCourseDetailModal}
          />

          <div className="fixed inset-0 z-[71] overflow-y-auto px-4 py-6 md:px-8 md:py-10" onClick={closeCourseDetailModal}>
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
                {loadingCourseDetail ? (
                  <div className="p-6 md:p-8">
                    <div className="animate-pulse space-y-5">
                      <div className="h-52 rounded-2xl bg-gray-100" />
                      <div className="space-y-3">
                        <div className="h-6 w-2/3 rounded bg-gray-100" />
                        <div className="h-4 w-full rounded bg-gray-100" />
                        <div className="h-4 w-5/6 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ) : loadingCourseDetailError || !selectedCourseDetail ? (
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
                        onClick={() => {
                          void fetchCourseDetail(selectedCourseId, true);
                        }}
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
                          src={selectedCourseDetail.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                          alt={selectedCourseDetail.title}
                          className="block h-auto w-auto max-h-[220px] max-w-full object-contain bg-white md:max-h-[320px] md:max-w-[320px]"
                        />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          {selectedCourseDetail.area?.name && (
                            <span
                              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                              style={{ backgroundColor: "rgba(0,153,220,0.92)" }}
                            >
                              {selectedCourseDetail.area.name}
                            </span>
                          )}

                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: selectedCourseDetail.is_enrolled
                                ? selectedCourseIsCompleted
                                  ? "rgba(74,138,44,0.92)"
                                  : "rgba(0,153,220,0.92)"
                                : "rgba(255,255,255,0.16)",
                              color: "#FFFFFF",
                              border: selectedCourseDetail.is_enrolled ? "none" : "1px solid rgba(255,255,255,0.16)",
                            }}
                          >
                            {selectedCourseDetail.is_enrolled
                              ? selectedCourseIsCompleted
                                ? "Completado"
                                : "Inscrito"
                              : "Disponible"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between text-white">
                        <div>
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#89B8D4]">CURSO</p>
                              <h3
                                style={{
                                  fontFamily: "'Nunito', sans-serif",
                                  fontWeight: 800,
                                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                                  lineHeight: 1.12,
                                }}
                              >
                                {selectedCourseDetail.title}
                              </h3>
                            </div>

                            <button
                              onClick={closeCourseDetailModal}
                              className="rounded-full border border-white/14 bg-white/10 p-2 text-white transition-colors hover:bg-white/16"
                              aria-label="Cerrar detalle"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <p className="max-w-3xl text-sm leading-7 text-white/80 md:text-[0.96rem]">
                            {selectedCourseDetail.description}
                          </p>

                          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                              { label: "Modulos", value: selectedCourseDetail.modules_count, icon: Layers3 },
                              { label: "Lecciones", value: selectedCourseDetail.lessons_count, icon: BookOpen },
                              { label: "Inscritos", value: selectedCourseDetail.total_enrolled, icon: Users },
                              { label: "Completados", value: selectedCourseDetail.total_completed, icon: GraduationCap },
                            ].map(({ label, value, icon: Icon }) => (
                              <div key={label} className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                                <Icon size={16} className="mb-2 text-[#8ed8ff]" />
                                <div className="text-xl font-bold text-white">{value}</div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/82">
                              <span className="flex items-center gap-2">
                                <Clock size={14} className="text-[#8ed8ff]" />
                                {formatDuration(selectedCourseDetail.estimated_minutes)}
                              </span>
                              {selectedCourseDetail.created_by_name && (
                                <span className="flex items-center gap-2">
                                  <Sparkles size={14} className="text-[#E5A800]" />
                                  Creado por {selectedCourseDetail.created_by_name}
                                </span>
                              )}
                            </div>

                            {selectedCourseDetail.is_enrolled && selectedCourseDetail.enrollment && (
                              <div className="max-w-md">
                                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/72">
                                  <span>Tu progreso</span>
                                  <span>{Math.round(selectedCourseDetail.enrollment.progress_percent ?? 0)}%</span>
                                </div>
                                <ProgressBar value={selectedCourseDetail.enrollment.progress_percent ?? 0} color="#0099DC" height={8} />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={async () => {
                                if (selectedCourseDetail.is_enrolled) {
                                  navigate(`/courses/${selectedCourseDetail.id}`);
                                  return;
                                }

                                await enrollInCourse(selectedCourseDetail.id);
                              }}
                              disabled={enrollingCourseId === selectedCourseDetail.id}
                              className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                              style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
                            >
                              {enrollingCourseId === selectedCourseDetail.id ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 size={14} className="animate-spin" />
                                  Inscribiendo...
                                </span>
                              ) : selectedCourseDetail.is_enrolled ? (
                                selectedCourseIsCompleted ? "Repasar" : "Continuar aprendizaje"
                              ) : (
                                "Inscribirme ahora"
                              )}
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