// src/services/carRentals.service.ts
import axios from "axios";

const API_BASE_URL = "https://your-backend-api.com/api";

// ============================================
// TYPES
// ============================================
export interface CarRental {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  currency: string;
  location: string;
  transmission: "automatic" | "manual";
  fuelType: string;
  seats: number;
  features: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  contactPhone: string;
  rating: number;
  reviews: number;
  available: boolean;
  createdAt: Date;
}

export interface CarRentalData {
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  location: string;
  transmission: "automatic" | "manual";
  fuelType: string;
  seats: number;
  features: string[];
  images: string[];
  contactPhone: string;
}

export interface CarRentalFilters {
  category?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  seats?: number;
  search?: string;
}

export interface BookingData {
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverDetails: {
    name: string;
    phone: string;
    licenseNumber: string;
  };
}

// ============================================
// HELPER: GET AUTH HEADERS
// ============================================
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  const headers: any = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// ============================================
// HELPER: HANDLE AUTH ERRORS
// ============================================
const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Fetch all car rentals with optional filters
 */
export const getCarRentals = async (
  filters?: CarRentalFilters,
): Promise<CarRental[]> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(`${API_BASE_URL}/car-rentals`, {
      headers,
      params: filters,
      timeout: 10000,
    });

    return response.data.data.carRentals || [];
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch car rentals",
    );
  }
};

/**
 * Get car rental by ID
 */
export const getCarRentalById = async (carId: string): Promise<CarRental> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(`${API_BASE_URL}/car-rentals/${carId}`, {
      headers,
      timeout: 10000,
    });

    return response.data.data.carRental;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch car rental details",
    );
  }
};

/**
 * Create a new car rental listing
 */
export const createCarRental = async (
  carData: CarRentalData,
): Promise<CarRental> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}/car-rentals/create`,
      carData,
      { headers, timeout: 10000 },
    );

    return response.data.data.carRental;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to create car rental",
    );
  }
};

/**
 * Update an existing car rental
 */
export const updateCarRental = async (
  carId: string,
  carData: Partial<CarRentalData>,
): Promise<CarRental> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.put(
      `${API_BASE_URL}/car-rentals/${carId}`,
      carData,
      { headers, timeout: 10000 },
    );

    return response.data.data.carRental;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to update car rental",
    );
  }
};

/**
 * Delete a car rental listing
 */
export const deleteCarRental = async (carId: string): Promise<void> => {
  try {
    const headers = getAuthHeaders();

    await axios.delete(`${API_BASE_URL}/car-rentals/${carId}`, {
      headers,
      timeout: 10000,
    });
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to delete car rental",
    );
  }
};

/**
 * Book a car rental
 */
export const bookCarRental = async (
  carId: string,
  bookingData: BookingData,
): Promise<any> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}/car-rentals/${carId}/book`,
      bookingData,
      { headers, timeout: 10000 },
    );

    return response.data.data.booking;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to book car rental",
    );
  }
};

/**
 * Get user's car rental listings
 */
export const getMyCarRentals = async (): Promise<CarRental[]> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(`${API_BASE_URL}/car-rentals/my-rentals`, {
      headers,
      timeout: 10000,
    });

    return response.data.data.carRentals || [];
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch your car rentals",
    );
  }
};

/**
 * Get user's car rental bookings
 */
export const getMyCarBookings = async (): Promise<any[]> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(
      `${API_BASE_URL}/car-rentals/my-bookings`,
      { headers, timeout: 10000 },
    );

    return response.data.data.bookings || [];
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch your car bookings",
    );
  }
};
