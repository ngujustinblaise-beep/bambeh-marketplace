import React from "react";
import { useParams, Link } from "react-router-dom";

const JobsCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const label = category
    ? decodeURIComponent(category).replace(/-/g, " ")
    : "All";

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link to="/jobs" className="hover:text-teal-600">
          Jobs
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium capitalize">{label}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
        {label} Jobs
      </h1>
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl shrink-0">
                🏢
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  Sample {label} Job {i + 1}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Yaounde,  · Full-time
                </p>
                <p className="text-sm text-teal-600 font-medium mt-2">
                  200,000 XAF/month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}
export default JobsCategory;

