// @ts-nocheck
/**
 * BAMBÃ‰ MARKETPLACE - GPS TRACKING COMPONENT
 * Version: 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import GPSTrackingService from './GPSTrackingService';
import { Location, DriverLocation, TrackingSession } from '../types';
import ENV_CONFIG from '../config/env.config';
import './GPSTracking.css';

interface GPSTrackingProps {
  orderId: string;
  trackingSessionId: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  onStatusChange?: (status: string) => void;
}

const GPSTrackingADVANCED: React.FC<GPSTrackingProps> = ({
  orderId, trackingSessionId, pickupLocation, deliveryLocation, onStatusChange,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [driverLocation, setDriverLocation]   = useState<DriverLocation | null>(null);
  const [directions, setDirections]           = useState<google.maps.DirectionsResult | null>(null);
  const [eta, setEta]                         = useState<string>('Calculating...');
  const [distance, setDistance]               = useState<string>('--');
  const [status, setStatus]                   = useState<string>('pending');
  const [isLoading, setIsLoading]             = useState<boolean>(true);
  const [error, setError]                     = useState<string | null>(null);
  const [showDriverInfo, setShowDriverInfo]   = useState<boolean>(false);
  const [trackingHistory, setTrackingHistory] = useState<Location[]>([]);

  const mapRef      = useRef<google.maps.Map | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const mapContainerStyle = ENV_CONFIG.GOOGLE_MAPS.MAP_STYLES;
  const center = currentLocation || ENV_CONFIG.GOOGLE_MAPS.DEFAULT_CENTER;
  const zoom   = ENV_CONFIG.GOOGLE_MAPS.DEFAULT_ZOOM;

  useEffect(() => {
    initializeTracking();
    return () => { cleanup(); };
  }, [orderId]);

  const initializeTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hasPermission = await GPSTrackingService.requestPermissions();
      if (!hasPermission) {
        setError('Location permission denied. Please enable location services.');
        setIsLoading(false);
        return;
      }

      const position = await GPSTrackingService.getCurrentPosition();
      if (position) setCurrentLocation(position);

      GPSTrackingService.connectToTrackingServer(orderId, handleTrackingUpdate);
      await GPSTrackingService.startWatchingPosition(handleLocationUpdate);

      intervalRef.current = setInterval(() => { updateRoute(); }, 30000);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing tracking:', err);
      setError('Failed to initialize tracking. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = useCallback((location: Location) => {
    setCurrentLocation(location);
    setTrackingHistory(prev => [...prev, location].slice(-50));
    GPSTrackingService.sendLocationUpdate(orderId, location);

    const distanceToDestination = GPSTrackingService.calculateDistance(location, deliveryLocation);
    if (distanceToDestination < 100 && status !== 'nearby') {
      setStatus('nearby');
      onStatusChange?.('nearby');
    } else if (distanceToDestination < 50 && status !== 'delivered') {
      setStatus('delivered');
      onStatusChange?.('delivered');
    }
  }, [orderId, deliveryLocation, status, onStatusChange]);

  const handleTrackingUpdate = useCallback((data: any) => {
    if (data.type === 'driver_location') {
      setDriverLocation(data.location);
      updateRoute();
    } else if (data.type === 'status_change') {
      setStatus(data.status);
      onStatusChange?.(data.status);
    }
  }, [onStatusChange]);

  const updateRoute = async () => {
    if (!driverLocation) return;
    const route = await GPSTrackingService.getRoute(
      { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
      deliveryLocation,
      'driving',
    );
    if (route) {
      setDistance(route.distance);
      setEta(route.duration);
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: driverLocation.latitude, lng: driverLocation.longitude },
          destination: { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') setDirections(result);
        },
      );
    }
  };

  const cleanup = () => {
    GPSTrackingService.stopWatchingPosition();
    GPSTrackingService.disconnectFromTrackingServer();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: pickupLocation.latitude, lng: pickupLocation.longitude });
    bounds.extend({ lat: deliveryLocation.latitude, lng: deliveryLocation.longitude });
    if (driverLocation) bounds.extend({ lat: driverLocation.latitude, lng: driverLocation.longitude });
    map.fitBounds(bounds);
  }, [pickupLocation, deliveryLocation, driverLocation]);

  const getStatusInfo = () => {
    const statusMap: Record<string, { text: string; color: string; icon: string }> = {
      pending:    { text: 'Order Pending',    color: '#FFA500', icon: 'â³' },
      confirmed:  { text: 'Order Confirmed',  color: '#4CAF50', icon: 'âœ“'  },
      assigned:   { text: 'Driver Assigned',  color: '#2196F3', icon: 'ðŸ‘¤' },
      picked_up:  { text: 'Order Picked Up',  color: '#9C27B0', icon: 'ðŸ“¦' },
      in_transit: { text: 'In Transit',       color: '#FF9800', icon: 'ðŸš—' },
      nearby:     { text: 'Driver Nearby',    color: '#4CAF50', icon: 'ðŸ“' },
      delivered:  { text: 'Delivered',        color: '#4CAF50', icon: 'ðŸŽ‰' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo();

  if (isLoading) {
    return (
      <div className="gps-tracking-container">
        <div className="loading-state"><div className="spinner"></div><p>Initializing tracking...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gps-tracking-container">
        <div className="error-state">
          <span className="error-icon">âš Ã¯Â¸Â</span>
          <p>{error}</p>
          <button onClick={initializeTracking} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gps-tracking-container">
      <div className="tracking-header">
        <div className="status-badge" style={{ backgroundColor: statusInfo.color }}>
          <span className="status-icon">{statusInfo.icon}</span>
          <span className="status-text">{statusInfo.text}</span>
        </div>
        <div className="tracking-stats">
          <div className="stat-item"><span className="stat-label">ETA</span><span className="stat-value">{eta}</span></div>
          <div className="stat-item"><span className="stat-label">Distance</span><span className="stat-value">{distance}</span></div>
        </div>
      </div>

      <div className="map-container">
        <LoadScript googleMapsApiKey={ENV_CONFIG.GOOGLE_MAPS.API_KEY} libraries={ENV_CONFIG.GOOGLE_MAPS.LIBRARIES as any}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center as any}
            zoom={zoom}
            onLoad={onMapLoad}
            options={{ zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
          >
            <Marker
              position={{ lat: pickupLocation.latitude, lng: pickupLocation.longitude }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', scaledSize: new google.maps.Size(40, 40) }}
              title="Pickup Location"
            />
            <Marker
              position={{ lat: deliveryLocation.latitude, lng: deliveryLocation.longitude }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', scaledSize: new google.maps.Size(40, 40) }}
              title="Delivery Location"
            />
            {driverLocation && (
              <>
                <Marker
                  position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', scaledSize: new google.maps.Size(50, 50) }}
                  title={driverLocation.driverName}
                  onClick={() => setShowDriverInfo(!showDriverInfo)}
                />
                {showDriverInfo && (
                  <InfoWindow position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }} onCloseClick={() => setShowDriverInfo(false)}>
                    <div className="driver-info-window">
                      <h4>{driverLocation.driverName}</h4>
                      <p>Vehicle: {driverLocation.vehicleType}</p>
                      <p>Speed: {Math.round(driverLocation.speed * 3.6)} km/h</p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{ polylineOptions: { strokeColor: '#4CAF50', strokeWeight: 5, strokeOpacity: 0.7 }, suppressMarkers: true }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {driverLocation && (
        <div className="driver-info-card">
          <div className="driver-avatar"><span>{driverLocation.driverName.charAt(0)}</span></div>
          <div className="driver-details">
            <h4>{driverLocation.driverName}</h4>
            <p className="driver-vehicle">{driverLocation.vehicleType}</p>
          </div>
          <div className="driver-status">
            <span className={`status-indicator ${driverLocation.isActive ? 'active' : 'inactive'}`}>
              {driverLocation.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}

      <div className="live-updates">
        <div className="update-header">
          <span className="pulse-dot"></span>
          <span className="update-title">Live Updates</span>
        </div>
        <div className="update-content">
          {status === 'nearby'     && <p>ðŸš— Driver is nearby! Please be ready to receive your order.</p>}
          {status === 'in_transit' && <p>ðŸ“¦ Your order is on the way. ETA: {eta}</p>}
          {status === 'picked_up'  && <p>âœ“ Driver has picked up your order and is heading your way.</p>}
        </div>
      </div>
    </div>
  );
};

export default GPSTrackingADVANCED;






