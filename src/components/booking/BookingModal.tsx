/**
 * BOOKING MODAL - REUSABLE FOR SERVICES, RENTALS, VEHICLES
 * FILE LOCATION: src/components/booking/BookingModal.tsx
 */

import { useState } from 'react';
import { X, Calendar, Clock, Send, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'service' | 'rental' | 'vehicle';
  itemTitle: string;
  providerName: string;
  onSubmit: (bookingData: BookingData) => Promise<void>;
}

export interface BookingData { date: string; time: string; notes?: string; }

export default function BookingModal({ isOpen, onClose, type, itemTitle, providerName, onSubmit }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);

  const timeSlots = [
    '07:00 AM','07:30 AM','08:00 AM','08:30 AM','09:00 AM','09:30 AM',
    '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM',
    '01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
    '04:00 PM','04:30 PM','05:00 PM',
  ];

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) { alert('Please select both date and time'); return; }
    setIsSubmitting(true);
    try {
      await onSubmit({ date: selectedDate, time: selectedTime, notes });
      setIsSuccess(true);
      setTimeout(() => { handleClose(); }, 3000);
    } catch (error) {
      alert('Failed to send booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(''); setSelectedTime(''); setNotes(''); setIsSuccess(false); onClose();
  };

  const getModalTitle = () => ({ service: 'Book Service', rental: 'Request Viewing', vehicle: 'Request Test Drive' }[type] || 'Make Booking');
  const getSubmitText = () => {
    if (isSubmitting) return 'Sending Request...';
    return { service: 'Book Service', rental: 'Request Viewing', vehicle: 'Request Test Drive' }[type] || 'Submit Request';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-12 h-12 text-green-600" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Sent!</h3>
            <p className="text-gray-600 mb-6">Your booking request has been sent to <strong>{providerName}</strong>. You'll receive a notification once they respond.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800"><strong>Next Steps:</strong></p>
              <ul className="text-sm text-blue-700 space-y-1 mt-2">
                <li>? Provider will review your request</li>
                <li>? You'll be notified when approved</li>
                <li>? Messaging will unlock after approval</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex items-center justify-between">
              <div><h2 className="text-2xl font-bold mb-1">{getModalTitle()}</h2><p className="text-teal-100 text-sm">{itemTitle}</p></div>
              <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Provider:</p>
                <p className="font-semibold text-gray-900">{providerName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />Select Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={getMinDate()} max={getMaxDate()} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                <p className="mt-1 text-xs text-gray-500">Available for booking up to 3 months in advance</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />Preferred Time <span className="text-red-500">*</span>
                </label>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option value="">-- Select a time --</option>
                  {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
                <p className="mt-1 text-xs text-gray-500">Available hours: 7:00 AM - 5:00 PM</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes <span className="text-gray-400 text-xs">(Optional)</span></label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Any special requests or questions?" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">How it works:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Your request will be sent to the provider</li>
                  <li>2. Provider will approve or suggest alternative times</li>
                  <li>3. Messaging will unlock once approved</li>
                  <li>4. You can then finalise details via chat</li>
                </ol>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={handleClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting || !selectedDate || !selectedTime} className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />{getSubmitText()}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}





