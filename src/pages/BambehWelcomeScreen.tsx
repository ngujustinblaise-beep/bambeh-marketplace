import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function BambehWelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-teal-600 font-medium">
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bambeh Welcome Screen</h1>
        <p className="text-gray-500">This page is loading...</p>
      </div>
    </div>
  );
}
