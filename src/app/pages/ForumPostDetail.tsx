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

  useEffect(() => {
    if (postId) {
      fetchPostAndComments();
    }
  }, [postId]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      // Fetch post details
      const postResponse = await fetch(`/api/v1/forum/${postId}`);
      if (!postResponse.ok) throw new Error("Failed to fetch post");
      const postData = await postResponse.json();
      setPost(postData);

      // Fetch all comments
      const commentsResponse = await fetch(`/api/v1/forum/${postId}/comments`);
      if (!commentsResponse.ok) throw new Error("Failed to fetch comments");
      const commentsData = await commentsResponse.json();
      
      // Store all comments
      setAllComments(commentsData);
      
      // Filter top-level comments (no parent)
      const topLevelComments = commentsData.filter(
        (c: Comment) => c.parent_comment_id === null
      );
      setComments(topLevelComments);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar el post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    if (newComment.length > 5000) {
      toast.error("El comentario no puede exceder 5000 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/forum/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: newComment,
          parent_comment_id: null,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        
        // Add to all comments and top-level comments using functional updates
        setAllComments(prevAll => [...prevAll, newCommentData]);
        setComments(prevComments => [...prevComments, newCommentData]);
        
        // Update post comments count
        setPost(prevPost => 
          prevPost ? { ...prevPost, comments_count: prevPost.comments_count + 1 } : prevPost
        );
        
        setNewComment("");
        toast.success("Comentario publicado");
      } else if (response.status === 401) {
        toast.error("Debes estar autenticado para comentar");
      } else {
        toast.error("Error al publicar comentario");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Error al publicar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (
    parentCommentId: string,
    content: string,
    onSuccess: () => void
  ) => {
    if (!content.trim()) {
      toast.error("La respuesta no puede estar vacía");
      return;
    }

    if (content.length > 5000) {
      toast.error("La respuesta no puede exceder 5000 caracteres");
      return;
    }

    try {
      const response = await fetch(`/api/v1/forum/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: content,
          parent_comment_id: parentCommentId,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        
        // Add to all comments using functional update
        setAllComments(prevAll => [...prevAll, newCommentData]);
        
        // Auto-expand the parent to show the new reply
        setExpandedReplies(prev => new Set([...prev, parentCommentId]));
        
        // Update parent's replies count
        setAllComments(prevAll => 
          prevAll.map(c => 
            c.id === parentCommentId 
              ? { ...c, replies_count: c.replies_count + 1 }
              : c
          )
        );
        
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === parentCommentId
              ? { ...c, replies_count: c.replies_count + 1 }
              : c
          )
        );
        
        // Update post comments count
        setPost(prevPost =>
          prevPost ? { ...prevPost, comments_count: prevPost.comments_count + 1 } : prevPost
        );
        
        toast.success("Respuesta publicada");
        onSuccess();
      } else if (response.status === 401) {
        toast.error("Debes estar autenticado para comentar");
      } else {
        toast.error("Error al publicar respuesta");
      }
    } catch (error) {
      console.error("Error creating reply:", error);
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
      const response = await fetch(
        `/api/v1/forum/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Get all comments to delete before state updates
        setAllComments(prevAll => {
          const deletedComment = prevAll.find(c => c.id === commentId);
          const repliesToDelete = prevAll.filter(c => c.parent_comment_id === commentId);
          const totalDeleted = 1 + repliesToDelete.length;
          
          // Calculate which IDs to remove
          const commentIdsToRemove = new Set([commentId, ...repliesToDelete.map(r => r.id)]);
          
          // Update post comments count
          setPost(prevPost =>
            prevPost ? { ...prevPost, comments_count: Math.max(0, prevPost.comments_count - totalDeleted) } : prevPost
          );
          
          // Remove from all lists
          const newAllComments = prevAll.filter((c) => !commentIdsToRemove.has(c.id));
          
          setComments(prevComments => prevComments.filter((c) => !commentIdsToRemove.has(c.id)));
          
          return newAllComments;
        });
        
        // If this was a reply, update parent's replies count
        if (parentCommentId) {
          setAllComments(prevAll =>
            prevAll.map(c =>
              c.id === parentCommentId
                ? { ...c, replies_count: Math.max(0, c.replies_count - 1) }
                : c
            )
          );
          
          setComments(prevComments =>
            prevComments.map(c =>
              c.id === parentCommentId
                ? { ...c, replies_count: Math.max(0, c.replies_count - 1) }
                : c
            )
          );
        }
        
        toast.success("Comentario eliminado");
      } else if (response.status === 403) {
        toast.error("No tienes permiso para borrar este comentario");
      } else {
        toast.error("Error al borrar comentario");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error al borrar comentario");
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getReplies = (parentId: string): Comment[] => {
    return allComments.filter((c) => c.parent_comment_id === parentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099DC] mx-auto mb-4"></div>
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
          <button
            onClick={() => navigate("/forum")}
            className="px-4 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90"
          >
            Volver al Foro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate("/forum")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0099DC] mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Volver al Foro
      </button>

      {/* Post Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 mb-6"
        style={{
          border: "1px solid #E8EAED",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h1
          className="text-3xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#0099DC",
              color: "white",
              fontWeight: 600,
            }}
          >
            {getInitials(post.author.first_name, post.author.last_name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {post.author.first_name} {post.author.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(post.published_at || post.created_at)}
            </p>
          </div>
        </div>

        <div
          className="text-gray-700 whitespace-pre-wrap"
          style={{ lineHeight: "1.7" }}
        >
          <GemMentionRenderer text={post.content} />
        </div>
      </motion.article>

      {/* Comments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-8"
        style={{
          border: "1px solid #E8EAED",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare size={20} />
          Comentarios ({post.comments_count})
        </h2>

        {/* Comment Form */}
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
            <span className="text-sm text-gray-500">
              {newComment.length} / 5000 caracteres
            </span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Publicar Comentario
                </>
              )}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onSubmitReply={handleSubmitReply}
                onDelete={handleDeleteComment}
                currentUserId={user?.id}
                getReplies={getReplies}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
                formatDate={formatDate}
                getInitials={getInitials}
              />
            ))
          )}
        </div>
      </motion.section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                Eliminar comentario
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de que quieres eliminar este comentario? Esta acción
              no se puede deshacer y también eliminará todas las respuestas a
              este comentario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setCommentToDelete(null);
              }}
              className="font-medium"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Comment Component
interface CommentItemProps {
  comment: Comment;
  onSubmitReply: (
    parentCommentId: string,
    content: string,
    onSuccess: () => void
  ) => Promise<void>;
  onDelete: (commentId: string, parentCommentId: string | null) => void;
  currentUserId?: string;
  getReplies: (parentId: string) => Comment[];
  expandedReplies: Set<string>;
  toggleReplies: (id: string) => void;
  formatDate: (date: string) => string;
  getInitials: (firstName: string, lastName: string) => string;
  isReply?: boolean;
}

function CommentItem({
  comment,
  onSubmitReply,
  onDelete,
  currentUserId,
  getReplies,
  expandedReplies,
  toggleReplies,
  formatDate,
  getInitials,
  isReply = false,
}: CommentItemProps) {
  const [replyingToThis, setReplyingToThis] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const isAuthor = currentUserId === comment.author.id;
  const replies = getReplies(comment.id);
  const hasReplies = replies.length > 0;
  const isExpanded = expandedReplies.has(comment.id);

  const handleReplyClick = () => {
    setReplyingToThis(true);
  };

  const handleCancelReply = () => {
    setReplyingToThis(false);
    setReplyText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      <div
        className={`${
          isReply ? "border-l-2 border-gray-200 pl-6" : "border-l-3 border-[#0099DC] pl-6"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: isReply ? "#6B7A8D" : "#0099DC",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {getInitials(comment.author.first_name, comment.author.last_name)}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {comment.author.first_name} {comment.author.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-3 whitespace-pre-wrap">
              <GemMentionRenderer text={comment.content} />
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleReplyClick}
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
                  {isExpanded ? "Ocultar" : "Ver"} {replies.length} respuesta
                  {replies.length !== 1 ? "s" : ""}
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
                        Respondiendo a{" "}
                        <strong>
                          {comment.author.first_name} {comment.author.last_name}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="text-gray-500 hover:text-gray-700"
                    >
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
                    <span className="text-xs text-gray-500">
                      {replyText.length} / 5000 caracteres
                    </span>
                    <button
                      type="submit"
                      disabled={submittingReply || !replyText.trim()}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#0099DC] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {submittingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Publicar Respuesta
                        </>
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
                currentUserId={currentUserId}
                getReplies={getReplies}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
                formatDate={formatDate}
                getInitials={getInitials}
                isReply={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
