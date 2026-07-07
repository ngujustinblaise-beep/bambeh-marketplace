/**
 * RENTALS PAGE - ENHANCED
 * 
 * Complete rental properties marketplace with all features
 * 
 * Features:
 * - Rental categories (7 categories)
 * - Property type filters (13 types)
 * - Price range filter (per day, week, month, year)
 * - Bedrooms/bathrooms filters
 * - Furnished/unfurnished filter
 * - Location hierarchy filter
 * - Keywords search
 * - Subscription gate for contact
 * - Review integration
 * - Amenities display
 * - House rules display
 * - Image gallery
 * - Responsive grid layout
 * - Loading and empty states
 * - Owner verification badges
 * 
 * IMPORTANT: Update your RentalItem type definition in @/types/items to include:
 * owner: {
 *   id: string;
 *   name: string;
 *   phone: string;
 *   email: string;
 *   isVerified: boolean;        // ADD THIS - Shows verified badge
 *   isTrusted?: boolean;        // ADD THIS - Shows premium landlord badge
 *   rating?: number;            // ADD THIS - Owner rating
 *   verificationLevel?: string; // ADD THIS - Verification level details
 * }
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Home,
  MapPin,
  DollarSign,
  Filter,
  Plus,
  X,
  Lock,
  Bed,
  Bath,
  Maximize,
  Check,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LocationSelector from '@/components/location/LocationSelector';
import ItemCard from '@/components/items/ItemCard';
import ReviewList from '@/components/reviews/ReviewList';
import StarRating from '@/components/reviews/StarRating';
import TrustedBadge from '@/components/TrustedBadge';
import { RentalItem, RentalCategory, PropertyType, RentalPeriod } from '@/types/items';
import { LocationDetails } from '@/types/location';
import { collection, query, where, orderBy, limit, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { isSubscribed } from '@/utils/subscriptionUtils';

export default function RentalsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  // State
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<RentalItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [selectedPricePeriod, setSelectedPricePeriod] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<string>('');
  const [minBathrooms, setMinBathrooms] = useState<string>('');
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const rentalCategories: RentalCategory[] = [
    'residential', 'commercial', 'land', 'vehicle',
    'equipment', 'event-space', 'storage'
  ];

  const propertyTypes: PropertyType[] = [
    'apartment', 'house', 'studio', 'room', 'villa',
    'office', 'shop', 'warehouse', 'land', 'parking',
    'car', 'truck', 'equipment'
  ];

  const pricePeriods: RentalPeriod[] = ['day', 'week', 'month', 'year'];

  /**
   * Fetch rentals from Firestore
   */
  const fetchRentals = async () => {
    setLoading(true);
    try {
      const constraints: QueryConstraint[] = [
        where('type', '==', 'rental'),
        where('status', '==', 'active'),
      ];

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        constraints.push(where('category', '==', selectedCategory));
      }

      // Property type filter
      if (selectedPropertyType && selectedPropertyType !== 'all') {
        constraints.push(where('propertyType', '==', selectedPropertyType));
      }

      // Price period filter
      if (selectedPricePeriod && selectedPricePeriod !== 'all') {
        constraints.push(where('price.period', '==', selectedPricePeriod));
      }

      // Location filter (by region)
      if (selectedLocation?.region) {
        constraints.push(where('location.region', '==', selectedLocation.region));
      }

      // Order by creation date
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(50));

      const q = query(collection(db, 'items'), ...constraints);
      const querySnapshot = await getDocs(q);

      let rentalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as RentalItem[];

      // Client-side filters
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        rentalsData = rentalsData.filter(
          rental =>
            rental.title.toLowerCase().includes(searchLower) ||
            rental.description.toLowerCase().includes(searchLower)
        );
      }

      // Keyword filter
      if (selectedKeywords.length > 0) {
        rentalsData = rentalsData.filter(rental =>
          selectedKeywords.some(keyword =>
            rental.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
          )
        );
      }

      // Location hierarchy filter
      if (selectedLocation) {
        if (selectedLocation.village) {
          rentalsData = rentalsData.filter(
            rental => rental.location.village === selectedLocation.village
          );
        } else if (selectedLocation.subdivision) {
          rentalsData = rentalsData.filter(
            rental => rental.location.subdivision === selectedLocation.subdivision
          );
        } else if (selectedLocation.division) {
          rentalsData = rentalsData.filter(
            rental => rental.location.division === selectedLocation.division
          );
        }
      }

      // Price range filter
      if (minPrice || maxPrice) {
        rentalsData = rentalsData.filter(rental => {
          const price = rental.price.amount;
          const filterMin = minPrice ? parseInt(minPrice) : 0;
          const filterMax = maxPrice ? parseInt(maxPrice) : Infinity;

          return price >= filterMin && price <= filterMax;
        });
      }

      // Bedrooms filter
      if (minBedrooms) {
        const min = parseInt(minBedrooms);
        rentalsData = rentalsData.filter(
          rental => rental.bedrooms && rental.bedrooms >= min
        );
      }

      // Bathrooms filter
      if (minBathrooms) {
        const min = parseInt(minBathrooms);
        rentalsData = rentalsData.filter(
          rental => rental.bathrooms && rental.bathrooms >= min
        );
      }

      // Furnished filter
      if (furnishedOnly) {
        rentalsData = rentalsData.filter(rental => rental.furnished === true);
      }

      // Amenity filter
      if (selectedAmenity) {
        rentalsData = rentalsData.filter(rental =>
          rental.amenities?.some(amenity =>
            amenity.toLowerCase().includes(selectedAmenity.toLowerCase())
          )
        );
      }

      setRentals(rentalsData);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [
    selectedCategory,
    selectedPropertyType,
    selectedPricePeriod,
    selectedLocation,
    searchQuery,
    selectedKeywords,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    furnishedOnly,
    selectedAmenity,
  ]);

  /**
   * Handle rental card click
   */
  const handleRentalClick = (rental: RentalItem) => {
    setSelectedRental(rental);
    setSelectedImageIndex(0);
  };

  /**
   * Handle add keyword
   */
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !selectedKeywords.includes(keywordInput.trim())) {
      setSelectedKeywords([...selectedKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  /**
   * Handle remove keyword
   */
  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation(null);
    setSelectedCategory('all');
    setSelectedPropertyType('all');
    setSelectedPricePeriod('all');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setMinBathrooms('');
    setFurnishedOnly(false);
    setSelectedAmenity('');
    setSelectedKeywords([]);
  };

  /**
   * Check if user can view contact
   */
  const canViewContact = () => {
    if (!currentUser) return false;
    return isSubscribed(currentUser);
  };

  /**
   * Active filters count
   */
  const activeFiltersCount = [
    searchQuery,
    selectedLocation,
    selectedCategory !== 'all' ? selectedCategory : null,
    selectedPropertyType !== 'all' ? selectedPropertyType : null,
    selectedPricePeriod !== 'all' ? selectedPricePeriod : null,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    furnishedOnly ? 'furnished' : null,
    selectedAmenity,
    ...selectedKeywords,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Home className="w-8 h-8 text-teal-600" />
                {t('rentals.title', 'Rentals')}
              </h1>
              <p className="text-gray-600 mt-1">
                {rentals.length} {t('rentals.available', 'properties available')}
              </p>
            </div>

            {/* List Property Button */}
            {currentUser && (
              <Button
                onClick={() => navigate('/list-property')}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('rentals.list', 'List Property')}
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('rentals.search', 'Search properties by title or description...')}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('common.filters', 'Filters')}
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-teal-600">{activeFiltersCount}</Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location Filter - Enhanced */}
              <div className="space-y-2 lg:col-span-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('common.location', 'Location')} - {t('rentals.locationHelp', 'Select from region to village')}
                </Label>
                <LocationSelector
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                />
                {selectedLocation && (
                  <p className="text-xs text-gray-600">
                    {t('rentals.searching', 'Searching in')}:{' '}
                    {selectedLocation.village && `${selectedLocation.village}, `}
                    {selectedLocation.subdivision && `${selectedLocation.subdivision}, `}
                    {selectedLocation.division && `${selectedLocation.division}, `}
                    {selectedLocation.region}
                  </p>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>{t('rentals.category', 'Category')}</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all', 'All Categories')}</SelectItem>
                    {rentalCategories.map(category => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Filter */}
              <div className="space-y-2">
                <Label>{t('rentals.propertyType', 'Property Type')}</Label>
                <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all', 'All Types')}</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Period Filter */}
              <div className="space-y-2">
                <Label>{t('rentals.pricePeriod', 'Price Period')}</Label>
                <Select value={selectedPricePeriod} onValueChange={setSelectedPricePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all', 'All Periods')}</SelectItem>
                    {pricePeriods.map(period => (
                      <SelectItem key={period} value={period} className="capitalize">
                        Per {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('rentals.minPrice', 'Min Price (XAF)')}
                </Label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('rentals.maxPrice', 'Max Price (XAF)')}
                </Label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No limit"
                />
              </div>

              {/* Bedrooms/Bathrooms */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  {t('rentals.minBedrooms', 'Min Bedrooms')}
                </Label>
                <Input
                  type="number"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  placeholder="Any"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  {t('rentals.minBathrooms', 'Min Bathrooms')}
                </Label>
                <Input
                  type="number"
                  value={minBathrooms}
                  onChange={(e) => setMinBathrooms(e.target.value)}
                  placeholder="Any"
                />
              </div>

              {/* Amenity Search */}
              <div className="space-y-2">
                <Label>{t('rentals.amenity', 'Amenity')}</Label>
                <Input
                  value={selectedAmenity}
                  onChange={(e) => setSelectedAmenity(e.target.value)}
                  placeholder="e.g., WiFi, Parking, Pool"
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>{t('common.keywords', 'Keywords')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    placeholder={t('common.addKeyword', 'Add keyword')}
                  />
                  <Button type="button" onClick={handleAddKeyword} variant="outline">
                    {t('common.add', 'Add')}
                  </Button>
                </div>
              </div>

              {/* Furnished Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="furnishedOnly"
                  checked={furnishedOnly}
                  onChange={(e) => setFurnishedOnly(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <Label htmlFor="furnishedOnly" className="cursor-pointer">
                  {t('rentals.furnished', 'Furnished only')}
                </Label>
              </div>
            </div>

            {/* Selected Keywords */}
            {selectedKeywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedKeywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  {t('common.clearFilters', 'Clear All Filters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rentals Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('rentals.noResults', 'No properties found')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('rentals.tryDifferent', 'Try adjusting your filters or search query')}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                {t('common.clearFilters', 'Clear Filters')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <ItemCard
                key={rental.id}
                item={rental}
                onClick={() => handleRentalClick(rental)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rental Details Modal */}
      {selectedRental && (
        <Dialog open={!!selectedRental} onOpenChange={() => setSelectedRental(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedRental.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>{selectedRental.userName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedRental.location.village || selectedRental.location.subdivision}
                    , {selectedRental.location.region}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Image Gallery */}
              {selectedRental.images.length > 0 && (
                <div className="space-y-2">
                  <img
                    src={selectedRental.images[selectedImageIndex]}
                    alt={selectedRental.title}
                    className="w-full h-96 object-cover rounded-lg border"
                  />
                  {selectedRental.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedRental.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedRental.title} ${index + 1}`}
                          className={`w-full h-24 object-cover rounded cursor-pointer border-2 ${
                            index === selectedImageIndex
                              ? 'border-teal-600'
                              : 'border-transparent'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-teal-600">
                  {selectedRental.price.amount.toLocaleString()} XAF
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  Per {selectedRental.price.period}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {selectedRental.category.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedRental.propertyType}
                </Badge>
                {selectedRental.furnished && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Furnished
                  </Badge>
                )}
                {selectedRental.bedrooms && (
                  <Badge variant="outline">
                    <Bed className="w-3 h-3 mr-1" />
                    {selectedRental.bedrooms} Bed
                  </Badge>
                )}
                {selectedRental.bathrooms && (
                  <Badge variant="outline">
                    <Bath className="w-3 h-3 mr-1" />
                    {selectedRental.bathrooms} Bath
                  </Badge>
                )}
                {selectedRental.squareMeters && (
                  <Badge variant="outline">
                    <Maximize className="w-3 h-3 mr-1" />
                    {selectedRental.squareMeters}m²
                  </Badge>
                )}
              </div>

              {/* Rating - Reviews Integration */}
              {selectedRental.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={selectedRental.averageRating} readonly />
                  <span className="text-sm text-gray-600">
                    ({selectedRental.reviewCount}{' '}
                    {selectedRental.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('rentals.description', 'Description')}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedRental.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedRental.amenities && selectedRental.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('rentals.amenities', 'Amenities')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRental.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* House Rules */}
              {selectedRental.rules && selectedRental.rules.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('rentals.rules', 'House Rules')}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedRental.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Owner Contact - Subscription Gate */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('rentals.contact', 'Contact Owner')}
                </h3>
                {!canViewContact() ? (
                  <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
                    <CardContent className="p-6 text-center">
                      <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('subscription.unlockContact', 'Unlock Owner Contact')}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {t(
                          'subscription.contactMessage',
                          'Subscribe to view owner phone numbers and contact directly'
                        )}
                      </p>
                      <Button
                        onClick={() => navigate('/subscription')}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {t('subscription.viewPlans', 'View Subscription Plans')}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div>
                      <p className="text-gray-700 mb-2">
                        <strong>{t('rentals.owner', 'Owner')}:</strong>{' '}
                        {selectedRental.userName}
                      </p>
                      {/* Owner Badges */}
                      <div className="flex gap-1 flex-wrap">
                        {selectedRental.owner?.isVerified && (
                          <TrustedBadge type="verified" size="sm" />
                        )}
                        {selectedRental.owner?.isTrusted && (
                          <TrustedBadge type="premium-landlord" size="sm" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <a
                        href={`tel:${selectedRental.userPhone}`}
                        className="text-teal-600 hover:underline"
                      >
                        {selectedRental.userPhone}
                      </a>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/chat?user=${selectedRental.userId}`)}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t('rentals.message', 'Send Message')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Keywords */}
              {selectedRental.keywords.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('common.keywords', 'Keywords')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRental.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Integration */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  {t('reviews.title', 'Reviews')}
                </h3>
                <ReviewList itemId={selectedRental.id} itemType="rental" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
