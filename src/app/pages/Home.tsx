import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Play,
  ArrowRight,
  ChevronRight,
  Clock,
  BarChart2,
  Trophy,
  TrendingUp,
  Flame,
  Star,
  Zap,
} from "lucide-react";
import { scoreboard } from "../data/mockData";
import { useAuth } from "../hooks/useAuth";

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  Beginner: { bg: "#EBF7EB", text: "#2E7D32", border: "#A5D6A7" },
  Intermediate: { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  Advanced: { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
};

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

function CourseCard({ course }: { course: any }) {
  const navigate = useNavigate();
  const levelStyle = levelColors[course.level] || levelColors.Beginner;

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
      onClick={() => navigate("/learning")}
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
        {course.popular && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: "#E5A800", fontSize: "0.7rem", fontWeight: 600 }}
          >
            <Star size={10} fill="white" /> Popular
          </div>
        )}
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
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: levelStyle.bg,
              color: levelStyle.text,
              border: `1px solid ${levelStyle.border}`,
            }}
          >
            {course.level}
          </span>
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
          className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
          style={{
            backgroundColor: course.progress > 0 && !course.completed ? "#0099DC" : course.completed ? "#F4F6F9" : "#1C3A5C",
            color: course.completed ? "#4A8A2C" : "#FFFFFF",
            border: course.completed ? "1px solid #A5D6A7" : "none",
          }}
        >
          {course.completed ? "Review Course" : course.progress > 0 ? "Continue →" : "Start Course"}
        </button>
      </div>
    </motion.div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all courses
        const coursesRes = await fetch('/api/v1/courses/');
        const coursesData = coursesRes.ok ? await coursesRes.json() : [];

        // Fetch user pending courses for progress
        const pendingRes = await fetch('/api/v1/courses/user/pending');
        const pendingData = pendingRes.ok ? await pendingRes.json() : [];

        // Map and merge data
        const mappedCourses = coursesData.map((c: any) => {
          const enrollment = pendingData.find((p: any) => p.course_id === c.id);
          const hours = Math.floor(c.estimated_minutes / 60);
          const minutes = c.estimated_minutes % 60;
          
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            image: c.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            duration: `${hours}h ${minutes}m`,
            level: "Beginner", // Default since API doesn't provide it
            progress: enrollment ? enrollment.progress_percent : 0,
            completed: enrollment?.status === 'completed',
            popular: false, // Default since API doesn't provide it
            rating: 4.5,
          };
        });
        
        setCourses(mappedCourses);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]); // Re-fetch if user changes, though mainly on mount

  if (!user || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const inProgressCourse = courses.find((c) => c.progress > 0 && !c.completed);
  const recommendedCourses = courses.filter((c) => !c.completed && c.id !== inProgressCourse?.id).slice(0, 5);
  const isRankOne = user.rank === 1;
  const rankAbove = scoreboard.find((s) => s.rank === (user.rank || 0) - 1);

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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
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

              {/* Rank message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {isRankOne ? (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(229, 168, 0, 0.2)", border: "1px solid rgba(229, 168, 0, 0.5)" }}
                  >
                    <Trophy size={16} color="#E5A800" />
                    <span style={{ color: "#E5A800", fontWeight: 600, fontSize: "0.9rem", fontFamily: "'Open Sans', sans-serif" }}>
                      🏆 You're ranked #1! Keep leading the way!
                    </span>
                  </div>
                ) : (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(0, 153, 220, 0.15)", border: "1px solid rgba(0, 153, 220, 0.3)" }}
                  >
                    <TrendingUp size={16} color="#0099DC" />
                    <span style={{ color: "#C5E4F5", fontSize: "0.9rem", fontFamily: "'Open Sans', sans-serif" }}>
                      You're in position{" "}
                      <strong style={{ color: "#FFFFFF" }}>#{user.rank}</strong>, just{" "}
                      <strong style={{ color: "#0099DC" }}>
                        {rankAbove ? rankAbove.points - (user.points || 0) : 0} pts
                      </strong>{" "}
                      behind{" "}
                      <strong style={{ color: "#FFFFFF" }}>{rankAbove?.name || "Leader"}</strong>
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-wrap items-center gap-6 mt-6"
              >
                {[
                  { icon: Trophy, label: "Rank", value: `#${user.rank}`, color: "#E5A800" },
                  { icon: Zap, label: "Points", value: (user.points || 0).toLocaleString(), color: "#0099DC" },
                  { icon: Flame, label: "Day Streak", value: `${user.streak}d`, color: "#E87830" },
                  { icon: BarChart2, label: "Completed", value: `${user.completedCourses} courses`, color: "#4A8A2C" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}22` }}
                    >
                      <Icon size={14} color={color} />
                    </div>
                    <div>
                      <p style={{ color: "#89B8D4", fontSize: "0.7rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300 }}>{label}</p>
                      <p style={{ color: "#FFFFFF", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Level Progress Circle */}
            {/* Using mock level progress for now since it's not in user model explicitly */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden lg:flex flex-col items-center gap-3"
            >
              <div className="relative" style={{ width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle
                    cx="70"
                    cy="70"
                    r="58"
                    fill="none"
                    stroke="#0099DC"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 58 * 0.68} ${2 * Math.PI * 58}`} // 68% hardcoded
                    strokeDashoffset={2 * Math.PI * 58 * 0.25}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>{user.level || "Beginner"}</span>
                  <span style={{ fontSize: "0.75rem", color: "#89B8D4" }}>Current Level</span>
                </div>
              </div>
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
            {inProgressCourse ? (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="flex items-center gap-2 text-xl font-bold"
                    style={{ color: "#1A2332", fontFamily: "'Nunito', sans-serif" }}
                  >
                    <Play size={20} className="fill-current text-[#0099DC]" />
                    Continue Learning
                  </h2>
                </div>

                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                  className="rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center"
                  style={{
                    background: "linear-gradient(145deg, #1C3A5C 0%, #0D2340 100%)",
                    color: "white",
                  }}
                  onClick={() => navigate("/learning")}
                >
                  <div className="relative flex-shrink-0 w-full md:w-48 aspect-video rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                    <img
                      src={inProgressCourse.image}
                      alt={inProgressCourse.title}
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
                        <Clock size={12} /> {inProgressCourse.duration} Left
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-1 leading-tight">{inProgressCourse.title}</h3>
                    <p className="text-sm text-[#89B8D4] mb-4 line-clamp-1">{inProgressCourse.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-white">{inProgressCourse.progress}% Complete</span>
                        <span className="text-[#89B8D4]">3/12 Lessons</span>
                      </div>
                      <ProgressBar value={inProgressCourse.progress} color="#0099DC" height={8} />
                    </div>
                  </div>

                  <div className="hidden md:flex items-center justify-center bg-white/10 rounded-full w-12 h-12 flex-shrink-0 hover:bg-[#0099DC] transition-colors cursor-pointer">
                    <ArrowRight size={20} />
                  </div>
                </motion.div>
              </section>
            ) : null}

            {/* Recommended Courses */}
            <section>
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
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Daily Goal */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TargetIcon /> Daily Goal
                </h3>
                <span className="text-xs font-semibold text-gray-500">2/3 Tasks</span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full border-4 border-[#0099DC] flex items-center justify-center text-[#0099DC] font-bold">
                  66%
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Keep it up, {user.first_name}!</p>
                  <p className="text-xs text-gray-400">You're on a 5-day streak</p>
                </div>
              </div>
              <button className="w-full py-2 bg-[#F4F6F9] text-[#1C3A5C] text-sm font-bold rounded-lg hover:bg-[#E3F2FD] transition-colors">
                View Details
              </button>
            </div>
            
             {/* Leaderboard Preview */}
             {/* Keeping this static/mock or assume empty */}
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C85A2A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
