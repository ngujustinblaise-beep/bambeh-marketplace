// @ts-nocheck
/**
 * BAMBÉ MARKETPLACE - ADMIN PANEL COMPONENT
 * Complete administrative dashboard with all management features
 * Version: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import AdminService from './AdminService';
import {
  Order,
  User,
  Dispute,
  AdminDashboardStats,
  AnalyticsData,
  OrderStatus,
} from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AdminPanel.css';

interface AdminPanelProps {
  adminId: string;
  adminName: string;
}

const AdminPanelADVANCED: React.FC<AdminPanelProps> = ({ adminId, adminName }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'users' | 'disputes' | 'analytics'>('dashboard');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, ordersData, usersData, disputesData, analytics] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getOrders({ limit: 20 }),
        AdminService.getUsers({ limit: 20 }),
        AdminService.getDisputes({ limit: 20 }),
        AdminService.getAnalytics('week'),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders);
      setUsers(usersData.users);
      setDisputes(disputesData.disputes);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── ORDER MANAGEMENT ─────────────────────────────────────────────────────

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const success = await AdminService.updateOrderStatus(orderId, newStatus);
      if (success) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleAssignDriver = async (orderId: string) => {
    const drivers = await AdminService.getAvailableDrivers();
    if (drivers.length === 0) {
      alert('No drivers available at the moment');
      return;
    }
    const driverId = drivers[0].id;
    const success = await AdminService.assignDriver(orderId, driverId);
    if (success) {
      alert('Driver assigned successfully!');
      loadDashboardData();
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    const success = await AdminService.cancelOrder(orderId, reason);
    if (success) {
      alert('Order cancelled successfully!');
      loadDashboardData();
    }
  };

  const handleBulkUpdate = async (action: 'confirm' | 'cancel') => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to update');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to ${action} ${selectedOrders.length} order(s)?`);
    if (!confirmed) return;
    const result = await AdminService.bulkUpdateOrders(selectedOrders, action);
    alert(`${result.success} order(s) updated successfully, ${result.failed} failed`);
    setSelectedOrders([]);
    loadDashboardData();
  };

  const handleExportOrders = async () => {
    try {
      await AdminService.exportOrders({ status: filterStatus !== 'all' ? filterStatus : undefined });
      alert('Orders exported successfully!');
    } catch (error) {
      alert('Failed to export orders');
    }
  };

  // ── USER MANAGEMENT ──────────────────────────────────────────────────────

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    const reason = newStatus !== 'active' ? prompt('Enter reason:') : undefined;
    const success = await AdminService.updateUserStatus(userId, newStatus, reason || undefined);
    if (success) {
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      alert('User status updated successfully!');
    }
  };

  const handleAdjustZermBalance = async (userId: string) => {
    const amountStr = prompt('Enter amount to add/subtract (use negative for deduction):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) { alert('Invalid amount'); return; }
    const reason = prompt('Enter reason for adjustment:');
    if (!reason) return;
    const success = await AdminService.adjustZermBalance(userId, amount, reason);
    if (success) alert('Balance adjusted successfully!');
  };

  // ── DISPUTE MANAGEMENT ───────────────────────────────────────────────────

  const handleUpdateDisputeStatus = async (
    disputeId: string,
    newStatus: 'open' | 'investigating' | 'resolved' | 'closed',
  ) => {
    let resolution: string | undefined;
    let refundAmount: number | undefined;
    if (newStatus === 'resolved') {
      resolution = prompt('Enter resolution details:') || undefined;
      if (!resolution) return;
      const refundStr = prompt('Enter refund amount (0 if none):');
      refundAmount = refundStr ? parseFloat(refundStr) : 0;
    }
    const success = await AdminService.updateDisputeStatus(disputeId, newStatus, resolution, refundAmount);
    if (success) {
      setDisputes(disputes.map(d => d.id === disputeId ? { ...d, status: newStatus } : d));
      alert('Dispute updated successfully!');
    }
  };

  const handleAddDisputeComment = async (disputeId: string) => {
    const comment = prompt('Enter comment:');
    if (!comment) return;
    const isInternal = window.confirm('Is this an internal note?');
    await AdminService.addDisputeComment(disputeId, comment, isInternal);
    alert('Comment added!');
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} XAF`;

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#FFC107', confirmed: '#2196F3', preparing: '#9C27B0',
      assigned: '#FF9800', in_transit: '#3F51B5', delivered: '#4CAF50',
      cancelled: '#F44336', open: '#FF5722', investigating: '#FF9800',
      resolved: '#4CAF50', closed: '#9E9E9E', active: '#4CAF50',
      suspended: '#FF9800', banned: '#F44336', low: '#4CAF50',
      medium: '#FF9800', high: '#F44336', urgent: '#D32F2F',
    };
    return colors[status] || '#9E9E9E';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order as any).orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order as any).customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner-large" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🛡ï¸ Bambeh Admin Panel</h1>
          <p className="admin-subtitle">Welcome, {adminName} | Full Control Dashboard</p>
        </div>
        <div className="admin-header-actions">
          <button className="header-action-button" onClick={loadDashboardData}>
            🔄 Refresh
          </button>
          <button className="header-action-button" onClick={() => AdminService.sendBroadcast('', '', 'all', [])}>
            📢 Broadcast
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="admin-tabs">
        {(['dashboard', 'orders', 'users', 'disputes', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' && '📊 Dashboard'}
            {tab === 'orders' && '📦 Orders'}
            {tab === 'users' && '👥 Users'}
            {tab === 'disputes' && '⚖ï¸ Disputes'}
            {tab === 'analytics' && '📈 Analytics'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                <div className={`stat-growth ${stats.orderGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {stats.orderGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.orderGrowth)}%
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                <div className={`stat-growth ${stats.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth)}%
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚖ï¸</div>
              <div className="stat-content">
                <div className="stat-label">Pending Disputes</div>
                <div className="stat-value">{stats.pendingDisputes}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-content">
          <div className="content-header">
            <div className="search-filter-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="action-buttons">
              <button className="bulk-action-button" onClick={() => handleBulkUpdate('confirm')}>
                ✓ Bulk Confirm
              </button>
              <button className="bulk-action-button danger" onClick={() => handleBulkUpdate('cancel')}>
                ✕ Bulk Cancel
              </button>
              <button className="export-button" onClick={handleExportOrders}>
                📥 Export CSV
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(filteredOrders.map(o => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }
                        }}
                      />
                    </td>
                    <td>{(order as any).orderNumber}</td>
                    <td>
                      <div>
                        <div>{(order as any).customerName}</div>
                        <div className="table-subtext">{(order as any).customerPhone}</div>
                      </div>
                    </td>
                    <td>{formatCurrency((order as any).total)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="status-select"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date((order as any).createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons-inline">
                        <button className="action-icon-button" onClick={() => handleAssignDriver(order.id)} title="Assign Driver">🚗</button>
                        <button className="action-icon-button" onClick={() => handleCancelOrder(order.id)} title="Cancel Order">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-content">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Zerm Balance</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{(user as any).name}</td>
                    <td>{(user as any).email}</td>
                    <td><span className="role-badge">{(user as any).role}</span></td>
                    <td>
                      <select
                        value={(user as any).status}
                        onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as any)}
                        className="status-select"
                        style={{ backgroundColor: getStatusColor((user as any).status) }}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </td>
                    <td>{(user as any).zermBalance ?? 0} ZC</td>
                    <td>{new Date((user as any).joinedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-icon-button"
                        onClick={() => handleAdjustZermBalance(user.id)}
                        title="Adjust Balance"
                      >
                        💰
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="admin-content">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(dispute => (
                  <tr key={dispute.id}>
                    <td>{dispute.id.substring(0, 8)}</td>
                    <td>{(dispute as any).orderNumber}</td>
                    <td>{(dispute as any).customerName}</td>
                    <td>{(dispute as any).type?.replace('_', ' ')}</td>
                    <td>
                      <span className="priority-badge" style={{ backgroundColor: getStatusColor((dispute as any).priority) }}>
                        {(dispute as any).priority}
                      </span>
                    </td>
                    <td>
                      <select
                        value={(dispute as any).status}
                        onChange={(e) => handleUpdateDisputeStatus(dispute.id, e.target.value as any)}
                        className="status-select"
                        style={{ backgroundColor: getStatusColor((dispute as any).status) }}
                      >
                        <option value="open">Open</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>{new Date((dispute as any).createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="action-icon-button" onClick={() => handleAddDisputeComment(dispute.id)} title="Add Comment">💬</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="admin-content">
          <div className="charts-grid">
            <div className="chart-card full-width">
              <h3>Revenue & Orders Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} name="Revenue (XAF)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#4CAF50" strokeWidth={3} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelADVANCED;




