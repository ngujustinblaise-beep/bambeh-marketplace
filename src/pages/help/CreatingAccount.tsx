import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

export default function CreatingAccount() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <UserPlus className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Creating an Account</h1>
              <p className="text-green-100">Join Bambeh today!</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Sign Up
            </h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-green-600">1.</span>
                <span>Click "Sign Up" in the header</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">2.</span>
                <span>Enter your email and create a password</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">3.</span>
                <span>Verify your email address</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">4.</span>
                <span>Complete your profile</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">5.</span>
                <span>Start browsing and posting!</span>
              </li>
            </ol>
          </section>
          <Link
            to="/register"
      className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Create Account Now
          </Link>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/help"
      className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
