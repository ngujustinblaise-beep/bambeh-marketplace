// @ts-nocheck
/**
 * ADD SERVICE FORM COMPONENT
 * FILE LOCATION: src/components/services/AddServiceForm.tsx
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wrench, DollarSign, Clock, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationSelector from '@/components/location/LocationSelector';
import { ServiceCategory, PricingUnit, ServiceItem } from '@/types/items';
import { LocationDetails } from '@/types/location';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const serviceSchema = z.object({
  title: z.string().min(5), category: z.string(),
  description: z.string().min(50),
  pricingAmount: z.number().min(0),
  pricingUnit: z.enum(['hour', 'day', 'project', 'visit']),
  availability: z.string(),
  experience: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.string().optional(),
});
type ServiceFormData = z.infer<typeof serviceSchema>;

interface AddServiceFormProps { onSuccess?: (id: string) => void; onCancel?: () => void; }

export default function AddServiceForm({ onSuccess, onCancel }: AddServiceFormProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [location, setLocation]         = useState<LocationDetails | null>(null);
  const [keywords, setKeywords]         = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { category: 'cleaning', pricingUnit: 'hour' },
  });
  const category    = watch('category');
  const pricingUnit = watch('pricingUnit');

  const serviceCategories: ServiceCategory[] = ['cleaning','plumbing','electrical','carpentry','painting','teaching','tutoring','catering','photography','videography','web-development','graphic-design','accounting','legal','security','gardening','moving','pet-care','beauty','fitness','event-planning','translation','repair','other'];

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 10) { setKeywords([...keywords, keywordInput.trim()]); setKeywordInput(''); }
  };
  const removeKeyword = (index: number) => { setKeywords(keywords.filter((_, i) => i !== index)); };

  const onSubmit = async (data: ServiceFormData) => {
    if (!location) { alert('Please select a location'); return; }
    if (keywords.length === 0) { alert('Please add at least one keyword'); return; }
    setIsSubmitting(true);
    try {
      const serviceItem: Omit<ServiceItem, 'id'> = {
        type: 'service', title: data.title, description: data.description, keywords, location,
        userId: currentUser!.id, userName: currentUser!.name, userPhone: currentUser!.phone,
        images: [], category: data.category as ServiceCategory,
        pricing: { amount: data.pricingAmount, unit: data.pricingUnit as PricingUnit, currency: 'XAF' },
        availability: data.availability, experience: data.experience,
        certifications: data.certifications?.split('\n').filter(c => c.trim()),
        languages: data.languages?.split(',').map(l => l.trim()).filter(l => l),
        createdAt: new Date(), updatedAt: new Date(), status: 'active',
        views: 0, averageRating: 0, reviewCount: 0, isPromoted: false,
      };
      const docRef = await addDoc(collection(db, 'items'), serviceItem);
      if (onSuccess) onSuccess(docRef.id);
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto p-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-2">Offer a Service</h2><p className="text-gray-600">List your professional service</p></div>
      <div className="space-y-2">
        <Label htmlFor="title"><Wrench className="w-4 h-4 inline mr-2" />Service Title *</Label>
        <Input id="title" {...register('title')} placeholder="e.g., Professional Plumbing Services" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={category} onValueChange={(v) => setValue('category', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{serviceCategories.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Service Description *</Label>
        <Textarea id="description" {...register('description')} rows={5} placeholder="Describe what services you offer..." />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pricingAmount"><DollarSign className="w-4 h-4 inline mr-2" />Price (XAF) *</Label>
          <Input id="pricingAmount" type="number" {...register('pricingAmount', { valueAsNumber: true })} placeholder="0" />
          {errors.pricingAmount && <p className="text-sm text-red-500">{errors.pricingAmount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Pricing Unit *</Label>
          <Select value={pricingUnit} onValueChange={(v) => setValue('pricingUnit', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Per Hour</SelectItem><SelectItem value="day">Per Day</SelectItem>
              <SelectItem value="project">Per Project</SelectItem><SelectItem value="visit">Per Visit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="availability"><Clock className="w-4 h-4 inline mr-2" />Availability *</Label>
        <Textarea id="availability" {...register('availability')} rows={3} placeholder="e.g., Monday-Friday 9AM-5PM, Weekends by appointment" />
        {errors.availability && <p className="text-sm text-red-500">{errors.availability.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience">Experience (optional)</Label>
        <Textarea id="experience" {...register('experience')} rows={3} placeholder="Describe your relevant experience..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="certifications"><Award className="w-4 h-4 inline mr-2" />Certifications (optional, one per line)</Label>
        <Textarea id="certifications" {...register('certifications')} rows={3} placeholder={"Licensed Electrician\nSafety Training Certificate"} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="languages">Languages Spoken (optional, comma separated)</Label>
        <Input id="languages" {...register('languages')} placeholder="English, French, Arabic" />
      </div>
      <div className="space-y-2"><Label>Service Area *</Label><LocationSelector value={location} onChange={setLocation} required /></div>
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
              {kw}<button type="button" onClick={() => removeKeyword(i)} className="hover:text-teal-600">×</button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>}
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'List Service'}
        </Button>
      </div>
    </form>
  );
}


