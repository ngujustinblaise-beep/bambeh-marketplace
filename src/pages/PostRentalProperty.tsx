/**
 * POST RENTAL PROPERTY
 * FILE LOCATION: src/pages/PostRentalProperty.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Upload, X, MapPin, DollarSign, Calendar, BedDouble, Bath, Square, Clock } from 'lucide-react';
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

interface RentalFormData {
  title: string; propertyType: string; rentalType: 'short-term' | 'long-term';
  address: string; city: string; neighborhood: string;
  bedrooms: string; bathrooms: string; area: string; furnished: boolean;
  price: string; currency: string; paymentPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  securityDeposit: string; availableFrom: string; minimumStay: string; maximumStay: string;
  description: string; amenities: string[]; utilities: string[]; rules: string;
  images: File[]; contactName: string; contactPhone: string; contactEmail: string;
  allowPets: boolean; parkingAvailable: boolean; numberOfParkingSpots: string;
}

const PostRentalProperty: React.FC = () => {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState<RentalFormData>({
    title: '', propertyType: '', rentalType: 'long-term', address: '', city: '',
    neighborhood: '', bedrooms: '1', bathrooms: '1', area: '', furnished: false,
    price: '', currency: 'XAF', paymentPeriod: 'monthly', securityDeposit: '',
    availableFrom: '', minimumStay: '', maximumStay: '', description: '',
    amenities: [], utilities: [], rules: '', images: [],
    contactName: currentUser?.name || '',
    contactPhone: '',
    contactEmail: currentUser?.email || '',
    allowPets: false, parkingAvailable: false, numberOfParkingSpots: '0',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const propertyTypes = ['Apartment','House','Villa','Studio','Room','Townhouse','Duplex','Penthouse','Commercial Space','Office','Shop','Warehouse','Land','Other'];

  const availableAmenities = [
    'Air Conditioning','Heating','Wi-Fi','Cable TV','Kitchen','Washing Machine',
    'Dryer','Dishwasher','Refrigerator','Microwave','Balcony','Terrace',
    'Garden','Swimming Pool','Gym','Elevator','Security','Generator','CCTV','Intercom',
  ];

  const availableUtilities = ['Water','Electricity','Gas','Internet','Trash Collection','Maintenance'];

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

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity],
    }));
  };

  const handleUtilityToggle = (utility: string) => {
    setFormData(prev => ({
      ...prev,
      utilities: prev.utilities.includes(utility) ? prev.utilities.filter(u => u !== utility) : [...prev.utilities, utility],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 15) {
      toast({ title: 'Too many images', description: 'Maximum 15 images allowed', variant: 'destructive' });
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
      [!formData.title.trim(),        'Missing title',         'Please enter a property title'],
      [!formData.propertyType,        'Missing property type', 'Please select a property type'],
      [!formData.address.trim(),      'Missing address',       'Please enter the property address'],
      [!formData.price,               'Missing price',         'Please enter the rental price'],
      [formData.images.length === 0,  'Missing images',        'Please upload at least one image'],
      [!formData.contactPhone.trim(), 'Missing phone',         'Please enter a contact phone number'],
    ];
    for (const [cond, title, description] of checks) {
      if (cond) { toast({ title, description, variant: 'destructive' }); return false; }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: 'Authentication required', description: 'Please log in to post a rental property', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const rentalListing = {
        ...formData, id: `rental-${Date.now()}`,
        landlordId: currentUser.id, landlordName: currentUser.name,
        postedAt: new Date().toISOString(), status: 'active', views: 0, saves: 0,
      };
      const existing = JSON.parse(localStorage.getItem('bambe-rentals') || '[]');
      localStorage.setItem('bambe-rentals', JSON.stringify([rentalListing, ...existing]));
      toast({ title: 'Property posted successfully!', description: 'Your rental property is now listed on Bambeh' });
      navigate('/rentals');
    } catch (error) {
      console.error('Error posting rental:', error);
      toast({ title: 'Error posting property', description: 'Something went wrong. Please try again.', variant: 'destructive' });
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
            <div><h1 className="text-xl font-bold">Post Rental Property</h1><p className="text-sm text-gray-600">List your property for rent</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" />Property Information</CardTitle><CardDescription>Basic details about your rental property</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="title">Property Title *</Label><Input id="title" name="title" placeholder="e.g., Modern 3-Bedroom Apartment in Bastos" value={formData.title} onChange={handleInputChange} required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Property Type *</Label>
                  <Select value={formData.propertyType} onValueChange={(v) => handleSelectChange('propertyType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{propertyTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rental Type</Label>
                  <Select value={formData.rentalType} onValueChange={(v) => handleSelectChange('rentalType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="long-term">Long-term</SelectItem><SelectItem value="short-term">Short-term</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="bedrooms">Bedrooms</Label><Input id="bedrooms" name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={handleInputChange} /></div>
                <div><Label htmlFor="bathrooms">Bathrooms</Label><Input id="bathrooms" name="bathrooms" type="number" min="1" value={formData.bathrooms} onChange={handleInputChange} /></div>
                <div><Label htmlFor="area">Area (m²)</Label><Input id="area" name="area" type="number" placeholder="e.g., 85" value={formData.area} onChange={handleInputChange} /></div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="furnished" checked={formData.furnished} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, furnished: checked as boolean }))} />
                <Label htmlFor="furnished">Furnished</Label>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="address">Street Address *</Label><Input id="address" name="address" placeholder="e.g., Rue de Bastos" value={formData.address} onChange={handleInputChange} required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="city">City</Label><Input id="city" name="city" placeholder="e.g., Yaoundé" value={formData.city} onChange={handleInputChange} /></div>
                <div><Label htmlFor="neighborhood">Neighborhood</Label><Input id="neighborhood" name="neighborhood" placeholder="e.g., Bastos, Mvan" value={formData.neighborhood} onChange={handleInputChange} /></div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="price">Price *</Label><Input id="price" name="price" type="number" placeholder="0" value={formData.price} onChange={handleInputChange} required /></div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="XAF">XAF</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Period</Label>
                  <Select value={formData.paymentPeriod} onValueChange={(v) => handleSelectChange('paymentPeriod', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="daily">Per Day</SelectItem><SelectItem value="weekly">Per Week</SelectItem><SelectItem value="monthly">Per Month</SelectItem><SelectItem value="yearly">Per Year</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label htmlFor="securityDeposit">Security Deposit</Label><Input id="securityDeposit" name="securityDeposit" type="number" placeholder="e.g., 200000" value={formData.securityDeposit} onChange={handleInputChange} /></div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Availability</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="availableFrom">Available From</Label><Input id="availableFrom" name="availableFrom" type="date" value={formData.availableFrom} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="minimumStay">Minimum Stay</Label><Input id="minimumStay" name="minimumStay" placeholder="e.g., 6 months, 1 year" value={formData.minimumStay} onChange={handleInputChange} /></div>
                <div><Label htmlFor="maximumStay">Maximum Stay</Label><Input id="maximumStay" name="maximumStay" placeholder="e.g., 2 years" value={formData.maximumStay} onChange={handleInputChange} /></div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="description">Property Description</Label><Textarea id="description" name="description" rows={6} placeholder="Describe your property..." value={formData.description} onChange={handleInputChange} /></div>
              <div><Label htmlFor="rules">House Rules</Label><Textarea id="rules" name="rules" rows={3} placeholder="e.g., No smoking, no pets..." value={formData.rules} onChange={handleInputChange} /></div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox id={`amenity-${amenity}`} checked={formData.amenities.includes(amenity)} onCheckedChange={() => handleAmenityToggle(amenity)} />
                    <Label htmlFor={`amenity-${amenity}`} className="font-normal">{amenity}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Utilities */}
          <Card>
            <CardHeader><CardTitle>Utilities Included</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableUtilities.map(utility => (
                  <div key={utility} className="flex items-center space-x-2">
                    <Checkbox id={`utility-${utility}`} checked={formData.utilities.includes(utility)} onCheckedChange={() => handleUtilityToggle(utility)} />
                    <Label htmlFor={`utility-${utility}`} className="font-normal">{utility}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parking & Pets */}
          <Card>
            <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="allowPets" checked={formData.allowPets} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowPets: checked as boolean }))} />
                <Label htmlFor="allowPets">Pets Allowed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="parkingAvailable" checked={formData.parkingAvailable} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, parkingAvailable: checked as boolean }))} />
                <Label htmlFor="parkingAvailable">Parking Available</Label>
              </div>
              {formData.parkingAvailable && <div><Label htmlFor="numberOfParkingSpots">Number of Parking Spots</Label><Input id="numberOfParkingSpots" name="numberOfParkingSpots" type="number" min="1" value={formData.numberOfParkingSpots} onChange={handleInputChange} /></div>}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Property Images *</CardTitle><CardDescription>Upload up to 15 images. First image will be the main photo.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
                <span className="text-xs text-gray-400">Max 15 images, 5MB each</span>
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
              {isSubmitting ? (<><Clock className="mr-2 h-4 w-4 animate-spin" />Posting...</>) : 'Post Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRentalProperty;






