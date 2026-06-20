/**
 * REPORT ISSUE BUTTON - UNIVERSAL REPORT COMPONENT
 * FILE LOCATION: src/components/report/ReportIssueButton.tsx
 */

import { useState } from 'react';
import {
  AlertCircle, X, Send, Camera, FileText, CheckCircle, Flag,
  AlertTriangle, Package, MessageSquare, Ban, ShieldX, HelpCircle, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type ReportType =
  | 'scam' | 'fake_product' | 'not_as_described' | 'poor_quality' | 'not_delivered'
  | 'damaged_item' | 'seller_not_responding' | 'inappropriate_content' | 'harassment' | 'other';

type ItemType = 'order' | 'product' | 'service' | 'job' | 'rental' | 'vehicle' | 'user' | 'message' | 'other';

interface ReportIssueButtonProps {
  itemId?: string; itemType?: ItemType; itemName?: string;
  sellerId?: string; sellerName?: string;
  variant?: 'button' | 'icon' | 'link' | 'text';
  size?: 'sm' | 'md' | 'lg'; className?: string;
}

const reportTypes: { id: ReportType; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'scam',                 label: 'Scam / Fraud',           description: 'Seller is trying to cheat or steal money',     icon: ShieldX },
  { id: 'fake_product',         label: 'Fake Product',            description: 'Item is counterfeit or not genuine',           icon: Package },
  { id: 'not_as_described',     label: 'Not as Described',        description: 'Item differs from listing description',        icon: AlertTriangle },
  { id: 'poor_quality',         label: 'Poor Quality',            description: 'Item quality is below expectations',           icon: AlertCircle },
  { id: 'not_delivered',        label: 'Not Delivered',           description: 'Paid but never received the item',             icon: Package },
  { id: 'damaged_item',         label: 'Damaged Item',            description: 'Item arrived broken or damaged',               icon: AlertTriangle },
  { id: 'seller_not_responding',label: 'Seller Not Responding',   description: 'Cannot reach the seller',                      icon: MessageSquare },
  { id: 'inappropriate_content',label: 'Inappropriate Content',   description: 'Listing contains offensive material',          icon: Ban },
  { id: 'harassment',           label: 'Harassment',              description: 'Being harassed by another user',               icon: Flag },
  { id: 'other',                label: 'Other Issue',             description: 'Something else not listed above',              icon: HelpCircle },
];

interface ReportModalProps {
  isOpen: boolean; onClose: () => void;
  itemId?: string; itemType?: ItemType; itemName?: string;
  sellerId?: string; sellerName?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, itemId, itemType, itemName, sellerId, sellerName }) => {
  const { currentUser } = useAuth();
  const [step, setStep]               = useState(1);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) {
      alert('Please select a report type and provide a description.');
      return;
    }
    setIsSubmitting(true);
    const report = {
      id: `report-${Date.now()}`, type: selectedType, description,
      itemId, itemType, itemName, sellerId, sellerName,
      reporterId: currentUser?.id || 'anonymous',
      reporterName: currentUser?.name || 'Anonymous',
      reporterEmail: currentUser?.email || '',
      createdAt: new Date().toISOString(), status: 'pending',
      attachments: attachments.map(f => f.name),
    };
    const existing = JSON.parse(localStorage.getItem('Bambeh_admin_reports') || '[]');
    existing.push(report);
    localStorage.setItem('Bambeh_admin_reports', JSON.stringify(existing));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setDescription('');
    setAttachments([]);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2"><Flag className="w-5 h-5" />Report Issue</h3>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded"><X className="w-5 h-5" /></button>
          </div>
          {itemName && <p className="text-sm text-red-100 mt-1">Reporting: {itemName}</p>}
        </div>

        {/* Success */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h4>
            <p className="text-gray-600 mb-6">Thank you for your report. Our admin team will review it and take appropriate action.</p>
            <button onClick={handleClose} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">Done</button>
          </div>
        ) : (
          <>
            {/* Step 1 */}
            {step === 1 && (
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">What type of issue are you reporting?</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button key={type.id}
                        onClick={() => { setSelectedType(type.id); setStep(2); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 hover:border-red-400 hover:bg-red-50 ${selectedType === type.id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                        <Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="p-6">
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4">â† Back to issue types</button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-red-800">Reporting: {reportTypes.find(t => t.id === selectedType)?.label}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Describe the issue in detail *</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                      placeholder="Please provide as much detail as possible about what happened..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none" />
                    <p className="text-xs text-gray-500 mt-1">Include dates, amounts, and any relevant details</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attach Evidence (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input type="file" multiple accept="image/*,.pdf"
                        onChange={(e) => { if (e.target.files) { setAttachments(Array.from(e.target.files)); } }}
                        className="hidden" id="report-attachments" />
                      <label htmlFor="report-attachments" className="cursor-pointer">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload screenshots or documents</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 5MB</p>
                      </label>
                    </div>
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" /><span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {step === 2 && (
              <div className="px-6 pb-6">
                <button onClick={handleSubmit} disabled={!description.trim() || isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>
                  ) : (
                    <><Send className="w-5 h-5" />Submit Report</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ReportIssueButton: React.FC<ReportIssueButtonProps> = ({
  itemId, itemType, itemName, sellerId, sellerName,
  variant = 'button', size = 'md', className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-6 py-3' };
  const cls = sizeClasses[size];

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button onClick={() => setShowModal(true)} className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ${className}`} title="Report Issue">
            <Flag className="w-5 h-5" />
          </button>
        );
      case 'link':
        return (
          <button onClick={() => setShowModal(true)} className={`text-red-500 hover:text-red-700 underline font-medium ${cls} ${className}`}>Report Issue</button>
        );
      case 'text':
        return (
          <button onClick={() => setShowModal(true)} className={`flex items-center gap-2 text-red-500 hover:text-red-700 font-medium ${cls} ${className}`}>
            <Flag className="w-4 h-4" />Report
          </button>
        );
      default:
        return (
          <button onClick={() => setShowModal(true)}
            className={`flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors ${cls} ${className}`}>
            <Flag className="w-4 h-4" />Report Issue
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <ReportModal isOpen={showModal} onClose={() => setShowModal(false)}
        itemId={itemId} itemType={itemType} itemName={itemName}
        sellerId={sellerId} sellerName={sellerName} />
    </>
  );
};

export default ReportIssueButton;


