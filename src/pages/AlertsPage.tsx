/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALERTS PAGE - COMPREHENSIVE USER ALERTS & NOTIFICATIONS CENTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A beautiful, feature-rich alerts page for regular users with:
 * ✅ Multiple alert categories (Orders, Messages, Deals, System, Security)
 * ✅ Real-time notification counts
 * ✅ Mark as read/unread functionality
 * ✅ Delete and clear all options
 * ✅ Filter by category and status
 * ✅ Beautiful animations and transitions
 * ✅ Empty state handling
 * ✅ Settings for notification preferences
 * 
 * FILE LOCATION: src/pages/AlertsPage.tsx
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, BellRing, ArrowLeft, Check, CheckCheck, Trash2, Settings,
  ShoppingBag, MessageSquare, Tag, Shield, AlertTriangle, Info,
  Package, CreditCard, Heart, Star, Clock, Filter, X, ChevronRight,
  Volume2, VolumeX, Smartphone, Mail, MoreVertical, RefreshCw,
  Zap, Gift, TrendingUp, Users, MapPin, Calendar, Eye, EyeOff
} from 'lucide-react';

// Alert Types
interface Alert {
  id: string;
  type: 'order' | 'message' | 'deal' | 'system' | 'security' | 'promo';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Sample alerts data
const generateSampleAlerts = (): Alert[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'order',
      title: 'Order Shipped!',
      message: 'Your order #BMB-2025-0847 has been shipped and is on its way to you.',
      timestamp: new Date(now.getTime() - 30 * 60000),
      isRead: false,
      actionUrl: '/orders',
      actionText: 'Track Order',
      priority: 'high'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message from TechStore',
      message: 'Hi! The iPhone you inquired about is still available. Would you like to schedule a meetup?',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      isRead: false,
      actionUrl: '/chat',
      actionText: 'Reply',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'deal',
      title: '🔥 Flash Sale Alert!',
      message: 'Electronics category - Up to 50% off for the next 24 hours!',
      timestamp: new Date(now.getTime() - 4 * 3600000),
      isRead: false,
      actionUrl: '/marketplace',
      actionText: 'Shop Now',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'security',
      title: 'New Login Detected',
      message: 'A new login was detected from Yaoundé, Cameroon on Android device.',
      timestamp: new Date(now.getTime() - 6 * 3600000),
      isRead: true,
      actionUrl: '/profile',
      actionText: 'Review',
      priority: 'high'
    },
    {
      id: '5',
      type: 'promo',
      title: '🎁 You Earned 50 Zerm Coins!',
      message: 'Congratulations! You received bonus Zerm Coins for completing your profile.',
      timestamp: new Date(now.getTime() - 12 * 3600000),
      isRead: true,
      actionUrl: '/zerm/purchase',
      actionText: 'View Balance',
      priority: 'low'
    },
    {
      id: '6',
      type: 'system',
      title: 'App Update Available',
      message: 'Version 2.5.0 is now available with new features and improvements.',
      timestamp: new Date(now.getTime() - 24 * 3600000),
      isRead: true,
      priority: 'low'
    },
    {
      id: '7',
      type: 'order',
      title: 'Payment Confirmed',
      message: 'Your payment of 25,000 XAF for order #BMB-2025-0846 has been confirmed.',
      timestamp: new Date(now.getTime() - 48 * 3600000),
      isRead: true,
      actionUrl: '/orders',
      actionText: 'View Order',
      priority: 'medium'
    },
    {
      id: '8',
      type: 'message',
      title: 'Seller Responded',
      message: 'AutoDealer237 replied to your inquiry about the Toyota Corolla 2020.',
      timestamp: new Date(now.getTime() - 72 * 3600000),
      isRead: true,
      actionUrl: '/chat',
      actionText: 'View Chat',
      priority: 'medium'
    }
  ];
};

// Category configuration
const categories = [
  { id: 'all', label: 'All', icon: Bell, color: 'gray' },
  { id: 'order', label: 'Orders', icon: ShoppingBag, color: 'blue' },
  { id: 'message', label: 'Messages', icon: MessageSquare, color: 'green' },
  { id: 'deal', label: 'Deals', icon: Tag, color: 'orange' },
  { id: 'security', label: 'Security', icon: Shield, color: 'red' },
  { id: 'promo', label: 'Promos', icon: Gift, color: 'purple' },
  { id: 'system', label: 'System', icon: Info, color: 'gray' }
];

// Get icon for alert type
const getAlertIcon = (type: string) => {
  switch (type) {
    case 'order': return ShoppingBag;
    case 'message': return MessageSquare;
    case 'deal': return Tag;
    case 'security': return Shield;
    case 'promo': return Gift;
    case 'system': return Info;
    default: return Bell;
  }
};

// Get color for alert type
const getAlertColor = (type: string) => {
  switch (type) {
    case 'order': return 'blue';
    case 'message': return 'green';
    case 'deal': return 'orange';
    case 'security': return 'red';
    case 'promo': return 'purple';
    case 'system': return 'gray';
    default: return 'teal';
  }
};

// Format timestamp
const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Notification settings
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    soundEnabled: true,
    orderAlerts: true,
    messageAlerts: true,
    dealAlerts: true,
    securityAlerts: true,
    promoAlerts: false,
    systemAlerts: true
  });

  // Load alerts
  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage or use sample data
      const storedAlerts = localStorage.getItem('Bambeh_alerts');
      if (storedAlerts) {
        const parsed = JSON.parse(storedAlerts);
        setAlerts(parsed.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
      } else {
        const sampleAlerts = generateSampleAlerts();
        setAlerts(sampleAlerts);
        localStorage.setItem('Bambeh_alerts', JSON.stringify(sampleAlerts));
      }
      
      // Load settings
      const storedSettings = localStorage.getItem('Bambeh_alert_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
      
      setIsLoading(false);
    };

    loadAlerts();
  }, []);

  // Filter alerts
  useEffect(() => {
    let filtered = [...alerts];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.type === selectedCategory);
    }
    
    if (showUnreadOnly) {
      filtered = filtered.filter(a => !a.isRead);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setFilteredAlerts(filtered);
  }, [alerts, selectedCategory, showUnreadOnly]);

  // Save alerts to localStorage
  const saveAlerts = (newAlerts: Alert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('Bambeh_alerts', JSON.stringify(newAlerts));
  };

  // Mark as read
  const markAsRead = (id: string) => {
    const updated = alerts.map(a => 
      a.id === id ? { ...a, isRead: true } : a
    );
    saveAlerts(updated);
  };

  // Mark as unread
  const markAsUnread = (id: string) => {
    const updated = alerts.map(a => 
      a.id === id ? { ...a, isRead: false } : a
    );
    saveAlerts(updated);
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = alerts.map(a => ({ ...a, isRead: true }));
    saveAlerts(updated);
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    saveAlerts(updated);
    setShowDeleteConfirm(null);
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    saveAlerts([]);
  };

  // Save settings
  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('Bambeh_alert_settings', JSON.stringify(newSettings));
  };

  // Count unread alerts
  const unreadCount = alerts.filter(a => !a.isRead).length;
  const categoryUnreadCount = (category: string) => 
    alerts.filter(a => (category === 'all' || a.type === category) && !a.isRead).length;

  // Refresh alerts
  const refreshAlerts = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const sampleAlerts = generateSampleAlerts();
    saveAlerts(sampleAlerts);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <BellRing className="w-6 h-6 text-teal-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={refreshAlerts}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Category Filter Pills */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map(cat => {
              const Icon = cat.icon;
              const count = categoryUnreadCount(cat.id);
              const isActive = selectedCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showUnreadOnly
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showUnreadOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showUnreadOnly ? 'Showing Unread' : 'Show Unread Only'}
          </button>
          
          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAllAlerts}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600 mb-4"></div>
            <p className="text-gray-500">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Alerts</h3>
            <p className="text-gray-500 max-w-sm">
              {showUnreadOnly 
                ? "You've read all your alerts! Toggle off 'Show Unread Only' to see all alerts."
                : selectedCategory !== 'all'
                  ? `No ${selectedCategory} alerts yet. Check back later!`
                  : "You're all caught up! New alerts will appear here."}
            </p>
            <Link
              to="/"
              className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              const color = getAlertColor(alert.type);
              
              return (
                <div
                  key={alert.id}
                  className={`relative bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                    alert.isRead ? 'border-gray-100' : 'border-teal-200 bg-teal-50/30'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.3s ease-out forwards'
                  }}
                >
                  {/* Unread indicator */}
                  {!alert.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
                  )}
                  
                  <div className="p-4 pl-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        color === 'green' ? 'bg-green-100 text-green-600' :
                        color === 'orange' ? 'bg-orange-100 text-orange-600' :
                        color === 'red' ? 'bg-red-100 text-red-600' :
                        color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-semibold ${alert.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                              {alert.title}
                            </h3>
                            <p className={`text-sm mt-1 ${alert.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                              {alert.message}
                            </p>
                          </div>
                          
                          {/* Priority badge */}
                          {alert.priority === 'high' && !alert.isRead && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(alert.timestamp)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {alert.actionUrl && (
                              <Link
                                to={alert.actionUrl}
                                onClick={() => markAsRead(alert.id)}
                                className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                              >
                                {alert.actionText || 'View'}
                              </Link>
                            )}
                            
                            <div className="relative">
                              <button
                                onClick={() => setShowDeleteConfirm(showDeleteConfirm === alert.id ? null : alert.id)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                              
                              {/* Dropdown menu */}
                              {showDeleteConfirm === alert.id && (
                                <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                  <button
                                    onClick={() => alert.isRead ? markAsUnread(alert.id) : markAsRead(alert.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    {alert.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {alert.isRead ? 'Mark Unread' : 'Mark Read'}
                                  </button>
                                  <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Alert Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Notification Methods */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Notification Methods
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-teal-600" />
                      <span className="font-medium text-gray-700">Push Notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pushEnabled}
                      onChange={(e) => saveSettings({ ...settings, pushEnabled: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-teal-600" />
                      <span className="font-medium text-gray-700">Email Notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailEnabled}
                      onChange={(e) => saveSettings({ ...settings, emailEnabled: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-teal-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                      <span className="font-medium text-gray-700">Sound Alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => saveSettings({ ...settings, soundEnabled: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>
              
              {/* Alert Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Alert Categories
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-700">Order Updates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.orderAlerts}
                      onChange={(e) => saveSettings({ ...settings, orderAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-700">Messages</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.messageAlerts}
                      onChange={(e) => saveSettings({ ...settings, messageAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-700">Deals & Discounts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dealAlerts}
                      onChange={(e) => saveSettings({ ...settings, dealAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-700">Security Alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.securityAlerts}
                      onChange={(e) => saveSettings({ ...settings, securityAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-700">Promotions & Rewards</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.promoAlerts}
                      onChange={(e) => saveSettings({ ...settings, promoAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">System Updates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.systemAlerts}
                      onChange={(e) => saveSettings({ ...settings, systemAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
