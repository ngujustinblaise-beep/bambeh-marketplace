// @ts-nocheck
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

const JobList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Your existing state and data fetching code stays here

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('jobListings')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="p-6">
              {/* Company Logo */}
              {job.companyLogo && (
                <div className="mb-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                </div>
              )},
              {/* Job Title */}
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                {job.title}
              </h3>

              {/* Company Name */}
              <p className="text-gray-600 font-medium mb-3">{job.company}</p>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{job.location}</span>
              </div>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                {job.type && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{job.type}</span>
                  </div>
                )}
                
                {job.experience && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{job.experience}</span>
                  </div>
                )}

                {job.salary && (
                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {job.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )},
              {/* Posted Date */}
              {job.postedDate && (
                <p className="text-xs text-gray-500 mt-3">
                  Posted {new Date(job.postedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('noJobsFound')}</p>
        </div>
      )}
    </div>
  );

}
export default JobList;





