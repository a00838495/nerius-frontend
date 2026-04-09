import React from "react";
import { motion } from "motion/react";
import { Sparkles, Bookmark, ExternalLink } from "lucide-react";
import type { GemCard as GemCardType } from "../types/gems";

interface GemCardProps {
  gem: GemCardType;
  onSave?: (gemId: string) => void;
  onUnsave?: (gemId: string) => void;
  onClick?: (gemId: string) => void;
}

export default function GemCard({ gem, onSave, onUnsave, onClick }: GemCardProps) {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gem.is_saved) {
      onUnsave?.(gem.id);
    } else {
      onSave?.(gem.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => onClick?.(gem.id)}
      className="relative w-full cursor-pointer rounded-2xl bg-white p-5"
      style={{
        minHeight: 200,
        boxShadow: "0 2px 12px rgba(28, 58, 92, 0.08)",
        border: gem.is_featured
          ? "2px solid #E5A800"
          : "1px solid rgba(28, 58, 92, 0.06)",
      }}
    >
      {/* Bookmark button */}
      <button
        onClick={handleBookmarkClick}
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{
          background: gem.is_saved ? "rgba(0, 153, 220, 0.1)" : "rgba(28, 58, 92, 0.05)",
        }}
        aria-label={gem.is_saved ? "Quitar de guardados" : "Guardar gema"}
      >
        <Bookmark
          size={16}
          fill={gem.is_saved ? "#0099DC" : "none"}
          stroke={gem.is_saved ? "#0099DC" : "#1C3A5C"}
          strokeWidth={2}
        />
      </button>

      {/* Icon + Title */}
      <div className="mb-3 flex items-center gap-3 pr-10">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #0099DC 0%, #1C3A5C 100%)" }}
        >
          {gem.icon_url ? (
            <img
              src={gem.icon_url}
              alt=""
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <Sparkles size={20} color="#fff" />
          )}
        </div>
        <h3
          className="text-base font-semibold leading-tight"
          style={{ color: "#1C3A5C" }}
        >
          {gem.title}
        </h3>
      </div>

      {/* Description */}
      {gem.description && (
        <p
          className="mb-3 line-clamp-2 text-sm leading-relaxed"
          style={{ color: "#1C3A5C", opacity: 0.65 }}
        >
          {gem.description}
        </p>
      )}

      {/* Category badge */}
      {gem.category && (
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: "rgba(0, 153, 220, 0.08)",
              color: "#0099DC",
            }}
          >
            {gem.category.icon && (
              <span className="text-xs">{gem.category.icon}</span>
            )}
            {gem.category.name}
          </span>
        </div>
      )}

      {/* Tags */}
      {gem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {gem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                background: "rgba(28, 58, 92, 0.05)",
                color: "#1C3A5C",
                opacity: 0.7,
              }}
            >
              {tag.name}
            </span>
          ))}
          {gem.tags.length > 3 && (
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ color: "#1C3A5C", opacity: 0.45 }}
            >
              +{gem.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Open in Gemini button */}
      {gem.gemini_url && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(28,58,92,0.06)" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(gem.gemini_url!, "_blank", "noopener,noreferrer");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ color: "#0099DC" }}
          >
            <ExternalLink size={12} />
            Abrir en Gemini
          </button>
        </div>
      )}

      {/* Featured accent line */}
      {gem.is_featured && (
        <div
          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
          style={{ background: "linear-gradient(90deg, #E5A800, transparent)" }}
        />
      )}
    </motion.div>
  );
}
