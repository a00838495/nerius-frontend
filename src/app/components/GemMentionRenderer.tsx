import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";

/**
 * Parses text containing gem mentions in the format @gem[Title](id)
 * and renders them as clickable inline chips.
 *
 * Usage: <GemMentionRenderer text={content} />
 */

const GEM_MENTION_REGEX = /@gem\[([^\]]+)\]\(([a-f0-9-]+)\)/g;

interface GemMentionRendererProps {
  text: string;
  className?: string;
}

export default function GemMentionRenderer({ text, className }: GemMentionRendererProps) {
  const navigate = useNavigate();

  const parts: Array<{ type: "text"; value: string } | { type: "gem"; title: string; id: string }> = [];
  let lastIndex = 0;

  // Reset regex state
  GEM_MENTION_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = GEM_MENTION_REGEX.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    // Add the gem mention
    parts.push({ type: "gem", title: match[1], id: match[2] });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  // If no mentions found, render plain text
  if (parts.length === 1 && parts[0].type === "text") {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/gems/${part.id}`);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium transition-colors hover:opacity-80 align-baseline"
            style={{
              backgroundColor: "rgba(0, 153, 220, 0.1)",
              color: "#0099DC",
              border: "1px solid rgba(0, 153, 220, 0.2)",
            }}
            title={`Ver gema: ${part.title}`}
          >
            <Sparkles size={12} />
            {part.title}
          </button>
        );
      })}
    </span>
  );
}
