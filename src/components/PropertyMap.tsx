import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  address, 
  latitude = 3.8480, 
  longitude = 11.5021 
}) => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{address}</p>
          
          <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Map View</p>
              <p className="text-xs text-muted-foreground">
                Coordinates: {latitude}, {longitude}
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
      className="text-sm text-primary hover:underline block"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

}
export default PropertyMap;






