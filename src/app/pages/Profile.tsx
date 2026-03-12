import { useState } from "react";
import { motion } from "motion/react";
import {
  Edit2, Camera, Mail, Building2, Award, BookOpen, Clock, Zap, Trophy,
  MapPin, Calendar, Shield, TrendingUp, ChevronRight, Star,
} from "lucide-react";
import { currentUser, courses, courseHistory } from "../data/mockData";
import coverImage from "../../assets/7fd3dad4efe18ada7c508db557505a6fb72bb193.png";

export function Profile() {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "badges">("overview");

  const earnedBadges = currentUser.badges.filter((b) => b.earned);
  const inProgressCourses = courses.filter((c) => c.progress > 0 && !c.completed);

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
      >
        {/* Cover */}
        <div
          className="relative h-36 lg:h-48 overflow-hidden"
        >
          <img
            src={coverImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(13,35,64,0.18) 0%, rgba(13,35,64,0.35) 55%, rgba(255,255,255,1) 100%)" }}
          />
          {/* Edit button */}
          <button
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/20"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onClick={() => setEditing(!editing)}
          >
            <Edit2 size={13} /> {editing ? "Save Profile" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Info */}
        <div className="bg-white px-6 lg:px-10 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 mb-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover"
                style={{
                  border: "4px solid #FFFFFF",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              />
              {editing && (
                <button
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#0099DC", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                >
                  <Camera size={13} color="white" />
                </button>
              )}
            </div>

            <div className="flex-1 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                   style={{
                     fontFamily: "'Nunito', sans-serif",
                     fontWeight: 800,
                     fontSize: "1.6rem",
                     color: "#1A2332",
                     lineHeight: 1.2,
                   }}
                 >
                  {currentUser.name}
                </h1>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,153,220,0.1)", border: "1px solid rgba(0,153,220,0.2)" }}
                >
                  <Shield size={11} color="#0099DC" />
                  <span style={{ color: "#0099DC", fontSize: "0.75rem", fontWeight: 600 }}>
                    {currentUser.level}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(229,168,0,0.1)", border: "1px solid rgba(229,168,0,0.2)" }}
                >
                  <Trophy size={11} color="#E5A800" />
                  <span style={{ color: "#E5A800", fontSize: "0.75rem", fontWeight: 600 }}>
                    Rank #{currentUser.rank}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
                  <Building2 size={13} color="#9AA5B4" /> {currentUser.role}
                </span>
                <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
                  <MapPin size={13} color="#9AA5B4" /> {currentUser.department}
                </span>
                <span className="flex items-center gap-1.5" style={{ color: "#6B7A8D", fontSize: "0.85rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
                  <Calendar size={13} color="#9AA5B4" /> Member since {currentUser.joinDate}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 sm:ml-auto">
              {[
                { icon: Zap, value: currentUser.points.toLocaleString(), label: "Points", color: "#E5A800" },
                { icon: BookOpen, value: currentUser.completedCourses, label: "Completed", color: "#0099DC" },
                { icon: Clock, value: `${currentUser.totalHours}h`, label: "Learned", color: "#4A8A2C" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="text-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"
                    style={{ backgroundColor: `${color}12` }}
                  >
                    <Icon size={16} color={color} />
                  </div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }}>
                    {value}
                  </p>
                  <p style={{ fontSize: "0.7rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, color: "#9AA5B4" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-2 border-b" style={{ borderColor: "#F0F1F5" }}>
            {(["overview", "history", "badges"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 text-sm font-medium capitalize transition-all duration-200 relative"
                style={{ color: activeTab === tab ? "#0099DC" : "#9AA5B4" }}
              >
                {tab === "history" ? "Course History" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "#0099DC" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Edit Profile Form */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <h2
               className="mb-5"
               style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
             >
               Personal Information
             </h2>
            <div className="space-y-4">
              {[
                { label: "Full Name", value: currentUser.name, icon: null },
                { label: "Email", value: "a0834108@tec.mx", icon: Mail },
                { label: "Department", value: currentUser.department, icon: Building2 },
                { label: "Role", value: currentUser.role, icon: Shield },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                  </label>
                  <div
                    className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: editing ? "#FFFFFF" : "#F9FAFB",
                      border: `1.5px solid ${editing ? "#0099DC" : "#E8EAED"}`,
                    }}
                  >
                    {Icon && <Icon size={14} color="#9AA5B4" />}
                    {editing ? (
                      <input
                        defaultValue={value}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: "#1A2332", fontFamily: "'Open Sans', sans-serif" }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.9rem", color: "#1A2332" }}>{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div
            className="rounded-2xl p-6 lg:col-span-2"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <h2
               className="mb-5"
               style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
             >
               In Progress
             </h2>
            <div className="space-y-4">
              {inProgressCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  style={{ border: "1px solid #F0F1F5" }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 600, fontFamily: "'Open Sans', sans-serif", fontSize: "0.9rem", color: "#1A2332" }}>{course.title}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, marginBottom: "0.5rem" }}>
                      {course.level} · {course.duration}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, backgroundColor: "rgba(0,0,0,0.07)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${course.progress}%`, backgroundColor: "#0099DC" }}
                        />
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#0099DC", fontWeight: 600, flexShrink: 0 }}>
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#9AA5B4" />
                </div>
              ))}

              {/* Level Progress */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(0,153,220,0.05), rgba(28,58,92,0.05))",
                  border: "1px solid rgba(0,153,220,0.15)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} color="#0099DC" />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1A2332" }}>
                      Level Progress: {currentUser.level}
                    </span>
                  </div>
                  <span style={{ color: "#0099DC", fontWeight: 700, fontSize: "0.85rem" }}>
                    {currentUser.levelProgress}%
                  </span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: "rgba(0,0,0,0.07)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${currentUser.levelProgress}%`,
                      background: "linear-gradient(to right, #0099DC, #1C3A5C)",
                    }}
                  />
                </div>
                <p style={{ color: "#9AA5B4", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  Complete more courses to reach Advanced level
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <h2
             className="mb-5"
             style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}
           >
             Course History
           </h2>
          <div className="space-y-4">
            {courseHistory.map((item) => {
              const course = courses.find((c) => c.id === item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  style={{ border: "1px solid #F0F1F5" }}
                >
                  {course && (
                    <img
                      src={course.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p style={{ fontWeight: 600, fontFamily: "'Open Sans', sans-serif", fontSize: "0.95rem", color: "#1A2332" }}>{item.title}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300 }}>Completed on {item.completedDate}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "#EBF7EB", color: "#2E7D32" }}
                      >
                        ✓ Completed
                      </span>
                      <span style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                        <Clock size={11} className="inline mr-1" />{item.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star size={14} color="#E5A800" fill="#E5A800" />
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#1A2332" }}>
                        {item.score}%
                      </span>
                    </div>
                    <p style={{ color: "#9AA5B4", fontSize: "0.72rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300 }}>Final Score</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {activeTab === "badges" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 pb-10"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
              All Achievements
            </h2>
            <span
              className="px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#E5A800" }}
            >
              {earnedBadges.length} / {currentUser.badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentUser.badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={badge.earned ? { scale: 1.05, y: -2 } : {}}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer"
                style={{
                  backgroundColor: badge.earned ? `${badge.color}0D` : "#F9FAFB",
                  border: badge.earned ? `1.5px solid ${badge.color}30` : "1.5px solid #F0F1F5",
                  opacity: badge.earned ? 1 : 0.5,
                  filter: badge.earned ? "none" : "grayscale(0.8)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: badge.earned ? `${badge.color}18` : "#F0F1F5" }}
                >
                  {badge.icon}
                </div>
                <div className="text-center">
                  <p
                     style={{
                       fontWeight: 700,
                       fontFamily: "'Open Sans', sans-serif",
                       fontSize: "0.85rem",
                       color: badge.earned ? badge.color : "#9AA5B4",
                     }}
                   >
                    {badge.name}
                  </p>
                  <p style={{ fontSize: "0.72rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, color: "#9AA5B4", marginTop: "0.3rem", lineHeight: 1.4 }}>
                    {badge.description}
                  </p>
                </div>
                {!badge.earned && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: "#F0F1F5", color: "#9AA5B4" }}
                  >
                    Locked
                  </span>
                )}
                {badge.earned && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                  >
                    Earned ✓
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}