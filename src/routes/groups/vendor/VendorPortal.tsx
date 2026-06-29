/**
 * ---------------------------------------------------------------------------
 * VENDOR PORTAL - ENTRY PAGE FOR VENDORS
 * ---------------------------------------------------------------------------
 * 
 * Entry point for vendors to:
 * - Register as a new vendor
 * - Sign in to existing vendor account
 * 
 * FILE LOCATION: src/pages/vendor/VendorPortal.tsx
 * 
 * � 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  UserPlus,
  LogIn,
  Building,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function VendorPortal() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  const benefits = [
    { icon: DollarSign, title: 'Only 1% Fee', description: 'Lowest commission in ' },
    { icon: Users, title: 'Millions of Buyers', description: 'Access to huge customer base' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track your sales performance' },
    { icon: Shield, title: 'Secure Payments', description: 'Protected transactions' },
    { icon: Zap, title: 'Premium Tools', description: 'Boost your listings visibility' },
    { icon: Star, title: 'Verified Badge', description: 'Build trust with customers' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/login"
      className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vendor Portal</h1>
                <p className="text-sm text-gray-600">For Enterprises</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6 shadow-2xl">
              <Store className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Grow Your Business with <span className="text-purple-600">Bambeh</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful vendors selling on 's fastest-growing marketplace
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Register Card */}
            <Link
              to="/vendor/register"
      className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-purple-500 transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserPlus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Register as Vendor</h3>
              <p className="text-gray-600 mb-4">
                New to Bambeh? Create your vendor account and start selling today.
              </p>
              <div className="flex items-center text-purple-600 font-semibold">
                Get Started
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              
              {/* Registration Fee Notice */}
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <strong>Registration Fee:</strong> 1,000 XAF (one-time)
                </p>
              </div>
            </Link>

            {/* Sign In Card */}
            <Link
              to="/vendor/login"
      className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-teal-500 transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LogIn className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Account</h3>
              <p className="text-gray-600 mb-4">
                Already a vendor? Sign in to access your dashboard and manage your store.
              </p>
              <div className="flex items-center text-teal-600 font-semibold">
                Sign In
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              
              {/* Benefits Preview */}
              <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                <p className="text-sm text-teal-700">
                  Access your <strong>Vendor Dashboard</strong>
                </p>
              </div>
            </Link>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Sell on Bambeh?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                );
                }
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-purple-600">10K+</p>
              <p className="text-gray-600">Active Vendors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-teal-600">500K+</p>
              <p className="text-gray-600">Monthly Buyers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-pink-600">1%</p>
              <p className="text-gray-600">Commission Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






