import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Rocket className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Getting Started</h1>
              <p className="text-blue-100">Welcome to Bambeh!</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h2>
            <p className="text-gray-700">
              Let's get you started on Bambeh in 3 easy steps.
            </p>
          </section>
          <div className="space-y-4">
            <Link
              to="/help/creating-account"
      className="block p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-bold text-gray-900">
                1. Create Your Account
              </h3>
            </Link>
            <Link
              to="/help/profile-setup"
      className="block p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-bold text-gray-900">
                2. Set Up Your Profile
              </h3>
            </Link>
            <Link
              to="/help/understanding-zerm-coins"
      className="block p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-bold text-gray-900">
                3. Understand Zerm Coins
              </h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
