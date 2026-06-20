/**
 * src/components/vendor/VendorAnalytics.tsx
 * Bambeh Marketplace — Vendor Analytics Summary Card
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Eye,
  ShoppingBag,
  Star,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import type { VendorAnalyticsSnapshot } from "@/types/vendor.monetization.types";
import { getVendorAnalytics } from "@/services/vendor.service";

// ─── Metric Card ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  color = "teal",
}) => {
  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color] ?? colorMap.teal}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

// ─── VendorAnalytics ─────────────────────────────────────────────────────────
interface VendorAnalyticsProps {
  vendorId: string;
  period?: VendorAnalyticsSnapshot["period"];
  compact?: boolean;
  className?: string;
}

const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({
  vendorId,
  period = "month",
  compact = false,
  className = "",
}) => {
  const [snapshot, setSnapshot] = useState<VendorAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getVendorAnalytics(vendorId, period);
      if (err) {
        setError(err);
      } else {
        setSnapshot(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [vendorId, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
            <div className="w-9 h-9 bg-gray-200 rounded-lg mb-2" />
            <div className="h-6 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between ${className}`}>
        <p className="text-sm text-red-600">{error ?? "Données non disponibles"}</p>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  const metrics = [
    { label: "Vues totales", value: snapshot.totalViews.toLocaleString(), icon: Eye, color: "blue", trend: undefined },
    { label: "Commandes", value: snapshot.ordersPlaced, icon: ShoppingBag, color: "teal", trend: undefined },
    { label: "Revenus nets", value: formatXAF(snapshot.netRevenueXAF), icon: DollarSign, color: "green", trend: undefined },
    { label: "Note moyenne", value: snapshot.averageRating.toFixed(1), icon: Star, color: "yellow", trend: undefined },
    ...(compact ? [] : [
      { label: "Visiteurs uniques", value: snapshot.uniqueVisitors.toLocaleString(), icon: Users, color: "purple", trend: undefined },
      { label: "Taux de conversion", value: `${(snapshot.conversionRate * 100).toFixed(1)}%`, icon: TrendingUp, color: "teal", trend: undefined },
    ]),
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
    </div>
  );
};

export default VendorAnalytics;


