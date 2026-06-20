/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ENHANCED BOOKING MODAL - WITH APPROVAL SYSTEM
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * © 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState } from 'react';
import { X, Calendar, Clock, Send, Check, XCircle, MessageCircle, Info } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemDetails: {
    id: string;
    title: string;
    type: 'service' | 'rental' | 'vehicle' | 'marketplace';
    providerName: string;
    providerId: string;
    providerPhone?: string;
    providerEmail?: string;
    price?: string;
    location?: string;
    images?: string[];
  };
}

interface TimeSlot {
  value: string;
  label: string;
  disabled: boolean;
}

export default function EnhancedBookingModal({ isOpen, onClose, itemDetails }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'form' | 'sent' | 'approved' | 'denied'>('form');

  const getAvailableDates = (): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 7;
    const endHour = 17;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (const minute of [0, 30]) {
        if (hour === endHour && minute === 30) break;

        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isPM = hour >= 12;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

        slots.push({ value: time24, label: time12, disabled: false });
      }
    }

    return slots;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('Bambeh_current_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  const sendBookingRequest = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert('Please login to book');
        return;
      }

      const bookingMessage = {
        id: `booking_${Date.now()}`,
        type: 'booking_request',
        from: currentUser.id,
        fromName: currentUser.name,
        to: itemDetails.providerId,
        toName: itemDetails.providerName,
        itemId: itemDetails.id,
        itemTitle: itemDetails.title,
        itemType: itemDetails.type,
        date: selectedDate.toISOString(),
        time: selectedTime,
        notes: additionalNotes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const messages = JSON.parse(localStorage.getItem('Bambeh_messages') || '[]');
      messages.push(bookingMessage);
      localStorage.setItem('Bambeh_messages', JSON.stringify(messages));

      const notification = {
        id: `notif_${Date.now()}`,
        userId: itemDetails.providerId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${currentUser.name} wants to book "${itemDetails.title}" for ${formatDate(selectedDate)} at ${getTimeSlots().find(s => s.value === selectedTime)?.label}`,
        link: `/messages/${bookingMessage.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      };

      const notifications = JSON.parse(localStorage.getItem('Bambeh_notifications') || '[]');
      notifications.push(notification);
      localStorage.setItem('Bambeh_notifications', JSON.stringify(notifications));

      setBookingStatus('sent');

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to send booking request');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime('');
    setAdditionalNotes('');
    setBookingStatus('form');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Book {itemDetails.type === 'service' ? 'Service' : itemDetails.type === 'rental' ? 'Viewing' : 'Test Drive'}</h2>
            <p className="text-teal-100 mt-1">{itemDetails.title}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {bookingStatus === 'form' && (
          <div className="p-6 space-y-6">

            {/* Item Details Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                {itemDetails.images && itemDetails.images[0] && (
                  <img src={itemDetails.images[0]} alt={itemDetails.title} className="w-20 h-20 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{itemDetails.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Provider: {itemDetails.providerName}</p>
                  {itemDetails.price && <p className="text-sm font-semibold text-teal-600 mt-1">{itemDetails.price}</p>}
                  {itemDetails.location && <p className="text-xs text-gray-500 mt-1">{itemDetails.location}</p>}
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date *
              </label>
              <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {getAvailableDates().map((date, index) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 text-center rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 font-bold'
                          : isToday
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <div className="text-xs">{date.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                      <div className="font-bold">{date.getDate()}</div>
                      <div className="text-xs">{date.toLocaleDateString('en-GB', { month: 'short' })}</div>
                    </button>
                  );
                })}
              </div>
              {selectedDate && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <strong>{formatDate(selectedDate)}</strong>
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                Select Time *
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {getTimeSlots().map((slot) => {
                  const isSelected = selectedTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      disabled={slot.disabled}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 font-bold'
                          : slot.disabled
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special requirements or questions..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Your booking request will be sent to the provider</li>
                  <li>Provider will review and approve/deny</li>
                  <li>Once approved, you can exchange contact details</li>
                  <li>Provider may contact you to confirm</li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendBookingRequest}
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {bookingStatus === 'sent' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-600 mb-6">
              Your booking request has been sent to <strong>{itemDetails.providerName}</strong>.
              <br />
              They will review it and get back to you shortly.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-3">Booking Details:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Date:</strong> {selectedDate && formatDate(selectedDate)}</p>
                <p><strong>Time:</strong> {getTimeSlots().find(s => s.value === selectedTime)?.label}</p>
                <p><strong>Item:</strong> {itemDetails.title}</p>
                {additionalNotes && <p><strong>Notes:</strong> {additionalNotes}</p>}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Next Steps:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Check your messages for the provider's response</li>
                    <li>• You'll be notified when they approve/deny</li>
                    <li>• After approval, you can exchange contact details</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/messages')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                View Messages
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function navigate(path: string) {
  window.location.href = path;
}


