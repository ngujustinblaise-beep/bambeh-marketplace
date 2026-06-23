/**
 * ---------------------------------------------------------------------------
 * GOOGLE MAP TRACKER - ORDER TRACKING WITH MAPS
 * ---------------------------------------------------------------------------
 * 
 * Complete order tracking with Google Maps:
 * - Real-time location tracking
 * - Route visualization
 * - Delivery status updates
 * - ETA calculation
 * - Driver contact info
 * 
 * FILE LOCATION: src/components/tracking/GoogleMapTracker.tsx
 * 
 * © 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Package,
  Truck,
  Clock,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle,
  Circle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  Shield,
  ExternalLink,
  Copy,
  Zap
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface DeliveryStep {
  id: string;
  status: 'completed' | 'current' | 'pending';
  title: string;
  description: string;
  timestamp?: string;
  location?: Location;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  rating: number;
  vehicleType: string;
  vehiclePlate: string;
}

interface OrderTracking {
  orderId: string;
  status: 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation: Location;
  pickupLocation: Location;
  deliveryLocation: Location;
  driver?: Driver;
  estimatedDelivery: string;
  steps: DeliveryStep[];
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// SAMPLE DATA
// ---------------------------------------------------------------------------

const sampleTracking: OrderTracking = {
  orderId: 'ORD-12345',
  status: 'in_transit',
  currentLocation: {
    lat: 4.0511,
    lng: 9.7679,
    address: 'Akwa, Douala'
  },
  pickupLocation: {
    lat: 4.0611,
    lng: 9.7579,
    address: 'TechZone Store, Bonapriso, Douala'
  },
  deliveryLocation: {
    lat: 4.0411,
    lng: 9.7779,
    address: 'Rue de la Joie, Bonanjo, Douala'
  },
  driver: {
    id: 'd1',
    name: 'Emmanuel Fon',
    phone: '+237 699 123 456',
    rating: 4.8,
    vehicleType: 'Motorcycle',
    vehiclePlate: 'LT 234 AB'
  },
  estimatedDelivery: '2025-01-10T16:30:00Z',
  steps: [
    {
      id: 's1',
      status: 'completed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared',
      timestamp: '2025-01-10T10:00:00Z'
    },
    {
      id: 's2',
      status: 'completed',
      title: 'Picked Up',
      description: 'Driver has picked up your package',
      timestamp: '2025-01-10T11:30:00Z',
      location: { lat: 4.0611, lng: 9.7579, address: 'TechZone Store, Bonapriso' }
    },
    {
      id: 's3',
      status: 'current',
      title: 'In Transit',
      description: 'Your package is on the way',
      timestamp: '2025-01-10T14:00:00Z',
      location: { lat: 4.0511, lng: 9.7679, address: 'Akwa, Douala' }
    },
    {
      id: 's4',
      status: 'pending',
      title: 'Out for Delivery',
      description: 'Driver is approaching your location'
    },
    {
      id: 's5',
      status: 'pending',
      title: 'Delivered',
      description: 'Package delivered successfully'
    }
  ],
  lastUpdated: '2025-01-10T14:00:00Z'
};

// ---------------------------------------------------------------------------
// MAP PLACEHOLDER COMPONENT (Replace with actual Google Maps)
// ---------------------------------------------------------------------------

const MapPlaceholder = ({ 
  pickupLocation, 
  deliveryLocation, 
  currentLocation,
  showRoute = true 
}: { 
  pickupLocation: Location;
  deliveryLocation: Location;
  currentLocation: Location;
  showRoute?: boolean;
}) => {
  // This is a placeholder. In production, use @react-google-maps/api
  // or leaflet for actual map implementation
  
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-100 rounded-xl overflow-hidden">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#888" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route Line */}
      {showRoute && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 20 70 Q 40 50, 50 40 Q 60 30, 80 25"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeDasharray="4 2"
            fill="none"
          />
        </svg>
      )},
      {/* Pickup Marker */}
      <div className="absolute left-[20%] top-[70%] transform -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div className="w-2 h-4 bg-green-500 -mt-1" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          <span className="mt-1 px-2 py-0.5 bg-white rounded text-xs font-medium shadow">Pickup</span>
        </div>
      </div>

      {/* Current Location Marker */}
      <div className="absolute left-[50%] top-[40%] transform -translate-x-1/2 -translate-y-full animate-bounce">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-purple-300">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="w-3 h-5 bg-purple-600 -mt-1" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          <span className="mt-1 px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-medium shadow">Driver</span>
        </div>
      </div>

      {/* Delivery Marker */}
      <div className="absolute left-[80%] top-[25%] transform -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="w-2 h-4 bg-red-500 -mt-1" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          <span className="mt-1 px-2 py-0.5 bg-white rounded text-xs font-medium shadow">Delivery</span>
        </div>
      </div>

      {/* Map Controls Placeholder */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50">
          <span className="text-xl font-bold text-gray-700">+</span>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50">
          <span className="text-xl font-bold text-gray-700">-</span>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50">
          <Navigation className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Google Maps Attribution Placeholder */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 rounded text-xs text-gray-500">
        Map powered by Google Maps
      </div>
    </div>
  );

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// --------------------

}
export default function GoogleMapTracker() {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState<OrderTracking>(sampleTracking);
  const [showDetails, setShowDetails] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would fetch from API
      setTracking(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refresh tracking
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTracking(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString()
    }));
    setIsRefreshing(false);

  // Get status display
  const getStatusDisplay = () => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      processing: { label: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      picked_up: { label: 'Picked Up', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      in_transit: { label: 'In Transit', color: 'text-orange-700', bgColor: 'bg-orange-100' },
      out_for_delivery: { label: 'Out for Delivery', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
    };
    return statusMap[tracking.status] || statusMap.processing;
  };

  const status = getStatusDisplay();

  // Calculate ETA
  const getETA = () => {
    const eta = new Date(tracking.estimatedDelivery);
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    
    if (diff <= 0) return 'Arriving now';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/orders" className="p-2 hover:bg-white/20 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-lg font-bold">Track Order</h1>
                <p className="text-sm text-purple-200">{tracking.orderId}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <MapPlaceholder
          pickupLocation={tracking.pickupLocation}
          deliveryLocation={tracking.deliveryLocation}
          currentLocation={tracking.currentLocation}
        />

        {/* Floating Status Card */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                  {status.label}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  Last updated: {new Date(tracking.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Estimated arrival</p>
                <p className="text-lg font-bold text-purple-600">{getETA()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-10 pb-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Driver Info */}
          {tracking.driver && (
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {tracking.driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tracking.driver.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{tracking.driver.rating}</span>
                      <span>•</span>
                      <span>{tracking.driver.vehicleType}</span>
                      <span>•</span>
                      <span className="font-mono">{tracking.driver.vehiclePlate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${tracking.driver.phone}`}
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <button className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )},
          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b"
          >
            <span className="font-medium text-gray-900">Delivery Progress</span>
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {/* Delivery Steps */}
          {showDetails && (
            <div className="p-4">
              <div className="space-y-0">
                {tracking.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'current' ? 'bg-purple-500 text-white animate-pulse' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === 'current' ? (
                          <Truck className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      {index < tracking.steps.length - 1 && (
                        <div className={`w-0.5 h-16 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <h4 className={`font-medium ${
                        step.status === 'completed' ? 'text-gray-900' :
                        step.status === 'current' ? 'text-purple-700' :
                        'text-gray-400'
                      }`}>
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(step.timestamp).toLocaleString()}
                        </p>
                      )}
                      {step.location && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {step.location.address}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )},
          {/* Addresses */}
          <div className="border-t p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-gray-900">{tracking.pickupLocation.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Delivery</p>
                <p className="font-medium text-gray-900">{tracking.deliveryLocation.address}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t p-4 flex gap-3">
            <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
              <Copy className="w-5 h-5" />
              Copy Tracking
            </button>
            <Link
              to={`/help/contact?order=${tracking.orderId}`}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Report Issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
}




