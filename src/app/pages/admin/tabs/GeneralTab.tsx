import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Loader2, Save, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { AdminCourse, AdminArea } from "../../../types/admin";

interface GeneralTabProps {
  course: AdminCourse;
  onUpdate: (c: AdminCourse) => void;
}

interface FormState {
  title: string;
  description: string;
  area_id: string;
  cover_url: string;
  estimated_minutes: string;
  access_type: "free" | "restricted";
}

function buildInitial(course: AdminCourse): FormState {
  return {
    title: course.title ?? "",
    description: course.description ?? "",
    area_id: course.area?.id ?? "",
    cover_url: course.cover_url ?? "",
    estimated_minutes:
      course.estimated_minutes !== null && course.estimated_minutes !== undefined
        ? String(course.estimated_minutes)
        : "",
    access_type: course.access_type,
  };
}

export default function GeneralTab({ course, onUpdate }: GeneralTabProps) {
  const [form, setForm] = useState<FormState>(() => buildInitial(course));
  const [initial, setInitial] = useState<FormState>(() => buildInitial(course));
  const [areas, setAreas] = useState<AdminArea[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = buildInitial(course);
    setForm(next);
    setInitial(next);
  }, [course]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/admin/areas", { credentials: "include" });
        if (!res.ok) throw await res.json().catch(() => ({ detail: "Error cargando áreas" }));
        const data = await res.json();
        if (alive) setAreas(Array.isArray(data) ? data : data.items ?? []);
      } catch (err: any) {
        toast.error(err?.detail || "No se pudieron cargar las áreas");
      } finally {
        if (alive) setLoadingAreas(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const dirty = useMemo(() => {
    return (
      form.title !== initial.title ||
      form.description !== initial.description ||
      form.area_id !== initial.area_id ||
      form.cover_url !== initial.cover_url ||
      form.estimated_minutes !== initial.estimated_minutes ||
      form.access_type !== initial.access_type
    );
  }, [form, initial]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {};
    if (form.title !== initial.title) payload.title = form.title.trim();
    if (form.description !== initial.description)
      payload.description = form.description.trim() === "" ? null : form.description;
    if (form.area_id !== initial.area_id) payload.area_id = form.area_id || null;
    if (form.cover_url !== initial.cover_url)
      payload.cover_url = form.cover_url.trim() === "" ? null : form.cover_url.trim();
    if (form.estimated_minutes !== initial.estimated_minutes) {
      payload.estimated_minutes =
        form.estimated_minutes.trim() === "" ? null : Number(form.estimated_minutes);
    }
    if (form.access_type !== initial.access_type) payload.access_type = form.access_type;

    try {
      const res = await fetch(`/api/v1/admin/courses/${course.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error al guardar" }));
      const updated: AdminCourse = await res.json();
      onUpdate(updated);
      toast.success("Cambios guardados");
    } catch (err: any) {
      toast.error(err?.detail || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
          Información General
        </h2>
        <div className="flex items-center gap-3">
          {dirty && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Sin guardar
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#E5A800" }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl p-6 border space-y-5"
        style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
            Título <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#E8EAED" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ borderColor: "#E8EAED" }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
              Área
            </label>
            <select
              value={form.area_id}
              onChange={(e) => update("area_id", e.target.value)}
              disabled={loadingAreas}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: "#E8EAED" }}
            >
              <option value="">Sin área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
              Duración estimada (minutos)
            </label>
            <input
              type="number"
              min={0}
              value={form.estimated_minutes}
              onChange={(e) => update("estimated_minutes", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E8EAED" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
            URL de portada
          </label>
          <input
            type="url"
            value={form.cover_url}
            onChange={(e) => update("cover_url", e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#E8EAED" }}
          />
          {form.cover_url.trim() !== "" && (
            <div
              className="mt-3 rounded-xl overflow-hidden border flex items-center justify-center bg-gray-50"
              style={{ borderColor: "#E8EAED", height: 200 }}
            >
              <img
                src={form.cover_url}
                alt="Portada"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const parent = (e.currentTarget as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<div style="color:#6B7A8D" class="flex flex-col items-center gap-2 text-sm"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>No se pudo cargar la imagen</div>`;
                  }
                }}
              />
            </div>
          )}
          {form.cover_url.trim() === "" && (
            <div
              className="mt-3 rounded-xl border border-dashed flex items-center justify-center text-sm gap-2"
              style={{ borderColor: "#E8EAED", height: 200, color: "#6B7A8D" }}
            >
              <ImageIcon className="w-5 h-5" />
              Sin imagen de portada
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
            Tipo de acceso
          </label>
          <div className="inline-flex rounded-xl border p-1" style={{ borderColor: "#E8EAED" }}>
            <button
              type="button"
              onClick={() => update("access_type", "free")}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: form.access_type === "free" ? "#4A8A2C" : "transparent",
                color: form.access_type === "free" ? "#FFFFFF" : "#6B7A8D",
              }}
            >
              Libre
            </button>
            <button
              type="button"
              onClick={() => update("access_type", "restricted")}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: form.access_type === "restricted" ? "#0099DC" : "transparent",
                color: form.access_type === "restricted" ? "#FFFFFF" : "#6B7A8D",
              }}
            >
              Restringido
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
