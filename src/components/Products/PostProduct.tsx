import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Upload, X, DollarSign, Tag, Clock } from 'lucide-react';
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

interface ProductFormData {
    title: string;
    category: string;
    subcategory: string;
    condition: 'new' | 'used' | 'refurbished';
    price: string;
    negotiable: boolean;
    currency: string;
    quantity: string;
    brand: string;
    model: string;
    description: string;
    features: string;
    dimensions: string;
    weight: string;
    color: string;
    material: string;
    warranty: boolean;
    warrantyPeriod: string;
    returnPolicy: boolean;
    returnPeriod: string;
    images: File[];
    location: string;
    shippingAvailable: boolean;
    shippingCost: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
}

const PostProduct: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        category: '',
        subcategory: '',
        condition: 'new',
        price: '',
        negotiable: true,
        currency: 'XAF',
        quantity: '1',
        brand: '',
        model: '',
        description: '',
        features: '',
        dimensions: '',
        weight: '',
        color: '',
        material: '',
        warranty: false,
        warrantyPeriod: '',
        returnPolicy: false,
        returnPeriod: '',
        images: [],
        location: '',
        shippingAvailable: false,
        shippingCost: '',
        contactName: currentUser?.name || '',
        contactPhone: '',
        contactEmail: currentUser?.email || '',
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        'Electronics', 'Fashion & Clothing', 'Home & Furniture', 'Sports & Outdoors',
        'Books & Media', 'Toys & Games', 'Health & Beauty', 'Automotive',
        'Garden & Tools', 'Food & Beverages', 'Art & Crafts', 'Jewelry & Accessories',
        'Office Supplies', 'Pet Supplies', 'Baby & Kids', 'Music Instruments', 'Other',
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
            toast({ title: 'Missing title', description: 'Please enter a product title', variant: 'destructive' });
            return false;
        }
        if (!formData.category) {
            toast({ title: 'Missing category', description: 'Please select a category', variant: 'destructive' });
            return false;
        }
        if (!formData.price) {
            toast({ title: 'Missing price', description: 'Please enter a price', variant: 'destructive' });
            return false;
        }
        if (formData.images.length === 0) {
            toast({ title: 'Missing images', description: 'Please upload at least one image', variant: 'destructive' });
            return false;
        }
        if (!formData.contactPhone.trim()) {
            toast({ title: 'Missing contact phone', description: 'Please enter a contact phone number', variant: 'destructive' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            toast({ title: 'Authentication required', description: 'Please log in to post a product', variant: 'destructive' });
            navigate('/login');
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const productListing = {
                ...formData,
                id: `product-${Date.now()}`,
                sellerId: currentUser.id,
                sellerName: currentUser.name,
                postedAt: new Date().toISOString(),
                status: 'active',
                views: 0,
                saves: 0,
                soldQuantity: 0,
            };

            const existingProducts = JSON.parse(localStorage.getItem('bambe-products') || '[]');
            localStorage.setItem('bambe-products', JSON.stringify([productListing, ...existingProducts]));

            toast({ title: 'Product posted successfully!', description: 'Your product is now listed on BambÃ©' });
            navigate('/products');
        } catch (error) {
            console.error('Error posting product:', error);
            toast({
                title: 'Error posting product',
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
                            <h1 className="text-xl font-bold">Post Product</h1>
                            <p className="text-sm text-gray-600">Sell your products on BambÃ©</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Product Photos
                            </CardTitle>
                            <CardDescription>Upload up to 10 photos of your product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img src={preview} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
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
                                            <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Main</span>
                                        )}
                                    </div>
                                ))}
                                {imagePreviews.length < 10 && (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                        <Upload className="h-6 w-6 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-600">Add Photo</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Product Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Product Title *</Label>
                                <Input id="title" name="title" placeholder="e.g., Samsung Galaxy S23 Ultra - 256GB" value={formData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select value={formData.condition} onValueChange={(value) => handleSelectChange('condition', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Brand New</SelectItem>
                                            <SelectItem value="used">Used</SelectItem>
                                            <SelectItem value="refurbished">Refurbished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input id="brand" name="brand" placeholder="e.g., Samsung" value={formData.brand} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="model">Model</Label>
                                    <Input id="model" name="model" placeholder="e.g., Galaxy S23 Ultra" value={formData.model} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="color">Color</Label>
                                    <Input id="color" name="color" placeholder="e.g., Phantom Black" value={formData.color} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="material">Material</Label>
                                    <Input id="material" name="material" placeholder="e.g., Aluminum, Glass" value={formData.material} onChange={handleInputChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing & Stock */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing & Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="price">Price *</Label>
                                    <Input id="price" name="price" type="number" placeholder="e.g., 550000" value={formData.price} onChange={handleInputChange} required />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="XAF">XAF (CFA Franc)</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="quantity">Quantity Available</Label>
                                    <Input id="quantity" name="quantity" type="number" min="1" value={formData.quantity} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="negotiable"
                                    checked={formData.negotiable}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, negotiable: checked as boolean }))}
                                />
                                <Label htmlFor="negotiable">Price is negotiable</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description & Features */}
                    <Card>
                        <CardHeader><CardTitle>Description & Features</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="description">Product Description *</Label>
                                <Textarea id="description" name="description" placeholder="Describe your product in detail..." rows={6} value={formData.description} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="features">Key Features</Label>
                                <Textarea id="features" name="features" placeholder="List key features (one per line)..." rows={4} value={formData.features} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
                                    <Input id="dimensions" name="dimensions" placeholder="e.g., 30 x 20 x 10 cm" value={formData.dimensions} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="weight">Weight</Label>
                                    <Input id="weight" name="weight" placeholder="e.g., 500g" value={formData.weight} onChange={handleInputChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warranty & Returns */}
                    <Card>
                        <CardHeader><CardTitle>Warranty & Returns</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="warranty" checked={formData.warranty} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, warranty: checked as boolean }))} />
                                <Label htmlFor="warranty">Warranty Included</Label>
                            </div>
                            {formData.warranty && (
                                <div>
                                    <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                                    <Input id="warrantyPeriod" name="warrantyPeriod" placeholder="e.g., 12 months, 2 years" value={formData.warrantyPeriod} onChange={handleInputChange} />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="returnPolicy" checked={formData.returnPolicy} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, returnPolicy: checked as boolean }))} />
                                <Label htmlFor="returnPolicy">Returns Accepted</Label>
                            </div>
                            {formData.returnPolicy && (
                                <div>
                                    <Label htmlFor="returnPeriod">Return Period</Label>
                                    <Input id="returnPeriod" name="returnPeriod" placeholder="e.g., 7 days, 30 days" value={formData.returnPeriod} onChange={handleInputChange} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping & Location */}
                    <Card>
                        <CardHeader><CardTitle>Shipping & Location</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="location">Your Location</Label>
                                <Input id="location" name="location" placeholder="e.g., YaoundÃ©, " value={formData.location} onChange={handleInputChange} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="shippingAvailable" checked={formData.shippingAvailable} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shippingAvailable: checked as boolean }))} />
                                <Label htmlFor="shippingAvailable">Shipping Available</Label>
                            </div>
                            {formData.shippingAvailable && (
                                <div>
                                    <Label htmlFor="shippingCost">Shipping Cost</Label>
                                    <Input id="shippingCost" name="shippingCost" type="number" placeholder="e.g., 5000 (or enter 0 for free shipping)" value={formData.shippingCost} onChange={handleInputChange} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="contactName">Your Name</Label>
                                <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="contactPhone">Phone Number *</Label>
                                <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+237 6XX XXX XXX" value={formData.contactPhone} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="contactEmail">Email</Label>
                                <Input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post Product'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostProduct;

