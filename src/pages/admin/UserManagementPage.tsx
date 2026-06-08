/**
 * src/pages/admin/UserManagementPage.tsx
 * Bambeh Marketplace — Admin User Management
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Users, Search, ShieldCheck, ShieldOff, Eye, Ban, RefreshCw, Filter, ChevronDown, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

interface ManagedUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  city?: string;
  isVerified: boolean;
  isVendor: boolean;
  isBanned: boolean;
  subscriptionTier: string;
  totalListings: number;
  createdAt: string;
}

type UserFilter = "all" | "verified" | "unverified" | "vendors" | "banned";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);
  const [selected, setSelected] = useState<ManagedUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url, city, is_verified, is_vendor, is_banned, subscription_tier, total_listings, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (filter === "verified") q = q.eq("is_verified", true);
      else if (filter === "unverified") q = q.eq("is_verified", false);
      else if (filter === "vendors") q = q.eq("is_vendor", true);
      else if (filter === "banned") q = q.eq("is_banned", true);

      const { data, error } = await q;
      if (!error && data) {
        setUsers(data.map((row) => ({
          id: row.id as string,
          displayName: (row.display_name as string) ?? "—",
          email: (row.email as string) ?? "—",
          avatarUrl: row.avatar_url as string | undefined,
          city: row.city as string | undefined,
          isVerified: Boolean(row.is_verified),
          isVendor: Boolean(row.is_vendor),
          isBanned: Boolean(row.is_banned),
          subscriptionTier: (row.subscription_tier as string) ?? "free",
          totalListings: (row.total_listings as number) ?? 0,
          createdAt: row.created_at as string,
        })));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const toggleBan = useCallback(async (user: ManagedUser) => {
    setActioning(user.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: !user.isBanned })
        .eq("id", user.id);
      if (!error) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u));
        if (selected?.id === user.id) setSelected((prev) => prev ? { ...prev, isBanned: !prev.isBanned } : null);
      }
    } catch {
      // silent
    } finally {
      setActioning(null);
    }
  }, [selected]);

  const toggleVerify = useCallback(async (user: ManagedUser) => {
    setActioning(user.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: !user.isVerified })
        .eq("id", user.id);
      if (!error) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isVerified: !u.isVerified } : u));
        if (selected?.id === user.id) setSelected((prev) => prev ? { ...prev, isVerified: !prev.isVerified } : null);
      }
    } catch {
      // silent
    } finally {
      setActioning(null);
    }
  }, [selected]);

  const filtered = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const TIER_COLORS: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    starter: "bg-blue-50 text-blue-600",
    growth: "bg-teal-50 text-teal-600",
    premium: "bg-yellow-50 text-yellow-700",
    enterprise: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <span className="text-sm text-gray-400">({filtered.length})</span>
        <button type="button" onClick={load} className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-white border border-gray-300 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nom ou email..." className="flex-1 text-sm outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value as UserFilter)} className="text-sm outline-none bg-transparent">
            <option value="all">Tous</option>
            <option value="verified">Vérifiés</option>
            <option value="unverified">Non vérifiés</option>
            <option value="vendors">Vendeurs</option>
            <option value="banned">Bannis</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center"><RefreshCw className="w-5 h-5 text-gray-300 animate-spin mx-auto mb-2" /><p className="text-sm text-gray-400">Chargement...</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center"><Users className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">Aucun utilisateur trouvé</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />
                    : <span className="text-teal-600 font-bold">{u.displayName.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold truncate ${u.isBanned ? "line-through text-gray-400" : "text-gray-900"}`}>{u.displayName}</p>
                    {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />}
                    {u.isVendor && <span className="text-xs text-blue-600 font-medium">Vendeur</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[u.subscriptionTier] ?? TIER_COLORS.free}`}>{u.subscriptionTier}</span>
                    <span className="text-xs text-gray-400">{u.totalListings} annonces</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => setSelected(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" aria-label="Voir"><Eye className="w-4 h-4" /></button>
                  <button type="button" onClick={() => toggleVerify(u)} disabled={actioning === u.id} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600" aria-label={u.isVerified ? "Retirer vérification" : "Vérifier"}>
                    {actioning === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : u.isVerified ? <ShieldOff className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={() => toggleBan(u)} disabled={actioning === u.id} className={`p-1.5 rounded-lg ${u.isBanned ? "hover:bg-green-50 text-green-600" : "hover:bg-red-50 text-red-500"}`} aria-label={u.isBanned ? "Débannir" : "Bannir"}>
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-5 max-w-sm mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Profil utilisateur</h3>
              <button type="button" onClick={() => setSelected(null)} className="text-gray-400">✕</button>
            </div>
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-teal-100 mx-auto mb-2 overflow-hidden flex items-center justify-center">
                {selected.avatarUrl
                  ? <img src={selected.avatarUrl} alt={selected.displayName} className="w-full h-full object-cover" />
                  : <span className="text-teal-600 font-bold text-xl">{selected.displayName.charAt(0)}</span>
                }
              </div>
              <p className="font-bold text-gray-900">{selected.displayName}</p>
              <p className="text-sm text-gray-500">{selected.email}</p>
            </div>
            <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between"><span className="text-gray-500">Ville</span><span>{selected.city ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Abonnement</span><span className="font-medium">{selected.subscriptionTier}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Annonces</span><span>{selected.totalListings}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Inscrit le</span><span>{new Date(selected.createdAt).toLocaleDateString("fr-CM")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vérifié</span><span className={selected.isVerified ? "text-green-600 font-medium" : "text-gray-400"}>{selected.isVerified ? "Oui" : "Non"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Banni</span><span className={selected.isBanned ? "text-red-500 font-medium" : "text-gray-400"}>{selected.isBanned ? "Oui" : "Non"}</span></div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleVerify(selected)} disabled={actioning === selected.id} className="flex-1 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-medium">
                {selected.isVerified ? "Retirer vérif." : "Vérifier"}
              </button>
              <button type="button" onClick={() => toggleBan(selected)} disabled={actioning === selected.id} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${selected.isBanned ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {selected.isBanned ? "Débannir" : "Bannir"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagementPage;
