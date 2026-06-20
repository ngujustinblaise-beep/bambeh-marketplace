/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VENDOR SECURE DASHBOARD - ENHANCED VERSION
 * © 2025 Bambeh. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, BarChart3, Zap, CreditCard, Shield, Settings,
  HelpCircle, MessageSquare, Users, ArrowRight, TrendingUp,
  Star, ShoppingBag, CheckCircle, Bell, FileText, Crown,
  Store, LogOut, Eye, DollarSign
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface Activity {
  id: string;
  type: 'sale' | 'milestone' | 'review' | 'message' | 'approval';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

export default function VendorSecureDashboard() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const vendorData = localStorage.getItem('Bambeh_vendor');
    if (vendorData) {
      setVendor(JSON.parse(vendorData));
    } else {
      navigate('/vendor/signin');
    }
  }, [navigate]);

  const recentActivity: Activity[] = [
    { id: '1', type: 'sale', title: 'New Sale', description: 'iPhone 14 Pro Max - 650,000 XAF', time: '5 minutes ago', icon: ShoppingBag, color: 'bg-green-500' },
    { id: '2', type: 'milestone', title: 'View Milestone', description: 'Your listings reached 10,000 views!', time: '2 hours ago', icon: Eye, color: 'bg-blue-500' },
    { id: '3', type: 'review', title: 'New Review', description: '5-star review from Customer #4521', time: '4 hours ago', icon: Star, color: 'bg-yellow-500' },
    { id: '4', type: 'message', title: 'New Message', description: 'Inquiry about Samsung Galaxy S23', time: '6 hours ago', icon: MessageSquare, color: 'bg-purple-500' },
    { id: '5', type: 'approval', title: 'Listing Approved', description: 'MacBook Pro M3 is now live', time: '8 hours ago', icon: CheckCircle, color: 'bg-teal-500' },
  ];

  const stats = [
    { label: 'Active Listings', value: vendor?.stats?.totalListings || 24, icon: Package, color: 'text-blue-600' },
    { label: 'Total Views', value: vendor?.stats?.totalViews || '1,542', icon: Eye, color: 'text-purple-600' },
    { label: 'Total Sales', value: vendor?.stats?.totalSales || 89, icon: ShoppingBag, color: 'text-green-600' },
    { label: 'Revenue', value: `${(vendor?.stats?.revenue || 15000000) / 1000}K XAF`, icon: DollarSign, color: 'text-orange-600' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('Bambeh_vendor');
    localStorage.removeItem('Bambeh_vendor_token');
    navigate('/vendor/portal');
  };

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/vendor/home" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src="/bambeh-logo.png"
                  alt="Bambeh"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Secure Dashboard</h1>
                <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {vendor.businessName}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                vendor.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                vendor.tier === 'premium' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {vendor.tier === 'gold' && <Crown className="w-4 h-4" />}
                {vendor.tier === 'premium' && <Star className="w-4 h-4" />}
                {vendor.tier === 'basic' && <Store className="w-4 h-4" />}
                <span className="font-semibold capitalize">{vendor.tier}</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {vendor.businessName}! 👋
            </h2>
            <p className="text-gray-600">Manage your store, track performance, and grow your business from one place.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/vendor/manage-listings"
              className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Manage Listings</h3>
              <p className="text-white/90 mb-4">Add, edit, and organize your products</p>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{vendor.stats?.totalListings || 24} active listings</span>
              </div>
            </Link>

            <Link
              to="/vendor/analytics"
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">View Analytics</h3>
              <p className="text-white/90 mb-4">Track performance and insights</p>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+{Math.floor(Math.random() * 30 + 10)}% this month</span>
              </div>
            </Link>

            <Link
              to="/vendor/premium-tools"
              className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Tools</h3>
              <p className="text-white/90 mb-4">Boost visibility and get featured</p>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                {vendor.tier === 'gold' || vendor.tier === 'premium' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>All tools unlocked</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    <span>Upgrade to unlock</span>
                  </>
                )}
              </div>
            </Link>

            <Link
              to="/vendor/subscription"
              className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Subscription</h3>
              <p className="text-white/90 mb-4">Upgrade your plan</p>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Crown className="w-4 h-4" />
                <span>Expires: {vendor.subscriptionExpiry ? new Date(vendor.subscriptionExpiry).toLocaleDateString() : 'N/A'}</span>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <Link
                to="/vendor/notifications"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { to: '/vendor/settings', icon: Settings, label: 'Settings', color: 'text-gray-600' },
                { to: '/help', icon: HelpCircle, label: 'Help', color: 'text-blue-600' },
                { to: '/vendor/messages', icon: MessageSquare, label: 'Messages', color: 'text-purple-600' },
                { to: '/vendor/customers', icon: Users, label: 'Customers', color: 'text-green-600' },
                { to: '/vendor/subscription', icon: CreditCard, label: 'Subscription', color: 'text-orange-600' },
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={idx}
                    to={link.to}
                    className="flex flex-col items-center gap-3 p-6 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className={`w-7 h-7 ${link.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


