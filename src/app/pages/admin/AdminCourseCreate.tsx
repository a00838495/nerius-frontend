import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminArea } from "../../types/admin";

export function AdminCourseCreate() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<AdminArea[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [accessType, setAccessType] = useState<"free" | "restricted">("free");

  useEffect(() => {
    fetch("/api/v1/admin/areas", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then(setAreas)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/courses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          area_id: areaId || null,
          cover_url: coverUrl.trim() || null,
          estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
          access_type: accessType,
          status: "draft",
        }),
      });
      if (res.ok) {
        const course = await res.json();
        toast.success("Curso creado como borrador");
        navigate(`/admin/cursos/${course.id}/editar`);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al crear curso");
      }
    } catch {
      toast.error("Error al crear curso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8">
      <button
        onClick={() => navigate("/admin/cursos")}
        className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-[#E5A800]"
        style={{ color: "#6B7A8D" }}
      >
        <ChevronLeft size={14} /> Volver a Cursos
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #E5A800, #F5D060)" }}
        >
          <BookOpen size={22} color="#1C3A5C" />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#1A2332" }}>
            Nuevo Curso
          </h1>
          <p className="text-sm" style={{ color: "#6B7A8D" }}>
            Crea un borrador y agrega contenido después
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-5"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6B7A8D" }}>
            Título *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej: Introducción a Python"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6B7A8D" }}>
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Breve descripción del curso..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 resize-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Area */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6B7A8D" }}>
              Área
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
            >
              <option value="">Sin área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Estimated minutes */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6B7A8D" }}>
              Duración estimada (minutos)
            </label>
            <input
              type="number"
              min={0}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="120"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
            />
          </div>
        </div>

        {/* Cover URL */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6B7A8D" }}>
            URL de portada
          </label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          />
        </div>

        {/* Access type */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#6B7A8D" }}>
            Tipo de acceso
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["free", "restricted"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccessType(type)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: accessType === type ? "rgba(229,168,0,0.12)" : "#F9FAFB",
                  border: `1.5px solid ${accessType === type ? "#E5A800" : "#E8EAED"}`,
                  color: accessType === type ? "#E5A800" : "#6B7A8D",
                }}
              >
                {type === "free" ? "Libre (todos los usuarios)" : "Restringido (requiere grant)"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "#F0F1F5" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/cursos")}
            className="px-5 py-2.5 text-sm font-medium rounded-xl transition-colors hover:bg-gray-100"
            style={{ color: "#6B7A8D" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #E5A800, #F5D060)", color: "#1C3A5C", boxShadow: "0 4px 12px rgba(229,168,0,0.3)" }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Crear y Editar
          </button>
        </div>
      </motion.form>
    </div>
  );
}
