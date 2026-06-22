// @ts-nocheck
/**
 * ADD JOB FORM COMPONENT
 * FILE LOCATION: src/components/jobs/AddJobForm.tsx
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Briefcase, Building2, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationSelector from '@/components/location/LocationSelector';
import { JobCategory, EmploymentType, JobItem } from '@/types/items';
import { LocationDetails } from '@/types/location';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  company: z.string().min(2, 'Company name is required'),
  category: z.string(),
  employmentType: z.string(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string(),
  benefits: z.string().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  applicationDeadline: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface AddJobFormProps { onSuccess?: (jobId: string) => void; onCancel?: () => void; }

export default function AddJobForm({ onSuccess, onCancel }: AddJobFormProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [location, setLocation]       = useState<LocationDetails | null>(null);
  const [keywords, setKeywords]       = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { category: 'technology', employmentType: 'full-time' },
  });
  const category = watch('category');
  const employmentType = watch('employmentType');

  const jobCategories: JobCategory[] = ['technology','healthcare','education','construction','sales','hospitality','agriculture','finance','government','engineering','marketing','legal','transportation','security','manufacturing','other'];
  const employmentTypes: EmploymentType[] = ['full-time','part-time','contract','internship','volunteer','temporary'];

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 10) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };
  const removeKeyword = (index: number) => { setKeywords(keywords.filter((_, i) => i !== index)); };

  const onSubmit = async (data: JobFormData) => {
    if (!location) { alert('Please select a location'); return; }
    if (keywords.length === 0) { alert('Please add at least one keyword'); return; }
    setIsSubmitting(true);
    try {
      const jobItem: Omit<JobItem, 'id'> = {
        type: 'job', title: data.title, description: data.description, keywords, location,
        userId: currentUser!.id, userName: currentUser!.name, userPhone: currentUser!.phone,
        images: [], category: data.category as JobCategory, company: data.company,
        employmentType: data.employmentType as EmploymentType,
        requirements: data.requirements.split('\n').filter(r => r.trim()),
        benefits: data.benefits?.split('\n').filter(b => b.trim()),
        salary: data.salaryMin && data.salaryMax ? { min: data.salaryMin, max: data.salaryMax, currency: 'XAF', period: 'monthly' } : undefined,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
        contactEmail: data.contactEmail, createdAt: new Date(), updatedAt: new Date(),
        status: 'active', views: 0, averageRating: 0, reviewCount: 0, isPromoted: false,
      };
      const docRef = await addDoc(collection(db, 'items'), jobItem);
      if (onSuccess) onSuccess(docRef.id);
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto p-6">
      <div><h2 className="text-2xl font-bold text-gray-900 mb-2">Post a Job</h2><p className="text-gray-600">Fill in the details to create a job listing</p></div>
      <div className="space-y-2">
        <Label htmlFor="title"><Briefcase className="w-4 h-4 inline mr-2" />Job Title *</Label>
        <Input id="title" {...register('title')} placeholder="e.g., Senior Software Developer" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="company"><Building2 className="w-4 h-4 inline mr-2" />Company Name *</Label>
        <Input id="company" {...register('company')} placeholder="Your company name" />
        {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={(v) => setValue('category', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{jobCategories.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat.replace('-', ' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Employment Type *</Label>
          <Select value={employmentType} onValueChange={(v) => setValue('employmentType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{employmentTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type.replace('-', ' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea id="description" {...register('description')} rows={5} placeholder="Describe the role, responsibilities, and what you're looking for..." />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements * (one per line)</Label>
        <Textarea id="requirements" {...register('requirements')} rows={4} placeholder={"Bachelor's degree\n5+ years experience\nProficiency in React"} />
        {errors.requirements && <p className="text-sm text-red-500">{errors.requirements.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits (optional, one per line)</Label>
        <Textarea id="benefits" {...register('benefits')} rows={3} placeholder={"Health insurance\nRemote work\nProfessional development"} />
      </div>
      <div className="space-y-2">
        <Label><DollarSign className="w-4 h-4 inline mr-2" />Salary Range (XAF, optional)</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input type="number" {...register('salaryMin', { valueAsNumber: true })} placeholder="Minimum" />
          <Input type="number" {...register('salaryMax', { valueAsNumber: true })} placeholder="Maximum" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email (optional)</Label>
        <Input id="contactEmail" type="email" {...register('contactEmail')} placeholder="jobs@company.com" />
        {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="deadline"><Calendar className="w-4 h-4 inline mr-2" />Application Deadline (optional)</Label>
        <Input id="deadline" type="date" {...register('applicationDeadline')} />
      </div>
      <div className="space-y-2"><Label>Location *</Label><LocationSelector value={location} onChange={setLocation} required /></div>
      <div className="space-y-2">
        <Label>Keywords * (max 10)</Label>
        <div className="flex gap-2">
          <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Add keyword and press Enter" />
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
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Post Job'}
        </Button>
      </div>
    </form>
  );
}




