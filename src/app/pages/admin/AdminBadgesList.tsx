import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Award, Plus, Loader2, Search, Edit, Trash2, X, Save, Users, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { adminBadgesApi } from "../../lib/adminApi";
import type { BadgeAdminRead, BadgeAwardItem } from "../../types/adminPanel";

export function AdminBadgesList() {
  const [items, setItems] = useState<BadgeAdminRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BadgeAdminRead | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingAwards, setViewingAwards] = useState<BadgeAdminRead | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      setItems(await adminBadgesApi.list(search.trim() || undefined));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (b: BadgeAdminRead) => {
    if (b.awarded_count > 0) {
      return toast.error(`No se puede eliminar: ${b.awarded_count} usuarios ya recibieron este badge`);
    }
    if (!confirm(`¿Eliminar el badge "${b.name}"?`)) return;
    try {
      await adminBadgesApi.remove(b.id);
      toast.success("Badge eliminado");
      fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <Award size={26} style={{ color: "#E5A800" }} />
            Badges Globales
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${items.length} badges`}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          <Plus size={16} /> Nuevo badge
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar badges..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
          <Award size={32} style={{ color: "#9AA5B4", margin: "0 auto" }} />
          <p style={{ color: "#6B7A8D", marginTop: "0.5rem" }}>No hay badges</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${b.main_color}10, ${b.secondary_color}10)`,
                border: `1px solid ${b.main_color}30`,
              }}>
              <div className="flex items-start justify-between mb-3">
                {b.icon_url ? (
                  <img src={b.icon_url} alt={b.name} className="w-14 h-14 rounded-2xl object-cover"
                    style={{ border: `3px solid ${b.main_color}` }} />
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${b.main_color}, ${b.secondary_color})` }}>
                    <Award size={24} color="#FFF" />
                  </div>
                )}
                <div className="flex gap-1">
                  <button onClick={() => setEditing(b)} className="p-1.5 rounded-lg hover:bg-white/60" title="Editar"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(b)} className="p-1.5 rounded-lg hover:bg-white/60" title="Eliminar"><Trash2 size={14} style={{ color: "#DC2626" }} /></button>
                </div>
              </div>
              <h3 style={{ fontWeight: 700, color: "#1A2332" }}>{b.name}</h3>
              {b.description && <p style={{ color: "#6B7A8D", fontSize: "0.78rem" }} className="line-clamp-2 mt-1">{b.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: `${b.main_color}30` }}>
                <button onClick={() => setViewingAwards(b)} className="flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: b.main_color }}>
                  <Users size={12} /> {b.awarded_count} otorgados
                </button>
                <span style={{ color: "#9AA5B4", fontSize: "0.72rem" }} className="flex items-center gap-1">
                  <BookOpen size={11} /> {b.courses_linked}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && <BadgeModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchData(); }} />}
      {editing && <BadgeModal badge={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
      {viewingAwards && <AwardsModal badge={viewingAwards} onClose={() => setViewingAwards(null)} />}
    </div>
  );
}

function BadgeModal({ badge, onClose, onSaved }: { badge?: BadgeAdminRead; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: badge?.name ?? "",
    description: badge?.description ?? "",
    icon_url: badge?.icon_url ?? "",
    main_color: badge?.main_color ?? "#E5A800",
    secondary_color: badge?.secondary_color ?? "#F5D060",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Nombre requerido");
    setSaving(true);
    try {
      if (badge) await adminBadgesApi.update(badge.id, form);
      else await adminBadgesApi.create(form);
      toast.success(badge ? "Badge actualizado" : "Badge creado");
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>{badge ? "Editar badge" : "Nuevo badge"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="rounded-2xl p-4 mb-4 text-center"
          style={{ background: `linear-gradient(135deg, ${form.main_color}15, ${form.secondary_color}15)`, border: `1px solid ${form.main_color}30` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2"
            style={{ background: `linear-gradient(135deg, ${form.main_color}, ${form.secondary_color})` }}>
            <Award size={24} color="#FFF" />
          </div>
          <p style={{ fontWeight: 700, color: "#1A2332" }}>{form.name || "Vista previa"}</p>
        </div>

        <div className="space-y-3">
          <Field label="Nombre"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Descripción"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} /></Field>
          <Field label="Icon URL (opcional)"><input value={form.icon_url} onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))} className={inputCls} placeholder="https://..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Color principal">
              <div className="flex gap-2">
                <input type="color" value={form.main_color} onChange={(e) => setForm((f) => ({ ...f, main_color: e.target.value }))} className="w-12 h-10 rounded-lg" />
                <input value={form.main_color} onChange={(e) => setForm((f) => ({ ...f, main_color: e.target.value }))} className={inputCls} />
              </div>
            </Field>
            <Field label="Color secundario">
              <div className="flex gap-2">
                <input type="color" value={form.secondary_color} onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))} className="w-12 h-10 rounded-lg" />
                <input value={form.secondary_color} onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))} className={inputCls} />
              </div>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {badge ? "Guardar" : "Crear"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AwardsModal({ badge, onClose }: { badge: BadgeAdminRead; onClose: () => void }) {
  const [items, setItems] = useState<BadgeAwardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminBadgesApi.awards(badge.id).then(setItems).catch((e) => toast.error((e as Error).message)).finally(() => setLoading(false));
  }, [badge.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>Otorgamientos: {badge.name}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div> :
          items.length === 0 ? <p className="text-center py-8" style={{ color: "#9AA5B4" }}>Aún no se ha otorgado este badge</p> : (
            <div className="space-y-2">
              {items.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#FAFBFC" }}>
                  <div>
                    <p style={{ fontWeight: 600, color: "#1A2332", fontSize: "0.875rem" }}>{a.user_full_name}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.75rem" }}>{a.user_email}</p>
                  </div>
                  <span style={{ color: "#6B7A8D", fontSize: "0.75rem" }}>{new Date(a.awarded_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
      </motion.div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none border";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>{label}</label>
      {children}
    </div>
  );
}
