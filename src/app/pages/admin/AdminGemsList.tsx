import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  Sparkles, Plus, Loader2, Search, Edit, Trash2, Star, Eye, X, Save, Tag, Folder,
} from "lucide-react";
import { toast } from "sonner";
import { adminGemsApi } from "../../lib/adminApi";
import type {
  GemAdminListItem, GemCategoryRead, GemTagRead,
} from "../../types/adminPanel";
import { PaginationBar } from "../../components/PaginationBar";

export function AdminGemsList() {
  const [tab, setTab] = useState<"gems" | "categories" | "tags">("gems");
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
          <Sparkles size={26} style={{ color: "#E5A800" }} />
          Gestión de Gemas
        </h1>
        <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Administra gemas, categorías y tags de toda la plataforma
        </p>
      </div>

      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#E8EAED" }}>
        {([["gems", "Gemas", Sparkles], ["categories", "Categorías", Folder], ["tags", "Tags", Tag]] as const).map(([k, label, Icon]) => (
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

      {tab === "gems" && <GemsPanel />}
      {tab === "categories" && <CategoriesPanel />}
      {tab === "tags" && <TagsPanel />}
    </div>
  );
}

function GemsPanel() {
  const [items, setItems] = useState<GemAdminListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "saved_count" | "usage_count">("created_at");
  const [categories, setCategories] = useState<GemCategoryRead[]>([]);
  const [tags, setTags] = useState<GemTagRead[]>([]);
  const [editing, setEditing] = useState<GemAdminListItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    adminGemsApi.categories().then(setCategories).catch(() => {});
    adminGemsApi.tags().then(setTags).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGemsApi.list({
        page, page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        sort_by: sortBy,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, categoryFilter, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleDelete = async (g: GemAdminListItem) => {
    if (!confirm(`¿Eliminar la gema "${g.title}"?`)) return;
    try {
      await adminGemsApi.remove(g.id);
      toast.success("Gema eliminada");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
          <Plus size={16} /> Nueva gema
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar gemas..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todos</option>
          <option value="published">Publicadas</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivadas</option>
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "created_at" | "saved_count" | "usage_count")}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="created_at">Más recientes</option>
          <option value="saved_count">Más guardadas</option>
          <option value="usage_count">Más usadas</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>No hay gemas</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {items.map((g) => (
              <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl p-4 transition-all hover:shadow-md"
                style={{ backgroundColor: "#FAFBFC", border: "1px solid #E8EAED" }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {g.icon_url ? (
                      <img src={g.icon_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(229,168,0,0.15)" }}>
                        <Sparkles size={14} style={{ color: "#E5A800" }} />
                      </div>
                    )}
                    {g.is_featured && <Star size={14} style={{ color: "#E5A800", fill: "#E5A800" }} />}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(g)} className="p-1 rounded hover:bg-gray-100"><Edit size={12} /></button>
                    <button onClick={() => handleDelete(g)} className="p-1 rounded hover:bg-red-50"><Trash2 size={12} style={{ color: "#DC2626" }} /></button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1A2332" }} className="line-clamp-1">{g.title}</h3>
                {g.description && <p style={{ color: "#6B7A8D", fontSize: "0.75rem" }} className="line-clamp-2 mt-1">{g.description}</p>}
                <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: "#F0F1F5" }}>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ backgroundColor: g.status === "published" ? "rgba(74,138,44,0.12)" : "rgba(156,163,175,0.15)",
                      color: g.status === "published" ? "#4A8A2C" : "#6B7280" }}>{g.status}</span>
                  <span style={{ fontSize: "0.7rem", color: "#9AA5B4" }}>
                    💾 {g.saved_count} · 🔥 {g.usage_count}
                  </span>
                </div>
                {g.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {g.tags.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ backgroundColor: "rgba(0,153,220,0.08)", color: "#0099DC" }}>{t}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {!loading && total > 0 && <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}

      {showCreate && <GemModal categories={categories} tags={tags} onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchData(); }} />}
      {editing && <GemModal gem={editing} categories={categories} tags={tags} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
    </>
  );
}

function GemModal({ gem, categories, tags, onClose, onSaved }: {
  gem?: GemAdminListItem;
  categories: GemCategoryRead[];
  tags: GemTagRead[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: gem?.title ?? "",
    description: gem?.description ?? "",
    instructions: "", // not in list payload — only required on create; on edit, leave empty to skip
    icon_url: gem?.icon_url ?? "",
    visibility: gem?.visibility ?? "public",
    is_featured: gem?.is_featured ?? false,
    status: gem?.status ?? "draft",
    category_id: gem?.category_id ?? "",
  });
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Resolve current tag ids from names
  useEffect(() => {
    if (gem) {
      const ids = gem.tags
        .map((name) => tags.find((t) => t.name === name)?.id)
        .filter((id): id is string => Boolean(id));
      setTagIds(ids);
    }
  }, [gem, tags]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Título requerido");
    if (!gem && !form.instructions.trim()) return toast.error("Instrucciones requeridas");

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || null,
        icon_url: form.icon_url || null,
        visibility: form.visibility,
        is_featured: form.is_featured,
        status: form.status,
        category_id: form.category_id || null,
        tag_ids: tagIds,
      };
      if (form.instructions) payload.instructions = form.instructions;

      if (gem) await adminGemsApi.update(gem.id, payload);
      else await adminGemsApi.create({ ...payload, instructions: form.instructions });
      toast.success(gem ? "Gema actualizada" : "Gema creada");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>{gem ? "Editar gema" : "Nueva gema"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Título"><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} /></Field>
          <Field label="Descripción"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} /></Field>
          <Field label={gem ? "Instrucciones (dejar vacío para no cambiar)" : "Instrucciones"}>
            <textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} className={inputCls} rows={3} />
          </Field>
          <Field label="Icon URL"><input value={form.icon_url} onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))} className={inputCls} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Estado">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                <option value="draft">Borrador</option>
                <option value="published">Publicada</option>
                <option value="archived">Archivada</option>
              </select>
            </Field>
            <Field label="Visibilidad">
              <select value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))} className={inputCls}>
                <option value="public">Pública</option>
                <option value="shared">Compartida</option>
                <option value="private">Privada</option>
              </select>
            </Field>
            <Field label="Categoría">
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
            <Star size={14} style={{ color: "#E5A800" }} /> Destacada
          </label>
          <Field label="Tags">
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => {
                const selected = tagIds.includes(t.id);
                return (
                  <button key={t.id} type="button" onClick={() => setTagIds((prev) => selected ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                    className="px-2 py-1 rounded-md text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: selected ? "#E5A800" : "rgba(229,168,0,0.08)",
                      color: selected ? "#FFFFFF" : "#B8830A",
                    }}>{t.name}</button>
                );
              })}
            </div>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {gem ? "Guardar" : "Crear"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==== CATEGORIES =====================================================

function CategoriesPanel() {
  const [items, setItems] = useState<GemCategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GemCategoryRead | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      setItems(await adminGemsApi.categories());
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (c: GemCategoryRead) => {
    if (!confirm(`¿Eliminar la categoría "${c.name}"? Las gemas quedarán sin categoría.`)) return;
    try {
      await adminGemsApi.removeCategory(c.id);
      toast.success("Categoría eliminada");
      fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}><Plus size={16} /> Nueva categoría</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div> :
        items.length === 0 ? <div className="text-center py-16" style={{ color: "#9AA5B4" }}>Sin categorías</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((c) => (
              <div key={c.id} className="rounded-2xl p-4 flex items-center justify-between"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(229,168,0,0.12)" }}>
                    <Folder size={16} style={{ color: "#E5A800" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#1A2332" }}>{c.name}</p>
                    <p style={{ color: "#9AA5B4", fontSize: "0.75rem" }}>{c.gems_count} gemas</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} style={{ color: "#DC2626" }} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      {showCreate && <CategoryModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchData(); }} />}
      {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
    </>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category?: GemCategoryRead; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Nombre requerido");
    setSaving(true);
    try {
      if (category) await adminGemsApi.updateCategory(category.id, form);
      else await adminGemsApi.createCategory(form);
      toast.success(category ? "Categoría actualizada" : "Categoría creada");
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-6 w-full max-w-md"
        style={{ backgroundColor: "#FFFFFF" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>{category ? "Editar categoría" : "Nueva categoría"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Nombre"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Descripción"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} /></Field>
          <Field label="Icono (emoji o nombre)"><input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className={inputCls} /></Field>
          <Field label="Orden"><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className={inputCls} /></Field>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ border: "1px solid #E8EAED", color: "#6B7A8D" }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {category ? "Guardar" : "Crear"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==== TAGS ===========================================================

function TagsPanel() {
  const [tags, setTags] = useState<GemTagRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      setTags(await adminGemsApi.tags());
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await adminGemsApi.createTag(newName.trim());
      toast.success("Tag creado");
      setNewName("");
      fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleDelete = async (t: GemTagRead) => {
    if (!confirm(`¿Eliminar el tag "${t.name}"?`)) return;
    try {
      await adminGemsApi.removeTag(t.id);
      toast.success("Tag eliminado");
      fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <div className="rounded-2xl p-4 mb-4 flex gap-2" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nombre del tag..." className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{ backgroundColor: "#E5A800", color: "#FFFFFF" }}><Plus size={14} /> Agregar</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#E5A800" }} /></div> :
        tags.length === 0 ? <div className="text-center py-16" style={{ color: "#9AA5B4" }}>Sin tags</div> : (
          <div className="rounded-2xl p-4 flex flex-wrap gap-2" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
            {tags.map((t) => (
              <div key={t.id} className="px-3 py-1.5 rounded-lg flex items-center gap-2 group"
                style={{ backgroundColor: "rgba(229,168,0,0.08)" }}>
                <Tag size={12} style={{ color: "#B8830A" }} />
                <span style={{ color: "#B8830A", fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</span>
                <span style={{ color: "#9AA5B4", fontSize: "0.7rem" }}>({t.gems_count})</span>
                <button onClick={() => handleDelete(t)} className="opacity-0 group-hover:opacity-100"><X size={12} style={{ color: "#DC2626" }} /></button>
              </div>
            ))}
          </div>
        )}
    </>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>{label}</label>
      {children}
    </div>
  );
}
