import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Search, Loader2, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { toast } from "sonner";
import type { GemCard as GemCardType, GemCategory, UserGemCollectionEntry } from "../types/gems";
import GemCard from "../components/GemCard";

const API_BASE = "/api/v1";

export default function GemBank() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<GemCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gems, setGems] = useState<GemCardType[]>([]);
  const [featuredGems, setFeaturedGems] = useState<GemCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [myGems, setMyGems] = useState<UserGemCollectionEntry[]>([]);
  const [loadingMyGems, setLoadingMyGems] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const LIMIT = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/gems/categories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error("Error al cargar categorías"));
  }, []);

  // Fetch featured gems
  useEffect(() => {
    fetch(`${API_BASE}/gems/featured?limit=6`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFeaturedGems(data))
      .catch(() => toast.error("Error al cargar gemas destacadas"));
  }, []);

  // Fetch gems (search or browse)
  const fetchGems = useCallback(
    async (newSkip: number, append: boolean = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        let url: string;
        if (debouncedSearch.trim()) {
          url = `${API_BASE}/gems/search?q=${encodeURIComponent(debouncedSearch.trim())}&limit=${LIMIT}&skip=${newSkip}`;
        } else {
          const params = new URLSearchParams();
          params.set("limit", String(LIMIT));
          params.set("skip", String(newSkip));
          selectedCategories.forEach((catId) => params.append("category_id", catId));
          url = `${API_BASE}/gems?${params.toString()}`;
        }

        const res = await fetch(url, { credentials: "include" });
        const data: GemCardType[] = await res.json();

        if (append) {
          setGems((prev) => [...prev, ...data]);
        } else {
          setGems(data);
        }
        setHasMore(data.length === LIMIT);
        setSkip(newSkip);
      } catch {
        toast.error("Error al cargar gemas");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, selectedCategories]
  );

  useEffect(() => {
    fetchGems(0, false);
  }, [fetchGems]);

  const handleLoadMore = () => {
    fetchGems(skip + LIMIT, true);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = async (gemId: string) => {
    try {
      await fetch(`${API_BASE}/gems/${gemId}/save`, {
        method: "POST",
        credentials: "include",
      });
      const update = (list: GemCardType[]) =>
        list.map((g) => (g.id === gemId ? { ...g, is_saved: true, saves_count: g.saves_count + 1 } : g));
      setGems(update);
      setFeaturedGems(update);
      toast.success("Gema guardada");
    } catch {
      toast.error("Error al guardar gema");
    }
  };

  const handleUnsave = async (gemId: string) => {
    try {
      await fetch(`${API_BASE}/gems/${gemId}/save`, {
        method: "DELETE",
        credentials: "include",
      });
      const update = (list: GemCardType[]) =>
        list.map((g) => (g.id === gemId ? { ...g, is_saved: false, saves_count: Math.max(0, g.saves_count - 1) } : g));
      setGems(update);
      setFeaturedGems(update);
      toast.success("Gema removida de guardados");
    } catch {
      toast.error("Error al remover gema");
    }
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 320;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Fetch my gems collection
  const fetchMyGems = useCallback(async () => {
    setLoadingMyGems(true);
    try {
      const res = await fetch(`${API_BASE}/gems/collection`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMyGems(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Error al cargar tu colección");
    } finally {
      setLoadingMyGems(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "mine") {
      fetchMyGems();
    }
  }, [activeTab, fetchMyGems]);

  // When saving/unsaving in "all" tab, also update myGems if in "mine"
  const handleSaveWithSync = async (gemId: string) => {
    await handleSave(gemId);
    // If user switches to "mine" later, it will refetch
    setMyGems([]);
  };

  const handleUnsaveWithSync = async (gemId: string) => {
    await handleUnsave(gemId);
    // Remove from myGems immediately
    setMyGems((prev) => prev.filter((e) => e.gem.id !== gemId));
  };

  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-2 flex items-center justify-center gap-3">
            <Sparkles size={32} style={{ color: "#E5A800" }} />
            <h1
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: "#1C3A5C" }}
            >
              Banco de Gemas
            </h1>
          </div>
          <p className="text-lg" style={{ color: "#64748b" }}>
            Descubre gemas de IA personalizadas para potenciar tu trabajo
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto mb-8 max-w-2xl"
        >
          <div className="relative">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "#94a3b8" }}
            />
            <input
              type="text"
              placeholder="Buscar gemas por nombre, descripción o etiqueta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border py-3 pl-12 pr-4 text-base outline-none transition-all focus:ring-2"
              style={{
                borderColor: "#e2e8f0",
                backgroundColor: "#ffffff",
                color: "#1C3A5C",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0099DC";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,153,220,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
              }}
            />
          </div>
        </motion.div>

        {/* Tabs: Todas / Mis Gemas */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === "all" ? "#0099DC" : "#ffffff",
              color: activeTab === "all" ? "#ffffff" : "#1C3A5C",
              border: `1.5px solid ${activeTab === "all" ? "#0099DC" : "#e2e8f0"}`,
              boxShadow: activeTab === "all" ? "0 4px 12px rgba(0,153,220,0.2)" : "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Sparkles size={16} />
            Todas las Gemas
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === "mine" ? "#E5A800" : "#ffffff",
              color: activeTab === "mine" ? "#ffffff" : "#1C3A5C",
              border: `1.5px solid ${activeTab === "mine" ? "#E5A800" : "#e2e8f0"}`,
              boxShadow: activeTab === "mine" ? "0 4px 12px rgba(229,168,0,0.2)" : "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Bookmark size={16} />
            Mis Gemas
            {myGems.length > 0 && activeTab === "mine" && (
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                {myGems.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab: Todas las Gemas ── */}
        {activeTab === "all" && (<>

        {/* Featured Section */}
        <AnimatePresence>
          {!isSearching && featuredGems.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className="flex items-center gap-2 text-xl font-semibold"
                  style={{ color: "#1C3A5C" }}
                >
                  <Sparkles size={20} style={{ color: "#E5A800" }} />
                  Gemas Destacadas
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    style={{ color: "#1C3A5C" }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    style={{ color: "#1C3A5C" }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <div
                ref={carouselRef}
                className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {featuredGems.map((gem, i) => (
                  <motion.div
                    key={gem.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex-shrink-0"
                    style={{ scrollSnapAlign: "start", width: "300px" }}
                  >
                    <GemCard
                      gem={gem}
                      onSave={handleSave}
                      onUnsave={handleUnsave}
                      onClick={(id) => navigate(`/gems/${id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Category Filters */}
        {!isSearching && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            <button
              onClick={() => setSelectedCategories([])}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  selectedCategories.length === 0 ? "#0099DC" : "#ffffff",
                color:
                  selectedCategories.length === 0 ? "#ffffff" : "#1C3A5C",
                border: `1.5px solid ${selectedCategories.length === 0 ? "#0099DC" : "#e2e8f0"}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              Todas
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? "#0099DC" : "#ffffff",
                    color: isActive ? "#ffffff" : "#1C3A5C",
                    border: `1.5px solid ${isActive ? "#0099DC" : "#e2e8f0"}`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Main Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={36} style={{ color: "#0099DC" }} />
            </motion.div>
          </div>
        ) : gems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <Sparkles
              size={48}
              className="mx-auto mb-4"
              style={{ color: "#cbd5e1" }}
            />
            <p className="text-lg font-medium" style={{ color: "#64748b" }}>
              No se encontraron gemas
            </p>
            <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
              Intenta con otros filtros o términos de búsqueda
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gems.map((gem, i) => (
                <motion.div
                  key={gem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.5) }}
                >
                  <GemCard
                    gem={gem}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    onClick={(id) => navigate(`/gems/${id}`)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 rounded-xl px-8 py-3 text-base font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{
                    backgroundColor: "#0099DC",
                    boxShadow: "0 4px 12px rgba(0,153,220,0.3)",
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar más gemas"
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}

        </>)}

        {/* ── Tab: Mis Gemas ── */}
        {activeTab === "mine" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loadingMyGems ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={36} className="animate-spin" style={{ color: "#E5A800" }} />
              </div>
            ) : myGems.length === 0 ? (
              <div className="py-20 text-center">
                <Bookmark size={48} className="mx-auto mb-4" style={{ color: "#cbd5e1" }} />
                <p className="text-lg font-medium" style={{ color: "#64748b" }}>
                  Aún no has guardado ninguna gema
                </p>
                <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                  Explora las gemas disponibles y guarda las que más te interesen
                </p>
                <button
                  onClick={() => setActiveTab("all")}
                  className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#0099DC" }}
                >
                  Explorar Gemas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {myGems.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <GemCard
                      gem={entry.gem}
                      onSave={handleSaveWithSync}
                      onUnsave={handleUnsaveWithSync}
                      onClick={(id) => navigate(`/gems/${id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
