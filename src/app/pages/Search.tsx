import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search as SearchIcon, Clock, BookOpen, Play, Star, X, TrendingUp, Sparkles } from "lucide-react";
import { courses } from "../data/mockData";

const suggestions = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Prompt Engineering",
  "AI Strategy",
  "Neural Networks",
  "Automation",
];

const trendingSearches = [
  { label: "Prompt Engineering", count: "1.5k learners" },
  { label: "AI Fundamentals", count: "1.2k learners" },
  { label: "Machine Learning", count: "987 learners" },
  { label: "NLP", count: "812 learners" },
];

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  Beginner: { bg: "#EBF7EB", text: "#2E7D32", border: "#A5D6A7" },
  Intermediate: { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  Advanced: { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
};

export function Search() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredSuggestions = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const results = query
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          c.level.toLowerCase().includes(query.toLowerCase()) ||
          c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSearch = (value: string) => {
    setQuery(value);
    setHasSearched(true);
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ backgroundColor: "rgba(0,153,220,0.1)", border: "1px solid rgba(0,153,220,0.2)" }}
        >
          <Sparkles size={13} color="#0099DC" />
          <span style={{ color: "#0099DC", fontSize: "0.78rem", fontWeight: 600 }}>SEARCH</span>
        </div>
        <h1
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            color: "#1A2332",
            lineHeight: 1.2,
          }}
        >
          Find Your Next Course
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.6rem", fontSize: "0.95rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
          Search across {courses.length} AI courses tailored for Whirlpool professionals
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10 relative">
        <motion.div
          animate={{
            boxShadow: focused
              ? "0 0 0 4px rgba(0,153,220,0.15), 0 8px 32px rgba(0,0,0,0.1)"
              : "0 4px 20px rgba(0,0,0,0.08)",
          }}
          className="relative rounded-2xl overflow-visible"
          style={{
            backgroundColor: "#FFFFFF",
            border: `2px solid ${focused ? "#0099DC" : "#E8EAED"}`,
            transition: "border-color 0.2s",
          }}
        >
          <div className="flex items-center px-4 py-4">
            <SearchIcon size={20} color={focused ? "#0099DC" : "#9AA5B4"} className="flex-shrink-0 mr-3" style={{ transition: "color 0.2s" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder="Search courses, topics, skills..."
              className="flex-1 bg-transparent outline-none"
              style={{
                fontSize: "1rem",
                color: "#1A2332",
                fontFamily: "'Open Sans', sans-serif",
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setHasSearched(false); }}
                className="w-6 h-6 rounded-full flex items-center justify-center ml-2"
                style={{ backgroundColor: "#E8EAED" }}
              >
                <X size={12} color="#6B7A8D" />
              </button>
            )}
            <button
              onClick={() => handleSearch(query)}
              className="ml-3 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "#1C3A5C", color: "#FFFFFF", flexShrink: 0 }}
            >
              Search
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {focused && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                  border: "1px solid #E8EAED",
                }}
              >
                <div className="p-2">
                  <p
                    className="px-3 py-2"
                    style={{ color: "#9AA5B4", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    {query ? "Suggestions" : "Popular Topics"}
                  </p>
                  {filteredSuggestions.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => handleSearch(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(0,153,220,0.08)" }}
                      >
                        <SearchIcon size={12} color="#0099DC" />
                      </div>
                      <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>
                        {s.split(new RegExp(`(${query})`, "gi")).map((part, i) =>
                          part.toLowerCase() === query.toLowerCase()
                            ? <strong key={i} style={{ color: "#0099DC" }}>{part}</strong>
                            : part
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Results or Default Content */}
      <AnimatePresence mode="wait">
        {hasSearched && query ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1.1rem", color: "#1A2332" }}
                >
                  {results.length > 0 ? `${results.length} result${results.length !== 1 ? "s" : ""} for ` : "No results for "}
                  <span style={{ color: "#0099DC" }}>"{query}"</span>
                </h2>
                {results.length > 0 && (
                  <p style={{ color: "#9AA5B4", fontSize: "0.82rem", marginTop: "0.2rem" }}>
                    Showing best matches
                  </p>
                )}
              </div>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((course, i) => {
                  const levelStyle = levelColors[course.level];
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E8EAED",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Image */}
                      <div className="relative flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 80, height: 80 }}>
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        {course.completed && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: "rgba(74, 138, 44, 0.7)" }}
                          >
                            <span style={{ fontSize: "1.4rem" }}>✓</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
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
                          <span style={{ fontSize: "0.75rem", color: "#9AA5B4" }}>{course.category}</span>
                        </div>
                        <h3
                           style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1A2332" }}
                         >
                           {course.title}
                         </h3>
                         <p style={{ color: "#6B7A8D", fontFamily: "'Open Sans', sans-serif", fontWeight: 400, fontSize: "0.82rem", marginTop: "0.2rem" }} className="line-clamp-1">
                           {course.subtitle}
                         </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                          <span className="flex items-center gap-1"><BookOpen size={12} /> {course.modules} modules</span>
                          <span className="flex items-center gap-1"><Star size={11} color="#E5A800" fill="#E5A800" /> {course.rating}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      {course.progress > 0 && !course.completed && (
                        <div className="hidden sm:block text-center" style={{ minWidth: 80 }}>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 relative"
                            style={{ border: "3px solid #E8EAED" }}
                          >
                            <svg className="absolute inset-0" width="48" height="48" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="#0099DC" strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 20 * course.progress / 100} ${2 * Math.PI * 20}`}
                                strokeDashoffset={2 * Math.PI * 20 * 0.25}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0099DC" }}>{course.progress}%</span>
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "#9AA5B4" }}>In progress</span>
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 flex-shrink-0"
                        style={{
                          backgroundColor: course.completed ? "#F4F6F9" : course.progress > 0 ? "#0099DC" : "#1C3A5C",
                          color: course.completed ? "#4A8A2C" : "#FFFFFF",
                          border: course.completed ? "1px solid #A5D6A7" : "none",
                          minWidth: 100,
                          justifyContent: "center",
                        }}
                      >
                        {course.completed ? (
                          "Review"
                        ) : (
                          <><Play size={12} fill="white" /> {course.progress > 0 ? "Continue" : "Start"}</>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#F4F6F9" }}
                >
                  <SearchIcon size={28} color="#9AA5B4" />
                </div>
                <h3 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>
                  No courses found
                </h3>
                <p style={{ color: "#9AA5B4", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Try a different search term
                </p>
                <button
                  onClick={() => { setQuery(""); setHasSearched(false); }}
                  className="mt-4 px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#0099DC", color: "#FFFFFF" }}
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} color="#E5A800" />
                  <h2
                    style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
                  >
                    Trending Searches
                  </h2>
                </div>
                <div className="space-y-2">
                  {trendingSearches.map(({ label, count }) => (
                    <button
                      key={label}
                      onClick={() => handleSearch(label)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl hover:border-blue-200 transition-all text-left"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E8EAED",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(229,168,0,0.1)" }}
                      >
                        <TrendingUp size={14} color="#E5A800" />
                      </div>
                      <div className="flex-1">
                        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A2332" }}>{label}</span>
                        <p style={{ fontSize: "0.75rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, color: "#9AA5B4" }}>{count}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse by Topic */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} color="#0099DC" />
                  <h2
                     style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
                   >
                     Browse by Topic
                   </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#4A5568",
                        border: "1px solid #E8EAED",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent courses quick access */}
            <div className="max-w-4xl mx-auto mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} color="#4A8A2C" />
                <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                  All Courses
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.slice(0, 4).map((course) => {
                  const levelStyle = levelColors[course.level];
                  return (
                    <button
                      key={course.id}
                      onClick={() => handleSearch(course.title)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}
                    >
                      <img src={course.image} alt={course.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 600, fontFamily: "'Open Sans', sans-serif", fontSize: "0.85rem", color: "#1A2332" }} className="truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
                          >
                            {course.level}
                          </span>
                          <span style={{ fontSize: "0.72rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, color: "#9AA5B4" }}>{course.duration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </div>
  );
}