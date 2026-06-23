/**
 * POST SERVICE
 * FILE LOCATION: src/pages/PostService.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Upload, X, DollarSign, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLang, t } from "@/hooks/useAppLang";

interface ServiceFormData {
  title: string; category: string; subcategory: string;
  serviceType: 'one-time' | 'recurring' | 'contract';
  price: string; priceType: 'fixed' | 'hourly' | 'daily' | 'project-based';
  negotiable: boolean; currency: string; description: string;
  whatIncluded: string; whatNotIncluded: string; qualifications: string;
  experience: string; location: string; serviceArea: string;
  availability: string[]; responseTime: string; minBookingNotice: string;
  cancellationPolicy: string; images: File[]; portfolio: File[];
  certifications: string; languages: string[];
  contactName: string; contactPhone: string; contactEmail: string;
  emergencyAvailable: boolean; travelCharges: boolean; travelCost: string;
}

const PostService: React.FC = () => {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState<ServiceFormData>({
    title: '', category: '', subcategory: '', serviceType: 'one-time',
    price: '', priceType: 'hourly', negotiable: true, currency: 'XAF',
    description: '', whatIncluded: '', whatNotIncluded: '', qualifications: '',
    experience: '', location: '', serviceArea: '', availability: [],
    responseTime: '', minBookingNotice: '', cancellationPolicy: '',
    images: [], portfolio: [], certifications: '', languages: [],
    contactName: currentUser?.name || '',
    contactPhone: '',
    contactEmail: currentUser?.email || '',
    emergencyAvailable: false, travelCharges: false, travelCost: '',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const serviceCategories = [
    'Home Services','Professional Services','Health & Wellness','Education & Tutoring',
    'Events & Entertainment','Beauty & Personal Care','Automotive Services','Technology & IT',
    'Construction & Repair','Cleaning Services','Transportation','Legal Services',
    'Financial Services','Consulting','Photography & Video','Catering & Food','Security Services','Other',
  ];

  const daysOfWeek    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const availableLanguages = ['English','French','Arabic','Hausa','Fulfulde','Ewondo','Duala'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day) ? prev.availability.filter(d => d !== day) : [...prev.availability, day],
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language) ? prev.languages.filter(l => l !== language) : [...prev.languages, language],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 10) {
      toast({ title: 'Too many images', description: 'Maximum 10 images allowed', variant: 'destructive' });
      return;
    }
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: `${file.name} is larger than 5MB`, variant: 'destructive' });
        return false;
      }
      return true;
    });
    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const checks: [boolean, string, string][] = [
      [!formData.title.trim(),       'Missing title',       'Please enter a service title'],
      [!formData.category,           'Missing category',    'Please select a service category'],
      [!formData.price,              'Missing price',       'Please enter a price'],
      [!formData.description.trim(), 'Missing description', 'Please describe your service'],
      [!formData.contactPhone.trim(),'Missing phone',       'Please enter a contact phone number'],
    ];
    for (const [cond, title, description] of checks) {
      if (cond) { toast({ title, description, variant: 'destructive' }); return false; }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: 'Authentication required', description: 'Please log in to post a service', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const serviceListing = {
        ...formData, id: `service-${Date.now()}`,
        providerId: currentUser.id, providerName: currentUser.name,
        postedAt: new Date().toISOString(), status: 'active',
        views: 0, saves: 0, bookings: 0, rating: 0, reviews: 0,
      };
      const existing = JSON.parse(localStorage.getItem('bambe-services') || '[]');
      localStorage.setItem('bambe-services', JSON.stringify([serviceListing, ...existing]));
      toast({ title: 'Service posted successfully!', description: 'Your service is now listed on Bambeh' });
      navigate('/services');
    } catch (error) {
      console.error('Error posting service:', error);
      toast({ title: 'Error posting service', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <div><h1 className="text-xl font-bold">Post Service</h1><p className="text-sm text-gray-600">Offer your services on Bambeh</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Service Information</CardTitle><CardDescription>Basic details about your service</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="title">Service Title *</Label><Input id="title" name="title" placeholder="e.g., Professional Plumbing Services" value={formData.title} onChange={handleInputChange} required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{serviceCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(v) => handleSelectChange('serviceType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="one-time">One-time</SelectItem><SelectItem value="recurring">Recurring</SelectItem><SelectItem value="contract">Contract</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label htmlFor="experience">Years of Experience</Label><Input id="experience" name="experience" placeholder="e.g., 5 years" value={formData.experience} onChange={handleInputChange} /></div>
              <div><Label htmlFor="certifications">Certifications / Qualifications</Label><Input id="certifications" name="certifications" placeholder="e.g., Licensed Electrician, Certified Trainer" value={formData.certifications} onChange={handleInputChange} /></div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="price">Price *</Label><Input id="price" name="price" type="number" placeholder="0" value={formData.price} onChange={handleInputChange} required /></div>
                <div>
                  <Label>Price Type</Label>
                  <Select value={formData.priceType} onValueChange={(v) => handleSelectChange('priceType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="fixed">Fixed Price</SelectItem><SelectItem value="hourly">Per Hour</SelectItem><SelectItem value="daily">Per Day</SelectItem><SelectItem value="project-based">Project-based</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="XAF">XAF</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="negotiable" checked={formData.negotiable} onCheckedChange={(c) => setFormData(prev => ({ ...prev, negotiable: c as boolean }))} />
                <Label htmlFor="negotiable">Price is Negotiable</Label>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader><CardTitle>Service Description</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="description">Description *</Label><Textarea id="description" name="description" rows={6} placeholder="Describe your service in detail..." value={formData.description} onChange={handleInputChange} required /></div>
              <div><Label htmlFor="whatIncluded">What's Included</Label><Textarea id="whatIncluded" name="whatIncluded" rows={3} placeholder="List what's included (one per line)..." value={formData.whatIncluded} onChange={handleInputChange} /></div>
              <div><Label htmlFor="qualifications">Qualifications</Label><Textarea id="qualifications" name="qualifications" rows={3} placeholder="Your qualifications and background..." value={formData.qualifications} onChange={handleInputChange} /></div>
              <div><Label htmlFor="cancellationPolicy">Cancellation Policy</Label><Textarea id="cancellationPolicy" name="cancellationPolicy" rows={2} placeholder="e.g., 24-hour cancellation notice required" value={formData.cancellationPolicy} onChange={handleInputChange} /></div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Location & Service Area</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="location">Base Location</Label><Input id="location" name="location" placeholder="e.g., Yaoundé, " value={formData.location} onChange={handleInputChange} /></div>
              <div><Label htmlFor="serviceArea">Service Area</Label><Input id="serviceArea" name="serviceArea" placeholder="e.g., Entire Yaoundé, or specific neighborhoods" value={formData.serviceArea} onChange={handleInputChange} /></div>
              <div className="flex items-center space-x-2">
                <Checkbox id="travelCharges" checked={formData.travelCharges} onCheckedChange={(c) => setFormData(prev => ({ ...prev, travelCharges: c as boolean }))} />
                <Label htmlFor="travelCharges">Travel Charges Apply</Label>
              </div>
              {formData.travelCharges && <div><Label htmlFor="travelCost">Travel Cost</Label><Input id="travelCost" name="travelCost" placeholder="e.g., 2000 XAF per km" value={formData.travelCost} onChange={handleInputChange} /></div>}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Availability</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Available Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox id={`day-${day}`} checked={formData.availability.includes(day)} onCheckedChange={() => handleAvailabilityToggle(day)} />
                      <Label htmlFor={`day-${day}`} className="font-normal">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="responseTime">Response Time</Label><Input id="responseTime" name="responseTime" placeholder="e.g., Within 1 hour" value={formData.responseTime} onChange={handleInputChange} /></div>
                <div><Label htmlFor="minBookingNotice">Min. Booking Notice</Label><Input id="minBookingNotice" name="minBookingNotice" placeholder="e.g., 24 hours" value={formData.minBookingNotice} onChange={handleInputChange} /></div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="emergencyAvailable" checked={formData.emergencyAvailable} onCheckedChange={(c) => setFormData(prev => ({ ...prev, emergencyAvailable: c as boolean }))} />
                <Label htmlFor="emergencyAvailable">Available for Emergency Calls</Label>
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader><CardTitle>Languages Spoken</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableLanguages.map(lang => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox id={`lang-${lang}`} checked={formData.languages.includes(lang)} onCheckedChange={() => handleLanguageToggle(lang)} />
                    <Label htmlFor={`lang-${lang}`} className="font-normal">{lang}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Service Images</CardTitle><CardDescription>Upload up to 10 images showing your work</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload portfolio images</span>
                <span className="text-xs text-gray-400">Max 10 images, 5MB each</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="contactName">Your Name</Label><Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} /></div>
              <div><Label htmlFor="contactPhone">Phone Number *</Label><Input id="contactPhone" name="contactPhone" type="tel" placeholder="+237 6XX XXX XXX" value={formData.contactPhone} onChange={handleInputChange} required /></div>
              <div><Label htmlFor="contactEmail">Email</Label><Input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} /></div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (<><Clock className="mr-2 h-4 w-4 animate-spin" />Posting...</>) : 'Post Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostService;







