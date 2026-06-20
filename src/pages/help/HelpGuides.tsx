import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Book, Search, HelpCircle, FileText } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface Guide {
  id: string;
  title: string;
  content: string[];
  category: string;
}

const HelpGuides: React.FC = () => {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const guides: Guide[] = [
    {
      id: '1',
      title: 'Creating Your Bambé Account',
      category: 'Getting Started',
      content: [
        'Click on "Register" in the top right corner',
        'Enter your full name, email address, and phone number',
        'Create a strong password (minimum 8 characters)',
        'Select your region and city in ',
        'Choose your preferred language (English, French, Arabic, or Hausa)',
        'Agree to the Terms of Service and Privacy Policy',
        'Click "Create Account"',
        'Check your email for verification link',
        'Click the verification link to activate your account',
        'Log in with your credentials',
        'Complete your profile by adding a photo and bio'
      ]
    },
    {
      id: '2',
      title: 'Understanding Zerm Coins',
      category: 'Zerm Coins',
      content: [
        'Zerm Coins are Bambé\'s digital currency for transactions',
        'Get 50 free Zerm Coins when you create an account',
        'Earn coins through referrals (100 coins per successful referral)',
        'Use coins to boost your listings for more visibility',
        'Purchase premium features and subscriptions',
        'Convert coins to XAF (1 Zerm Coin = 1 XAF)',
        'Buy Zerm Coins through Mobile Money (MTN, Orange)',
        'Track your coin balance in your profile',
        'View transaction history under "My Coins"',
        'Coins never expire and are always available'
      ]
    },
    {
      id: '3',
      title: 'How to Post a Job',
      category: 'Jobs',
      content: [
        'Log in to your Bambé account',
        'Click on "Jobs" in the navigation menu',
        'Click the "Post a Job" button (or "+" icon)',
        'Enter the job title and description',
        'Select the job category (IT, Marketing, Sales, etc.)',
        'Choose job type (Full-time, Part-time, Contract, Internship)',
        'Set salary range or indicate "Negotiable"',
        'Specify required qualifications and experience',
        'Add company name and contact details',
        'Select location (region and city)',
        'Upload company logo (optional)',
        'Set application deadline',
        'Review your listing carefully',
        'Click "Publish Job"',
        'Job will be visible immediately to all users'
      ]
    },
    {
      id: '4',
      title: 'Selling Items on Marketplace',
      category: 'Marketplace',
      content: [
        'Navigate to "Marketplace" section',
        'Click "Sell an Item" button',
        'Select the appropriate category',
        'Enter item title (be clear and specific)',
        'Write detailed description of the item',
        'Set your price in XAF',
        'Upload up to 5 high-quality photos',
        'Specify item condition (New, Like New, Used, For Parts)',
        'Add item specifications (size, color, model, etc.)',
        'Choose your location for pickup/delivery',
        'Provide contact information',
        'Review and publish your listing'
      ]
    },
    {
      id: '5',
      title: 'Renting Out Property',
      category: 'Rentals',
      content: [
        'Go to "Rentals" section',
        'Click "List Property" button',
        'Select property type (Apartment, House, Studio, etc.)',
        'Enter property title and description',
        'Set monthly rent amount in XAF',
        'Specify number of bedrooms and bathrooms',
        'Add property size in square meters',
        'List amenities (WiFi, Parking, Security, etc.)',
        'Upload clear photos of each room',
        'Provide exact address and location',
        'Set availability date',
        'Add lease terms and requirements',
        'Submit for review and publishing'
      ]
    },
    {
      id: '6',
      title: 'Offering Professional Services',
      category: 'Services',
      content: [
        'Navigate to "Services" section',
        'Click "Offer Service" button',
        'Choose your service category',
        'Write a compelling service title',
        'Describe your service in detail',
        'Set your rates (hourly, fixed, or package)',
        'List your qualifications and experience',
        'Upload portfolio or sample work',
        'Specify service areas/regions',
        'Set your availability schedule',
        'Add contact preferences',
        'Publish your service listing'
      ]
    },
    {
      id: '7',
      title: 'Using Filters and Search',
      category: 'Navigation',
      content: [
        'Use the search bar at the top to find specific items',
        'Click on category tabs to browse by type',
        'Use the filter panel on the left side',
        'Filter by price range (min and max)',
        'Filter by location (region and city)',
        'Sort results by: Newest, Oldest, Price (Low to High), Price (High to Low)',
        'Use the "Reset Filters" button to clear all filters',
        'Toggle between grid and list view',
        'Save your favorite searches for quick access',
        'Get notifications for new listings matching your filters'
      ]
    },
    {
      id: '8',
      title: 'Managing Your Listings',
      category: 'Account',
      content: [
        'Go to "Profile" and click "My Listings"',
        'View all your active, pending, and expired listings',
        'Click "Edit" to modify any listing',
        'Update photos, price, or description anytime',
        'Mark items as "Sold" when transaction is complete',
        'Delete listings you no longer need',
        'Boost listings with Zerm Coins for more visibility',
        'Respond to inquiries promptly',
        'Track views and favorites on each listing',
        'Renew expired listings with one click'
      ]
    },
    {
      id: '9',
      title: 'Payment Methods',
      category: 'Payments',
      content: [
        'Bambé supports Mobile Money (MTN, Orange)',
        'Cash payments for local transactions',
        'Zerm Coins for platform transactions',
        'Always meet in safe, public places for cash deals',
        'Verify items before making payment',
        'Request receipts for all transactions',
        'Never send money before seeing the item',
        'Use Bambé\'s messaging for all communications',
        'Report suspicious activity immediately',
        'Keep transaction records for your protection'
      ]
    },
    {
      id: '10',
      title: 'Safety Tips',
      category: 'Safety',
      content: [
        'Never share personal banking information',
        'Meet buyers/sellers in public, well-lit places',
        'Bring a friend for high-value transactions',
        'Inspect items thoroughly before payment',
        'Trust your instincts - if something feels wrong, walk away',
        'Verify user profiles and ratings before dealing',
        'Keep all communications within Bambé platform',
        'Report suspicious listings or users immediately',
        'Don\'t fall for deals that seem too good to be true',
        'Use secure payment methods only',
        'Never wire money or send prepayments to strangers'
      ]
    }
  ];

  const categories = ['All', 'Getting Started', 'Jobs', 'Marketplace', 'Services', 'Rentals', 'Zerm Coins', 'Account', 'Payments', 'Safety', 'Navigation'];

  const toggleGuide = (guideId: string) => {
    setExpandedGuide(expandedGuide === guideId ? null : guideId);
  };

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesSearch = 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.content.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Book className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Help Guides</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Step-by-step guides to help you make the most of Bambé
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Found {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}
        </div>

        {/* Guides List */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No guides found matching your search.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                {/* Guide Header */}
                <button
                  onClick={() => toggleGuide(guide.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {guide.title}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {guide.category}
                      </span>
                    </div>
                  </div>
                  {expandedGuide === guide.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {/* Guide Content */}
                {expandedGuide === guide.id && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <ol className="space-y-3">
                      {guide.content.map((step, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Help Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Still Need Help?
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex gap-4">
            <a
              href="/help/video-tutorials"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Watch Video Tutorials
            </a>
            <a
              href="/help"
      className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuides;





