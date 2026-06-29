/**
 * REPORT BUTTON - Quick report submission from any page
 * FILE LOCATION: src/components/report/ReportButton.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, X, AlertTriangle, AlertCircle, MessageSquare, ShieldAlert, Package, CreditCard, Truck, User, Send, ChevronRight, Check } from 'lucide-react';
import { useReports, ReportType, ReportSource } from '@/contexts/ReportContext';

interface ReportButtonProps {
  inline?: boolean; floating?: boolean; source?: ReportSource;
  itemId?: string; itemType?: 'listing' | 'order' | 'user' | 'vendor' | 'transaction' | 'service';
  itemTitle?: string; accusedId?: string; accusedName?: string;
  accusedType?: 'user' | 'vendor'; className?: string;
}

const reportTypes: { value: ReportType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'scam',                 label: 'Scam / Fraud',            icon: AlertCircle,  description: 'Report fraudulent activity or scams'           },
  { value: 'fake_product',         label: 'Fake Product',            icon: Package,      description: 'Report counterfeit or misrepresented products' },
  { value: 'harassment',           label: 'Harassment',              icon: ShieldAlert,  description: 'Report harassment or abusive behavior'         },
  { value: 'inappropriate_content',label: 'Inappropriate Content',   icon: Flag,         description: 'Report offensive or inappropriate content'     },
  { value: 'payment_issue',        label: 'Payment Issue',           icon: CreditCard,   description: 'Report payment-related problems'               },
  { value: 'delivery_issue',       label: 'Delivery Issue',          icon: Truck,        description: 'Report delivery or shipping problems'          },
  { value: 'vendor_complaint',     label: 'Vendor Complaint',        icon: User,         description: 'Report issues with a vendor'                   },
  { value: 'spam',                 label: 'Spam',                    icon: MessageSquare,description: 'Report spam or unwanted messages'              },
  { value: 'other',                label: 'Other Issue',             icon: AlertTriangle,description: 'Report any other issue'                        },
];

interface ReportModalProps {
  isOpen: boolean; onClose: () => void; source: ReportSource;
  itemId?: string; itemType?: string; itemTitle?: string;
  accusedId?: string; accusedName?: string; accusedType?: 'user' | 'vendor';
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, source, itemId, itemType, itemTitle, accusedId, accusedName, accusedType }) => {
  const { submitReport } = useReports();
  const [step, setStep]               = useState(1);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [subject, setSubject]         = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);

  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('bambeh_user') || localStorage.getItem('Bambeh_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return { id: user.id || 'USR-' + Date.now(), name: user.name || 'Anonymous User', email: user.email || 'no-email@bambeh.cm', phone: user.phone, isVendor: source === 'vendor_section' };
      }
    } catch (e) {
      console.error('Error getting user info:', e);
    }
    return { id: 'USR-' + Date.now(), name: 'Anonymous User', email: 'no-email@bambeh.cm', isVendor: source === 'vendor_section' };
  };

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) return;
    setIsSubmitting(true);
    const userInfo = getUserInfo();
    try {
      const success = await submitReport({
        type: selectedType,
        priority: ['scam', 'fraud', 'harassment'].includes(selectedType) ? 'high' : 'normal',
        source, reporterId: userInfo.id, reporterName: userInfo.name, reporterEmail: userInfo.email,
        reporterPhone: (userInfo as any).phone, isVendor: userInfo.isVendor,
        subject: subject || `${reportTypes.find(t => t.value === selectedType)?.label} Report`,
        description, category: reportTypes.find(t => t.value === selectedType)?.label || 'Other',
        relatedItemId: itemId, relatedItemType: itemType as any, relatedItemTitle: itemTitle,
        accusedId, accusedName, accusedType,
      });
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setStep(1); setSelectedType(null); setSubject(''); setDescription(''); setIsSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flag className="w-6 h-6" />
              <div>
                <h2 className="font-bold text-lg">Report an Issue</h2>
                <p className="text-sm text-white/80">{source === 'vendor_section' ? 'Vendor Report' : 'User Report'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
            <p className="text-gray-600">Thank you for your report. Our admin team will review it shortly.</p>
          </div>
        ) : (
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">What type of issue would you like to report?</p>
                <div className="space-y-2">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button key={type.value}
                        onClick={() => { setSelectedType(type.value); setStep(2); }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-red-300 hover:bg-red-50 transition-all text-left">
                        <div className="p-2 bg-red-100 rounded-lg"><Icon className="w-5 h-5 text-red-600" /></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{type.label}</p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && selectedType && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  {(() => {
                    const type = reportTypes.find(t => t.value === selectedType);
                    const Icon = type?.icon || Flag;
                    return (
                      <>
                        <Icon className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800">{type?.label}</span>
                        <button onClick={() => setStep(1)} className="ml-auto text-sm text-red-600 hover:text-red-700">Change</button>
                      </>
                    );
                  })()}
                </div>

                {itemTitle && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Reporting about:</p>
                    <p className="font-medium text-gray-900">{itemTitle}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject (optional)</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide as much detail as possible about the issue..." rows={5}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" required />
                </div>

                <button onClick={handleSubmit} disabled={!description.trim() || isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>) : (<><Send className="w-5 h-5" />Submit Report</>)}
                </button>

                <p className="text-xs text-gray-500 text-center">Reports are reviewed by our admin team within 24-48 hours.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportButton: React.FC<ReportButtonProps> = ({
  inline = false, floating = true, source = 'regular_app',
  itemId, itemType, itemTitle, accusedId, accusedName, accusedType, className = '',
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  if (inline) {
    return (
      <>
        <button onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}>
          <Flag className="w-4 h-4" /><span>Report</span>
        </button>
        <ReportModal isOpen={showModal} onClose={() => setShowModal(false)} source={source}
          itemId={itemId} itemType={itemType} itemTitle={itemTitle}
          accusedId={accusedId} accusedName={accusedName} accusedType={accusedType} />
      </>
    );
  }

  if (floating) {
    return (
      <>
        <button onClick={() => setShowModal(true)}
          className={`fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-40 transition-all hover:scale-110 ${className}`}
          title="Report an Issue">
          <Flag className="w-6 h-6" />
        </button>
        <ReportModal isOpen={showModal} onClose={() => setShowModal(false)} source={source}
          itemId={itemId} itemType={itemType} itemTitle={itemTitle}
          accusedId={accusedId} accusedName={accusedName} accusedType={accusedType} />
      </>
    );
  }

  return (
    <button onClick={() => navigate('/report-issue')}
      className={`flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${className}`}>
      <Flag className="w-4 h-4" /><span>Report Issue</span>
    </button>
  );
};

export default ReportButton;





