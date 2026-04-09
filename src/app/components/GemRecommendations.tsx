import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import GemCard from "./GemCard";
import type { GemCard as GemCardType } from "../types/gems";

interface GemRecommendationsProps {
  title?: string;
  maxItems?: number;
}

export default function GemRecommendations({
  title = "Gemas Recomendadas para Ti",
  maxItems = 6,
}: GemRecommendationsProps) {
  const [gems, setGems] = useState<GemCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGems = async () => {
      try {
        const res = await fetch(
          `/api/v1/gems/recommended?limit=${maxItems}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setGems(Array.isArray(data) ? data : []);
      } catch {
        setGems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGems();
  }, [maxItems]);

  const handleSave = useCallback(async (gemId: string) => {
    try {
      const res = await fetch(`/api/v1/gems/${gemId}/save`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setGems((prev) =>
          prev.map((g) => (g.id === gemId ? { ...g, is_saved: true, saves_count: g.saves_count + 1 } : g))
        );
      }
    } catch {
      // silent fail
    }
  }, []);

  const handleUnsave = useCallback(async (gemId: string) => {
    try {
      const res = await fetch(`/api/v1/gems/${gemId}/save`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setGems((prev) =>
          prev.map((g) => (g.id === gemId ? { ...g, is_saved: false, saves_count: Math.max(0, g.saves_count - 1) } : g))
        );
      }
    } catch {
      // silent fail
    }
  }, []);

  const handleClick = useCallback(
    (gemId: string) => {
      navigate(`/gems/${gemId}`);
    },
    [navigate]
  );

  if (!loading && gems.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "rgba(0, 153, 220, 0.1)" }}
          >
            <Sparkles size={18} color="#0099DC" />
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "#1C3A5C" }}
          >
            {title}
          </h2>
        </div>
        <button
          onClick={() => navigate("/gems")}
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "#0099DC" }}
        >
          Ver todas
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {loading
          ? Array.from({ length: maxItems }).map((_, i) => (
              <div
                key={i}
                className="w-72 min-w-[288px] shrink-0 snap-start animate-pulse rounded-2xl bg-white p-5"
                style={{
                  minHeight: 200,
                  boxShadow: "0 2px 12px rgba(28, 58, 92, 0.08)",
                }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl"
                    style={{ background: "rgba(28, 58, 92, 0.08)" }}
                  />
                  <div
                    className="h-4 w-32 rounded"
                    style={{ background: "rgba(28, 58, 92, 0.08)" }}
                  />
                </div>
                <div className="space-y-2">
                  <div
                    className="h-3 w-full rounded"
                    style={{ background: "rgba(28, 58, 92, 0.06)" }}
                  />
                  <div
                    className="h-3 w-3/4 rounded"
                    style={{ background: "rgba(28, 58, 92, 0.06)" }}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <div
                    className="h-5 w-16 rounded-full"
                    style={{ background: "rgba(28, 58, 92, 0.06)" }}
                  />
                  <div
                    className="h-5 w-12 rounded-full"
                    style={{ background: "rgba(28, 58, 92, 0.06)" }}
                  />
                </div>
              </div>
            ))
          : gems.map((gem) => (
              <div
                key={gem.id}
                className="w-72 min-w-[288px] shrink-0 snap-start"
              >
                <GemCard
                  gem={gem}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                  onClick={handleClick}
                />
              </div>
            ))}
      </div>
    </section>
  );
}
