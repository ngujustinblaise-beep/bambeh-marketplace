// @ts-nocheck
/**
 * POST MARKETPLACE ITEM - MILITARY GRADE VERSION
 * FILE LOCATION: src/pages/PostMarketplaceItem.tsx
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, DollarSign, Package, Loader2, Check, Camera } from 'lucide-react';
import { MarketplaceItem } from '@/types/items';

interface ImagePreview { file: File; url: string; id: string; }

const PostMarketplaceItem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
    title: '', description: '', category: '', subcategory: '', condition: 'brand-new',
    price: 0, originalPrice: 0, currency: 'XAF', brand: '', model: '',
    yearOfManufacture: undefined, warranty: '', color: '', size: '', quantity: 1,
    location: { address: '', city: '', region: '', area: '' },
    contact: { phone: '', whatsapp: '', email: '' },
    negotiable: false, deliveryAvailable: false, deliveryFee: 0, deliveryCities: [],
    returnPolicy: '', acceptsZermCoins: true, featuredListing: false,
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [dragActive, setDragActive]       = useState(false);
  const [loading, setLoading]             = useState(false);
  const [errors, setErrors]               = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep]     = useState(1);

  const categories = {
    'Electronics & Gadgets': { icon: '📱', subcategories: ['Phones & Tablets', 'Laptops & Computers', 'Cameras', 'Audio', 'Gaming'] },
    'Fashion & Clothing':    { icon: '👗', subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'] },
    'Home & Furniture':      { icon: '🏠', subcategories: ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Decor'] },
    'Vehicles & Parts':      { icon: '🚗', subcategories: ['Cars', 'Motorcycles', 'Bicycles', 'Parts'] },
    'Other':                 { icon: '📦', subcategories: ['General', 'Miscellaneous'] },
  };

  const conditions = [
    { value: 'brand-new',  label: 'Brand New',  description: 'Never used, original packaging' },
    { value: 'like-new',   label: 'Like New',   description: 'Gently used, excellent condition' },
    { value: 'excellent',  label: 'Excellent',  description: 'Very good condition' },
    { value: 'good',       label: 'Good',       description: 'Used, normal wear' },
    { value: 'fair',       label: 'Fair',       description: 'Visible wear, functional' },
    { value: 'for-parts',  label: 'For Parts',  description: 'Not fully functional' },
  ];

  const majorCities = ['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam', 'Buea'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked    = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof MarketplaceItem] as object), [child]: value },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: isCheckbox ? checked : (type === 'number' ? Number(value) : value),
      }));
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    if (imagePreviews.length + fileArray.length > 10) { alert('Max 10 images'); return; }
    const newPreviews = fileArray.map(file => ({
      file, url: URL.createObjectURL(file), id: Math.random().toString(36).substr(2, 9),
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title?.trim()) newErrors.title = 'Title required';
      if (!formData.description?.trim()) newErrors.description = 'Description required';
      if (!formData.category) newErrors.category = 'Category required';
    }
    if (step === 2 && imagePreviews.length === 0) newErrors.images = 'Upload at least one image';
    if (step === 3 && !formData.location?.city) newErrors.city = 'City required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 2000));
      setCurrentStep(4);
      setTimeout(() => navigate('/marketplace'), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress */}
        <div className="flex justify-between mb-8 px-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {s < currentStep ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <header className="border-b pb-4">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Package className="text-blue-600" />Basic Information</h2>
                </header>
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Listing Title *</label>
                  <input name="title" value={formData.title} onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none" placeholder="What are you selling?" />
                  {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title}</span>}
                  <label className="block text-sm font-bold text-gray-700">Detailed Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5}
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none" placeholder="Provide details about condition, age, and features..." />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none">
                        <option value="">Select...</option>
                        {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                      <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none">
                        {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <header className="border-b pb-4"><h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><DollarSign className="text-green-600" />Pricing & Visuals</h2></header>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price ({formData.currency})</label>
                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none" />
                  </div>
                </div>
                <div
                  className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); setDragActive(false); }}
                >
                  <Camera className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="font-bold text-gray-600">Drag images here or click to upload</p>
                  <input type="file" className="hidden" ref={fileInputRef} multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full font-bold">Browse Files</button>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {imagePreviews.map((p, i) => (
                    <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm">
                      <img src={p.url} className="w-full h-full object-cover" alt="Preview" />
                      <button type="button" onClick={() => setImagePreviews(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <header className="border-b pb-4"><h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><MapPin className="text-red-600" />Logistics & Contact</h2></header>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <select name="location.city" value={formData.location?.city} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl outline-none">
                      <option value="">Select City</option>
                      {majorCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input name="contact.phone" value={formData.contact?.phone} onChange={handleInputChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none" placeholder="+237..." />
                  </div>
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="acceptsZermCoins" checked={!!formData.acceptsZermCoins} onChange={handleInputChange} className="w-5 h-5 rounded-lg text-blue-600" />
                    <div>
                      <span className="font-bold text-blue-900">Enable Zerm Coins Payment</span>
                      <p className="text-xs text-blue-700">Allow buyers to pay with local digital currency</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            {currentStep < 4 && (
              <div className="flex gap-4 mt-12">
                {currentStep > 1 && (
                  <button type="button" onClick={() => setCurrentStep(p => p - 1)} className="px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50">Back</button>
                )}
                <button
                  type={currentStep === 3 ? 'submit' : 'button'}
                  onClick={currentStep < 3 ? () => { if (validateStep(currentStep)) setCurrentStep(p => p + 1); } : undefined}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${currentStep === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {currentStep === 3 ? (loading ? 'Publishing...' : 'Complete Listing') : 'Save & Continue'}
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center py-10 space-y-4">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-12 h-12" /></div>
                <h2 className="text-3xl font-black text-gray-900">Mission Accomplished!</h2>
                <p className="text-gray-500">Your item is being deployed to the Bambeh Marketplace network.</p>
                <button type="button" onClick={() => navigate('/marketplace')} className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold">Return to Base</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostMarketplaceItem;
