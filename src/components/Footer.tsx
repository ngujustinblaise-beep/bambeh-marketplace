/**
 * ---------------------------------------------------------------------------
 * FOOTER - BAMBEH MARKETPLACE
 * ---------------------------------------------------------------------------
 * 
 * ? Exchange in Categories section
 * ? Donate/Support Bambeh in Support section
 * ? Company profile links to actual website
 * ? All navigation links working
 * 
 * © 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ArrowLeftRight,
  Briefcase,
  ShoppingBag,
  Wrench,
  Home as HomeIcon,
  Car
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* -----------------------------------------------------------
              ABOUT SECTION
              ----------------------------------------------------------- */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">About Bambeh</h3>
            <p className="text-sm mb-4">
              Online Marketplace - Buy, Sell, Trade, and Find Jobs with only 1% transaction fee!
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/bambeh"
                target="_blank"
                rel="noopener noreferrer"
      className="hover:text-teal-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/bambeh"
                target="_blank"
                rel="noopener noreferrer"
      className="hover:text-teal-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/bambeh"
                target="_blank"
                rel="noopener noreferrer"
      className="hover:text-teal-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* -----------------------------------------------------------
              CATEGORIES - WITH EXCHANGE!
              ----------------------------------------------------------- */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Jobs
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Services
                </Link>
              </li>
              <li>
                <Link to="/rentals" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <HomeIcon className="w-4 h-4" />
                  Rentals
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicles
                </Link>
              </li>
              <li>
                <Link to="/exchange" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  Exchange
                </Link>
              </li>
            </ul>
          </div>

          {/* -----------------------------------------------------------
              SUPPORT - WITH DONATE!
              ----------------------------------------------------------- */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-teal-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/help/contact" className="hover:text-teal-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/help/safety-security" className="hover:text-teal-400 transition-colors">
                  Safety & Security
                </Link>
              </li>
              <li>
                <Link to="/subscription-plans" className="hover:text-teal-400 transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="font-semibold">Support Bambeh</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* -----------------------------------------------------------
              COMPANY - WITH PROPER WEBSITE LINK!
              ----------------------------------------------------------- */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://www.bambeh.com"
                  target="_blank"
                  rel="noopener noreferrer"
      className="hover:text-teal-400 transition-colors"
                >
                  View Company Profile
                </a>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:bambehtheapp@gmail.com" className="hover:text-teal-400">
                  bambehtheapp@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+237 652 953 607
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Yaoundé, </span>
              </div>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------
            BOTTOM BAR
            ----------------------------------------------------------- */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <p>© {currentYear} Bambeh. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-1">
                Operated by BAMBEH SARL
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/terms" className="hover:text-teal-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/privacy" className="hover:text-teal-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/help/contact" className="hover:text-teal-400 transition-colors">
                Contact
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/subscription-plans" className="hover:text-teal-400 transition-colors">
                Subscriptions
              </Link>
            </div>

            {/* Transaction Fee Badge */}
            <div className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold">
              Only 1% Transaction Fee!
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

