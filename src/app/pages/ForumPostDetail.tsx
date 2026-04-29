import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  MessageSquare,
  Send,
  Trash2,
  X,
  CornerDownRight,
  AlertTriangle,
  Mail,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import GemMentionRenderer from "../components/GemMentionRenderer";
import GemMentionInput from "../components/GemMentionInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

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
  updated_at?: string;
  published_at?: string;
  comments_count: number;
}

interface Comment {
  id: string;
  post_id: string;
  author: Author;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string | null;
  replies_count: number;
}

export function ForumPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{
    id: string;
    parentId: string | null;
  } | null>(null);

  // Author panel state
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorPosts, setAuthorPosts] = useState<ForumPost[]>([]);
  const [authorPanelLoading, setAuthorPanelLoading] = useState(false);

  useEffect(() => {
    if (postId) fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const postResponse = await fetch(`/api/v1/forum/${postId}`);
      if (!postResponse.ok) throw new Error("Failed to fetch post");
      const postData = await postResponse.json();
      setPost(postData);

      const commentsResponse = await fetch(`/api/v1/forum/${postId}/comments`);
      if (!commentsResponse.ok) throw new Error("Failed to fetch comments");
      const commentsData = await commentsResponse.json();
      setAllComments(commentsData);
      setComments(commentsData.filter((c: Comment) => c.parent_comment_id === null));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar el post");
    } finally {
      setLoading(false);
    }
  };

  const openAuthorPanel = async (author: Author) => {
    if (selectedAuthor?.id === author.id) {
      setSelectedAuthor(null);
      setAuthorPosts([]);
      return;
    }
    setSelectedAuthor(author);
    setAuthorPanelLoading(true);
    try {
      const res = await fetch(`/api/v1/forum?limit=50`);
      if (res.ok) {
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data.filter((p: ForumPost) => p.author.id === author.id && p.id !== postId).slice(0, 5)
          : [];
        setAuthorPosts(filtered);
      }
    } catch {
      setAuthorPosts([]);
    } finally {
      setAuthorPanelLoading(false);
    }
  };

  const closeAuthorPanel = () => {
    setSelectedAuthor(null);
    setAuthorPosts([]);
  };

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) { toast.error("El comentario no puede estar vacío"); return; }
    if (newComment.length > 5000) { toast.error("El comentario no puede exceder 5000 caracteres"); return; }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/forum/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment, parent_comment_id: null }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setAllComments(prev => [...prev, newCommentData]);
        setComments(prev => [...prev, newCommentData]);
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev);
        setNewComment("");
        toast.success("Comentario publicado");
      } else if (response.status === 401) {
        toast.error("Debes estar autenticado para comentar");
      } else {
        toast.error("Error al publicar comentario");
      }
    } catch (error) {
      toast.error("Error al publicar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string, content: string, onSuccess: () => void) => {
    if (!content.trim()) { toast.error("La respuesta no puede estar vacía"); return; }
    if (content.length > 5000) { toast.error("La respuesta no puede exceder 5000 caracteres"); return; }
    try {
      const response = await fetch(`/api/v1/forum/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, parent_comment_id: parentCommentId }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setAllComments(prev => [...prev, newCommentData]);
        setExpandedReplies(prev => new Set([...prev, parentCommentId]));
        setAllComments(prev => prev.map(c => c.id === parentCommentId ? { ...c, replies_count: c.replies_count + 1 } : c));
        setComments(prev => prev.map(c => c.id === parentCommentId ? { ...c, replies_count: c.replies_count + 1 } : c));
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev);
        toast.success("Respuesta publicada");
        onSuccess();
      } else if (response.status === 401) {
        toast.error("Debes estar autenticado para comentar");
      } else {
        toast.error("Error al publicar respuesta");
      }
    } catch {
      toast.error("Error al publicar respuesta");
    }
  };

  const handleDeleteComment = async (commentId: string, parentCommentId: string | null) => {
    setCommentToDelete({ id: commentId, parentId: parentCommentId });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const { id: commentId, parentId: parentCommentId } = commentToDelete;
    try {
      const response = await fetch(`/api/v1/forum/${postId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setAllComments(prevAll => {
          const repliesToDelete = prevAll.filter(c => c.parent_comment_id === commentId);
          const totalDeleted = 1 + repliesToDelete.length;
          const commentIdsToRemove = new Set([commentId, ...repliesToDelete.map(r => r.id)]);
          setPost(prev => prev ? { ...prev, comments_count: Math.max(0, prev.comments_count - totalDeleted) } : prev);
          const newAll = prevAll.filter(c => !commentIdsToRemove.has(c.id));
          setComments(prev => prev.filter(c => !commentIdsToRemove.has(c.id)));
          return newAll;
        });
        if (parentCommentId) {
          setAllComments(prev => prev.map(c => c.id === parentCommentId ? { ...c, replies_count: Math.max(0, c.replies_count - 1) } : c));
          setComments(prev => prev.map(c => c.id === parentCommentId ? { ...c, replies_count: Math.max(0, c.replies_count - 1) } : c));
        }
        toast.success("Comentario eliminado");
      } else if (response.status === 403) {
        toast.error("No tienes permiso para borrar este comentario");
      } else {
        toast.error("Error al borrar comentario");
      }
    } catch {
      toast.error("Error al borrar comentario");
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) newSet.delete(commentId);
      else newSet.add(commentId);
      return newSet;
    });
  };

  const getReplies = (parentId: string): Comment[] =>
    allComments.filter(c => c.parent_comment_id === parentId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4" />
          <p className="text-gray-600">Cargando post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Post no encontrado</p>
          <button onClick={() => navigate("/forum")} className="px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90">
            Volver al Foro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto px-6 lg:px-10 py-10 transition-all duration-300"
      style={{ maxWidth: selectedAuthor ? "1400px" : "900px" }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/forum")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0099DC] mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Volver al Foro
      </button>

      <div className="flex gap-6 items-start">
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Post */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 mb-6"
            style={{ border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <h1
              className="text-3xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {post.title}
            </h1>

            {/* Author row — clickable */}
            <button
              onClick={() => openAuthorPanel(post.author)}
              className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 w-full text-left group"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#0099DC]/40"
                style={{ backgroundColor: "#0099DC", color: "white", fontWeight: 600 }}
              >
                {getInitials(post.author.first_name, post.author.last_name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-[#0099DC] transition-colors">
                  {post.author.first_name} {post.author.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(post.published_at || post.created_at)}
                </p>
              </div>
              <span className="text-xs text-[#0099DC] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Ver perfil →
              </span>
            </button>

            <div className="text-gray-700 whitespace-pre-wrap" style={{ lineHeight: "1.7" }}>
              <GemMentionRenderer text={post.content} />
            </div>
          </motion.article>

          {/* Comments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8"
            style={{ border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare size={20} />
              Comentarios ({post.comments_count})
            </h2>

            <form onSubmit={handleSubmitComment} className="mb-8">
              <GemMentionInput
                value={newComment}
                onChange={setNewComment}
                placeholder="Escribe un comentario... (usa @gem para mencionar una gema)"
                rows={4}
                maxLength={5000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0099DC] focus:ring-2 focus:ring-[#0099DC]/20 transition-all resize-none"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">{newComment.length} / 5000 caracteres</span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Publicando...</>
                  ) : (
                    <><Send size={16} />Publicar Comentario</>
                  )}
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onSubmitReply={handleSubmitReply}
                    onDelete={handleDeleteComment}
                    onAuthorClick={openAuthorPanel}
                    currentUserId={user?.id}
                    getReplies={getReplies}
                    expandedReplies={expandedReplies}
                    toggleReplies={toggleReplies}
                    formatDate={formatDate}
                    getInitials={getInitials}
                    selectedAuthorId={selectedAuthor?.id}
                  />
                ))
              )}
            </div>
          </motion.section>
        </div>

        {/* ── Author Panel ── */}
        <AnimatePresence>
          {selectedAuthor && (
            <motion.aside
              key="author-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-80 shrink-0 sticky top-24"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              >
                {/* Panel header */}
                <div
                  className="px-5 pt-5 pb-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid #F0F1F5" }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#9AA5B4", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Perfil del autor
                  </span>
                  <button
                    onClick={closeAuthorPanel}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                    style={{ color: "#9AA5B4" }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center px-5 pt-6 pb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: "linear-gradient(135deg, #0099DC, #1C3A5C)",
                      boxShadow: "0 4px 16px rgba(0,153,220,0.3)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                    }}
                  >
                    {getInitials(selectedAuthor.first_name, selectedAuthor.last_name)}
                  </div>
                  <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#1A2332" }}>
                    {selectedAuthor.first_name} {selectedAuthor.last_name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail size={12} color="#9AA5B4" />
                    <span style={{ fontSize: "0.78rem", color: "#9AA5B4" }}>{selectedAuthor.email}</span>
                  </div>
                </div>

                {/* Their posts */}
                <div className="px-5 pb-5">
                  <div
                    className="pt-4 pb-2 mb-3"
                    style={{ borderTop: "1px solid #F0F1F5" }}
                  >
                    <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "#1A2332", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Publicaciones en el Foro
                    </p>
                  </div>

                  {authorPanelLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 size={22} className="animate-spin" style={{ color: "#0099DC" }} />
                    </div>
                  ) : authorPosts.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <MessageSquare size={32} color="#D1D5DB" className="mb-2" />
                      <p style={{ fontSize: "0.8rem", color: "#9AA5B4" }}>Sin otras publicaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {authorPosts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => navigate(`/forum/${p.id}`)}
                          className="w-full text-left p-3 rounded-xl transition-colors hover:bg-gray-50 group/post"
                          style={{ border: "1px solid #F0F1F5" }}
                        >
                          <p
                            className="text-sm font-semibold line-clamp-2 mb-1 group-hover/post:text-[#0099DC] transition-colors"
                            style={{ color: "#1A2332" }}
                          >
                            {p.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <span style={{ fontSize: "0.7rem", color: "#9AA5B4" }}>
                              {p.comments_count} comentario{p.comments_count !== 1 ? "s" : ""}
                            </span>
                            <ExternalLink size={11} color="#9AA5B4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <AlertDialogTitle className="text-xl font-bold">Eliminar comentario</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer
              y también eliminará todas las respuestas a este comentario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => { setDeleteDialogOpen(false); setCommentToDelete(null); }}
              className="font-medium"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteComment} className="bg-red-600 hover:bg-red-700 text-white font-medium">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Comment Component ──

interface CommentItemProps {
  comment: Comment;
  onSubmitReply: (parentCommentId: string, content: string, onSuccess: () => void) => Promise<void>;
  onDelete: (commentId: string, parentCommentId: string | null) => void;
  onAuthorClick: (author: Author) => void;
  currentUserId?: string;
  getReplies: (parentId: string) => Comment[];
  expandedReplies: Set<string>;
  toggleReplies: (id: string) => void;
  formatDate: (date: string) => string;
  getInitials: (firstName: string, lastName: string) => string;
  isReply?: boolean;
  selectedAuthorId?: string;
}

function CommentItem({
  comment,
  onSubmitReply,
  onDelete,
  onAuthorClick,
  currentUserId,
  getReplies,
  expandedReplies,
  toggleReplies,
  formatDate,
  getInitials,
  isReply = false,
  selectedAuthorId,
}: CommentItemProps) {
  const [replyingToThis, setReplyingToThis] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const isAuthor = currentUserId === comment.author.id;
  const isSelected = selectedAuthorId === comment.author.id;
  const replies = getReplies(comment.id);
  const hasReplies = replies.length > 0;
  const isExpanded = expandedReplies.has(comment.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingReply(true);
    await onSubmitReply(comment.id, replyText, () => {
      setReplyText("");
      setReplyingToThis(false);
      setSubmittingReply(false);
    });
    setSubmittingReply(false);
  };

  return (
    <div className={isReply ? "ml-12 mt-4" : ""}>
      <div className={`${isReply ? "border-l-2 border-gray-200 pl-6" : "border-l-2 border-[#0099DC] pl-6"}`}>
        <div className="flex items-start gap-4">
          {/* Avatar — clickable */}
          <button
            onClick={() => onAuthorClick(comment.author)}
            className="shrink-0 transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-[#0099DC]/40 rounded-full"
            style={{ outline: "none" }}
            title={`Ver perfil de ${comment.author.first_name}`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: isSelected ? "#1C3A5C" : (isReply ? "#6B7A8D" : "#0099DC"),
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "background-color 0.2s",
              }}
            >
              {getInitials(comment.author.first_name, comment.author.last_name)}
            </div>
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <button
                  onClick={() => onAuthorClick(comment.author)}
                  className="font-semibold text-gray-900 hover:text-[#0099DC] transition-colors text-left"
                >
                  {comment.author.first_name} {comment.author.last_name}
                </button>
                <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-3 whitespace-pre-wrap">
              <GemMentionRenderer text={comment.content} />
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setReplyingToThis(true)}
                className="text-sm text-[#0099DC] hover:underline font-medium flex items-center gap-1"
              >
                <CornerDownRight size={14} />
                Responder
              </button>

              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  {isExpanded ? "Ocultar" : "Ver"} {replies.length} respuesta{replies.length !== 1 ? "s" : ""}
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={() => onDelete(comment.id, comment.parent_comment_id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Borrar
                </button>
              )}
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {replyingToThis && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="bg-blue-50 px-3 py-2 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CornerDownRight size={14} className="text-[#0099DC]" />
                      <span className="text-gray-700">
                        Respondiendo a <strong>{comment.author.first_name} {comment.author.last_name}</strong>
                      </span>
                    </div>
                    <button type="button" onClick={() => { setReplyingToThis(false); setReplyText(""); }} className="text-gray-500 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  </div>

                  <GemMentionInput
                    value={replyText}
                    onChange={setReplyText}
                    placeholder="Escribe tu respuesta... (usa @gem para mencionar una gema)"
                    rows={3}
                    maxLength={5000}
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:border-[#0099DC] focus:ring-2 focus:ring-[#0099DC]/20 transition-all resize-none"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  />

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{replyText.length} / 5000 caracteres</span>
                    <button
                      type="submit"
                      disabled={submittingReply || !replyText.trim()}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {submittingReply ? (
                        <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />Publicando...</>
                      ) : (
                        <><Send size={14} />Publicar Respuesta</>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      <AnimatePresence>
        {hasReplies && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onSubmitReply={onSubmitReply}
                onDelete={onDelete}
                onAuthorClick={onAuthorClick}
                currentUserId={currentUserId}
                getReplies={getReplies}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
                formatDate={formatDate}
                getInitials={getInitials}
                isReply={true}
                selectedAuthorId={selectedAuthorId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
