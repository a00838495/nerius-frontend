import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { EarnedBadge } from "../types/badges";

interface BadgeCelebrationOverlayProps {
  badge: EarnedBadge | null;
  hasMoreBadges?: boolean;
  onClose: () => void;
}

export function BadgeCelebrationOverlay({
  badge,
  hasMoreBadges = false,
  onClose,
}: BadgeCelebrationOverlayProps) {
  useEffect(() => {
    if (!badge) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [badge, onClose]);

  if (!badge) {
    return null;
  }

  const primaryColor = badge.badge.main_color || "#0099DC";
  const secondaryColor = badge.badge.secondary_color || "#1C3A5C";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(104,194,255,0.30),transparent_36%),linear-gradient(145deg,#06172d_0%,#0e2b56_45%,#0099dc_100%)] px-4 py-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.06, 0.98, 1],
            opacity: [0.25, 0.5, 0.3, 0.4],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${primaryColor}60 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{
            x: [0, 24, -18, 0],
            y: [0, -18, 14, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-8 h-48 w-48 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${secondaryColor}4a 0%, transparent 72%)` }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute right-[12%] top-[16%] h-32 w-32 rounded-full border border-white/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute left-[10%] bottom-[18%] h-24 w-24 rounded-full border border-white/10"
        />

        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/16 bg-white/10 p-6 backdrop-blur-xl shadow-[0_30px_120px_rgba(3,26,56,0.45)] md:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/16 to-transparent" />

          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
              <Sparkles size={16} className="text-[#8ed8ff]" />
              Nueva badge desbloqueada
            </div>

            <div className="relative mb-8 mt-2 flex h-[280px] w-full items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                className="absolute h-60 w-60 rounded-full border border-white/18"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute h-72 w-72 rounded-full border border-white/10"
              />
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-52 w-52 items-center justify-center"
              >
                <div
                  className="absolute bottom-2 left-8 h-24 w-12 rounded-b-[2rem] rounded-t-lg"
                  style={{
                    background: `linear-gradient(180deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
                  }}
                />
                <div
                  className="absolute bottom-2 right-8 h-24 w-12 rounded-b-[2rem] rounded-t-lg"
                  style={{
                    background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full shadow-[0_0_45px_rgba(255,255,255,0.16)]"
                  style={{ background: `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                />
                <div className="absolute inset-[10px] rounded-full border border-white/35 bg-white/12" />
                <div className="absolute inset-[22px] rounded-full bg-white/95 shadow-[inset_0_8px_24px_rgba(3,26,56,0.12)]" />
                <div className="absolute inset-[34px] rounded-full bg-gradient-to-b from-white to-slate-100" />

                <div
                  className="absolute inset-[46px] rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${primaryColor}24 0%, rgba(255,255,255,0.92) 58%, ${secondaryColor}18 100%)`,
                  }}
                />

                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(3,26,56,0.16)] md:h-28 md:w-28">
                  <ImageWithFallback
                    src={badge.badge.icon_url}
                    alt={badge.badge.name}
                    className="h-14 w-14 object-contain md:h-16 md:w-16"
                  />
                </div>

                <div className="absolute -right-2 top-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white shadow-lg backdrop-blur-md">
                  <Award size={18} />
                </div>
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-extrabold tracking-tight text-white md:text-4xl"
            >
              ¡Felicidades!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-3 text-lg font-semibold text-[#d8f1ff] md:text-xl"
            >
              Has obtenido la badge
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-2xl font-extrabold md:text-3xl"
              style={{ color: primaryColor }}
            >
              {badge.badge.name}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="mt-4 max-w-xl text-sm leading-7 text-white/82 md:text-base"
            >
              {badge.badge.description}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 }}
              onClick={onClose}
              className="mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(3,26,56,0.22)] transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {hasMoreBadges ? "Ver siguiente badge" : "Continuar"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}