import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  MessageSquare, Loader2, Search, EyeOff, Eye, Trash2, FileText,
  TrendingUp, MessageCircle, ArchiveX,
} from "lucide-react";
import { toast } from "sonner";
import { adminForumApi } from "../../lib/adminApi";
import type {
  ForumPostAdminRead, ForumCommentAdminRead, ForumStats,
} from "../../types/adminPanel";
import { PaginationBar } from "../../components/PaginationBar";

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  draft: { label: "Borrador", bg: "rgba(156,163,175,0.15)", color: "#6B7280" },
  published: { label: "Publicado", bg: "rgba(74,138,44,0.12)", color: "#4A8A2C" },
  archived: { label: "Archivado", bg: "rgba(220,38,38,0.08)", color: "#DC2626" },
};

export function AdminForumModeration() {
  const [tab, setTab] = useState<"posts" | "comments" | "stats">("posts");

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <MessageSquare size={26} style={{ color: "#E5A800" }} />
          Moderación del Foro
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Gestiona posts, comentarios y revisa estadísticas
        </p>
      </div>

      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#E8EAED" }}>
        {([["posts", "Posts", FileText], ["comments", "Comentarios", MessageCircle], ["stats", "Estadísticas", TrendingUp]] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-4 py-2 text-sm font-semibold flex items-center gap-2 -mb-px"
            style={{
              borderBottom: tab === k ? "2px solid #E5A800" : "2px solid transparent",
              color: tab === k ? "#E5A800" : "#6B7A8D",
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "posts" && <PostsPanel />}
      {tab === "comments" && <CommentsPanel />}
      {tab === "stats" && <StatsPanel />}
    </div>
  );
}

// ==== POSTS ===========================================================

function PostsPanel() {
  const [items, setItems] = useState<ForumPostAdminRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [noComments, setNoComments] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminForumApi.posts({
        page, page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        no_comments: noComments || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, noComments]);

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleStatus = async (p: ForumPostAdminRead, newStatus: string) => {
    try {
      await adminForumApi.setPostStatus(p.id, newStatus);
      toast.success("Estado actualizado");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (p: ForumPostAdminRead) => {
    if (!confirm(`¿Eliminar el post "${p.title}"? Esta acción es permanente.`)) return;
    try {
      await adminForumApi.deletePost(p.id);
      toast.success("Post eliminado");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <div className="rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: "1.5px solid #E8EAED" }}>
          <input type="checkbox" checked={noComments} onChange={(e) => { setNoComments(e.target.checked); setPage(1); }} />
          <span style={{ color: "#1A2332" }}>Sin comentarios</span>
        </label>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay posts</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0F1F5" }}>
            {items.map((p) => {
              const meta = STATUS_META[p.status] ?? STATUS_META.draft;
              return (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2332" }} className="truncate">{p.title}</h3>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                          style={{ backgroundColor: meta.bg, color: meta.color }}>{meta.label}</span>
                      </div>
                      <p style={{ color: "#6B7A8D", fontSize: "0.85rem" }} className="line-clamp-2">{p.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#9AA5B4" }}>
                        <span><strong style={{ color: "#1A2332" }}>{p.author_full_name}</strong> · {p.author_email}</span>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        {p.area_name && <span>📁 {p.area_name}</span>}
                        <span>💬 {p.comments_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.status !== "published" ? (
                        <button onClick={() => handleStatus(p, "published")} className="p-1.5 rounded-lg hover:bg-green-50" title="Publicar">
                          <Eye size={14} style={{ color: "#4A8A2C" }} />
                        </button>
                      ) : (
                        <button onClick={() => handleStatus(p, "archived")} className="p-1.5 rounded-lg hover:bg-yellow-50" title="Archivar">
                          <EyeOff size={14} style={{ color: "#E5A800" }} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                        <Trash2 size={14} style={{ color: "#DC2626" }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      )}
    </>
  );
}

// ==== COMMENTS ========================================================

function CommentsPanel() {
  const [items, setItems] = useState<ForumCommentAdminRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminForumApi.comments({
        page, page_size: pageSize,
        search: search.trim() || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { const t = setTimeout(fetchData, 250); return () => clearTimeout(t); }, [fetchData]);

  const handleDelete = async (c: ForumCommentAdminRead) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      await adminForumApi.deleteComment(c.id);
      toast.success("Comentario eliminado");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar en comentarios..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay comentarios</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0F1F5" }}>
            {items.map((c) => (
              <div key={c.id} className="p-4 hover:bg-gray-50 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#1A2332", fontSize: "0.9rem" }}>{c.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#9AA5B4" }}>
                    <span><strong style={{ color: "#1A2332" }}>{c.author_full_name}</strong></span>
                    <span>en post: <em>{c.post_title}</em></span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                  <Trash2 size={14} style={{ color: "#DC2626" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      )}
    </>
  );
}

// ==== STATS ===========================================================

function StatsPanel() {
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminForumApi.stats().then(setStats).catch((e) => toast.error((e as Error).message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>;
  if (!stats) return null;

  const cards = [
    { label: "Total posts", value: stats.total_posts, color: "#0099DC" },
    { label: "Publicados", value: stats.published_posts, color: "#4A8A2C" },
    { label: "Borradores", value: stats.draft_posts, color: "#9AA5B4" },
    { label: "Archivados", value: stats.archived_posts, color: "#DC2626" },
    { label: "Total comentarios", value: stats.total_comments, color: "#E5A800" },
    { label: "Posts esta semana", value: stats.posts_last_7d, color: "#7B61FF" },
    { label: "Posts sin comentarios", value: stats.posts_without_comments, color: "#E87830" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-4"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
            <p style={{ fontWeight: 800, fontSize: "1.5rem", color: c.color }}>{c.value.toLocaleString()}</p>
            <p style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <h3 style={{ fontWeight: 700, color: "#1A2332", fontSize: "1.05rem", marginBottom: "1rem" }}>Top autores</h3>
        {stats.top_authors.length === 0 ? (
          <p style={{ color: "#9AA5B4" }}>Sin datos</p>
        ) : (
          <div className="space-y-2">
            {stats.top_authors.map((a, i) => (
              <div key={a.user_id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#FAFBFC" }}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: i === 0 ? "#E5A800" : "#E8EAED", color: i === 0 ? "#FFF" : "#1A2332" }}>{i + 1}</span>
                  <div>
                    <p style={{ fontWeight: 600, color: "#1A2332", fontSize: "0.9rem" }}>{a.full_name}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.75rem" }}>{a.email}</p>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: "#E5A800" }}>{a.posts_count} posts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
