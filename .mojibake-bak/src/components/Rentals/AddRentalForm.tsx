// @ts-nocheck
/**
 * ADD RENTAL FORM COMPONENT
 *
 * Form for creating rental property listings.
 *
 * Features:
 * - Property details input
 * - Property type selection
 * - Price per period (day, week, month, year)
 * - Property features (bedrooms, bathrooms, sqm)
 * - Amenities & rules
 * - Furnished/unfurnished toggle
 * - Image uploads (max 10, 5 MB each)
 * - Location selection
 * - Keyword tags
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, DollarSign, Bed, Bath, Maximize, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationSelector from '@/components/location/LocationSelector';
import { RentalCategory, PropertyType, RentalPeriod, RentalItem } from '@/types/items';
import { LocationDetails } from '@/types/location';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const rentalSchema = z.object({
  title:         z.string().min(5, 'Title must be at least 5 characters'),
  category:      z.string(),
  propertyType:  z.string(),
  description:   z.string().min(50, 'Description must be at least 50 characters'),
  priceAmount:   z.number().min(0, 'Price must be positive'),
  pricePeriod:   z.enum(['day', 'week', 'month', 'year']),
  bedrooms:      z.number().min(0).optional(),
  bathrooms:     z.number().min(0).optional(),
  squareMeters:  z.number().min(0).optional(),
  furnished:     z.boolean(),
  amenities:     z.string(),
  rules:         z.string().optional(),
});

type RentalFormData = z.infer<typeof rentalSchema>;

interface AddRentalFormProps {
  onSuccess?: (rentalId: string) => void;
  onCancel?: () => void;
}

export default function AddRentalForm({ onSuccess, onCancel }: AddRentalFormProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [location, setLocation]           = useState<LocationDetails | null>(null);
  const [keywords, setKeywords]           = useState<string[]>([]);
  const [keywordInput, setKeywordInput]   = useState('');
  const [images, setImages]               = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      category:     'residential',
      propertyType: 'apartment',
      pricePeriod:  'month',
      furnished:    false,
    },
  });

  const category     = watch('category');
  const propertyType = watch('propertyType');
  const pricePeriod  = watch('pricePeriod');
  const furnished    = watch('furnished');

  const rentalCategories: RentalCategory[] = [
    'residential', 'commercial', 'land', 'vehicle',
    'equipment', 'event-space', 'storage',
  ];

  const propertyTypes: PropertyType[] = [
    'apartment', 'house', 'studio', 'room', 'villa',
    'office', 'shop', 'warehouse', 'land', 'parking',
    'car', 'truck', 'equipment',
  ];

  // â”€â”€ Keywords â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 10) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // â”€â”€ Images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) { alert('Maximum 10 images allowed'); return; }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { alert(`File ${file.name} is too large. Maximum 5MB per image.`); return false; }
      return true;
    });

    setImages([...images, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // â”€â”€ Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];
    for (const image of images) {
      const timestamp  = Date.now();
      const fileName   = `rentals/${currentUser!.id}/${timestamp}_${image.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }
    return imageUrls;
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onSubmit = async (data: RentalFormData) => {
    if (!location)          { alert('Please select a location');           return; }
    if (keywords.length === 0) { alert('Please add at least one keyword'); return; }
    if (images.length === 0)   { alert('Please add at least one image');   return; }

    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImages();

      const rentalItem: Omit<RentalItem, 'id'> = {
        type:         'rental',
        title:        data.title,
        description:  data.description,
        keywords,
        location,
        userId:       currentUser!.id,
        userName:     currentUser!.name,
        userPhone:    currentUser!.phone,
        images:       imageUrls,
        category:     data.category as RentalCategory,
        propertyType: data.propertyType as PropertyType,
        price: {
          amount:   data.priceAmount,
          period:   data.pricePeriod as RentalPeriod,
          currency: 'XAF',
        },
        bedrooms:      data.bedrooms,
        bathrooms:     data.bathrooms,
        squareMeters:  data.squareMeters,
        furnished:     data.furnished,
        amenities:     data.amenities.split('\n').filter(a => a.trim()),
        rules:         data.rules?.split('\n').filter(r => r.trim()),
        createdAt:     new Date(),
        updatedAt:     new Date(),
        status:        'active',
        views:         0,
        averageRating: 0,
        reviewCount:   0,
        isPromoted:    false,
      };

      const docRef = await addDoc(collection(db, 'items'), rentalItem);

      if (onSuccess) {
        onSuccess(docRef.id);
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      alert('Failed to create rental listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">List a Property</h2>
        <p className="text-gray-600">Create a rental listing for your property</p>
      </div>

      {/* Property Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          <Home className="w-4 h-4 inline mr-2" />
          Property Title *
        </Label>
        <Input id="title" {...register('title')} placeholder="e.g., Modern 2 Bedroom Apartment in Bastos" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Category and Property Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={(v) => setValue('category', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {rentalCategories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat.replace('-', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Property Type *</Label>
          <Select value={propertyType} onValueChange={(v) => setValue('propertyType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceAmount">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Price (XAF) *
          </Label>
          <Input id="priceAmount" type="number" {...register('priceAmount', { valueAsNumber: true })} placeholder="0" />
          {errors.priceAmount && <p className="text-sm text-red-500">{errors.priceAmount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Period *</Label>
          <Select value={pricePeriod} onValueChange={(v) => setValue('pricePeriod', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Per Day</SelectItem>
              <SelectItem value="week">Per Week</SelectItem>
              <SelectItem value="month">Per Month</SelectItem>
              <SelectItem value="year">Per Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Property Description *</Label>
        <Textarea id="description" {...register('description')} rows={5}
          placeholder="Describe your property, its features, and surrounding area..." />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Property Features (residential only) */}
      {category === 'residential' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedrooms"><Bed className="w-4 h-4 inline mr-2" />Bedrooms</Label>
            <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms"><Bath className="w-4 h-4 inline mr-2" />Bathrooms</Label>
            <Input id="bathrooms" type="number" {...register('bathrooms', { valueAsNumber: true })} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="squareMeters"><Maximize className="w-4 h-4 inline mr-2" />Size (mÂ²)</Label>
            <Input id="squareMeters" type="number" {...register('squareMeters', { valueAsNumber: true })} placeholder="0" />
          </div>
        </div>
      )}

      {/* Furnished (residential only) */}
      {category === 'residential' && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="furnished" className="cursor-pointer">Furnished Property</Label>
            <p className="text-sm text-gray-600">Is the property fully or partially furnished?</p>
          </div>
          <Switch id="furnished" checked={furnished} onCheckedChange={(checked) => setValue('furnished', checked)} />
        </div>
      )}

      {/* Amenities */}
      <div className="space-y-2">
        <Label htmlFor="amenities">Amenities * (one per line)</Label>
        <Textarea id="amenities" {...register('amenities')} rows={4}
          placeholder={"WiFi\nParking\nSecurity\nAir Conditioning\nGenerator"} />
        {errors.amenities && <p className="text-sm text-red-500">{errors.amenities.message}</p>}
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <Label htmlFor="rules">House Rules (optional, one per line)</Label>
        <Textarea id="rules" {...register('rules')} rows={3}
          placeholder={"No smoking\nNo pets\nQuiet hours after 10 PM"} />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Images * (max 10, 5MB each)
        </Label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                <button type="button" onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location *</Label>
        <LocationSelector value={location} onChange={setLocation} required />
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label>Keywords * (max 10)</Label>
        <div className="flex gap-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Add keyword and press Enter"
          />
          <Button type="button" onClick={addKeyword} variant="outline">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm flex items-center gap-2">
              {keyword}
              <button type="button" onClick={() => removeKeyword(index)} className="hover:text-teal-600">Ã—</button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
          ) : (
            'List Property'
          )}
        </Button>
      </div>
    </form>
  );
}


