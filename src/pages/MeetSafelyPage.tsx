/**
 * src/pages/MeetSafelyPage.tsx — Bambeh Marketplace
 * FIXED: Was a stub (emoji + title). Now a full safety guide.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Users, Phone, AlertTriangle, CheckCircle, Camera } from 'lucide-react';

const TIPS = [
  {
    icon: <MapPin className="w-5 h-5 text-teal-600" />,
    title: 'Meet in a Public Place',
    color: 'bg-teal-50 border-teal-200',
    points: [
      'Choose busy locations: supermarkets, shopping centres, banks',
      'Avoid isolated areas, parking lots, or your home address',
      'Popular spots in : Marché Central, shopping malls, hotel lobbies',
      'Meet during daytime hours whenever possible',
    ],
  },
  {
    icon: <Users className="w-5 h-5 text-blue-600" />,
    title: 'Bring Someone You Trust',
    color: 'bg-blue-50 border-blue-200',
    points: [
      'Always tell someone where you are going and who you are meeting',
      'For high-value items, bring a friend or family member',
      'Share the seller\'s contact details with someone you trust',
      'Check in with someone after the transaction is complete',
    ],
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-600" />,
    title: 'Verify the Item Before Paying',
    color: 'bg-purple-50 border-purple-200',
    points: [
      'Test electronics — power them on, check all functions',
      'Inspect items carefully for damage not shown in photos',
      'For vehicles, check the engine, tyres, and all documents',
      'Do NOT pay until you are satisfied with the item',
    ],
  },
  {
    icon: <Phone className="w-5 h-5 text-green-600" />,
    title: 'Pay Safely',
    color: 'bg-green-50 border-green-200',
    points: [
      'Count cash before handing it over',
      'Prefer mobile money (MTN MoMo / Orange Money) for a trail',
      'Use Bambeh Escrow for expensive purchases — funds held until delivery confirmed',
      'Never wire transfer to unknown bank accounts',
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    title: 'Red Flags — Walk Away If...',
    color: 'bg-red-50 border-red-200',
    points: [
      '🚩 Seller asks you to pay before meeting or seeing the item',
      '🚩 Price is unbelievably low — "too good to be true"',
      '🚩 Seller refuses to meet in a public place',
      '🚩 Seller pressures you to decide quickly',
      '🚩 Seller sends someone else in their place unexpectedly',
    ],
  },
];

const SAFE_SPOTS = [
  { name: 'Marché Central, Yaoundé', type: 'Market' },
  { name: 'Auchan, Yaoundé', type: 'Supermarket' },
  { name: 'Akwa Business District, Douala', type: 'Business Area' },
  { name: 'Hotel lobbies (any city)', type: 'Hotel' },
  { name: 'Police stations', type: 'Official' },
  { name: 'Banks and ATM areas', type: 'Financial' },
];

export default function MeetSafelyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 pt-6 pb-10">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-teal-100 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Meet Safely</h1>
            <p className="text-teal-100 text-sm">Stay safe when buying & selling in person</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Safety checklist */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" /> Quick Safety Checklist
          </h2>
          <div className="space-y-2">
            {[
              'Meet in a public, well-lit place',
              'Tell someone where you are going',
              'Test the item before paying',
              'Count money / verify mobile payment',
              'Trust your instincts — if something feels wrong, leave',
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                </div>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed tips */}
        {TIPS.map((tip, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${tip.color}`}>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              {tip.icon} {tip.title}
            </h3>
            <ul className="space-y-1.5">
              {tip.points.map((point, j) => (
                <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Recommended safe meeting spots */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" /> Recommended Meeting Spots
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {SAFE_SPOTS.map((spot, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{spot.name}</p>
                <p className="text-xs text-teal-600 mt-0.5">{spot.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use escrow CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Shield className="w-8 h-8 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-1">For Expensive Items — Use Escrow</h3>
              <p className="text-teal-100 text-sm mb-3">
                Bambeh Escrow holds your payment securely until you confirm you received the item. No risk to buyer or seller.
              </p>
              <button onClick={() => navigate('/escrow')}
                className="bg-white text-teal-700 font-bold px-4 py-2 rounded-xl text-sm">
                Learn About Escrow →
              </button>
            </div>
          </div>
        </div>

        {/* Report */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-bold text-red-800 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Encountered a Problem?
          </h3>
          <p className="text-sm text-red-700 mb-3">
            If you experienced fraud, violence, or a scam, report it immediately.
          </p>
          <button onClick={() => navigate('/report-issue')}
            className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">
            Report an Incident
          </button>
        </div>
      </div>
    </div>
  );
}

