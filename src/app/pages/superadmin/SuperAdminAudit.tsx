import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  ScrollText, Loader2, Search, Download, Eye, X, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { superadminAuditApi } from "../../lib/superadminApi";
import type { AuditAction, AuditLogRow } from "../../types/superadminPanel";
import { PaginationBar } from "../../components/PaginationBar";

export function SuperAdminAudit() {
  const [items, setItems] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [viewing, setViewing] = useState<AuditLogRow | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    superadminAuditApi.actions()
      .then((data) => setActions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await superadminAuditApi.list({
        page, page_size: pageSize,
        search: search.trim() || undefined,
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }, [page, pageSize, search, actionFilter, resourceFilter, dateFrom, dateTo]);

  useEffect(() => { const t = setTimeout(fetchData, 250); return () => clearTimeout(t); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await superadminAuditApi.exportCsv({
        search: search.trim() || undefined,
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      toast.success("Exportado");
    } catch (e) { toast.error((e as Error).message); }
    finally { setExporting(false); }
  };

  // Group actions by category for the dropdown
  const groupedActions = actions.reduce((acc, a) => {
    const cat = a.category || "otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, AuditAction[]>);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#1A2332" }}>
            <ScrollText size={26} style={{ color: "#7B61FF" }} />
            Audit Logs
          </h1>
          <p style={{ color: "#6B7A8D", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {loading ? "Cargando..." : `${total} eventos registrados`}
          </p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: "#7B61FF", color: "#FFF" }}>
          {exporting ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        <div className="relative col-span-2 lg:col-span-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }}>
          <option value="">Todas las acciones</option>
          {Object.entries(groupedActions).map(([cat, list]) => (
            <optgroup key={cat} label={cat.toUpperCase()}>
              {list.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <input value={resourceFilter} onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }} placeholder="Tipo de recurso..."
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA5B4" }} />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid #E8EAED", backgroundColor: "#F9FAFB" }} />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8EAED" }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={28} style={{ color: "#7B61FF" }} /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#9AA5B4" }}>Sin eventos</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAFBFC", borderBottom: "1px solid #E8EAED" }}>
                <th className={thCls}>Fecha</th>
                <th className={thCls}>Usuario</th>
                <th className={thCls}>Acción</th>
                <th className={thCls}>Recurso</th>
                <th className={thCls}>IP</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase" style={{ color: "#6B7A8D" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50" style={{ borderBottom: "1px solid #F0F1F5" }}>
                  <td className="px-5 py-3 whitespace-nowrap" style={{ color: "#9AA5B4", fontSize: "0.78rem" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <p style={{ color: "#1A2332", fontWeight: 600, fontSize: "0.85rem" }}>{log.user_full_name ?? "Sistema"}</p>
                    {log.user_email && <p style={{ color: "#9AA5B4", fontSize: "0.72rem" }}>{log.user_email}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono"
                      style={{ backgroundColor: "rgba(123,97,255,0.1)", color: "#7B61FF" }}>{log.action}</span>
                  </td>
                  <td className="px-5 py-3" style={{ color: "#1A2332", fontSize: "0.85rem" }}>
                    {log.resource_type ?? "—"}
                    {log.description && <p style={{ color: "#6B7A8D", fontSize: "0.72rem" }} className="line-clamp-1">{log.description}</p>}
                  </td>
                  <td className="px-5 py-3" style={{ color: "#6B7A8D", fontSize: "0.75rem", fontFamily: "monospace" }}>{log.ip_address ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setViewing(log)} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 && <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} accent="#7B61FF" />}

      {viewing && <DetailModal log={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

const thCls = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B7A8D]";

function DetailModal({ log, onClose }: { log: AuditLogRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FFFFFF" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A2332" }}>Detalle del evento</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <Row label="Fecha" value={new Date(log.created_at).toLocaleString()} />
          <Row label="Acción" value={log.action} mono />
          <Row label="Usuario" value={log.user_full_name ? `${log.user_full_name} (${log.user_email ?? "—"})` : "—"} />
          <Row label="Tipo de recurso" value={log.resource_type ?? "—"} />
          <Row label="ID del recurso" value={log.resource_id ?? "—"} mono />
          <Row label="Descripción" value={log.description ?? "—"} />
          <Row label="IP" value={log.ip_address ?? "—"} mono />
          <Row label="User Agent" value={log.user_agent ?? "—"} mono />

          {log.extra_data && Object.keys(log.extra_data).length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#6B7A8D" }}>Datos adicionales</p>
              <pre className="rounded-xl p-3 text-xs overflow-x-auto"
                style={{ backgroundColor: "#0D2340", color: "#C9B8FF", fontFamily: "monospace" }}>
                {JSON.stringify(log.extra_data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold mb-0.5" style={{ color: "#6B7A8D" }}>{label}</p>
      <p style={{ color: "#1A2332", fontSize: "0.9rem", fontFamily: mono ? "monospace" : undefined, wordBreak: "break-all" }}>{value}</p>
    </div>
  );
}