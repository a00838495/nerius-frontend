import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  ArrowRight,
  ChevronRight,
  Clock,
  Star,
  Loader2,
  CheckCircle2,
  ChevronLeft,
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

function CourseCard({ course, onEnroll }: { course: any; onEnroll: (courseId: string) => Promise<void> }) {
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
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
      onClick={() => navigate(`/courses/${course.id}`)}
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
            ✓ Done
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
                Enrolled Successfully!
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
                Enrolling...
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {course.completed ? "Review Course" : course.progress > 0 ? "Continue →" : "Start Course"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);

  const handleEnroll = async (courseId: string) => {
    // Show loading toast
    const toastId = toast.loading("Enrolling in course...");
    
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

      // Show success toast
      toast.success(`Successfully enrolled in ${course?.title || 'the course'}!`, {
        id: toastId,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      
      // Show error toast
      toast.error("Failed to enroll in course. Please try again.", {
        id: toastId,
        duration: 4000,
      });
      
      throw error;
    }
  };

  const fetchCourses = async () => {
    try {
      // Fetch user pending courses
      const pendingRes = await fetch('/api/v1/courses/user/pending');
      const pendingData = pendingRes.ok ? await pendingRes.json() : [];

      // Fetch recommended courses
      const recommendedRes = await fetch('/api/v1/courses/user/recommended');
      const recommendedData = recommendedRes.ok ? await recommendedRes.json() : [];

      // Map pending courses
      const mappedPending = pendingData.map((enrollment: any) => {
        const hours = Math.floor(enrollment.course.estimated_minutes / 60);
        const minutes = enrollment.course.estimated_minutes % 60;
        
        return {
          id: enrollment.course_id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          image: enrollment.course.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          duration: `${hours}h ${minutes}m`,
          progress: enrollment.progress_percent || 0,
          completed: enrollment.status === 'completed',
        };
      }).filter((c: any) => !c.completed); // All enrolled courses except completed

      // Map recommended courses
      const mappedRecommended = recommendedData.map((c: any) => {
        const hours = Math.floor(c.estimated_minutes / 60);
        const minutes = c.estimated_minutes % 60;
        
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          duration: `${hours}h ${minutes}m`,
          progress: 0,
          completed: false,
        };
      });
      
      setPendingCourses(mappedPending);
      setRecommendedCourses(mappedRecommended);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]); // Re-fetch if user changes, though mainly on mount

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
                WELCOME BACK
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
                Hello, {user.first_name}.<br />
                <span style={{ color: "#0099DC" }}>Ready to keep learning?</span>
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
                  Continue Learning
                </h2>
                {totalPending > 1 && (
                  <span className="text-sm text-gray-500">
                    {currentPendingIndex + 1} of {totalPending}
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
                            RESUME
                          </span>
                          <span className="text-xs text-[#89B8D4] font-medium flex items-center gap-1">
                            <Clock size={12} /> {pendingCourses[currentPendingIndex].duration}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-1 leading-tight">{pendingCourses[currentPendingIndex].title}</h3>
                        <p className="text-sm text-[#89B8D4] mb-4 line-clamp-1">{pendingCourses[currentPendingIndex].description}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-white">{pendingCourses[currentPendingIndex].progress}% Complete</span>
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

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 ? (
              <section id="recommended-courses">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="flex items-center gap-2 text-xl font-bold"
                    style={{ color: "#1A2332", fontFamily: "'Nunito', sans-serif" }}
                  >
                    <Star size={20} className="fill-current text-[#E5A800]" />
                    Recommended for You
                  </h2>
                  <button
                    onClick={() => navigate("/search")}
                    className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: "#0099DC" }}
                  >
                    View All <ChevronRight size={16} />
                  </button>
                </div>

                <div className="overflow-x-auto pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
                  <div className="flex gap-5 w-max">
                    {recommendedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-100">
                  <Star size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No recommendations yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Start exploring courses to get personalized recommendations!</p>
                  <button
                    onClick={() => navigate("/search")}
                    className="px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Browse Courses
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Will contain backend data in the future */}
          <div className="lg:col-span-4 space-y-8">
            {/* Placeholder for future features */}
          </div>
        </div>
      </div>
    </div>
  );
}

