import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Upload, X, MapPin, DollarSign, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface VehicleFormData {
  title: string;
  make: string;
  model: string;
  year: string;
  condition: 'new' | 'used';
  vehicleType: string;
  bodyType: string;
  transmission: 'automatic' | 'manual';
  fuelType: string;
  mileage: string;
  engineSize: string;
  color: string;
  price: string;
  negotiable: boolean;
  currency: string;
  description: string;
  location: string;
  features: string[];
  images: File[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  vinNumber: string;
  registrationStatus: 'registered' | 'unregistered';
  numberOfOwners: string;
  serviceHistory: boolean;
  accidentHistory: boolean;
}

const PostVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState<VehicleFormData>({
    title: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    condition: 'used',
    vehicleType: '',
    bodyType: '',
    transmission: 'automatic',
    fuelType: '',
    mileage: '',
    engineSize: '',
    color: '',
    price: '',
    negotiable: true,
    currency: 'XAF',
    description: '',
    location: '',
    features: [],
    images: [],
    contactName: currentUser?.name || '',
    contactPhone: '',
    contactEmail: currentUser?.email || '',
    vinNumber: '',
    registrationStatus: 'registered',
    numberOfOwners: '1',
    serviceHistory: false,
    accidentHistory: false,
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicleTypes = [
    'Car',
    'Truck',
    'SUV',
    'Van',
    'Motorcycle',
    'Bus',
    'Trailer',
    'Heavy Equipment',
    'Other',
  ];

  const bodyTypes = [
    'Sedan',
    'Hatchback',
    'SUV',
    'Coupe',
    'Convertible',
    'Wagon',
    'Pickup',
    'Minivan',
    'Van',
    'Other',
  ];

  const fuelTypes = [
    'Petrol',
    'Diesel',
    'Electric',
    'Hybrid',
    'Plug-in Hybrid',
    'LPG',
    'CNG',
  ];

  const carMakes = [
    'Toyota', 'Honda', 'Ford', 'Nissan', 'Chevrolet', 'Hyundai', 'Kia',
    'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Peugeot', 'Renault',
    'Mazda', 'Subaru', 'Mitsubishi', 'Lexus', 'Jeep', 'Land Rover',
    'Porsche', 'Volvo', 'Suzuki', 'Isuzu', 'Other',
  ];

  const availableFeatures = [
    'Air Conditioning',
    'Power Steering',
    'Power Windows',
    'Central Locking',
    'ABS',
    'Airbags',
    'Sunroof',
    'Leather Seats',
    'Navigation System',
    'Bluetooth',
    'Backup Camera',
    'Parking Sensors',
    'Cruise Control',
    'Alloy Wheels',
    'Fog Lights',
    'Keyless Entry',
    'Push Start',
    'Heated Seats',
    'Sound System',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.images.length + files.length > 10) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 10 images',
        variant: 'destructive',
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please enter a title for your vehicle',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.make) {
      toast({
        title: 'Missing make',
        description: 'Please select the vehicle make',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.model.trim()) {
      toast({
        title: 'Missing model',
        description: 'Please enter the vehicle model',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.year) {
      toast({
        title: 'Missing year',
        description: 'Please enter the year',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.price) {
      toast({
        title: 'Missing price',
        description: 'Please enter a price',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.images.length === 0) {
      toast({
        title: 'Missing images',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.contactPhone.trim()) {
      toast({
        title: 'Missing contact phone',
        description: 'Please enter a contact phone number',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to post a vehicle',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const vehicleListing = {
        ...formData,
        id: `vehicle-${Date.now()}`,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        postedAt: new Date().toISOString(),
        status: 'active',
        views: 0,
        saves: 0,
      };

      // Save to localStorage for demo
      const existingVehicles = JSON.parse(localStorage.getItem('bambe-vehicles') || '[]');
      localStorage.setItem('bambe-vehicles', JSON.stringify([vehicleListing, ...existingVehicles]));

      toast({
        title: 'Vehicle posted successfully!',
        description: 'Your vehicle is now listed on Bambé',
      });

      navigate('/products?category=vehicles');
    } catch (error) {
      console.error('Error posting vehicle:', error);
      toast({
        title: 'Error posting vehicle',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Post Vehicle</h1>
              <p className="text-sm text-gray-600">Sell your vehicle on Bambé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Vehicle Photos
              </CardTitle>
              <CardDescription>
                Upload up to 10 photos. First image will be the main photo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                
                {imagePreviews.length < 10 && (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600">Add Photo</span>
                    <input
                      type="file"
      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., 2020 Toyota Camry - Excellent Condition"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Select
                    value={formData.make}
                    onValueChange={(value) => handleSelectChange('make', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {carMakes.map(make => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="e.g., Camry"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleSelectChange('condition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(value) => handleSelectChange('vehicleType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyType">Body Type</Label>
                  <Select
                    value={formData.bodyType}
                    onValueChange={(value) => handleSelectChange('bodyType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="e.g., Silver"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => handleSelectChange('transmission', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => handleSelectChange('fuelType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map(fuel => (
                        <SelectItem key={fuel} value={fuel}>
                          {fuel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    placeholder="e.g., 45000"
                    value={formData.mileage}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="engineSize">Engine Size (L)</Label>
                  <Input
                    id="engineSize"
                    name="engineSize"
                    placeholder="e.g., 2.5"
                    value={formData.engineSize}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationStatus">Registration Status</Label>
                  <Select
                    value={formData.registrationStatus}
                    onValueChange={(value) => handleSelectChange('registrationStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="unregistered">Unregistered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numberOfOwners">Number of Owners</Label>
                  <Input
                    id="numberOfOwners"
                    name="numberOfOwners"
                    type="number"
                    min="1"
                    value={formData.numberOfOwners}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vinNumber">VIN Number (Optional)</Label>
                <Input
                  id="vinNumber"
                  name="vinNumber"
                  placeholder="17-character Vehicle Identification Number"
                  maxLength={17}
                  value={formData.vinNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="serviceHistory"
                    checked={formData.serviceHistory}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, serviceHistory: checked as boolean }))
                    }
                  />
                  <Label htmlFor="serviceHistory">Full Service History Available</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accidentHistory"
                    checked={formData.accidentHistory}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, accidentHistory: checked as boolean }))
                    }
                  />
                  <Label htmlFor="accidentHistory">Has Accident History</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Equipment</CardTitle>
              <CardDescription>Select all features that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm cursor-pointer">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="e.g., 15000000"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">XAF (CFA Franc)</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, negotiable: checked as boolean }))
                  }
                />
                <Label htmlFor="negotiable">Price is negotiable</Label>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Yaoundé, "
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="description"
                placeholder="Provide detailed information about the vehicle condition, maintenance history, reason for selling, etc..."
                rows={6}
                value={formData.description}
                onChange={handleInputChange}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
      className="flex-1"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
      className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Vehicle'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostVehicle;


