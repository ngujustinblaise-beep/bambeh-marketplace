import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSearch } from '@/contexts/SearchContext';
import { useToast } from '@/hooks/use-toast';
import { useLang, t } from "@/hooks/useAppLang";

const SavedSearches: React.FC = () => {
  const navigate = useNavigate();
  const { recentSearches, clearRecentSearches } = useSearch();
  const { toast } = useToast();

  const handleSearchClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleClearAll = () => {
    clearRecentSearches();
    toast({
      title: 'Searches cleared',
      description: 'All recent searches have been removed',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Recent Searches</h1>
                <p className="text-sm text-gray-600">Your search history</p>
              </div>
            </div>
            {recentSearches.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {recentSearches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Searches</h3>
              <p className="text-gray-600 mb-6">Your search history will appear here</p>
              <Button onClick={() => navigate('/search')}>
                <Search className="h-4 w-4 mr-2" />Start Searching
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentSearches.map((search, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSearchClick(search)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{search}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const searches = recentSearches.filter((_, i) => i !== index);
                        localStorage.setItem('bambe-recent-searches', JSON.stringify(searches));
                        window.location.reload();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
