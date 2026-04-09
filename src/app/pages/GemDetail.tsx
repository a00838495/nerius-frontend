import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Loader2,
  MessageCircle,
  User,
  Eye,
  Calendar,
  Tag,
  Layers,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { GemDetail as GemDetailType } from "../types/gems";

const API_BASE = "/api/v1";

export default function GemDetail() {
  const { gemId } = useParams<{ gemId: string }>();
  const navigate = useNavigate();

  const [gem, setGem] = useState<GemDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!gemId) return;
    setLoading(true);
    fetch(`${API_BASE}/gems/${gemId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: GemDetailType) => setGem(data))
      .catch(() => {
        toast.error("Error al cargar la gema");
        navigate("/gems");
      })
      .finally(() => setLoading(false));
  }, [gemId, navigate]);

  const handleToggleSave = async () => {
    if (!gem || saving) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/gems/${gem.id}/save`, {
        method: gem.is_saved ? "DELETE" : "POST",
        credentials: "include",
      });
      setGem({
        ...gem,
        is_saved: !gem.is_saved,
        saves_count: gem.is_saved ? gem.saves_count - 1 : gem.saves_count + 1,
      });
      toast.success(gem.is_saved ? "Gema removida de guardados" : "Gema guardada");
    } catch {
      toast.error("Error al actualizar guardado");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} style={{ color: "#0099DC" }} />
        </motion.div>
      </div>
    );
  }

  if (!gem) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate("/gems")}
          className="mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          style={{ color: "#1C3A5C" }}
        >
          <ArrowLeft size={18} />
          Volver al Banco de Gemas
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {gem.icon_url && (
                  <img
                    src={gem.icon_url}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
                <h1
                  className="text-2xl font-bold sm:text-3xl"
                  style={{ color: "#1C3A5C" }}
                >
                  {gem.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {gem.category && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: "rgba(0,153,220,0.1)",
                      color: "#0099DC",
                    }}
                  >
                    <Layers size={12} />
                    {gem.category.name}
                  </span>
                )}
                {gem.is_featured && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: "rgba(229,168,0,0.12)",
                      color: "#E5A800",
                    }}
                  >
                    <Sparkles size={12} />
                    Destacada
                  </span>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleSave}
              disabled={saving}
              className="flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                backgroundColor: gem.is_saved ? "#0099DC" : "#ffffff",
                color: gem.is_saved ? "#ffffff" : "#0099DC",
                border: "2px solid #0099DC",
              }}
            >
              {gem.is_saved ? (
                <>
                  <BookmarkCheck size={18} />
                  Guardada
                </>
              ) : (
                <>
                  <Bookmark size={18} />
                  Guardar
                </>
              )}
            </motion.button>
            {gem.gemini_url && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={gem.gemini_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #E5A800 0%, #1C3A5C 100%)",
                  boxShadow: "0 4px 12px rgba(229,168,0,0.3)",
                }}
              >
                <ExternalLink size={18} />
                Abrir en Gemini
              </motion.a>
            )}
          </div>
        </motion.div>

        {/* Description */}
        {gem.description && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 rounded-2xl p-6"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              className="mb-3 text-lg font-semibold"
              style={{ color: "#1C3A5C" }}
            >
              Descripción
            </h2>
            <p className="leading-relaxed" style={{ color: "#475569" }}>
              {gem.description}
            </p>
          </motion.section>
        )}

        {/* Instructions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 rounded-2xl p-6"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            className="mb-3 text-lg font-semibold"
            style={{ color: "#1C3A5C" }}
          >
            Instrucciones
          </h2>
          <div
            className="whitespace-pre-wrap rounded-xl p-5 text-sm leading-relaxed"
            style={{
              backgroundColor: "#f0f7fc",
              color: "#334155",
              border: "1px solid rgba(0,153,220,0.15)",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {gem.instructions}
          </div>
        </motion.section>

        {/* Conversation Starters */}
        {gem.conversation_starters && gem.conversation_starters.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 rounded-2xl p-6"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2 text-lg font-semibold"
              style={{ color: "#1C3A5C" }}
            >
              <MessageCircle size={20} style={{ color: "#0099DC" }} />
              Inicios de conversación
            </h2>
            <div className="flex flex-wrap gap-3">
              {gem.conversation_starters.map((starter, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer rounded-xl px-4 py-3 text-left text-sm transition-all"
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#1C3A5C",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0099DC";
                    e.currentTarget.style.backgroundColor = "#f0f7fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                >
                  "{starter}"
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Tags & Areas */}
        {(gem.tags.length > 0 || gem.areas.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-6 rounded-2xl p-6"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {gem.tags.length > 0 && (
              <div className="mb-4">
                <h3
                  className="mb-2 flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "#1C3A5C" }}
                >
                  <Tag size={16} style={{ color: "#0099DC" }} />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gem.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: "rgba(0,153,220,0.08)",
                        color: "#0099DC",
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {gem.areas.length > 0 && (
              <div>
                <h3
                  className="mb-2 flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "#1C3A5C" }}
                >
                  <Layers size={16} style={{ color: "#E5A800" }} />
                  Áreas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gem.areas.map((area) => (
                    <span
                      key={area.id}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: "rgba(229,168,0,0.1)",
                        color: "#b38600",
                      }}
                    >
                      {area.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Meta info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10 rounded-2xl p-6"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm" style={{ color: "#64748b" }}>
            <div className="flex items-center gap-2">
              <User size={16} style={{ color: "#0099DC" }} />
              <span>
                Creada por{" "}
                <span className="font-medium" style={{ color: "#1C3A5C" }}>
                  {gem.created_by_user.first_name} {gem.created_by_user.last_name}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark size={16} style={{ color: "#0099DC" }} />
              <span>
                <span className="font-medium" style={{ color: "#1C3A5C" }}>
                  {gem.saves_count}
                </span>{" "}
                {gem.saves_count === 1 ? "persona guardó" : "personas guardaron"} esta gema
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: "#0099DC" }} />
              <span>{formatDate(gem.created_at)}</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
