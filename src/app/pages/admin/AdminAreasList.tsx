import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Building2, Plus, Edit, Trash2, Loader2, Save, X, Users, BookOpen, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { adminAreasApi } from "../../lib/adminApi";
import type { AreaAdminRead } from "../../types/adminPanel";

export function AdminAreasList() {
  const [areas, setAreas] = useState<AreaAdminRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AreaAdminRead | null>(null);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      setAreas(await adminAreasApi.list());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAreas(); }, []);

  const handleDelete = async (a: AreaAdminRead) => {
    if (!confirm(`¿Eliminar el área "${a.name}"? Los usuarios y cursos asociados quedarán sin área.`)) return;
    try {
      await adminAreasApi.remove(a.id);
      toast.success("Área eliminada");
      fetchAreas();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <Building2 size={26} style={{ color: "#E5A800" }} />
            Áreas / Departamentos
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${areas.length} áreas`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}
        >
          <Plus size={16} /> Nueva área
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
      ) : areas.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <Building2 size={32} style={{ color: "#9AA5B4", margin: "0 auto" }} />
          <p style={{ color: "#6B7A8D", marginTop: "0.5rem" }}>No hay áreas todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(229,168,0,0.12)" }}>
                  <Building2 size={18} style={{ color: "#E5A800" }} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(a)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Editar">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(a)} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                    <Trash2 size={14} style={{ color: "#DC2626" }} />
                  </button>
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1A2332" }}>{a.name}</h3>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: "#F0F1F5" }}>
                <Mini icon={Users} label="Usuarios" value={a.users_count} color="#0099DC" />
                <Mini icon={BookOpen} label="Cursos" value={a.courses_count} color="#4A8A2C" />
                <Mini icon={MessageSquare} label="Posts" value={a.forum_posts_count} color="#E87830" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && <AreaModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchAreas(); }} />}
      {editing && <AreaModal area={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchAreas(); }} />}
    </div>
  );
}

function Mini({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <Icon size={14} style={{ color, margin: "0 auto" }} />
      <p style={{ fontWeight: 700, color: "#1A2332", fontSize: "0.95rem", marginTop: "0.15rem" }}>{value}</p>
      <p style={{ fontSize: "0.65rem", color: "#9AA5B4" }}>{label}</p>
    </div>
  );
}

function AreaModal({ area, onClose, onSaved }: { area?: AreaAdminRead; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(area?.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("El nombre es obligatorio");
    setSaving(true);
    try {
      if (area) await adminAreasApi.update(area.id, name.trim());
      else await adminAreasApi.create(name.trim());
      toast.success(area ? "Área actualizada" : "Área creada");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-md"
        style={{ backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>
            {area ? "Editar área" : "Nueva área"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {area ? "Guardar" : "Crear"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
