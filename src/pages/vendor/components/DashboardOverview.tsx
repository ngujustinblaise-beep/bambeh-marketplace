/**
 * src/pages/vendor/components/DashboardOverview.tsx
 * Bambeh Marketplace — Vendor Dashboard Overview
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { getVendorAnalytics } from "@/services/vendor.service";
import type { VendorAnalyticsSnapshot } from "@/types/vendor.monetization.types";
import { useLang, t } from "@/hooks/useAppLang";

interface DashboardOverviewProps {
  vendorId: string;
  className?: string;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  subValue?: string;
  trend?: number;
  colorClass?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  subValue,
  trend,
  colorClass = "bg-teal-50 text-teal-600",
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend>= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}
        >
          {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
  </div>
);

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vendorId,
  className = "",
}) => {
  const [snapshot, setSnapshot] = useState<VendorAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<VendorAnalyticsSnapshot["period"]>("month");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await getVendorAnalytics(vendorId, period);

      if (apiError) {
        setError(apiError);
      } else {
        setSnapshot(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [vendorId, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
      notation: n >= 1_000_000 ? "compact" : "standard",
    }).format(n);

  const PERIOD_OPTIONS: { value: VendorAnalyticsSnapshot["period"]; label: string }[] = [
    { value: "today", label: "Aujourd'hui" },
    { value: "week", label: "Cette semaine" },
    { value: "month", label: "Ce mois" },
    { value: "year", label: "Cette année" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Vue d'ensemble</h2>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === opt.value
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div  key={i} className="h-28 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-1 text-red-600 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && snapshot && (
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label="Revenus nets"
            value={formatXAF(snapshot.netRevenueXAF)}
            icon={DollarSign}
            subValue={`Commission: ${formatXAF(snapshot.commissionXAF)}`}
            colorClass="bg-green-50 text-green-600"
          />
          <KpiCard
            label="Commandes"
            value={String(snapshot.ordersPlaced)}
            icon={ShoppingBag}
            subValue={`${snapshot.ordersCompleted} livrées`}
            colorClass="bg-blue-50 text-blue-600"
          />
          <KpiCard
            label="Vues totales"
            value={snapshot.totalViews.toLocaleString("fr-CM")}
            icon={Eye}
            subValue={`${snapshot.uniqueVisitors.toLocaleString()} visiteurs uniques`}
            colorClass="bg-purple-50 text-purple-600"
          />
          <KpiCard
            label="Note moyenne"
            value={snapshot.averageRating.toFixed(1)}
            icon={Star}
            subValue={`${snapshot.reviewsReceived} avis`}
            colorClass="bg-yellow-50 text-yellow-600"
          />
          <KpiCard
            label="Nouveaux abonnés"
            value={String(snapshot.newFollowers)}
            icon={Users}
            colorClass="bg-teal-50 text-teal-600"
          />
          <KpiCard
            label="Taux de conversion"
            value={`${(snapshot.conversionRate * 100).toFixed(1)}%`}
            icon={TrendingUp}
            subValue={`Panier moyen: ${formatXAF(snapshot.averageOrderValueXAF)}`}
            colorClass="bg-orange-50 text-orange-600"
          />
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;


