import React from "react";
import { useParams, Link } from "react-router-dom";

const MarketplaceCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const label = category
    ? decodeURIComponent(category).replace(/-/g, " ")
    : "All";

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link to="/marketplace" className="hover:text-teal-600">
          Marketplace
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium capitalize">{label}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
        {label}
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="w-full h-40 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center text-4xl">
              🛍️
            </div>
            <div className="p-3">
              <p className="font-medium text-gray-800 text-sm">
                Sample item {i + 1}
              </p>
              <p className="text-sm font-bold text-teal-600 mt-1">15,000 XAF</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}
export default MarketplaceCategory;
