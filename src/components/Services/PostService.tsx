import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Upload, X, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
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

interface ServiceFormData {
    title: string;
    category: string;
    subcategory: string;
    serviceType: 'one-time' | 'recurring' | 'contract';
    price: string;
    priceType: 'fixed' | 'hourly' | 'daily' | 'project-based';
    negotiable: boolean;
    currency: string;
    description: string;
    whatIncluded: string;
    whatNotIncluded: string;
    qualifications: string;
    experience: string;
    location: string;
    serviceArea: string;
    availability: string[];
    responseTime: string;
    minBookingNotice: string;
    cancellationPolicy: string;
    images: File[];
    portfolio: File[];
    certifications: string;
    languages: string[];
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    emergencyAvailable: boolean;
    travelCharges: boolean;
    travelCost: string;
}

const PostService: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState<ServiceFormData>({
        title: '',
        category: '',
        subcategory: '',
        serviceType: 'one-time',
        price: '',
        priceType: 'hourly',
        negotiable: true,
        currency: 'XAF',
        description: '',
        whatIncluded: '',
        whatNotIncluded: '',
        qualifications: '',
        experience: '',
        location: '',
        serviceArea: '',
        availability: [],
        responseTime: '',
        minBookingNotice: '',
        cancellationPolicy: '',
        images: [],
        portfolio: [],
        certifications: '',
        languages: [],
        contactName: currentUser?.name || '',
        contactPhone: '',
        contactEmail: currentUser?.email || '',
        emergencyAvailable: false,
        travelCharges: false,
        travelCost: '',
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const serviceCategories = [
        'Home Services',
        'Professional Services',
        'Health & Wellness',
        'Education & Tutoring',
        'Events & Entertainment',
        'Beauty & Personal Care',
        'Automotive Services',
        'Technology & IT',
        'Construction & Repair',
        'Cleaning Services',
        'Transportation',
        'Legal Services',
        'Financial Services',
        'Consulting',
        'Photography & Video',
        'Catering & Food',
        'Security Services',
        'Other',
    ];

    const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];

    const availableLanguages = [
        'English',
        'French',
        'Arabic',
        'Hausa',
        'Fulfulde',
        'Ewondo',
        'Duala',
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

    const handleAvailabilityToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.includes(day)
                ? prev.availability.filter(d => d !== day)
                : [...prev.availability, day],
        }));
    };

    const handleLanguageToggle = (language: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.includes(language)
                ? prev.languages.filter(l => l !== language)
                : [...prev.languages, language],
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
                description: 'Please enter a service title',
                variant: 'destructive',
            });
            return false;
        }

        if (!formData.category) {
            toast({
                title: 'Missing category',
                description: 'Please select a service category',
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

        if (!formData.description.trim()) {
            toast({
                title: 'Missing description',
                description: 'Please describe your service',
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
                description: 'Please log in to post a service',
                variant: 'destructive',
            });
            navigate('/login');
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const serviceListing = {
                ...formData,
                id: `service-${Date.now()}`,
                providerId: currentUser.id,
                providerName: currentUser.name,
                postedAt: new Date().toISOString(),
                status: 'active',
                views: 0,
                saves: 0,
                bookings: 0,
                rating: 0,
                reviews: 0,
            };

            const existingServices = JSON.parse(localStorage.getItem('bambe-services') || '[]');
            localStorage.setItem('bambe-services', JSON.stringify([serviceListing, ...existingServices]));

            toast({
                title: 'Service posted successfully!',
                description: 'Your service is now listed on Bambé',
            });

            navigate('/services');
        } catch (error) {
            console.error('Error posting service:', error);
            toast({
                title: 'Error posting service',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">Post Service</h1>
                            <p className="text-sm text-gray-600">Offer your services on Bambé</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Service Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Service Photos
                            </CardTitle>
                            <CardDescription>Upload photos of your work or service setup</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Service ${index + 1}`}
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

                    {/* Service Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Service Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Service Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g., Professional Plumbing Services"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleSelectChange('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceCategories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="serviceType">Service Type</Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(value) => handleSelectChange('serviceType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-time">One-time Service</SelectItem>
                                            <SelectItem value="recurring">Recurring Service</SelectItem>
                                            <SelectItem value="contract">Contract-based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Service Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe your service in detail..."
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="whatIncluded">What's Included</Label>
                                    <Textarea
                                        id="whatIncluded"
                                        name="whatIncluded"
                                        placeholder="List what's included in your service..."
                                        rows={4}
                                        value={formData.whatIncluded}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="whatNotIncluded">What's Not Included</Label>
                                    <Textarea
                                        id="whatNotIncluded"
                                        name="whatNotIncluded"
                                        placeholder="List what's not included..."
                                        rows={4}
                                        value={formData.whatNotIncluded}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        placeholder="e.g., 25000"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="priceType">Price Type</Label>
                                    <Select
                                        value={formData.priceType}
                                        onValueChange={(value) => handleSelectChange('priceType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">Fixed Price</SelectItem>
                                            <SelectItem value="hourly">Per Hour</SelectItem>
                                            <SelectItem value="daily">Per Day</SelectItem>
                                            <SelectItem value="project-based">Project-based</SelectItem>
                                        </SelectContent>
                                    </Select>
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

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="travelCharges"
                                    checked={formData.travelCharges}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, travelCharges: checked as boolean }))
                                    }
                                />
                                <Label htmlFor="travelCharges">Travel charges apply</Label>
                            </div>

                            {formData.travelCharges && (
                                <div>
                                    <Label htmlFor="travelCost">Travel Cost</Label>
                                    <Input
                                        id="travelCost"
                                        name="travelCost"
                                        type="number"
                                        placeholder="e.g., 5000"
                                        value={formData.travelCost}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Qualifications & Experience */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications & Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="experience">Years of Experience</Label>
                                <Input
                                    id="experience"
                                    name="experience"
                                    placeholder="e.g., 5 years"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="qualifications">Qualifications</Label>
                                <Textarea
                                    id="qualifications"
                                    name="qualifications"
                                    placeholder="List your qualifications, certifications, training..."
                                    rows={4}
                                    value={formData.qualifications}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="certifications">Certifications</Label>
                                <Input
                                    id="certifications"
                                    name="certifications"
                                    placeholder="e.g., Licensed Electrician, First Aid Certified"
                                    value={formData.certifications}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label>Languages Spoken</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    {availableLanguages.map(language => (
                                        <div key={language} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={language}
                                                checked={formData.languages.includes(language)}
                                                onCheckedChange={() => handleLanguageToggle(language)}
                                            />
                                            <Label htmlFor={language} className="text-sm cursor-pointer">
                                                {language}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Availability */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location & Availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="location">Your Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="e.g., Yaoundé, "
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="serviceArea">Service Area</Label>
                                <Input
                                    id="serviceArea"
                                    name="serviceArea"
                                    placeholder="e.g., Yaoundé and surrounding areas within 20km"
                                    value={formData.serviceArea}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label>Days Available</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    {daysOfWeek.map(day => (
                                        <div key={day} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={day}
                                                checked={formData.availability.includes(day)}
                                                onCheckedChange={() => handleAvailabilityToggle(day)}
                                            />
                                            <Label htmlFor={day} className="text-sm cursor-pointer">
                                                {day}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responseTime">Typical Response Time</Label>
                                    <Input
                                        id="responseTime"
                                        name="responseTime"
                                        placeholder="e.g., Within 2 hours"
                                        value={formData.responseTime}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="minBookingNotice">Minimum Booking Notice</Label>
                                    <Input
                                        id="minBookingNotice"
                                        name="minBookingNotice"
                                        placeholder="e.g., 24 hours"
                                        value={formData.minBookingNotice}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="emergencyAvailable"
                                    checked={formData.emergencyAvailable}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, emergencyAvailable: checked as boolean }))
                                    }
                                />
                                <Label htmlFor="emergencyAvailable">Available for emergency calls</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policies */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cancellation Policy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="cancellationPolicy"
                                placeholder="Describe your cancellation policy..."
                                rows={4}
                                value={formData.cancellationPolicy}
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
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post Service'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostService;


