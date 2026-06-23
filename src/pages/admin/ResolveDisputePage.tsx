/**
 * src/pages/admin/ResolveDisputePage.tsx
 * Bambeh Marketplace — Admin Dispute Resolution
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Scale, Search, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw, ChevronDown, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type DisputeStatus = "open" | "under_review" | "resolved_buyer" | "resolved_seller" | "closed";

interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  reason: string;
  description: string;
  amountXAF: number;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CFG: Record<DisputeStatus, { label: string; color: string; icon: React.ElementType }> = {
  open:             { label: "Ouvert",               color: "text-red-600 bg-red-50 border-red-200",      icon: AlertTriangle },
  under_review:     { label: "En révision",          color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  resolved_buyer:   { label: "Résolu → Acheteur",    color: "text-blue-600 bg-blue-50 border-blue-200",   icon: CheckCircle },
  resolved_seller:  { label: "Résolu → Vendeur",     color: "text-teal-600 bg-teal-50 border-teal-200",   icon: CheckCircle },
  closed:           { label: "Fermé",                color: "text-gray-500 bg-gray-100 border-gray-200",  icon: XCircle },
};

function DisputeBadge({ status }: { status: DisputeStatus }) {
  const lang = useLang();
  const isRtl = lang === "ar";
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

const ResolveDisputePage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("open");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (!error && data) {
        setDisputes(data.map((row) => ({
          id: row.id as string,
          orderId: row.order_id as string,
          buyerId: row.buyer_id as string,
          sellerId: row.seller_id as string,
          buyerName: (row.buyer_name as string) ?? "—",
          sellerName: (row.seller_name as string) ?? "—",
          reason: row.reason as string,
          description: row.description as string,
          amountXAF: row.amount_xaf as number,
          status: row.status as DisputeStatus,
          resolution: row.resolution as string | undefined,
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        })));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { void load(); }, [load]);

  const resolve = useCallback(async (newStatus: DisputeStatus) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("disputes")
        .update({
          status: newStatus,
          resolution: resolution.trim() || null,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);
      if (!error) {
        setDisputes((prev) => prev.map((d) => d.id === selected.id ? { ...d, status: newStatus, resolution: resolution.trim() } : d));
        setSelected(null);
        setResolution("");
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [selected, resolution]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

  const filtered = disputes.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.buyerName.toLowerCase().includes(q) || d.sellerName.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">Résolution des Litiges</h1>
        <span className="text-sm text-gray-400">({filtered.length})</span>
        <button type="button" onClick={load} className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-white border border-gray-300 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="flex-1 text-sm outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DisputeStatus | "all")} className="text-sm outline-none bg-transparent">
            <option value="all">Tous</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center"><RefreshCw className="w-5 h-5 text-gray-300 animate-spin mx-auto mb-2" /><p className="text-sm text-gray-400">Chargement...</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center"><Scale className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">Aucun litige trouvé</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((d) => (
              <button key={d.id} type="button" onClick={() => setSelected(d)} className="w-full flex items-start gap-3 px-4 py-4 hover:bg-gray-50 text-left transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <DisputeBadge status={d.status} />
                    <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString("fr-CM")}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.reason}</p>
                  <p className="text-xs text-gray-500">{d.buyerName} vs {d.sellerName}</p>
                  <p className="text-xs text-teal-700 font-medium mt-0.5">{formatXAF(d.amountXAF)}</p>
                </div>
                <MessageSquare className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-5 max-w-lg mx-auto space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Détail du litige</h3>
              <button type="button" onClick={() => setSelected(null)} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between"><span className="text-gray-500">Statut</span><DisputeBadge status={selected.status} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Acheteur</span><span className="font-medium">{selected.buyerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vendeur</span><span className="font-medium">{selected.sellerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-bold text-teal-700">{formatXAF(selected.amountXAF)}</span></div>
              <div><span className="text-gray-500">Motif: </span><span>{selected.reason}</span></div>
              <div className="pt-1 border-t border-gray-200"><p className="text-gray-500 mb-1">Description:</p><p className="text-gray-700">{selected.description}</p></div>
            </div>
            {selected.status !== "closed" && selected.status !== "resolved_buyer" && selected.status !== "resolved_seller" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Décision & Notes</label>
                  <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Expliquez la décision prise..." rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => resolve("resolved_buyer")} disabled={submitting} className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-60">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Faveur Acheteur
                  </button>
                  <button type="button" onClick={() => resolve("resolved_seller")} disabled={submitting} className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-60">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Faveur Vendeur
                  </button>
                </div>
                <button type="button" onClick={() => resolve("closed")} disabled={submitting} className="w-full py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Fermer sans décision
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResolveDisputePage;






