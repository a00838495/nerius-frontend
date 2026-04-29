import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  accent?: string; // hex color
}

/**
 * Lightweight pagination bar — used across admin panel tables.
 */
export function PaginationBar({ page, pageSize, total, onPageChange, accent = "#E5A800" }: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-3 mt-4 text-sm" style={{ color: "#6B7A8D" }}>
      <p>
        Mostrando <strong style={{ color: "#1A2332" }}>{from}–{to}</strong> de{" "}
        <strong style={{ color: "#1A2332" }}>{total}</strong>
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{
            border: "1px solid #E8EAED",
            backgroundColor: "#FFFFFF",
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs" style={{ color: "#1A2332" }}>
          Página{" "}
          <strong style={{ color: accent }}>
            {page}
          </strong>{" "}
          de <strong>{totalPages}</strong>
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{
            border: "1px solid #E8EAED",
            backgroundColor: "#FFFFFF",
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
