import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Star, Users, Play, BookOpen, Filter, X, CheckCircle2, ChevronDown } from "lucide-react";
import { courses } from "../data/mockData";

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  Beginner: { bg: "#EBF7EB", text: "#2E7D32", border: "#A5D6A7" },
  Intermediate: { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  Advanced: { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
};

const categories = ["All", "Foundations", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Automation", "Generative AI", "Strategy"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const durations = ["Any Duration", "Under 4 hours", "4–6 hours", "6+ hours"];
const sortOptions = ["Most Popular", "Newest", "Shortest", "Highest Rated"];

function ProgressBar({ value, color = "#0099DC", height = 5 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: "rgba(0,0,0,0.07)" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: color, transition: "width 1s ease-out" }}
      />
    </div>
  );
}

function CourseCard({ course, index }: { course: typeof courses[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const levelStyle = levelColors[course.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: hovered ? "0 20px 50px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: hovered ? "1px solid rgba(0, 153, 220, 0.2)" : "1px solid rgba(0,0,0,0.05)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 190 }}>
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }}
        />

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.popular && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "#E5A800" }}
            >
              <Star size={9} fill="white" /> Popular
            </span>
          )}
          {course.completed && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "#4A8A2C" }}
            >
              <CheckCircle2 size={9} /> Completed
            </span>
          )}
        </div>

        {/* Category tag bottom */}
        <div className="absolute bottom-3 left-3">
          <span
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: `${course.color}CC`, backdropFilter: "blur(4px)" }}
          >
            {course.category}
          </span>
        </div>

        {/* Hover play button */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
              >
                <Play size={18} color="#0099DC" fill="#0099DC" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
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
          <div className="flex items-center gap-1">
            <Star size={12} color="#E5A800" fill="#E5A800" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A2332" }}>{course.rating}</span>
          </div>
        </div>

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

        <p
          className="mb-3 line-clamp-2"
          style={{ fontSize: "0.8rem", color: "#6B7A8D", fontFamily: "'Open Sans', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
        >
          {course.subtitle}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> {course.modules} modules
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {course.enrolled.toLocaleString()}
          </span>
        </div>

        {/* Progress if started */}
        {course.progress > 0 && !course.completed && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span style={{ fontSize: "0.72rem", color: "#9AA5B4" }}>Progress</span>
              <span style={{ fontSize: "0.72rem", color: "#0099DC", fontWeight: 600 }}>{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} />
          </div>
        )}

        {/* CTA */}
        <button
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            backgroundColor: course.completed ? "#F4F6F9" : course.progress > 0 ? "#0099DC" : "#1C3A5C",
            color: course.completed ? "#4A8A2C" : "#FFFFFF",
            border: course.completed ? "1px solid #A5D6A7" : "none",
          }}
        >
          {course.completed ? (
            <><CheckCircle2 size={14} /> Review Course</>
          ) : course.progress > 0 ? (
            <><Play size={12} fill="white" /> Continue</>
          ) : (
            <><Play size={12} fill="white" /> Start Course</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export function LearningContent() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedDuration, setSelectedDuration] = useState("Any Duration");
  const [selectedSort, setSelectedSort] = useState("Most Popular");
  const [showCompleted, setShowCompleted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredCourses = courses.filter((c) => {
    if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
    if (selectedLevel !== "All Levels" && c.level !== selectedLevel) return false;
    if (showCompleted && !c.completed) return false;
    if (selectedDuration === "Under 4 hours") {
      const hrs = parseFloat(c.duration);
      if (hrs >= 4) return false;
    }
    if (selectedDuration === "4–6 hours") {
      const hrs = parseFloat(c.duration);
      if (hrs < 4 || hrs > 6) return false;
    }
    if (selectedDuration === "6+ hours") {
      const hrs = parseFloat(c.duration);
      if (hrs <= 6) return false;
    }
    return true;
  });

  const sorted = [...filteredCourses].sort((a, b) => {
    if (selectedSort === "Highest Rated") return b.rating - a.rating;
    if (selectedSort === "Most Popular") return b.enrolled - a.enrolled;
    if (selectedSort === "Shortest") return parseFloat(a.duration) - parseFloat(b.duration);
    return 0;
  });

  const activeFilters = [
    selectedCategory !== "All" ? selectedCategory : null,
    selectedLevel !== "All Levels" ? selectedLevel : null,
    selectedDuration !== "Any Duration" ? selectedDuration : null,
    showCompleted ? "Completed only" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ backgroundColor: "rgba(0, 153, 220, 0.1)", border: "1px solid rgba(0, 153, 220, 0.2)" }}
        >
          <BookOpen size={13} color="#0099DC" />
          <span style={{ color: "#0099DC", fontSize: "0.78rem", fontWeight: 600 }}>LEARNING CATALOG</span>
        </div>
        <h1
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
            color: "#1A2332",
            lineHeight: 1.2,
          }}
        >
          Explore AI Courses
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
          {courses.length} courses designed to build your AI expertise
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: selectedCategory === cat ? "#1C3A5C" : "#FFFFFF",
              color: selectedCategory === cat ? "#FFFFFF" : "#6B7A8D",
              border: selectedCategory === cat ? "1px solid #1C3A5C" : "1px solid #E8EAED",
              boxShadow: selectedCategory === cat ? "0 2px 8px rgba(28,58,92,0.25)" : "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div
        className="rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
      >
        {/* Filter toggle */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: filtersOpen ? "#1C3A5C" : "#F4F6F9",
            color: filtersOpen ? "#FFFFFF" : "#4A5568",
          }}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Filter size={14} /> Filters
          {activeFilters.length > 0 && (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
            >
              {activeFilters.length}
            </span>
          )}
        </button>

        {/* Quick filter dropdowns */}
        {[
          { label: selectedLevel, options: levels, onChange: setSelectedLevel },
          { label: selectedDuration, options: durations, onChange: setSelectedDuration },
        ].map(({ label, options, onChange }) => (
          <div key={label} className="relative">
            <select
              value={label}
              onChange={(e) => onChange(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: "#F4F6F9",
                color: "#4A5568",
                border: "1px solid #E8EAED",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9AA5B4" }} />
          </div>
        ))}

        {/* Completed toggle */}
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: showCompleted ? "rgba(74, 138, 44, 0.1)" : "#F4F6F9",
            color: showCompleted ? "#4A8A2C" : "#4A5568",
            border: showCompleted ? "1px solid rgba(74, 138, 44, 0.3)" : "1px solid #E8EAED",
          }}
        >
          <CheckCircle2 size={14} /> Completed
        </button>

        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "0.8rem", color: "#9AA5B4" }}>Sort by:</span>
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: "#F4F6F9",
                color: "#1A2332",
                border: "1px solid #E8EAED",
                outline: "none",
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9AA5B4" }} />
          </div>
        </div>

        {/* Results count */}
        <span style={{ fontSize: "0.8rem", color: "#9AA5B4" }}>
          {sorted.length} result{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeFilters.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: "rgba(0,153,220,0.1)", color: "#0099DC", border: "1px solid rgba(0,153,220,0.2)" }}
            >
              {f}
              <button
                onClick={() => {
                  if (f === selectedCategory) setSelectedCategory("All");
                  if (f === selectedLevel) setSelectedLevel("All Levels");
                  if (f === selectedDuration) setSelectedDuration("Any Duration");
                  if (f === "Completed only") setShowCompleted(false);
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedLevel("All Levels");
              setSelectedDuration("Any Duration");
              setShowCompleted(false);
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ color: "#9AA5B4", border: "1px solid #E8EAED" }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Course Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "#F4F6F9" }}
          >
            <BookOpen size={28} color="#9AA5B4" />
          </div>
          <h3 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>
            No courses found
          </h3>
          <p style={{ color: "#9AA5B4", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Try adjusting your filters
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedLevel("All Levels");
              setSelectedDuration("Any Duration");
              setShowCompleted(false);
            }}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}