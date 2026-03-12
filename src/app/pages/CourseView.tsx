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
} from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  resource_type: "video" | "pdf" | "podcast";
  title: string;
  external_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

interface LessonProgress {
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  estimated_minutes: number;
  resources?: Resource[];
  progress?: LessonProgress;
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
  progress_percent: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  estimated_minutes: number;
  cover_url?: string;
  enrollment?: Enrollment;
  first_module: Module;
  other_modules: Module[];
}

export function CourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [progressTracking, setProgressTracking] = useState({ startTime: Date.now(), lastUpdate: Date.now() });
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch course details
  const fetchCourseDetails = async (moduleId?: string, lessonId?: string) => {
    try {
      let url = `/api/v1/courses/${courseId}/detailed`;
      const params = new URLSearchParams();
      
      if (moduleId && lessonId) {
        params.append("focus_module_id", moduleId);
        params.append("focus_lesson_id", lessonId);
      } else if (moduleId) {
        params.append("focus_module_id", moduleId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch course");
      
      const data: CourseDetail = await response.json();
      setCourse(data);
      
      // Set current module and lesson if not set
      if (!currentModuleId) {
        setCurrentModuleId(data.first_module.id);
        setExpandedModules(new Set([data.first_module.id]));
        
        // Find first lesson with resources
        const lessonWithResources = data.first_module.lessons.find(l => l.resources && l.resources.length > 0);
        if (lessonWithResources) {
          setCurrentLessonId(lessonWithResources.id);
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
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
        body: JSON.stringify({
          progress_percent: progressPercent,
          time_spent_seconds: timeSpent,
          status,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to update progress");
      
      const data = await response.json();
      
      // Update local state with data from backend
      if (course) {
        const updatedCourse = { ...course };
        
        // Update enrollment progress if available
        if (updatedCourse.enrollment && data.enrollment_progress_percent !== undefined) {
          updatedCourse.enrollment.progress_percent = data.enrollment_progress_percent;
        }
        
        // Update lesson progress in first_module
        let lesson = updatedCourse.first_module.lessons.find(l => l.id === currentLessonId);
        
        // If not found in first_module, search in other_modules
        if (!lesson) {
          for (const module of updatedCourse.other_modules) {
            lesson = module.lessons.find(l => l.id === currentLessonId);
            if (lesson) break;
          }
        }
        
        // Update lesson with backend response
        if (lesson) {
          if (!lesson.progress) {
            lesson.progress = {
              lesson_id: currentLessonId,
              status: "not_started",
              progress_percent: 0,
            };
          }
          lesson.progress.progress_percent = data.progress_percent;
          lesson.progress.status = data.status;
        }
        
        setCourse(updatedCourse);
      }
      
      setProgressTracking({ ...progressTracking, lastUpdate: now });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // Auto-save progress every 30 seconds for videos
  useEffect(() => {
    if (currentLessonId && course) {
      const lesson = course.first_module.lessons.find(l => l.id === currentLessonId);
      const hasVideo = lesson?.resources?.some(r => r.resource_type === "video");
      
      if (hasVideo) {
        progressIntervalRef.current = setInterval(() => {
          const currentProgress = lesson?.progress?.progress_percent || 0;
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
  }, [currentLessonId, course]);

  // Initial fetch
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Navigate to lesson
  const navigateToLesson = async (moduleId: string, lessonId: string) => {
    setLoading(true);
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
    setProgressTracking({ startTime: Date.now(), lastUpdate: Date.now() });
    
    // Expand the module
    setExpandedModules(prev => new Set([...prev, moduleId]));
    
    await fetchCourseDetails(moduleId, lessonId);
  };

  // Navigate to module
  const navigateToModule = async (moduleId: string) => {
    setLoading(true);
    setCurrentModuleId(moduleId);
    setExpandedModules(prev => new Set([...prev, moduleId]));
    
    await fetchCourseDetails(moduleId);
    
    // Set first lesson of the module as current
    if (course) {
      const module = [course.first_module, ...course.other_modules].find(m => m.id === moduleId);
      if (module && module.lessons.length > 0) {
        setCurrentLessonId(module.lessons[0].id);
      }
    }
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

  // Get current lesson
  const getCurrentLesson = (): Lesson | null => {
    if (!course || !currentLessonId) return null;
    return course.first_module.lessons.find(l => l.id === currentLessonId) || null;
  };

  // Get all modules
  const getAllModules = (): Module[] => {
    if (!course) return [];
    return [course.first_module, ...course.other_modules];
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
        navigateToModule(nextModule.id);
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
    const currentLesson = getCurrentLesson();
    if (!currentLesson) return;
    
    await updateProgress(100, "completed");
    toast.success("Lesson completed!");
    
    // Auto-navigate to next lesson after 1 second
    setTimeout(() => {
      navigateLesson("next");
    }, 1000);
  };

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Check if course is 100% complete
  const isCourseCompleted = course.enrollment && course.enrollment.progress_percent >= 100;

  if (isCourseCompleted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center max-w-2xl px-8"
        >
          {/* Confetti animation */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-8xl"
              >
                🎉
              </motion.div>
              {/* Floating confetti pieces */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [-20, -60, -100],
                    x: [(i % 2 === 0 ? -1 : 1) * (20 + i * 10)],
                    opacity: [1, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute top-0 left-1/2"
                  style={{
                    fontSize: '24px',
                  }}
                >
                  {['🎊', '✨', '⭐', '🌟'][i % 4]}
                </motion.div>
              ))}
            </div>
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

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-100 mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 size={64} className="text-green-500" />
            </motion.div>
          </motion.div>

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
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const allModules = getAllModules();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0099DC] mb-4 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Home
          </button>
          
          <h2 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
            {course.title}
          </h2>
          
          {course.enrollment && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Overall Progress</span>
                <span className="font-semibold text-[#0099DC]">
                  {Math.round(course.enrollment.progress_percent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#0099DC] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.enrollment.progress_percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modules & Lessons List */}
        <div className="flex-1 overflow-y-auto">
          {allModules.map((module, moduleIndex) => (
            <div key={module.id} className="border-b border-gray-100">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {moduleIndex + 1}
                  </div>
                  <span className="font-semibold text-sm text-gray-900">{module.title}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
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
                      const isCompleted = lesson.progress?.status === "completed";
                      const isInProgress = lesson.progress?.status === "in_progress";
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => navigateToLesson(module.id, lesson.id)}
                          className={`w-full px-6 py-3 pl-16 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                            isActive ? "bg-blue-50" : ""
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={16} className="text-green-500 flex-shrink-0" />
                          ) : isInProgress ? (
                            <Circle size={16} className="text-[#0099DC] flex-shrink-0 fill-current" />
                          ) : (
                            <Circle size={16} className="text-gray-300 flex-shrink-0" />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isActive ? "text-[#0099DC]" : "text-gray-700"
                            }`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {lesson.estimated_minutes} min
                            </p>
                          </div>
                          
                          {isActive && (
                            <Play size={14} className="text-[#0099DC] flex-shrink-0" fill="currentColor" />
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentLesson ? (
          <>
            {/* Content Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLesson.title}
                  </h1>
                  {currentLesson.description && (
                    <p className="text-gray-600 text-sm">{currentLesson.description}</p>
                  )}
                  
                  {currentLesson.progress && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Lesson Progress</span>
                          <span className="font-semibold">
                            {Math.round(currentLesson.progress.progress_percent)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentLesson.progress.progress_percent}%` }}
                          />
                        </div>
                      </div>
                      
                      {currentLesson.progress.status !== "completed" && (
                        <button
                          onClick={markComplete}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Check size={16} />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
              {currentLesson.resources && currentLesson.resources.length > 0 ? (
                <div className="max-w-5xl mx-auto space-y-6">
                  {currentLesson.resources.map((resource) => (
                    <ResourceViewer
                      key={resource.id}
                      resource={resource}
                      onProgressUpdate={(percent) => updateProgress(percent, percent >= 100 ? "completed" : "in_progress")}
                    />
                  ))}
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Resources Available
                    </h3>
                    <p className="text-gray-500">
                      This lesson doesn't have any resources yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="bg-white border-t border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateLesson("prev")}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#0099DC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    allModules.indexOf(allModules.find(m => m.id === currentModuleId)!) === 0 &&
                    allModules[0].lessons.indexOf(currentLesson) === 0
                  }
                >
                  <ChevronLeft size={18} />
                  <span className="font-medium">Previous Lesson</span>
                </button>
                
                <button
                  onClick={() => navigateLesson("next")}
                  className="flex items-center gap-2 px-6 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    allModules.indexOf(allModules.find(m => m.id === currentModuleId)!) === allModules.length - 1 &&
                    allModules[allModules.length - 1].lessons.indexOf(currentLesson) === allModules[allModules.length - 1].lessons.length - 1
                  }
                >
                  <span className="font-medium">Next Lesson</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a lesson to start learning</p>
          </div>
        )}
      </div>
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
              Duration: {Math.floor(resource.duration_seconds / 60)} min
            </p>
          )}
        </div>
      </div>

      <div className="p-0">
        {resource.resource_type === "video" && (
          <video
            ref={videoRef}
            controls
            className="w-full"
            poster={resource.thumbnail_url}
          >
            <source src={resource.external_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {resource.resource_type === "pdf" && (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-blue-500 mb-4" />
            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => onProgressUpdate(100)}
            >
              Open PDF
            </a>
          </div>
        )}

        {resource.resource_type === "podcast" && (
          <div className="p-8">
            <audio controls className="w-full">
              <source src={resource.external_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
