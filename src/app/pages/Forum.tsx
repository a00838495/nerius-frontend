import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MessageSquare, ChevronLeft, ChevronRight, User, Search, X } from "lucide-react";
import { toast } from "sonner";

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
  author: Author;
  status: string;
  created_at: string;
  published_at?: string;
  comments_count: number;
}

export function Forum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const POSTS_PER_PAGE = 10;

  // Debounce: actualiza debouncedSearch 400ms después del último cambio
  useEffect(() => {
    if (searchTerm.length === 0) {
      setDebouncedSearch("");
      return;
    }
    if (searchTerm.length < 2) return;

    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch inicial (sin búsqueda)
  useEffect(() => {
    if (debouncedSearch.length === 0 || debouncedSearch.length >= 2) {
      fetchPosts(debouncedSearch);
    }
  }, [page, debouncedSearch]);

  const fetchPosts = async (query: string) => {
    if (initialLoading) {
      // Primera carga: spinner de pantalla completa
    } else {
      setSearching(true);
    }

    try {
      const params = new URLSearchParams({
        limit: POSTS_PER_PAGE.toString(),
        skip: (page * POSTS_PER_PAGE).toString(),
      });

      let endpoint = "/api/v1/forum";

      if (query.trim()) {
        params.set("q", query.trim());
        endpoint = "/api/v1/forum/search";
      }

      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Error al cargar los posts del foro");
    } finally {
      setInitialLoading(false);
      setSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
    if (value.length === 0) {
      setDebouncedSearch("");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(0);
  };

  const shouldShowSearchHint = searchTerm.length > 0 && searchTerm.length < 2;
  const isSearching = searching || (searchTerm.length >= 2 && debouncedSearch !== searchTerm);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando foro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,153,220,0.1)" }}
          >
            <MessageSquare size={24} color="#0099DC" />
          </div>
          <h1
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: "2rem",
              color: "#1A2332",
            }}
          >
            Foro de Discusión
          </h1>
        </div>
        <p className="text-gray-600">
          Comparte conocimientos, haz preguntas y conecta con otros estudiantes
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por título o contenido..."
            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#0099DC] focus:ring-2 focus:ring-[#0099DC]/20 transition-all"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          />
          {isSearching ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0099DC]"></div>
            </div>
          ) : searchTerm ? (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>
        {shouldShowSearchHint && (
          <p className="text-sm text-amber-600 mt-2">
            ⚠️ Escribe al menos 2 caracteres para buscar
          </p>
        )}
        {searchTerm && searchTerm.length >= 2 && (
          <p className="text-sm text-gray-600 mt-2">
            {isSearching ? (
              <span className="text-gray-400">Buscando...</span>
            ) : (
              <>
                {posts.length > 0 ? (
                  <>
                    Mostrando {posts.length} resultado{posts.length !== 1 ? "s" : ""} para <strong>"{debouncedSearch}"</strong>
                  </>
                ) : (
                  <>No se encontraron resultados para <strong>"{debouncedSearch}"</strong></>
                )}
              </>
            )}
          </p>
        )}
      </motion.div>

      {/* Posts List */}
      <div className={`space-y-4 transition-opacity duration-200 ${isSearching ? "opacity-50" : "opacity-100"}`}>
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? "No se encontraron resultados" : "No hay posts disponibles"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda"
                : "Sé el primero en iniciar una conversación"
              }
            </p>
          </motion.div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/forum/${post.id}`)}
              className="bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{
                border: "1px solid #E8EAED",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "#0099DC",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {getInitials(post.author.first_name, post.author.last_name)}
                </div>

                {/* Author & Date */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 hover:text-[#0099DC] transition-colors"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">
                      {post.author.first_name} {post.author.last_name}
                    </span>
                    <span>•</span>
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Post Content Preview */}
              <p className="text-gray-700 line-clamp-2 mb-4">
                {post.content}
              </p>

              {/* Post Footer */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare size={16} />
                  <span className="font-medium">
                    {post.comments_count} comentario{post.comments_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-sm text-[#0099DC] font-medium hover:underline">
                  Leer más →
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: page === 0 ? "#F0F1F5" : "#FFFFFF",
              color: page === 0 ? "#9AA5B4" : "#1A2332",
              border: "1px solid #E8EAED",
            }}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          
          <span className="text-sm font-medium text-gray-600">
            Página {page + 1}
          </span>
          
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={posts.length < POSTS_PER_PAGE}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: posts.length < POSTS_PER_PAGE ? "#F0F1F5" : "#0099DC",
              color: posts.length < POSTS_PER_PAGE ? "#9AA5B4" : "#FFFFFF",
              border: posts.length < POSTS_PER_PAGE ? "1px solid #E8EAED" : "none",
            }}
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
