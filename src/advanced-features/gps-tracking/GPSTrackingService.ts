// @ts-nocheck
/**
 * BAMBÉ MARKETPLACE - GPS TRACKING SERVICE
 * Real-time location tracking and route calculation
 * Version: 1.0.0
 */

import { Geolocation } from "@capacitor/geolocation";
import { Location, RouteInfo, TrackingSession, DriverLocation } from "../types";
import ENV_CONFIG from "../config/env.config";

class GPSTrackingService {
  private watchId: string | null = null;
  private socket: WebSocket | null = null;
  private trackingSessions: Map<string, TrackingSession> = new Map();

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  /**
   * Get current position
   */
  async getCurrentPosition(): Promise<Location | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        timestamp: position.timestamp,
      };
    } catch (error) {
      console.error("Error getting current position:", error);
      return null;
    }
  }

  /**
   * Start watching position
   */
  async startWatchingPosition(
    callback: (location: Location) => void,
  ): Promise<void> {
    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
        (position, err) => {
          if (err) {
            console.error("Watch position error:", err);
            return;
          }

          if (position) {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              timestamp: position.timestamp,
            };
            callback(location);
          }
        },
      );
    } catch (error) {
      console.error("Error starting position watch:", error);
    }
  }

  /**
   * Stop watching position
   */
  async stopWatchingPosition(): Promise<void> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  /**
   * Calculate distance between two points (in meters)
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = this.toRadians(point1.latitude);
    const lat2 = this.toRadians(point2.latitude);
    const deltaLat = this.toRadians(point2.latitude - point1.latitude);
    const deltaLng = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Calculate ETA based on distance and speed
   */
  calculateETA(
    distanceInMeters: number,
    speedInMetersPerSecond: number = 8.33,
  ): string {
    // Default speed: 8.33 m/s (≈30 km/h for city traffic)
    const timeInSeconds = distanceInMeters / speedInMetersPerSecond;
    const minutes = Math.round(timeInSeconds / 60);

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  /**
   * Get route between two points using Google Directions API
   */
  async getRoute(
    origin: Location,
    destination: Location,
    mode: "driving" | "walking" | "bicycling" = "driving",
  ): Promise<RouteInfo | null> {
    try {
      const directionsService = new google.maps.DirectionsService();

      const request: google.maps.DirectionsRequest = {
        origin: { lat: origin.latitude, lng: origin.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
        travelMode:
          google.maps.TravelMode[
            mode.toUpperCase() as keyof typeof google.maps.TravelMode
          ],
      };

      return new Promise((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === "OK" && result) {
            const route = result.routes[0];
            const leg = route.legs[0];

            const routeInfo: RouteInfo = {
              distance: leg.distance?.text || "",
              duration: leg.duration?.text || "",
              distanceValue: leg.distance?.value || 0,
              durationValue: leg.duration?.value || 0,
              polyline: route.overview_polyline || "",
            };

            resolve(routeInfo);
          } else {
            console.error("Directions request failed:", status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Error getting route:", error);
      return null;
    }
  }

  /**
   * Connect to real-time tracking WebSocket
   */
  connectToTrackingServer(
    orderId: string,
    onUpdate: (data: any) => void,
  ): void {
    try {
      this.socket = new WebSocket(`${ENV_CONFIG.API.WEBSOCKET_URL}/tracking`);

      this.socket.onopen = () => {
        console.log("Connected to tracking server");
        this.socket?.send(
          JSON.stringify({
            type: "subscribe",
            orderId: orderId,
          }),
        );
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onUpdate(data);
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.socket.onclose = () => {
        console.log("Disconnected from tracking server");
      };
    } catch (error) {
      console.error("Error connecting to tracking server:", error);
    }
  }

  /**
   * Disconnect from tracking server
   */
  disconnectFromTrackingServer(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send location update to server
   */
  sendLocationUpdate(orderId: string, location: Location): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "location_update",
          orderId: orderId,
          location: location,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  /**
   * Helper: Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if location is within geofence
   */
  isWithinGeofence(
    currentLocation: Location,
    centerLocation: Location,
    radiusInMeters: number,
  ): boolean {
    const distance = this.calculateDistance(currentLocation, centerLocation);
    return distance <= radiusInMeters;
  }

  /**
   * Create a tracking session
   */
  createTrackingSession(session: TrackingSession): void {
    this.trackingSessions.set(session.sessionId, session);
  }

  /**
   * Get tracking session
   */
  getTrackingSession(sessionId: string): TrackingSession | undefined {
    return this.trackingSessions.get(sessionId);
  }

  /**
   * Update tracking session
   */
  updateTrackingSession(
    sessionId: string,
    updates: Partial<TrackingSession>,
  ): void {
    const session = this.trackingSessions.get(sessionId);
    if (session) {
      this.trackingSessions.set(sessionId, { ...session, ...updates });
    }
  }

  /**
   * End tracking session
   */
  endTrackingSession(sessionId: string): void {
    this.trackingSessions.delete(sessionId);
  }
}

export default new GPSTrackingService();

