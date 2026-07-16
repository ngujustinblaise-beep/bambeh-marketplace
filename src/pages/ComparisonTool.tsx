import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ComparisonTool: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comparedItems, setComparedItems] = useState<any[]>([]);

  useEffect(() => {
    // Load compared items from localStorage
    const saved = localStorage.getItem('Bambeh_comparison');
    if (saved) {
      try {
        setComparedItems(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading comparison:', error);
      }
    }
  }, []);

  const removeItem = (index: number) => {
    const updated = comparedItems.filter((_, i) => i !== index);
    setComparedItems(updated);
    localStorage.setItem('Bambeh_comparison', JSON.stringify(updated));
    toast({
      title: 'Item removed',
      description: 'Item removed from comparison',
    });
  };

  const clearAll = () => {
    setComparedItems([]);
    localStorage.removeItem('Bambeh_comparison');
    toast({
      title: 'Comparison cleared',
      description: 'All items removed from comparison',
    });
  };

  const addNewItem = () => {
    toast({
      title: 'Add items to compare',
      description: 'Browse products and click "Add to Compare"',
    });
    navigate('/products');
  };

  if (comparedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Compare Items</h1>
                <p className="text-sm text-gray-600">Side-by-side comparison</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Items to Compare
              </h3>
              <p className="text-gray-600 mb-6">
                Add items from product listings to compare them side-by-side
              </p>
              <Button onClick={addNewItem}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract common features to compare
  const allFeatures = new Set<string>();
  comparedItems.forEach(item => {
    if (item.features) {
      item.features.forEach((f: string) => allFeatures.add(f));
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Compare Items</h1>
                <p className="text-sm text-gray-600">
                  Comparing {comparedItems.length} item(s)
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="overflow-x-auto">
          <div className="inline-flex gap-4 min-w-full">
            {comparedItems.map((item, index) => (
              <Card key={index} className="flex-1 min-w-[300px]">
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {item.images && item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <CardTitle className="text-lg line-clamp-2">
                    {item.title}
                  </CardTitle>
                  
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {parseFloat(item.price || 0).toLocaleString()} {item.currency || 'XAF'}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Basic Details */}
                  {item.condition && (
                    <div>
                      <p className="text-sm text-gray-600">Condition</p>
                      <Badge variant="secondary" className="capitalize">
                        {item.condition}
                      </Badge>
                    </div>
                  )}

                  {item.brand && (
                    <div>
                      <p className="text-sm text-gray-600">Brand</p>
                      <p className="font-medium">{item.brand}</p>
                    </div>
                  )}

                  {item.model && (
                    <div>
                      <p className="text-sm text-gray-600">Model</p>
                      <p className="font-medium">{item.model}</p>
                    </div>
                  )}

                  {item.year && (
                    <div>
                      <p className="text-sm text-gray-600">Year</p>
                      <p className="font-medium">{item.year}</p>
                    </div>
                  )}

                  {item.location && (
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{item.location}</p>
                    </div>
                  )}

                  {/* Features Comparison */}
                  {allFeatures.size > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Features</p>
                      <div className="space-y-1">
                        {Array.from(allFeatures).map(feature => {
                          const hasFeature = item.features?.includes(feature);
                          return (
                            <div
                              key={feature}
                              className="flex items-center gap-2 text-sm"
                            >
                              {hasFeature ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-300" />
                              )}
                              <span className={hasFeature ? '' : 'text-gray-400'}>
                                {feature}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Add More Card */}
            {comparedItems.length < 4 && (
              <Card className="flex-1 min-w-[300px] border-dashed">
                <CardContent className="p-12 flex flex-col items-center justify-center h-full">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={addNewItem}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Another Item
                  </Button>
                  <p className="text-sm text-gray-600 mt-4">
                    Compare up to 4 items
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;
