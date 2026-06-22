/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ADMIN REPORTS PANEL
 * FILE LOCATION: src/components/admin/AdminReportsPanel.tsx
 * Â© 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flag, AlertTriangle, AlertCircle, MessageSquare, Search, Filter,
  RefreshCw, Eye, CheckCircle, XCircle, Clock, User, Store, Shield,
  ChevronDown, MoreVertical, Mail, Ban, Lock, ExternalLink, Tag,
} from 'lucide-react';
import { useReports, Report, ReportStatus, ReportSource, ReportType } from '@/contexts/ReportContext';
import { useAccountStatus } from '@/contexts/AccountStatusContext';

// â”€â”€ TYPE CONFIGURATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const reportTypeConfig: Record<ReportType, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  scam:                  { label: 'Scam',             color: 'text-red-700',    bgColor: 'bg-red-100',    icon: AlertCircle  },
  fraud:                 { label: 'Fraud',            color: 'text-red-700',    bgColor: 'bg-red-100',    icon: AlertTriangle},
  fake_product:          { label: 'Fake Product',     color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertTriangle},
  inappropriate_content: { label: 'Inappropriate',    color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Flag         },
  harassment:            { label: 'Harassment',       color: 'text-pink-700',   bgColor: 'bg-pink-100',   icon: AlertCircle  },
  spam:                  { label: 'Spam',             color: 'text-gray-700',   bgColor: 'bg-gray-100',   icon: MessageSquare},
  vendor_complaint:      { label: 'Vendor Issue',     color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: Store        },
  service_issue:         { label: 'Service Issue',    color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: AlertTriangle},
  payment_issue:         { label: 'Payment Issue',    color: 'text-green-700',  bgColor: 'bg-green-100',  icon: AlertCircle  },
  delivery_issue:        { label: 'Delivery Issue',   color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: AlertTriangle},
  account_issue:         { label: 'Account Issue',    color: 'text-teal-700',   bgColor: 'bg-teal-100',   icon: User         },
  other:                 { label: 'Other',            color: 'text-gray-700',   bgColor: 'bg-gray-100',   icon: Flag         },
};

const statusConfig: Record<ReportStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',    color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock        },
  reviewing: { label: 'Reviewing',  color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: Eye          },
  resolved:  { label: 'Resolved',   color: 'text-green-700',  bgColor: 'bg-green-100',  icon: CheckCircle  },
  dismissed: { label: 'Dismissed',  color: 'text-gray-700',   bgColor: 'bg-gray-100',   icon: XCircle      },
  escalated: { label: 'Escalated',  color: 'text-red-700',    bgColor: 'bg-red-100',    icon: AlertTriangle},
};

const sourceConfig: Record<ReportSource, { label: string; color: string; icon: React.ElementType }> = {
  regular_app:    { label: 'User App', color: 'text-blue-600',   icon: User         },
  vendor_section: { label: 'Vendor',   color: 'text-purple-600', icon: Store        },
  admin:          { label: 'Admin',    color: 'text-red-600',    icon: Shield       },
  system:         { label: 'System',   color: 'text-gray-600',   icon: AlertCircle  },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  low:    { label: 'Low',    color: 'text-gray-600',   bgColor: 'bg-gray-100'  },
  normal: { label: 'Normal', color: 'text-blue-600',   bgColor: 'bg-blue-100'  },
  high:   { label: 'High',   color: 'text-orange-600', bgColor: 'bg-orange-100'},
  urgent: { label: 'Urgent', color: 'text-red-600',    bgColor: 'bg-red-100'   },
};

// â”€â”€ REPORT DETAIL MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onResolve: (reportId: string, resolution: string) => void;
  onDismiss: (reportId: string, reason: string) => void;
  onEscalate: (reportId: string, reason: string) => void;
  onFreezeAccount: (accountId: string, accountType: 'user' | 'vendor', name: string, email: string) => void;
  onSuspendAccount: (accountId: string, accountType: 'user' | 'vendor', name: string, email: string) => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report, onClose, onResolve, onDismiss, onEscalate, onFreezeAccount, onSuspendAccount,
}) => {
  const [resolution, setResolution]   = useState('');
  const [dismissReason, setDismissReason] = useState('');
  const [activeAction, setActiveAction] = useState<'resolve' | 'dismiss' | 'escalate' | null>(null);

  const typeConfig  = reportTypeConfig[report.type];
  const TypeIcon    = typeConfig.icon;
  const status      = statusConfig[report.status];
  const StatusIcon  = status.icon;
  const source      = sourceConfig[report.source];
  const SourceIcon  = source.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/20"><TypeIcon className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-bold">{report.subject}</h2>
                <p className="text-purple-200 text-sm">Report ID: {report.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color} flex items-center gap-1`}>
              <StatusIcon className="w-4 h-4" />{status.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>{typeConfig.label}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[report.priority].bgColor} ${priorityConfig[report.priority].color}`}>
              {priorityConfig[report.priority].label} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 ${source.color} flex items-center gap-1`}>
              <SourceIcon className="w-4 h-4" />{source.label}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{report.description}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              {report.isVendor ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
              Reporter Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-blue-600">Name:</span><p className="font-medium text-blue-900">{report.reporterName}</p></div>
              <div><span className="text-blue-600">Email:</span><p className="font-medium text-blue-900">{report.reporterEmail}</p></div>
              <div><span className="text-blue-600">Type:</span><p className="font-medium text-blue-900">{report.isVendor ? 'Vendor' : 'User'}</p></div>
              <div><span className="text-blue-600">ID:</span><p className="font-medium text-blue-900">{report.reporterId}</p></div>
            </div>
          </div>

          {report.accusedId && (
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />Accused Party
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-900">{report.accusedName}</p>
                  <p className="text-sm text-red-600">ID: {report.accusedId} â€¢ Type: {report.accusedType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => report.accusedId && onFreezeAccount(report.accusedId, report.accusedType || 'user', report.accusedName || '', '')}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 flex items-center gap-1"
                  >
                    <Lock className="w-4 h-4" />Freeze
                  </button>
                  <button
                    onClick={() => report.accusedId && onSuspendAccount(report.accusedId, report.accusedType || 'user', report.accusedName || '', '')}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-1"
                  >
                    <Ban className="w-4 h-4" />Suspend
                  </button>
                </div>
              </div>
            </div>
          )}

          {report.relatedItemId && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Related Item</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-900">{report.relatedItemTitle}</p>
                  <p className="text-sm text-purple-600">Type: {report.relatedItemType} â€¢ ID: {report.relatedItemId}</p>
                </div>
                <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />View
                </button>
              </div>
            </div>
          )}

          {report.attachments && report.attachments.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Attachments ({report.attachments.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {report.attachments.map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:bg-gray-50"
                  >
                    <Tag className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">{att.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(report.status === 'pending' || report.status === 'reviewing') ? (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Take Action</h3>
              <div className="flex gap-3 mb-4">
                <button onClick={() => setActiveAction('resolve')} className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${activeAction === 'resolve' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  <CheckCircle className="w-5 h-5" />Resolve
                </button>
                <button onClick={() => setActiveAction('dismiss')} className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${activeAction === 'dismiss' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <XCircle className="w-5 h-5" />Dismiss
                </button>
                <button onClick={() => setActiveAction('escalate')} className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${activeAction === 'escalate' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                  <AlertTriangle className="w-5 h-5" />Escalate
                </button>
              </div>

              {activeAction === 'resolve' && (
                <div className="space-y-3">
                  <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Enter resolution details..." className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500" rows={3} />
                  <button onClick={() => { onResolve(report.id, resolution); onClose(); }} disabled={!resolution.trim()} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                    Confirm Resolution
                  </button>
                </div>
              )}
              {activeAction === 'dismiss' && (
                <div className="space-y-3">
                  <textarea value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} placeholder="Enter reason for dismissal..." className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-500" rows={3} />
                  <button onClick={() => { onDismiss(report.id, dismissReason); onClose(); }} disabled={!dismissReason.trim()} className="w-full py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50">
                    Confirm Dismissal
                  </button>
                </div>
              )}
              {activeAction === 'escalate' && (
                <div className="space-y-3">
                  <textarea value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} placeholder="Enter reason for escalation..." className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" rows={3} />
                  <button onClick={() => { onEscalate(report.id, dismissReason); onClose(); }} disabled={!dismissReason.trim()} className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                    Confirm Escalation
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-6">
              <div className={`p-4 rounded-lg ${status.bgColor}`}>
                <p className={`font-medium ${status.color}`}>
                  This report has been {report.status}.{report.resolution && ` Resolution: ${report.resolution}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AdminReportsPanelProps {
  showHeader?: boolean;
  maxItems?: number;
  filterSource?: ReportSource;
}

const AdminReportsPanel: React.FC<AdminReportsPanelProps> = ({
  showHeader = true, maxItems, filterSource,
}) => {
  const navigate = useNavigate();
  const { reports, resolveReport, dismissReport, escalateReport, refreshReports } = useReports();
  const { freezeAccount, suspendAccount } = useAccountStatus();

  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>(filterSource || 'all');
  const [selectedType, setSelectedType]   = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = useMemo(() => {
    let filtered = [...reports];
    if (selectedSource !== 'all') filtered = filtered.filter(r => r.source === selectedSource);
    if (selectedStatus !== 'all') filtered = filtered.filter(r => r.status === selectedStatus);
    if (selectedType !== 'all')   filtered = filtered.filter(r => r.type === selectedType);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.subject.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.reporterName.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (maxItems) filtered = filtered.slice(0, maxItems);
    return filtered;
  }, [reports, searchQuery, selectedStatus, selectedSource, selectedType, maxItems]);

  const handleFreezeAccount = async (accountId: string, accountType: 'user' | 'vendor', name: string, email: string) => {
    const reason = prompt('Enter reason for freezing this account:');
    if (reason) {
      await freezeAccount(accountId, accountType, name, email, reason, 'ADM-001', 'Admin');
      alert(`Account ${accountId} has been frozen.`);
    }
  };

  const handleSuspendAccount = async (accountId: string, accountType: 'user' | 'vendor', name: string, email: string) => {
    const reason = prompt('Enter reason for suspending this account:');
    if (reason) {
      await suspendAccount(accountId, accountType, name, email, reason, 'ADM-001', 'Admin');
      alert(`Account ${accountId} has been suspended.`);
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    fromUsers: reports.filter(r => r.source === 'regular_app').length,
    fromVendors: reports.filter(r => r.source === 'vendor_section').length,
    urgent: reports.filter(r => r.priority === 'urgent' && r.status === 'pending').length,
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {showHeader && (
        <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Bambeh Reports Center</h2>
                <p className="text-purple-200 text-sm">{stats.pending} pending â€¢ {stats.urgent} urgent</p>
              </div>
            </div>
            <button onClick={() => refreshReports()} className="p-2 hover:bg-white/20 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 border-b">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { icon: Flag, label: 'Total', value: stats.total, bg: 'bg-white', color: 'text-gray-600' },
            { icon: Clock, label: 'Pending', value: stats.pending, bg: 'bg-yellow-100', color: 'text-yellow-700' },
            { icon: User, label: 'From Users', value: stats.fromUsers, bg: 'bg-blue-100', color: 'text-blue-700' },
            { icon: Store, label: 'From Vendors', value: stats.fromVendors, bg: 'bg-purple-100', color: 'text-purple-700' },
            { icon: AlertTriangle, label: 'Urgent', value: stats.urgent, bg: 'bg-red-100', color: 'text-red-700' },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className={`flex items-center gap-2 px-4 py-2 ${bg} rounded-lg shadow-sm`}>
              <Icon className={`w-5 h-5 ${color}`} />
              <span className={`font-medium ${color}`}>{value}</span>
              <span className={`text-sm ${color} opacity-80`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search reports..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">All Sources</option>
              <option value="regular_app">User App</option>
              <option value="vendor_section">Vendor Section</option>
              <option value="system">System</option>
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="escalated">Escalated</option>
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">All Types</option>
              <option value="scam">Scam</option>
              <option value="fraud">Fraud</option>
              <option value="fake_product">Fake Product</option>
              <option value="harassment">Harassment</option>
              <option value="vendor_complaint">Vendor Complaint</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => {
            const typeConfig  = reportTypeConfig[report.type];
            const TypeIcon    = typeConfig.icon;
            const status      = statusConfig[report.status];
            const StatusIcon  = status.icon;
            const source      = sourceConfig[report.source];
            const SourceIcon  = source.icon;
            return (
              <div key={report.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedReport(report)}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${typeConfig.bgColor}`}>
                    <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{report.subject}</h3>
                      {report.priority === 'urgent' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">URGENT</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={`flex items-center gap-1 ${source.color}`}><SourceIcon className="w-3 h-3" />{source.label}</span>
                      <span>â€¢</span>
                      <span>{report.reporterName}</span>
                      <span>â€¢</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color} flex items-center gap-1 whitespace-nowrap`}>
                    <StatusIcon className="w-3 h-3" />{status.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">{searchQuery ? 'Try a different search term' : 'No reports match your filters'}</p>
          </div>
        )}
      </div>

      {maxItems && reports.length > maxItems && (
        <div className="p-4 border-t bg-gray-50 text-center">
          <Link to="/admin/inbox" className="text-purple-600 font-medium hover:text-purple-700">
            View all {reports.length} reports â†’
          </Link>
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onResolve={resolveReport}
          onDismiss={dismissReport}
          onEscalate={escalateReport}
          onFreezeAccount={handleFreezeAccount}
          onSuspendAccount={handleSuspendAccount}
        />
      )}
    </div>
  );
};

export default AdminReportsPanel;




