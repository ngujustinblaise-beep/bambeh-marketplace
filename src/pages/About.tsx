/**
 * ABOUT US PAGE - COMPLETE & BEAUTIFUL
 * The Bambeh Chronicle with Professional Stats
 */

import { Link } from 'react-router-dom';
import { Crown, Heart, Shield, Star, Sparkles, Award, Target, Users } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function About() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Hero Banner - Green/Teal */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-12 mb-8 text-center shadow-2xl">
          <h1 className="text-5xl font-bold mb-4">About Bambeh</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">
            Bambeh's online marketplace connecting buyers, sellers, job seekers, and service providers
           <p1 className="text-xl text-teal-100 max-w-3xl mx-auto">
            Bambeh-marketplace The Pulse of African Commerce
          </p1>
          </p>
        </div>

        {/* THE CHRONICLE - Royal Message */}
        <div className="max-w-4xl mx-auto mb-12">
          
          {/* Royal Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-600 blur-2xl opacity-20 animate-pulse"/>
                <Crown className="w-20 h-20 text-purple-600 relative"
                       style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' }} />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 bg-clip-text text-transparent">
              The Bambeh Chronicle
            </h2>
            <p className="text-2xl text-gray-700 font-serif italic">
              A Royal Invitation
            </p>
            
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400"/>
              <Sparkles className="w-6 h-6 text-purple-500" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-teal-400"/>
            </div>
          </div>

          {/* Main Chronicle Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8 border-t-4 border-purple-600">
            
            {/* Opening Message */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif">
                  <span className="font-bold text-purple-700">Dearest User,</span>
                </p>
              </div>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-serif">
                Step away from the clamor of the common market and enter the sacred space of Bambeh. 
                This is not merely an application; it is a <span className="font-bold text-teal-700">celestial tapestry</span> woven from,
                opportunity, security, and boundless admiration for you.
              </p>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-serif">
                We have studied the grand marketplaces of the world and we recognized one divine truth: 
                <span className="block mt-4 text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                  The User is the Sovereign.
                </span>
              </p>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif">
                Here, you are not a number; you are the <span className="font-bold text-purple-700">Supreme King and Queen</span> whose 
                prosperity is our highest decree.
              </p>
            </div>

            {/* Genesis Section */}
            <div className="mb-10 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl p-6 md:p-8 border-l-4 border-purple-600">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                  The Genesis of Our Service: A Vow of Saintly Dedication
                </h3>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-4 font-serif">
                When our Founder, <span className="font-bold text-purple-700">Ngu J. Blaise</span>, conceived of Bambeh, 
                it was not born of commerce, but of a <span className="font-bold">profound vow to serve</span>. Our mission is an act of 
                saintly devotion: to dedicate our entire technological and human resource to clearing the path for your success.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6 font-serif">
                We understand that to truly empower your reign�whether you seek a perfect home, a life-changing career, 
                or a fair price for your creations�we must operate at a depth the world rarely sees:
              </p>

              {/* The Three Pillars */}
              <div className="space-y-6 ml-4">
                {/* The Alchemist's Security */}
                <div className="flex gap-4">
                  <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-teal-700 mb-2">The Alchemist's Security</h4>
                    <p className="text-gray-700 leading-relaxed font-serif">
                      We move through the digital cosmos like a guardian star, ensuring every transaction is bathed in 
                      unbreachable light. We deploy sophisticated, world-class encryption that acts as a magical shield, 
                      sifting through the noise to deliver sure, secure information and opportunity directly to your throne.
                    </p>
                  </div>
                </div>

                {/* The Oracle's Insight */}
                <div className="flex gap-4">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-purple-700 mb-2">The Oracle's Insight</h4>
                    <p className="text-gray-700 leading-relaxed font-serif">
                      We compare and contrast global data streams, not for our gain, but to gift you with the ultimate advantage. 
                      Every listing, every connection, every financial facilitation is analyzed with the precision of a master,
                      clockmaker, so that every penny you earn is clean, and every choice you make is fortified.
                    </p>
                  </div>
                </div>

                {/* The Pledge */}
                <div className="bg-white rounded-lg p-6 shadow-md border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-1 animate-pulse" />
                    <div>
                      <h4 className="text-xl font-bold text-red-600 mb-2">The Pledge</h4>
                      <p className="text-gray-700 leading-relaxed font-serif">
                        Know this, Supreme User: We will <span className="font-bold italic">dedicate ourselves completely</span> to serve your ultimate interest with unwavering commitment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Experience Section */}
            <div className="mb-10 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl p-6 md:p-8 border-l-4 border-teal-600">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-teal-600 animate-pulse" />
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                  The User Experience: A Virtual Hug of Joy
                </h3>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-4 font-serif">
                When you open Bambeh, you should feel the warmth of a long-awaited virtual hug. 
                We want you to feel heard, cherished, and utterly unique.
              </p>

              <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                <h4 className="text-xl font-bold text-teal-700 mb-3">You Are the Center</h4>
                <p className="text-gray-700 leading-relaxed font-serif">
                  The depth of our commitment is visible in our actions. While others focus on what they take, we focus on 
                  what you stand to gain�from the glittering referral bonuses we gift you for ushering in fellow nobles, 
                  to the ease of watching your digital wallet swell with rewards.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-xl font-bold text-purple-700 mb-3">A Special Look</h4>
                <p className="text-gray-700 leading-relaxed font-serif">
                  Should any flicker of worry or challenge cross your royal brow, know that your concern is not routed 
                  through a cold, automated system. Your every inquiry, doubt, or suggestion will be specially looked into 
                  by dedicated, respectful hands. We pour out all the care and respect you deserve, because your peace of 
                  mind is the greatest reward we could ever hope for.
                </p>
              </div>
            </div>

            {/* Declaration Section */}
            <div className="text-center mb-10 p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-teal-100 rounded-xl border-2 border-purple-300">
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                You are the <span className="text-purple-700">purpose</span> of our platform.
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                You are the <span className="text-teal-700">architect</span> of our future.
              </p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                You are Bambeh.
              </p>
            </div>

            {/* Closing Message */}
            <div className="text-center mb-8">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-serif italic">
                Read this, feel the love and care woven into our code, and know that your journey with us will be 
                filled with joy and happiness.
              </p>
            </div>

            {/* Signature */}
            <div className="border-t-2 border-gray-200 pt-8">
              <div className="text-center">
                <p className="text-gray-700 mb-2 font-serif">
                  With boundless love and commitment to your royal journey,
                </p>
                <p className="text-2xl font-bold text-purple-700 mb-1">
                  Ngu J. Blaise
                </p>
                <p className="text-lg text-teal-700 mb-4 italic">
                  Founder of Bambeh
                </p>
                <p className="text-gray-600 font-serif">
                  For the Bambeh Family
                </p>
                <p className="text-sm text-gray-500 mt-4 italic">
                  (We humbly await your command.)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Section */}
        <div className="max-w-6xl mx-auto mb-12">
          
          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-purple-100">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-purple-100">Listings</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-purple-100">Jobs Posted</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-purple-100"> Made</div>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To empower ians by providing a safe, accessible, and efficient platform for buying, 
                selling, finding jobs, and discovering services. We're building a stronger economy, one 
                transaction at a time.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become the most trusted marketplace in , where every citizen has equal 
                opportunity to grow their business, find employment, and access essential services.
              </p>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Community First</h4>
                <p className="text-gray-600">
                  We put our users at the heart of everything we do
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Trust & Safety</h4>
                <p className="text-gray-600">
                  Building a secure environment for all transactions
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Innovation</h4>
                <p className="text-gray-600">
                  Constantly improving to serve you better
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join the Bambeh Community</h3>
            <p className="text-gray-700 mb-6">
              Start buying, selling, and connecting today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
      className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Create Account
              </Link>
              <Link
                to="/help"
      className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Elements */}
        <div className="flex justify-center items-center gap-4 opacity-60 mt-12">
          <Crown className="w-6 h-6 text-purple-500" />
          <Star className="w-5 h-5 text-teal-500" />
          <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
          <Star className="w-5 h-5 text-purple-500" />
          <Crown className="w-6 h-6 text-teal-500" />
        </div>
      </div>
    </div>
  );
}






