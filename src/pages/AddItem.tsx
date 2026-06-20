// @ts-nocheck
﻿/**
 * ADD ITEM PAGE
 * 
 * Category selection page for creating new listings
 * Allows users to choose what type of item to add:
 * - Jobs
 * - Marketplace Items
 * - Services
 * - Rental Properties
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  ShoppingBag,
  Wrench,
  Home,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setMainOrigin } from '@/utils/navigationOrigin';
import { useLang, t } from "@/hooks/useAppLang";

interface CategoryOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  examples: string[];
}

export default function AddItem() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories: CategoryOption[] = [
    {
      id: 'job',
      title: t('addItem.job.title', 'Post a Job'),
      description: t('addItem.job.description', 'Hire talented professionals for your company'),
      icon: <Briefcase className="w-12 h-12" />,
      route: '/post-job',
      color: 'text-blue-600 bg-blue-50',
      examples: [
        'Software Developer',
        'Sales Manager',
        'Accountant',
        'Teacher',
      ],
    },
    {
      id: 'marketplace',
      title: t('addItem.marketplace.title', 'Sell an Item'),
      description: t('addItem.marketplace.description', 'List products for sale in the marketplace'),
      icon: <ShoppingBag className="w-12 h-12" />,
      route: '/sell',
      color: 'text-teal-600 bg-teal-50',
      examples: [
        'Electronics',
        'Furniture',
        'Clothing',
        'Vehicles',
      ],
    },
    {
      id: 'service',
      title: t('addItem.service.title', 'Offer a Service'),
      description: t('addItem.service.description', 'Provide professional services to customers'),
      icon: <Wrench className="w-12 h-12" />,
      route: '/offer-service',
      color: 'text-purple-600 bg-purple-50',
      examples: [
        'Plumbing',
        'Web Development',
        'Tutoring',
        'Photography',
      ],
    },
    {
      id: 'rental',
      title: t('addItem.rental.title', 'List a Property'),
      description: t('addItem.rental.description', 'Rent out your property or equipment'),
      icon: <Home className="w-12 h-12" />,
      route: '/list-property',
      color: 'text-orange-600 bg-orange-50',
      examples: [
        'Apartments',
        'Houses',
        'Office Space',
        'Vehicles',
      ],
    },
  ];

  const handleCategoryClick = (route: string) => {
    setMainOrigin();
    navigate(route);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-teal-100 rounded-full">
                <Plus className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('addItem.title', 'What would you like to add?')}
            </h1>
            <p className="text-lg text-gray-600">
              {t(
                'addItem.subtitle',
                'Choose a category to get started with your listing'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleCategoryClick(category.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-4 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
      className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                <CardTitle className="text-2xl mt-4">{category.title}</CardTitle>
                <CardDescription className="text-base">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    {t('addItem.examples', 'Examples')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('addItem.help.title', 'Need help choosing?')}
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>{t('addItem.help.jobs', 'Jobs')}:</strong>{' '}
                  {t(
                    'addItem.help.jobsDescription',
                    'For hiring employees or contractors'
                  )}
                </p>
                <p>
                  <strong>{t('addItem.help.marketplace', 'Marketplace')}:</strong>{' '}
                  {t(
                    'addItem.help.marketplaceDescription',
                    'For selling physical products'
                  )}
                </p>
                <p>
                  <strong>{t('addItem.help.services', 'Services')}:</strong>{' '}
                  {t(
                    'addItem.help.servicesDescription',
                    'For offering professional services'
                  )}
                </p>
                <p>
                  <strong>{t('addItem.help.rentals', 'Rentals')}:</strong>{' '}
                  {t(
                    'addItem.help.rentalsDescription',
                    'For renting properties or equipment'
                  )}
                </p>
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/help')}
                  className="bg-white"
                >
                  {t('addItem.help.button', 'Visit Help Center')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
}


