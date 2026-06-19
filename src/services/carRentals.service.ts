// src/services/carRentals.service.ts
import axios from "axios";
import {
  API_CONFIG,
  getAuthHeaders,
  handleAuthError,
  formatErrorMessage
} from "./api.config";

// ============================================
// TYPES
// ============================================
export interface CarRental {
  id: string;
  make: string;
  model: string;
  year: number;
  type: "sedan" | "suv" | "truck" | "van" | "luxury" | "economy";
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  seats: number;
  pricePerDay: number;
  currency: string;
  features: string[];
  images: string[];
  location: string;
  ownerId: string;
  ownerName: string;
  ownerContact: string;
  availability: {
    available: boolean;
    bookedDates: Date[];
  };
  rating: number;
  reviews: number;
  status: "available" | "rented" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCarRentalData {
  make: string;
  model: string;
  year: number;
  type: "sedan" | "suv" | "truck" | "van" | "luxury" | "economy";
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  seats: number;
  pricePerDay: number;
  currency: string;
  features: string[];
  images: string[];
  location: string;
  ownerContact: string;
}

export interface CarRentalFilters {
  type?: string;
  transmission?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
  location?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CarBooking {
  id: string;
  carId: string;
  userId: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
  createdAt: Date;
}

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Get all car rentals with optional filters
 */
export const getCarRentals = async (
  filters?: CarRentalFilters,
): Promise<CarRental[]> => {
  try {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.transmission) params.append("transmission", filters.transmission);
    if (filters?.fuelType) params.append("fuelType", filters.fuelType);
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.minSeats) params.append("minSeats", filters.minSeats.toString());
    if (filters?.location) params.append("location", filters.location);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const url = `${API_CONFIG.GET_MARKETPLACE_ITEMS}/car-rentals${params.toString() ? "?" + params.toString() : ""}`;

    const response = await axios.get(url, {
      timeout: API_CONFIG.TIMEOUT.DEFAULT,
    });

    return response.data.data.cars || [];
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Failed to fetch car rentals"));
  }
};

/**
 * Get single car rental by ID
 */
export const getCarRentalById = async (carId: string): Promise<CarRental> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.GET_MARKETPLACE_ITEMS}/car-rentals/${carId}`,
      { timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.car;
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Failed to fetch car details"));
  }
};

/**
 * Create new car rental listing
 */
export const createCarRental = async (
  carData: CreateCarRentalData,
): Promise<CarRental> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/car-rentals`,
      carData,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.car;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      formatErrorMessage(error, "Failed to create car rental listing"),
    );
  }
};

/**
 * Update car rental listing
 */
export const updateCarRental = async (
  carId: string,
  carData: Partial<CreateCarRentalData>,
): Promise<CarRental> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.put(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/car-rentals/${carId}`,
      carData,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.car;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to update car rental"));
  }
};

/**
 * Delete car rental listing
 */
export const deleteCarRental = async (carId: string): Promise<void> => {
  try {
    const headers = getAuthHeaders();

    await axios.delete(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/car-rentals/${carId}`,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to delete car rental"));
  }
};

/**
 * Book a car rental
 */
export const bookCarRental = async (
  carId: string,
  bookingData: {
    startDate: Date;
    endDate: Date;
    pickupLocation: string;
    dropoffLocation: string;
    notes?: string;
  },
): Promise<CarBooking> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/car-rentals/${carId}/book`,
      bookingData,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.booking;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to book car"));
  }
};

/**
 * Get user's car bookings
 */
export const getMyCarBookings = async (): Promise<CarBooking[]> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(
      `${API_CONFIG.GET_MARKETPLACE_ITEMS}/car-rentals/my-bookings`,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.bookings || [];
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to fetch car bookings"));
  }
};

/**
 * Cancel car booking
 */
export const cancelCarBooking = async (bookingId: string): Promise<void> => {
  try {
    const headers = getAuthHeaders();

    await axios.patch(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/car-rentals/bookings/${bookingId}/cancel`,
      {},
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to cancel booking"));
  }
};

/**
 * Check car availability for dates
 */
export const checkCarAvailability = async (
  carId: string,
  startDate: Date,
  endDate: Date,
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.GET_MARKETPLACE_ITEMS}/car-rentals/${carId}/check-availability`,
      { startDate, endDate },
      { timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.available;
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Failed to check availability"));
  }
};

/**
 * Upload car images
 */
export const uploadCarImages = async (files: File[]): Promise<string[]> => {
  try {
    const headers = getAuthHeaders();
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });

    const response = await axios.post(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/car-rentals/upload-images`,
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        timeout: API_CONFIG.TIMEOUT.UPLOAD,
      },
    );

    return response.data.data.imageUrls || [];
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to upload car images"));
  }
};
