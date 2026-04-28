import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare, Search, X, Plus, ChevronLeft, ChevronRight,
  Flame, Clock, User, Send,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

interface Author {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string | null;
  author: Author;
  status: string;
  created_at: string;
  published_at?: string;
  comments_count: number;
}

const CATEGORIES = [
  { id: "all", label: "Todos", color: "#1C3A5C", bg: "rgba(28,58,92,0.1)" },
  { id: "General", label: "General", color: "#0099DC", bg: "rgba(0,153,220,0.1)" },
  { id: "Aprendizaje", label: "Aprendizaje", color: "#4A8A2C", bg: "rgba(74,138,44,0.1)" },
  { id: "Cursos", label: "Cursos", color: "#E5A800", bg: "rgba(229,168,0,0.1)" },
  { id: "Preguntas", label: "Preguntas", color: "#FF6B35", bg: "rgba(255,107,53,0.1)" },
  { id: "Comunidad", label: "Comunidad", color: "#7B61FF", bg: "rgba(123,97,255,0.1)" },
];

function getCategoryMeta(id: string | null) {
  return CATEGORIES.find((c) => c.id === (id ?? "all")) ?? CATEGORIES[0];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

const POSTS_PER_PAGE = 9;

export function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"recent" | "popular" | "mine">("recent");

  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    if (searchTerm.length === 0) { setDebouncedSearch(""); return; }
    if (searchTerm.length < 2) return;
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [page, debouncedSearch, activeCategory, activeTab]);

  useEffect(() => {
    if (showModal) setTimeout(() => titleRef.current?.focus(), 100);
  }, [showModal]);

  const fetchPosts = async () => {
    if (!loading) setSearching(true);

    try {
      const params = new URLSearchParams({
        limit: POSTS_PER_PAGE.toString(),
        skip: (page * POSTS_PER_PAGE).toString(),
      });

      if (activeCategory !== "all") params.set("category", activeCategory);
      if (activeTab === "popular") params.set("sort", "popular");

      let endpoint = "/api/v1/forum";
      if (debouncedSearch.trim()) {
        params.set("q", debouncedSearch.trim());
        endpoint = "/api/v1/forum/search";
      }

      const res = await fetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error();
      let data: ForumPost[] = await res.json();

      if (activeTab === "mine" && user) {
        data = data.filter((p) => p.author.id === user.id);
      }

      setPosts(data);
    } catch {
      toast.error("Error al cargar el foro");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Publicación creada!");
      setShowModal(false);
      setNewPost({ title: "", content: "", category: "General" });
      setPage(0);
      setActiveTab("recent");
      setActiveCategory("all");
      fetchPosts();
    } catch {
      toast.error("Error al publicar");
    } finally {
      setSubmitting(false);
    }
  };

  const popularPosts = [...posts].sort((a, b) => b.comments_count - a.comments_count).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4" />
          <p className="text-gray-600">Cargando foro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
      >
        <div>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#1A2332" }}>
            Foro de Discusión
          </h1>
          <p style={{ color: "#9AA5B4", fontSize: "0.9rem", marginTop: "0.2rem", fontFamily: "'Open Sans', sans-serif" }}>
            Comparte conocimientos, haz preguntas y conecta con otros
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] shrink-0"
          style={{ backgroundColor: "#1C3A5C", color: "#FFFFFF" }}
        >
          <Plus size={16} /> Nueva publicación
        </button>
      </motion.div>

      {/* ── CATEGORY CHIPS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 flex-wrap mb-5"
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setPage(0); }}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: active ? cat.color : cat.bg,
                color: active ? "#FFFFFF" : cat.color,
                border: `1.5px solid ${active ? cat.color : "transparent"}`,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </motion.div>

      {/* ── SEARCH + TABS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      >
        {/* Tabs */}
        <div
          className="inline-flex gap-1 p-1 rounded-xl shrink-0"
          style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
        >
          {([
            { id: "recent", label: "Recientes", icon: Clock },
            { id: "popular", label: "Populares", icon: Flame },
            { id: "mine", label: "Mis publicaciones", icon: User },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setPage(0); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: activeTab === id ? "#1C3A5C" : "transparent",
                color: activeTab === id ? "#FFFFFF" : "#9AA5B4",
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); if (!e.target.value) setDebouncedSearch(""); }}
            placeholder="Buscar publicaciones..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8EAED",
              color: "#1A2332",
              fontFamily: "'Open Sans', sans-serif",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          />
          {searching ? (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0099DC]" />
            </div>
          ) : searchTerm ? (
            <button onClick={() => { setSearchTerm(""); setDebouncedSearch(""); setPage(0); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          ) : null}
        </div>
      </motion.div>

      {/* ── MAIN CONTENT: POSTS + SIDEBAR ── */}
      <div className="flex gap-6 items-start">

        {/* Posts grid */}
        <div className="flex-1 min-w-0">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <MessageSquare size={48} color="#D1D9E6" className="mb-3" />
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1A2332" }}>
                {searchTerm ? "Sin resultados" : activeTab === "mine" ? "Aún no has publicado nada" : "No hay publicaciones aquí"}
              </p>
              <p style={{ color: "#9AA5B4", fontSize: "0.84rem", marginTop: "0.3rem" }}>
                {activeTab === "mine" ? "¡Crea tu primera publicación!" : "Sé el primero en iniciar una conversación"}
              </p>
            </motion.div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${searching ? "opacity-50" : ""}`}>
              {posts.map((post, i) => {
                const catMeta = getCategoryMeta(post.category);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/forum/${post.id}`)}
                    className="flex flex-col rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8EAED",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Category + time */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: catMeta.bg, color: catMeta.color }}
                      >
                        {post.category ?? "General"}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#B0B9C6" }}>
                        {timeAgo(post.published_at ?? post.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      className="line-clamp-2 mb-2 flex-1"
                      style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#1A2332", lineHeight: 1.4 }}
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="line-clamp-2 mb-4" style={{ fontSize: "0.82rem", color: "#6B7A8D", lineHeight: 1.55 }}>
                      {post.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #F0F1F5" }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: catMeta.color, fontSize: "0.6rem", fontWeight: 700 }}
                        >
                          {getInitials(post.author.first_name, post.author.last_name)}
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "#6B7A8D", fontFamily: "'Open Sans', sans-serif" }}>
                          {post.author.first_name} {post.author.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: "#9AA5B4" }}>
                        <MessageSquare size={13} />
                        <span style={{ fontSize: "0.78rem" }}>{post.comments_count}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {posts.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{ backgroundColor: "#FFFFFF", color: "#1A2332", border: "1px solid #E8EAED" }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span style={{ fontSize: "0.84rem", color: "#9AA5B4" }}>Página {page + 1}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={posts.length < POSTS_PER_PAGE}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{
                  backgroundColor: posts.length < POSTS_PER_PAGE ? "#FFFFFF" : "#1C3A5C",
                  color: posts.length < POSTS_PER_PAGE ? "#9AA5B4" : "#FFFFFF",
                  border: posts.length < POSTS_PER_PAGE ? "1px solid #E8EAED" : "none",
                }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── SIDEBAR: POPULARES ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="hidden lg:block w-64 xl:w-72 shrink-0"
        >
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={15} color="#FF6B35" />
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#1A2332" }}>
                Temas Populares
              </p>
            </div>

            {popularPosts.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "#9AA5B4", textAlign: "center", padding: "1rem 0" }}>
                Aún no hay publicaciones
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {popularPosts.map((post, i) => {
                  const catMeta = getCategoryMeta(post.category);
                  return (
                    <button
                      key={post.id}
                      onClick={() => navigate(`/forum/${post.id}`)}
                      className="flex items-start gap-3 text-left group"
                    >
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: catMeta.bg, color: catMeta.color }}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="line-clamp-2 group-hover:text-[#0099DC] transition-colors"
                          style={{ fontSize: "0.82rem", color: "#1A2332", fontFamily: "'Open Sans', sans-serif", fontWeight: 600, lineHeight: 1.4 }}
                        >
                          {post.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <MessageSquare size={11} color="#9AA5B4" />
                          <span style={{ fontSize: "0.72rem", color: "#9AA5B4" }}>{post.comments_count} respuestas</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA */}
          <div
            className="mt-4 rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(135deg, #1C3A5C, #0099DC)", boxShadow: "0 4px 16px rgba(28,58,92,0.2)" }}
          >
            <MessageSquare size={24} color="rgba(255,255,255,0.8)" className="mx-auto mb-2" />
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#FFFFFF", marginBottom: "0.3rem" }}>
              ¡Únete a la conversación!
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>
              Comparte tu conocimiento con la comunidad
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}
            >
              Crear publicación
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── MODAL NUEVA PUBLICACIÓN ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#FFFFFF", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ backgroundColor: "#1C3A5C" }}
              >
                <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#FFFFFF" }}>
                  Nueva Publicación
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={15} color="white" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmitPost} className="p-6 flex flex-col gap-4">
                {/* Categoría */}
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Categoría
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                      const active = newPost.category === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setNewPost((p) => ({ ...p, category: cat.id }))}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: active ? cat.color : cat.bg,
                            color: active ? "#FFFFFF" : cat.color,
                            border: `1.5px solid ${active ? cat.color : "transparent"}`,
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Título
                  </label>
                  <input
                    ref={titleRef}
                    value={newPost.title}
                    onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                    placeholder="¿Sobre qué quieres hablar?"
                    maxLength={180}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{ border: "1.5px solid #E8EAED", color: "#1A2332", fontFamily: "'Open Sans', sans-serif" }}
                  />
                </div>

                {/* Contenido */}
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Contenido
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Comparte tus ideas, preguntas o experiencias..."
                    rows={5}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl outline-none text-sm resize-none"
                    style={{ border: "1.5px solid #E8EAED", color: "#1A2332", fontFamily: "'Open Sans', sans-serif", lineHeight: 1.6 }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ border: "1px solid #E8EAED", color: "#6B7A8D", backgroundColor: "#F9FAFB" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newPost.title.trim() || !newPost.content.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}
                  >
                    <Send size={14} />
                    {submitting ? "Publicando…" : "Publicar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
