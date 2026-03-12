import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  Trophy, Zap, Clock, BookOpen, Target, TrendingUp, Star, Award, Flame,
} from "lucide-react";
import { scoreboard, weeklyActivity, monthlyProgress, courseHistory } from "../data/mockData";
import { useAuth } from "../hooks/useAuth";

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const steps = 40;
    const stepVal = target / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(stepVal * step), target));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <>{current}</>;
}

function ProgressRing({ value, size = 120, strokeWidth = 10, color = "#0099DC" }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedValue(value), 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference * animatedValue / 100} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: "stroke-dasharray 1.5s ease-out", filter: `drop-shadow(0 0 6px ${color}50)` }}
      />
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl"
        style={{ backgroundColor: "#1C3A5C", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p style={{ color: "#89B8D4", fontSize: "0.75rem" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem" }}>
            {p.value} {p.name === "minutes" ? "min" : p.name === "points" ? "pts" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MyProgress() {
  const { user } = useAuth();
  
  if (!user) return <div className="p-10 text-center">Loading...</div>;

  const nextRankUser = scoreboard.find((s) => s.rank === (user.rank || 0) - 1);
  const ptsToNext = nextRankUser ? nextRankUser.points - (user.points || 0) : 0;

  const stats = [
    { label: "Completed Courses", value: user.completedCourses || 0, icon: BookOpen, color: "#0099DC", suffix: "" },
    { label: "Total XP Points", value: user.points || 0, icon: Zap, color: "#E5A800", suffix: "" },
    { label: "Learning Hours", value: user.totalHours || 0, icon: Clock, color: "#4A8A2C", suffix: "h" },
    { label: "Average Score", value: user.avgScore || 0, icon: Target, color: "#E87830", suffix: "%" },
    { label: "Day Streak", value: user.streak || 0, icon: Flame, color: "#C85A2A", suffix: "d" },
    { label: "Global Rank", value: user.rank || 0, icon: Trophy, color: "#1C3A5C", suffix: "" },
  ];

  const earnedBadges = (user.badges || []).filter((b: any) => b.earned);

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ backgroundColor: "rgba(74, 138, 44, 0.1)", border: "1px solid rgba(74, 138, 44, 0.2)" }}
        >
          <TrendingUp size={13} color="#4A8A2C" />
          <span style={{ color: "#4A8A2C", fontSize: "0.78rem", fontWeight: 600 }}>MY PROGRESS</span>
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
          Your Learning Dashboard
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.5rem", fontSize: "0.95rem", fontFamily: "'Open Sans', sans-serif", fontWeight: 400 }}>
          Keep up the momentum — you're doing great!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, suffix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon size={16} color={color} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#1A2332",
                  lineHeight: 1.1,
                }}
              >
                <AnimatedNumber target={value} />{suffix}
              </p>
              <p style={{ color: "#9AA5B4", fontSize: "0.73rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, marginTop: "0.2rem" }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #0D2340, #1C3A5C)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            gridColumn: "span 1",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Star size={16} color="#E5A800" />
            <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#FFFFFF" }}>
              Current Level
            </h2>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "#FFFFFF",
                  lineHeight: 1.1,
                }}
              >
                {user.level || "Beginner"}
              </p>
              <p style={{ color: "#89B8D4", fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300, marginTop: "0.2rem" }}>
                {68}% to Advanced
              </p>
            </div>
            <div className="relative">
              <ProgressRing value={68} size={90} strokeWidth={8} color="#0099DC" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#FFFFFF" }}>
                  {68}%
                </span>
              </div>
            </div>
          </div>

          {/* Rank vs next */}
          {nextRankUser && (
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: "#89B8D4", fontSize: "0.75rem" }}>
                  {ptsToNext} pts to pass {nextRankUser.name}
                </span>
                <span style={{ color: "#E5A800", fontSize: "0.75rem", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>#{user.rank} → #{user.rank! - 1}</span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 6, backgroundColor: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((user.points || 0) / nextRankUser.points) * 100}%`,
                    background: "linear-gradient(to right, #0099DC, #E5A800)",
                    transition: "width 1.5s ease-out",
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-6 lg:col-span-2"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                Weekly Activity
              </h2>
              <p style={{ color: "#9AA5B4", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300 }}>Minutes spent learning this week</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: "rgba(0,153,220,0.1)", border: "1px solid rgba(0,153,220,0.15)" }}
            >
              <span style={{ color: "#0099DC", fontSize: "0.8rem", fontWeight: 600 }}>
                {weeklyActivity.reduce((a, b) => a + b.minutes, 0)} min total
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyActivity} barSize={28}>
              <CartesianGrid vertical={false} stroke="#F0F1F5" />
              <XAxis dataKey="day" tick={{ fill: "#9AA5B4", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9AA5B4", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,153,220,0.05)" }} />
              <Bar dataKey="minutes" name="minutes" radius={[6, 6, 0, 0]}
                fill="url(#barGradient)"
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0099DC" />
                  <stop offset="100%" stopColor="#1C3A5C" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

       {/* Monthly Points Chart */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
              XP Points Over Time
            </h2>
            <p style={{ color: "#9AA5B4", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 300 }}>Cumulative score progression</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: "rgba(229, 168, 0, 0.1)", border: "1px solid rgba(229, 168, 0, 0.2)" }}
          >
            <span style={{ color: "#E5A800", fontSize: "0.8rem", fontWeight: 600 }}>
              +{(user.points || 0).toLocaleString()} total pts
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyProgress}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0099DC" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0099DC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F0F1F5" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#9AA5B4", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9AA5B4", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="points"
              stroke="#0099DC"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              dot={{ fill: "#0099DC", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#0099DC" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award size={16} color="#E5A800" />
              <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                Achievements
              </h2>
            </div>
            <span
              className="px-2 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "rgba(229,168,0,0.1)", color: "#E5A800" }}
            >
              {earnedBadges.length}/{user.badges?.length || 0} earned
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {(user.badges || []).map((badge: any) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: badge.earned ? `${badge.color}12` : "#F9FAFB",
                  border: badge.earned ? `1.5px solid ${badge.color}30` : "1.5px solid #F0F1F5",
                  opacity: badge.earned ? 1 : 0.45,
                  filter: badge.earned ? "none" : "grayscale(1)",
                }}
                title={badge.description}
              >
                <span style={{ fontSize: "1.4rem" }}>{badge.icon}</span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: badge.earned ? badge.color : "#9AA5B4",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scoreboard Position */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Trophy size={16} color="#E5A800" />
              <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
                Leaderboard
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {scoreboard.map((sUser) => {
              // Highlight if rank matches current user rank as approximation
              const isCurrentUser = sUser.rank === user.rank; 
              const rankColors: Record<number, string> = { 1: "#E5A800", 2: "#9AA5B4", 3: "#E87830" };
              return (
                <div
                  key={sUser.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: isCurrentUser ? "rgba(0, 153, 220, 0.05)" : "transparent",
                    border: isCurrentUser ? "1.5px solid rgba(0, 153, 220, 0.2)" : "1.5px solid transparent",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: rankColors[sUser.rank] || "#9AA5B4",
                      width: 20,
                      textAlign: "center",
                    }}
                  >
                    {sUser.rank <= 3 ? ["🥇", "🥈", "🥉"][sUser.rank - 1] : sUser.rank}
                  </span>
                  <img src={sUser.avatar} alt={sUser.name} className="w-8 h-8 rounded-full object-cover" style={{ border: isCurrentUser ? "2px solid #0099DC" : "2px solid #E8EAED" }} />
                  <div className="flex-1">
                    <p style={{ fontSize: "0.85rem", fontWeight: isCurrentUser ? 700 : 600, fontFamily: "'Open Sans', sans-serif", color: isCurrentUser ? "#0099DC" : "#1A2332" }}>
                      {sUser.name} {isCurrentUser && <span style={{ fontSize: "0.72rem", color: "#0099DC" }}>(You)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={11} color="#E5A800" />
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1A2332" }}>
                      {sUser.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

       {/* Course History */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl p-6 mb-10"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={16} color="#0099DC" />
            <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A2332" }}>
              Completed Courses
            </h2>
             </div>
             </div>
             {/* Using mock history for now as API doesn't support completed courses efficiently yet */}
             <div className="space-y-4">
                {courseHistory.map((course) => (
                    <div key={course.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                         <span>{course.title}</span>
                         <span className="text-sm text-green-600 font-semibold">{course.score}%</span>
                    </div>
                ))}
             </div>
      </motion.div>
    </div>
  );
}
