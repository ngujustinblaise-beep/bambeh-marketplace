import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ReportCategory =
  | 'spam'
  | 'fake_listing'
  | 'wrong_price'
  | 'inappropriate'
  | 'scam'
  | 'duplicate'
  | 'other';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'listing' | 'user' | 'vendor' | 'job' | 'service' | 'review';
  targetTitle?: string;
}

const REPORT_CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
  { value: 'spam',          label: 'Spam',             description: 'Unsolicited or repetitive content' },
  { value: 'fake_listing',  label: 'Fake Listing',     description: 'Product or service does not exist' },
  { value: 'wrong_price',   label: 'Wrong Price',      description: 'Price is misleading or incorrect' },
  { value: 'inappropriate', label: 'Inappropriate',    description: 'Offensive or harmful content' },
  { value: 'scam',          label: 'Scam / Fraud',     description: 'Suspicious or fraudulent activity' },
  { value: 'duplicate',     label: 'Duplicate',        description: 'Same listing posted multiple times' },
  { value: 'other',         label: 'Other',            description: 'Something else not listed above' },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
}: ReportModalProps) {
  const { user } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedCategory(null);
    setDetails('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      setError('Please select a reason for your report.');
      return;
    }
    if (!user?.id) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await supabase.from('reports').insert({
        reporter_id: user.id,
        target_id: targetId,
        target_type: targetType,
        category: selectedCategory,
        details: details.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-semibold text-gray-900">Report</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {submitted ? (
            /* â”€â”€ Success state â”€â”€ */
            <div className="py-6 text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900 mb-1">Report Submitted</p>
              <p className="text-sm text-gray-500">
                Thank you for helping keep Bambeh safe. Our team will review your report shortly.
              </p>
              <button
                onClick={handleClose}
                className="mt-5 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* â”€â”€ Form state â”€â”€ */
            <>
              {targetTitle && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5">Reporting</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{targetTitle}</p>
                </div>
              )}

              <p className="text-sm font-medium text-gray-700 mb-3">
                Why are you reporting this?
              </p>

              <div className="space-y-2 mb-4">
                {REPORT_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => { setSelectedCategory(cat.value); setError(''); }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                      selectedCategory === cat.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                      selectedCategory === cat.value
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedCategory === cat.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        selectedCategory === cat.value ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Additional details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Provide any additional context..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{details.length}/500</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCategory}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                False reports may result in account restrictions.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
