import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Loader2,
  Award,
  Save,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminCertification } from "../../../types/admin";

interface CertificationTabProps {
  courseId: string;
}

interface FormState {
  title: string;
  description: string;
  cost: string;
  validity_days: string;
}

function toForm(cert: AdminCertification | null): FormState {
  return {
    title: cert?.title ?? "",
    description: cert?.description ?? "",
    cost: cert?.cost !== null && cert?.cost !== undefined ? String(cert.cost) : "",
    validity_days:
      cert?.validity_days !== null && cert?.validity_days !== undefined
        ? String(cert.validity_days)
        : "",
  };
}

export default function CertificationTab({ courseId }: CertificationTabProps) {
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<AdminCertification | null>(null);
  const [form, setForm] = useState<FormState>(toForm(null));
  const [initial, setInitial] = useState<FormState>(toForm(null));
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/admin/courses/${courseId}/certification`,
        { credentials: "include" },
      );
      if (res.status === 404) {
        setCert(null);
        const empty = toForm(null);
        setForm(empty);
        setInitial(empty);
        return;
      }
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const data: AdminCertification = await res.json();
      setCert(data);
      const next = toForm(data);
      setForm(next);
      setInitial(next);
    } catch (err: any) {
      toast.error(err?.detail || "No se pudo cargar la certificación");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(
    () =>
      form.title !== initial.title ||
      form.description !== initial.description ||
      form.cost !== initial.cost ||
      form.validity_days !== initial.validity_days,
    [form, initial],
  );

  const buildPayload = () => {
    if (!form.title.trim()) return null;
    return {
      title: form.title.trim(),
      description: form.description.trim() === "" ? null : form.description.trim(),
      cost: form.cost.trim() === "" ? null : Number(form.cost),
      validity_days:
        form.validity_days.trim() === "" ? null : Number(form.validity_days),
    };
  };

  const createCertification = async () => {
    const payload = buildPayload();
    if (!payload) {
      toast.error("El título es obligatorio");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(
        `/api/v1/admin/courses/${courseId}/certification`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const data: AdminCertification = await res.json();
      setCert(data);
      const next = toForm(data);
      setForm(next);
      setInitial(next);
      setShowCreateForm(false);
      toast.success("Certificación creada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear certificación");
    } finally {
      setCreating(false);
    }
  };

  const saveChanges = async () => {
    if (!cert) return;
    const payload = buildPayload();
    if (!payload) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/certifications/${cert.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      const data: AdminCertification = await res.json();
      setCert(data);
      const next = toForm(data);
      setForm(next);
      setInitial(next);
      toast.success("Certificación actualizada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al guardar certificación");
    } finally {
      setSaving(false);
    }
  };

  const deleteCertification = async () => {
    if (!cert) return;
    if (!confirm("¿Eliminar la certificación? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/v1/admin/certifications/${cert.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw await res.json().catch(() => ({ detail: "Error" }));
      setCert(null);
      const empty = toForm(null);
      setForm(empty);
      setInitial(empty);
      toast.success("Certificación eliminada");
    } catch (err: any) {
      toast.error(err?.detail || "Error al eliminar certificación");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E5A800" }} />
      </div>
    );
  }

  if (!cert && !showCreateForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
          Certificación
        </h2>
        <div
          className="bg-white rounded-2xl border p-10 text-center"
          style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#FFF8E1" }}
          >
            <Award className="w-7 h-7" style={{ color: "#E5A800" }} />
          </div>
          <p className="text-sm mb-5" style={{ color: "#6B7A8D" }}>
            Este curso no tiene certificación configurada
          </p>
          <button
            onClick={() => {
              setShowCreateForm(true);
              const empty = toForm(null);
              setForm(empty);
              setInitial(empty);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#E5A800" }}
          >
            <Plus className="w-4 h-4" /> Configurar Certificación
          </button>
        </div>
      </motion.div>
    );
  }

  const costLabel = (() => {
    const trimmed = form.cost.trim();
    if (trimmed === "") return "Gratis";
    const n = Number(trimmed);
    if (isNaN(n)) return "";
    return `${n.toFixed(2)} USD`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#1A2332" }}>
          Certificación
        </h2>
        <div className="flex items-center gap-3">
          {dirty && cert && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Sin guardar
            </span>
          )}
          {cert ? (
            <button
              onClick={saveChanges}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#E5A800" }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar cambios
            </button>
          ) : (
            <button
              onClick={createCertification}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#E5A800" }}
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Crear certificación
            </button>
          )}
        </div>
      </div>

      <div
        className="bg-white rounded-2xl border p-6 space-y-5"
        style={{ borderColor: "#E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
            Título <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "#E8EAED" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
            Descripción
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: "#E8EAED" }}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
              Costo
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 pr-14 rounded-xl border text-sm"
                style={{ borderColor: "#E8EAED" }}
              />
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                style={{ color: "#6B7A8D" }}
              >
                USD
              </span>
            </div>
            <p className="mt-1 text-xs" style={{ color: "#6B7A8D" }}>
              {form.cost.trim() === "" ? (
                <span style={{ color: "#4A8A2C", fontWeight: 500 }}>Gratis</span>
              ) : (
                costLabel
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2332" }}>
              Validez (días)
            </label>
            <input
              type="number"
              min={0}
              value={form.validity_days}
              onChange={(e) =>
                setForm((f) => ({ ...f, validity_days: e.target.value }))
              }
              placeholder="Sin vencimiento"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E8EAED" }}
            />
            <p className="mt-1 text-xs" style={{ color: "#6B7A8D" }}>
              Deja vacío para certificaciones sin vencimiento
            </p>
          </div>
        </div>
      </div>

      {cert && (
        <div
          className="bg-white rounded-2xl border p-5 flex items-center justify-between"
          style={{ borderColor: "#FECACA", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: "#DC2626" }}>
              Zona de peligro
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7A8D" }}>
              Eliminar esta certificación invalidará los certificados ya emitidos.
            </div>
          </div>
          <button
            onClick={deleteCertification}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#DC2626" }}
          >
            <Trash2 className="w-4 h-4" /> Eliminar certificación
          </button>
        </div>
      )}

      {!cert && showCreateForm && (
        <button
          onClick={() => setShowCreateForm(false)}
          className="text-xs font-medium underline"
          style={{ color: "#6B7A8D" }}
        >
          Cancelar
        </button>
      )}
    </motion.div>
  );
}
