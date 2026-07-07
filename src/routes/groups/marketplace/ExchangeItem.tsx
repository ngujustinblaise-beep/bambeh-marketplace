import { useState } from 'react';
import { ArrowLeftRight, Upload, X, Search } from 'lucide-react';

export default function ExchangeItem() {
  const [step, setStep] = useState<'what-i-have' | 'what-i-want' | 'review'>('what-i-have');
  const [haveItem, setHaveItem] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    images: [] as File[],
    location: '',
    neighbourhood: '',
  });
  const [wantItem, setWantItem] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Exchange Item
              </h1>
              <p className="text-gray-600">
                Trade your items with others - No money needed!
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mt-6">
            <div className={`flex-1 text-center ${step === 'what-i-have' ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
              1. What I Have
            </div>
            <div className={`flex-1 text-center ${step === 'what-i-want' ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
              2. What I Want
            </div>
            <div className={`flex-1 text-center ${step === 'review' ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
              3. Review & Post
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
              style={{
                width:
                  step === 'what-i-have' ? '33%' :
                  step === 'what-i-want' ? '66%' : '100%',
              }}
            />
          </div>
        </div>

        {/* STEP 1: What I Have */}
        {step === 'what-i-have' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What Item Do You Have to Exchange?
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={haveItem.title}
                  onChange={(e) => setHaveItem({ ...haveItem, title: e.target.value })}
                  placeholder="e.g., PlayStation 4 with 2 Controllers"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={haveItem.description}
                  onChange={(e) => setHaveItem({ ...haveItem, description: e.target.value })}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={haveItem.category}
                  onChange={(e) => setHaveItem({ ...haveItem, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category...</option>
                  <option>Electronics</option>
                  <option>Phones & Tablets</option>
                  <option>Gaming</option>
                  <option>Furniture</option>
                  <option>Fashion</option>
                  <option>Sports</option>
                  <option>Books</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['New', 'Like New', 'Good', 'Fair'].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setHaveItem({ ...haveItem, condition: cond })}
                      className={`p-3 border-2 rounded-lg ${
                        haveItem.condition === cond
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={haveItem.location}
                    onChange={(e) => setHaveItem({ ...haveItem, location: e.target.value })}
                    placeholder="e.g., Yaoundé"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neighbourhood <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={haveItem.neighbourhood}
                    onChange={(e) => setHaveItem({ ...haveItem, neighbourhood: e.target.value })}
                    placeholder="e.g., Bastos"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos <span className="text-red-500">*</span>
                </label>
                <label className="block w-full p-8 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setHaveItem({ ...haveItem, images: files });}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-purple-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload photos
                    </p>
                  </div>
                </label>

                {haveItem.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {haveItem.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${i}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setStep('what-i-want')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold text-lg"
              >
                Next: What I Want →
              </button>
            </div>
          </div>
        )},
        {/* STEP 2: What I Want */}
        {step === 'what-i-want' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What Do You Want in Exchange?
            </h2>

            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  💡 <strong>Tip:</strong> Be flexible! The more options you're open to, the more likely you'll find a match.
                </p>
              </div>

              {/* What I Want */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I Want <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={wantItem.title}
                  onChange={(e) => setWantItem({ ...wantItem, title: e.target.value })}
                  placeholder="e.g., iPhone 12 or newer, Laptop, Mountain Bike"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details (Optional)
                </label>
                <textarea
                  value={wantItem.description}
                  onChange={(e) => setWantItem({ ...wantItem, description: e.target.value })}
                  placeholder="Any specific requirements or preferences..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={wantItem.category}
                  onChange={(e) => setWantItem({ ...wantItem, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category...</option>
                  <option>Electronics</option>
                  <option>Phones & Tablets</option>
                  <option>Gaming</option>
                  <option>Furniture</option>
                  <option>Fashion</option>
                  <option>Sports</option>
                  <option>Books</option>
                  <option>Or cash equivalent</option>
                  <option>Open to offers</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Location
                </label>
                <input
                  type="text"
                  value={wantItem.location}
                  onChange={(e) => setWantItem({ ...wantItem, location: e.target.value })}
                  placeholder="Same city, anywhere in Cameroon, etc."
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('what-i-have')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold"
                >
                  Review & Post →
                </button>
              </div>
            </div>
          </div>
        )},
        {/* STEP 3: Review */}
        {step === 'review' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review Your Exchange Request
            </h2>

            <div className="space-y-6">
              {/* What I Have */}
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                <h3 className="font-bold text-lg mb-4 text-purple-900">
                  What I'm Offering:
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {haveItem.title}</p>
                  <p><strong>Category:</strong> {haveItem.category}</p>
                  <p><strong>Condition:</strong> {haveItem.condition}</p>
                  <p><strong>Location:</strong> {haveItem.neighbourhood}, {haveItem.location}</p>
                  <p><strong>Photos:</strong> {haveItem.images.length} uploaded</p>
                </div>
              </div>

              {/* Exchange Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <ArrowLeftRight className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* What I Want */}
              <div className="border-2 border-pink-200 rounded-lg p-6 bg-pink-50">
                <h3 className="font-bold text-lg mb-4 text-pink-900">
                  What I'm Looking For:
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Want:</strong> {wantItem.title}</p>
                  <p><strong>Category:</strong> {wantItem.category}</p>
                  {wantItem.location && (
                    <p><strong>Location:</strong> {wantItem.location}</p>
                  )}
                </div>
              </div>

              {/* Post Button */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('what-i-want')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  ← Edit
                </button>
                <button
                  onClick={() => {
                    alert('Exchange posted! We\'ll notify you when we find matches.');
                    window.location.href = '/';
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold text-lg shadow-lg"
                >
                  Post Exchange Request 🎉
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExchangeItem;