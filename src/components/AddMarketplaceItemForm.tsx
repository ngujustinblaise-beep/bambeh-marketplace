// @ts-nocheck
/**
 * ADD MARKETPLACE ITEM FORM COMPONENT
 * FILE LOCATION: src/components/marketplace/AddMarketplaceItemForm.tsx
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShoppingBag, DollarSign, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationSelector from '@/components/location/LocationSelector';
import { MarketplaceCategory, ItemCondition, MarketplaceItem } from '@/types/items';
import { LocationDetails } from '@/types/location';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { BambehImage } from '@/components/ui/BambehImage';

const marketplaceSchema = z.object({
  title: z.string().min(5), category: z.string(),
  price: z.number().min(0), currency: z.enum(['XAF', 'Zerm']),
  condition: z.enum(['new', 'used', 'refurbished']),
  description: z.string().min(50),
  color: z.string().optional(), texture: z.string().optional(),
  material: z.string().optional(), brand: z.string().optional(),
  quantity: z.number().min(1).optional(),
});
type MarketplaceFormData = z.infer<typeof marketplaceSchema>;

interface AddMarketplaceItemFormProps { onSuccess?: (id: string) => void; onCancel?: () => void; }

export default function AddMarketplaceItemForm({ onSuccess, onCancel }: AddMarketplaceItemFormProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [location, setLocation]           = useState<LocationDetails | null>(null);
  const [keywords, setKeywords]           = useState<string[]>([]);
  const [keywordInput, setKeywordInput]   = useState('');
  const [images, setImages]               = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MarketplaceFormData>({
    resolver: zodResolver(marketplaceSchema),
    defaultValues: { category: 'electronics', currency: 'XAF', condition: 'new', quantity: 1 },
  });
  const category  = watch('category');
  const condition = watch('condition');
  const currency  = watch('currency');

  const marketplaceCategories: MarketplaceCategory[] = ['electronics','clothing','furniture','vehicles','food','books','toys','sports','beauty','home-garden','tools','pets','art','jewelry','other'];

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 10) { setKeywords([...keywords, keywordInput.trim()]); setKeywordInput(''); }
  };
  const removeKeyword = (index: number) => { setKeywords(keywords.filter((_, i) => i !== index)); };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { alert('Maximum 5 images allowed'); return; }
    const validFiles = files.filter(f => { if (f.size > 5 * 1024 * 1024) { alert(`${f.name} too large. Max 5MB.`); return false; } return true; });
    setImages([...images, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreviews(prev => [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const image of images) {
      const storageRef = ref(storage, `marketplace/${currentUser!.id}/${Date.now()}_${image.name}`);
      await uploadBytes(storageRef, image);
      urls.push(await getDownloadURL(storageRef));
    }
    return urls;
  };

  const onSubmit = async (data: MarketplaceFormData) => {
    if (!location) { alert('Please select a location'); return; }
    if (keywords.length === 0) { alert('Please add at least one keyword'); return; }
    if (images.length === 0) { alert('Please add at least one image'); return; }
    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      const item: Omit<MarketplaceItem, 'id'> = {
        type: 'marketplace', title: data.title, description: data.description, keywords, location,
        userId: currentUser!.id, userName: currentUser!.name, userPhone: currentUser!.phone,
        images: imageUrls, category: data.category as MarketplaceCategory,
        price: data.price, currency: data.currency, condition: data.condition as ItemCondition,
        color: data.color, texture: data.texture, material: data.material, brand: data.brand,
        quantity: data.quantity || 1, createdAt: new Date(), updatedAt: new Date(),
        status: 'active', views: 0, averageRating: 0, reviewCount: 0, isPromoted: false,
      };
      const docRef = await addDoc(collection(db, 'items'), item);
      if (onSuccess) onSuccess(docRef.id);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto p-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-2">Sell an Item</h2><p className="text-gray-600">List an item for sale on the marketplace</p></div>
      <div className="space-y-2">
        <Label htmlFor="title"><ShoppingBag className="w-4 h-4 inline mr-2" />Item Title *</Label>
        <Input id="title" {...register('title')} placeholder="e.g., iPhone 13 Pro Max 256GB" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={(v) => setValue('category', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{marketplaceCategories.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Condition *</Label>
          <Select value={condition} onValueChange={(v) => setValue('condition', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refurbished">Refurbished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="price"><DollarSign className="w-4 h-4 inline mr-2" />Price *</Label>
          <Input id="price" type="number" {...register('price', { valueAsNumber: true })} placeholder="0" />
          {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Currency *</Label>
          <Select value={currency} onValueChange={(v) => setValue('currency', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="XAF">XAF</SelectItem><SelectItem value="Zerm">Zerm Coins</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" {...register('description')} rows={5} placeholder="Describe your item in detail..." />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="brand">Brand (optional)</Label><Input id="brand" {...register('brand')} placeholder="e.g., Apple, Samsung" /></div>
        <div className="space-y-2"><Label htmlFor="color">Color (optional)</Label><Input id="color" {...register('color')} placeholder="e.g., Black, Silver" /></div>
        <div className="space-y-2"><Label htmlFor="material">Material (optional)</Label><Input id="material" {...register('material')} placeholder="e.g., Aluminum, Plastic" /></div>
        <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} placeholder="1" /></div>
      </div>
      <div className="space-y-2">
        <Label><ImageIcon className="w-4 h-4 inline mr-2" />Images * (max 5, 5MB each)</Label>
        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <BambehImage src={preview} alt={`Preview ${index + 1}`} width={200} height={128} objectFit="cover" imgClassName="rounded-lg border" />
                <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2"><Label>Location *</Label><LocationSelector value={location} onChange={setLocation} required /></div>
      <div className="space-y-2">
        <Label>Keywords * (max 10)</Label>
        <div className="flex gap-2">
          <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }} placeholder="Add keyword and press Enter" />
          <Button type="button" onClick={addKeyword} variant="outline">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <span key={i} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm flex items-center gap-2">
              {kw}<button type="button" onClick={() => removeKeyword(i)} className="hover:text-teal-600">�</button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>}
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'List Item'}
        </Button>
      </div>
    </form>
  );
}





