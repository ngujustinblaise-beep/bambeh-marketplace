/**
 * REPORT MODAL - COMPREHENSIVE REPORTING SYSTEM
 * FILE LOCATION: src/components/common/ReportModal.tsx
 */

import { useState } from 'react';
import { X, AlertTriangle, Send, Upload, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  itemType: 'job' | 'marketplace' | 'service' | 'rental' | 'vehicle';
  itemId: string;
  itemTitle: string;
  onClose: () => void;
}

export default function ReportModal({ itemType, itemId, itemTitle, onClose }: ReportModalProps) {
  const [formData, setFormData] = useState({
    category: '', subcategory: '', description: '', evidenceFiles: [] as File[],
    reporterEmail: '', reporterName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  const reportCategories: Record<string, string[]> = {
    'Scam or Fraud':        ['Fake listing', 'Suspicious payment request', 'Phishing attempt', 'Identity theft', 'Price manipulation', 'Counterfeit goods'],
    'Inappropriate Content':['Offensive language', 'Discriminatory content', 'Adult content', 'Violence or gore', 'Hate speech', 'Harassment'],
    'Prohibited Items':     ['Illegal goods or services', 'Weapons or explosives', 'Drugs or controlled substances', 'Stolen property', 'Live animals (restricted)', 'Human body parts'],
    'Misleading Information':['False description', 'Incorrect pricing', 'Wrong location', 'Fake credentials', 'Misleading photos', 'Hidden fees'],
    'Intellectual Property':['Copyright infringement', 'Trademark violation', 'Counterfeit items', 'Unauthorized resale', 'Plagiarized content'],
    'Safety Concerns':      ['Dangerous product', 'Health hazard', 'Unsafe service', 'Risk of injury', 'Poor quality/defective'],
    'Spam or Duplicate':    ['Duplicate listing', 'Spam posting', 'Excessive messaging', 'Automated bot', 'Irrelevant content'],
    'Other':                ['Other issue not listed', 'Multiple violations'],
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.evidenceFiles.length > 5) { alert('Maximum 5 files allowed'); return; }
    setFormData({ ...formData, evidenceFiles: [...formData.evidenceFiles, ...files] });
  };

  const removeFile = (index: number) => {
    setFormData({ ...formData, evidenceFiles: formData.evidenceFiles.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) { alert('Please select a report category'); return; }
    if (!formData.description || formData.description.length < 20) { alert('Please provide a detailed description (minimum 20 characters)'); return; }
    setIsSubmitting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('Bambeh_current_user') || '{}');
      const report = {
        id: `report_${Date.now()}`, itemType, itemId, itemTitle,
        category: formData.category, subcategory: formData.subcategory, description: formData.description,
        reporterName: formData.reporterName || currentUser.name || 'Anonymous',
        reporterEmail: formData.reporterEmail || currentUser.email || '',
        reporterId: currentUser.id || 'guest', evidenceCount: formData.evidenceFiles.length,
        status: 'pending', createdAt: new Date().toISOString(),
        priority: (formData.category === 'Scam or Fraud' || formData.category === 'Safety Concerns') ? 'high' : 'normal',
      };
      const reports = JSON.parse(localStorage.getItem('Bambeh_reports') || '[]');
      reports.push(report);
      localStorage.setItem('Bambeh_reports', JSON.stringify(reports));
      setSubmitted(true);
      setTimeout(() => { onClose(); }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h3>
          <p className="text-gray-600 mb-4">Thank you for helping keep Bambeh safe. Our admin team will review your report within 24 hours.</p>
          <p className="text-sm text-gray-500">Reference ID: {`REP${Date.now().toString().slice(-8)}`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
              <div><h2 className="text-2xl font-bold">Report Listing</h2><p className="text-red-100 text-sm">Help us keep Bambeh safe for everyone</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Reporting:</p>
            <p className="font-semibold text-gray-900">{itemTitle}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {itemId}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What's the problem? <span className="text-red-500">*</span></label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" required>
              <option value="">Select a category</option>
              {Object.keys(reportCategories).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {formData.category && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specific Issue <span className="text-red-500">*</span></label>
              <select value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" required>
                <option value="">Select specific issue</option>
                {reportCategories[formData.category].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6} placeholder="Describe the issue in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none" required minLength={20} />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length} / minimum 20 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name (Optional)</label>
              <input type="text" value={formData.reporterName} onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                placeholder="Your name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email (Optional)</label>
              <input type="email" value={formData.reporterEmail} onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                placeholder="your.email@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />Upload Evidence (Optional, Max 5 files)
            </label>
            <input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer" />
            {formData.evidenceFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.evidenceFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <ul className="text-xs text-amber-800 space-y-1">
                <li>? Your report will be sent to Bambeh admin team</li>
                <li>? False reports may result in account suspension</li>
                <li>? We review all reports within 24 hours</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>) : (<><Send className="w-5 h-5" />Submit Report</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





