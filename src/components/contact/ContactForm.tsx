/**
 * UNIVERSAL CONTACT FORM
 * Used for: Jobs (Apply Now), Services (Book Now), Rentals (Contact Owner), Vehicles (Contact Seller)
 * Shows contact details ONLY for paid subscribers
 */

import { useState } from 'react';
import { Mail, Phone, MessageCircle, User, Send, Crown, Lock } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ContactFormProps {
  type: 'job' | 'service' | 'rental' | 'vehicle';
  itemTitle: string;
  ownerContact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function ContactForm({ type, itemTitle, ownerContact }: ContactFormProps) {
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Check if user can see contact details
  const isPaidSubscriber = subscriptionTier !== 'free';

  // Get button text and titles based on type
  const config = {
    job: {
      title: 'Apply for this Job',
      buttonText: 'Send Application',
      icon: User,
      color: 'green',
      defaultMessage: `I am interested in applying for the ${itemTitle} position. Please find my contact details above.`
    },
    service: {
      title: 'Book this Service',
      buttonText: 'Book Now',
      icon: MessageCircle,
      color: 'purple',
      defaultMessage: `I would like to book ${itemTitle}. Please contact me to discuss details and pricing.`
    },
    rental: {
      title: 'Contact Landlord',
      buttonText: 'Send Message',
      icon: Mail,
      color: 'orange',
      defaultMessage: `I am interested in renting ${itemTitle}. I would like to schedule a viewing and discuss the rental terms.`
    },
    vehicle: {
      title: 'Contact Seller',
      buttonText: 'Contact Seller',
      icon: Phone,
      color: 'green',
      defaultMessage: `I am interested in ${itemTitle}. Is this vehicle still available? I would like to arrange a viewing.`
    }
  }[type];

  const IconComponent = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle form submission
    console.log('Contact form submitted:', { type, formData, itemTitle });
    
    // Show success message
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 bg-${config.color}-100 rounded-full flex items-center justify-center`}>
          <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
      </div>

      {/* For Paid Subscribers: Show Contact Details */}
      {isPaidSubscriber && ownerContact && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Premium Contact Information</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">{ownerContact.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <a href={`mailto:${ownerContact.email}`} className="text-blue-600 hover:underline">
                {ownerContact.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <a href={`tel:${ownerContact.phone}`} className="text-blue-600 hover:underline">
                {ownerContact.phone}
              </a>
            </div>
          </div>
        </div>
      )},
      {/* For Free Users: Show Upgrade Message */}
      {!isPaidSubscriber && ownerContact && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 text-lg">Unlock Direct Contact</h3>
              <p className="text-sm text-purple-700">Upgrade to see email and phone number</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-gray-700 mb-2"><strong>Premium Benefits:</strong></p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Direct email & phone access</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Priority messaging</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Unlimited contacts per day</span>
              </li>
            </ul>
          </div>

          <Link
            to="/subscription"
      className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold text-center transition-all"
          >
            Upgrade to Premium
          </Link>
        </div>
      )},
      {/* Contact Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name..."
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+237 XXX XXX XXX"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              placeholder={config.defaultMessage}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
      className={`w-full px-6 py-4 bg-gradient-to-r from-${config.color}-600 to-${config.color}-700 text-white rounded-lg hover:from-${config.color}-700 hover:to-${config.color}-800 font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl`}
          >
            <Send className="w-5 h-5" />
            {config.buttonText}
          </button>

          {!!!user && (
            <p className="text-sm text-center text-gray-600">
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>{' '}
              to save your contact preferences
            </p>
          )}
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Message Sent!</h3>
          <p className="text-green-700">
            Your message has been sent successfully. The owner will contact you soon.
          </p>
        </div>
      )},
      {/* Safety Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">??? Safety Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Never send money before meeting in person</li>
          <li>• Meet in safe, public places</li>
          <li>• Trust your instincts</li>
          <li>• Report suspicious behavior</li>
        </ul>
      </div>
    </div>
  );
}
}

}
