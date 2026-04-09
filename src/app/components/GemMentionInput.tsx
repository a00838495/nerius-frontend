import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { GemCard } from "../types/gems";

/**
 * ContentEditable input with gem mention chips.
 * Mentions are rendered as inline non-editable spans.
 * The `value` and `onChange` work with plain text containing @gem[Title](id) syntax.
 */

const GEM_MENTION_REGEX = /@gem\[([^\]]+)\]\(([a-f0-9-]+)\)/g;

interface GemMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Convert plain text with @gem[...](...) to HTML with chip spans
function textToHtml(text: string): string {
  if (!text) return "";
  GEM_MENTION_REGEX.lastIndex = 0;
  return text.replace(GEM_MENTION_REGEX, (_, title, id) => {
    return `<span contenteditable="false" data-gem-id="${id}" data-gem-title="${title}" class="gem-chip">✦ ${title}</span>`;
  }).replace(/\n/g, "<br>");
}

// Convert HTML content back to plain text with @gem[...](...) syntax
function htmlToText(container: HTMLElement): string {
  let result = "";
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains("gem-chip")) {
        const id = el.getAttribute("data-gem-id") || "";
        const title = el.getAttribute("data-gem-title") || "";
        result += `@gem[${title}](${id})`;
      } else if (el.tagName === "BR") {
        result += "\n";
      } else {
        // Recurse into other elements (e.g. divs from contenteditable line breaks)
        result += htmlToText(el);
        if (el.tagName === "DIV" || el.tagName === "P") {
          result += "\n";
        }
      }
    }
  });
  return result;
}

// Get text before cursor in contentEditable
function getTextBeforeCursor(container: HTMLElement): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return "";
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  range.setStart(container, 0);

  const fragment = range.cloneContents();
  const temp = document.createElement("div");
  temp.appendChild(fragment);
  return htmlToText(temp);
}

export default function GemMentionInput({
  value,
  onChange,
  placeholder,
  rows = 4,
  autoFocus = false,
  className = "",
  style,
}: GemMentionInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gems, setGems] = useState<GemCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComposing = useRef(false);
  const lastValueRef = useRef(value);

  // Sync value → editor HTML (only on initial mount or external changes)
  useEffect(() => {
    if (!editorRef.current) return;
    // Only update DOM if value changed externally (not from our own onInput)
    if (lastValueRef.current !== value) {
      const html = textToHtml(value);
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
      lastValueRef.current = value;
    }
  }, [value]);

  // Initial mount
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = textToHtml(value);
    }
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // ── Fetch gems for popup ──
  useEffect(() => {
    if (!showPopup) { setGems([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = searchQuery.length === 0 ? 0 : 250;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const endpoint = searchQuery.length >= 2
          ? `/api/v1/gems/search?q=${encodeURIComponent(searchQuery)}&limit=6`
          : `/api/v1/gems?limit=6`;
        const res = await fetch(endpoint, { credentials: "include" });
        if (res.ok) setGems(await res.json());
      } catch { setGems([]); }
      finally { setLoading(false); }
    }, delay);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, showPopup]);

  // ── Close popup on outside click ──
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Insert gem chip at cursor ──
  const insertGemMention = useCallback((gem: GemCard) => {
    const editor = editorRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // Delete the @gem... trigger text
    const textBefore = getTextBeforeCursor(editor);
    const triggerMatch = textBefore.match(/@gem( [^\n]*)?$/);
    if (triggerMatch) {
      // Walk backwards from cursor to delete trigger
      const range = sel.getRangeAt(0);
      const startContainer = range.startContainer;
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const text = startContainer.textContent || "";
        const triggerIdx = text.lastIndexOf("@gem");
        if (triggerIdx >= 0) {
          const deleteRange = document.createRange();
          deleteRange.setStart(startContainer, triggerIdx);
          deleteRange.setEnd(startContainer, range.startOffset);
          deleteRange.deleteContents();
        }
      }
    }

    // Create chip element
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.setAttribute("data-gem-id", gem.id);
    chip.setAttribute("data-gem-title", gem.title);
    chip.className = "gem-chip";
    chip.textContent = `✦ ${gem.title}`;

    // Insert chip + space after
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const space = document.createTextNode("\u00A0");
    range.insertNode(space);
    range.insertNode(chip);

    // Move cursor after space
    range.setStartAfter(space);
    range.setEndAfter(space);
    sel.removeAllRanges();
    sel.addRange(range);

    setShowPopup(false);
    setSearchQuery("");

    // Sync value
    const newText = htmlToText(editor);
    lastValueRef.current = newText;
    onChange(newText);

    editor.focus();
  }, [onChange]);

  // ── Handle input ──
  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    const editor = editorRef.current;
    if (!editor) return;

    const newText = htmlToText(editor);
    lastValueRef.current = newText;
    onChange(newText);

    // Detect @gem trigger
    const textBefore = getTextBeforeCursor(editor);
    const triggerMatch = textBefore.match(/@gem( [^\n]*)?$/);
    if (triggerMatch) {
      const query = (triggerMatch[1] || "").trimStart();
      setSearchQuery(query);
      setShowPopup(true);
      setSelectedIndex(0);
    } else if (showPopup) {
      setShowPopup(false);
      setSearchQuery("");
    }
  }, [onChange, showPopup]);

  // ── Keyboard nav in popup ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showPopup) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => Math.min(p + 1, gems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && gems.length > 0) {
      e.preventDefault();
      insertGemMention(gems[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowPopup(false);
    }
  }, [showPopup, gems, selectedIndex, insertGemMention]);

  const minHeight = (rows || 4) * 24;

  return (
    <div className="relative">
      {/* Injected styles for chips */}
      <style>{`
        .gem-chip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 1px 8px;
          margin: 0 2px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          background-color: rgba(0, 153, 220, 0.12);
          color: #0099DC;
          border: 1px solid rgba(0, 153, 220, 0.25);
          vertical-align: baseline;
          line-height: 1.6;
          cursor: default;
          user-select: none;
        }
        .gem-editor:empty::before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>

      {/* ContentEditable editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`gem-editor ${className}`}
        style={{
          ...style,
          minHeight,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          outline: "none",
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
      />

      {/* Hint */}
      <div className="flex items-center gap-1.5 mt-1">
        <Sparkles size={11} color="#9AA5B4" />
        <span className="text-[11px]" style={{ color: "#9AA5B4" }}>
          Escribe <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">@gem</code> para mencionar una gema
        </span>
      </div>

      {/* ── Mention popup ── */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute z-50 mt-1 w-80 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8EAED",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            bottom: "100%",
            left: 0,
            marginBottom: 4,
          }}
        >
          <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: "#F0F1F5", backgroundColor: "#FAFBFC" }}>
            <Sparkles size={14} color="#0099DC" />
            <span className="text-xs font-semibold" style={{ color: "#1C3A5C" }}>Mencionar gema</span>
            {searchQuery && (
              <span className="text-xs text-gray-400 ml-auto">buscando: &quot;{searchQuery}&quot;</span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={18} className="animate-spin text-gray-400" />
              </div>
            ) : gems.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-400">No se encontraron gemas</p>
              </div>
            ) : (
              gems.map((gem, index) => (
                <button
                  key={gem.id}
                  onMouseDown={(e) => { e.preventDefault(); insertGemMention(gem); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors"
                  style={{ backgroundColor: index === selectedIndex ? "rgba(0, 153, 220, 0.06)" : "transparent" }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0" style={{ background: "rgba(0, 153, 220, 0.1)" }}>
                    <Sparkles size={14} color="#0099DC" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#1A2332" }}>{gem.title}</p>
                    {gem.category && (
                      <p className="text-[11px] truncate" style={{ color: "#9AA5B4" }}>{gem.category.name}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-3 py-1.5 border-t flex items-center gap-3 text-[11px]" style={{ borderColor: "#F0F1F5", color: "#9AA5B4" }}>
            <span>↑↓ navegar</span>
            <span>↵ seleccionar</span>
            <span>esc cerrar</span>
          </div>
        </div>
      )}
    </div>
  );
}
