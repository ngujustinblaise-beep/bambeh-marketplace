/**
 * src/services/carRentals.service.ts â€” Bambeh Marketplace
 *
 * SECURITY REWRITE (original had critical issues):
 *  ðŸ”´ REMOVED â€” axios calls to `https://your-backend-api.com/api` (placeholder, broke prod)
 *  ðŸ”´ REMOVED â€” localStorage.getItem('authToken') for auth header (XSS attack vector;
 *               any JS on page could steal the token from localStorage)
 *  ðŸ”´ REMOVED â€” Manual redirect to /login on 401 (bypasses React Router, loses state)
 *  âœ… REPLACED â€” All calls use Supabase client (session managed via httpOnly cookie /
 *               in-memory token; Supabase SDK handles auth transparently)
 *  âœ… SECURITY â€” Row Level Security (RLS) enforced server-side; client never sees other
 *               users' private data even if they call these functions directly
 *  âœ… SECURITY â€” No secret keys or tokens in client code
 *  âœ… PRESERVED â€” All function signatures unchanged so callers don't need updates
 *  âœ… NOTE     â€” "car rentals" in Bambeh maps to the `listings` table with type='vehicle'
 *               AND the `rentals` table for property rentals. This service targets
 *               listings (vehicles for hire/sale). Adjust table name if your schema differs.
 *
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Types (unchanged from original so callers don't need updates)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Internal helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Map a raw Supabase row from `listings` to a CarRental object */
function rowToCarRental(d: any): CarRental {
  const extra = d.extra || {};
  return {
    id:           d.id,
    make:         extra.make         || "",
    model:        extra.model        || d.title || "",
    year:         Number(extra.year) || new Date().getFullYear(),
    category:     d.category         || extra.vehicle_type || "",
    pricePerDay:  d.price            || 0,
    currency:     "XAF",
    location:     d.location         || "",
    transmission: extra.transmission || "manual",
    fuelType:     extra.fuel         || "",
    seats:        Number(extra.seats) || 5,
    features:     Array.isArray(extra.features) ? extra.features : [],
    images:       Array.isArray(d.images)  ? d.images
                : Array.isArray(extra.images) ? extra.images : [],
    ownerId:      d.user_id          || d.seller_id || "",
    ownerName:    d.profiles?.full_name || "Seller",
    contactPhone: d.profiles?.phone || d.phone || extra.contact_phone || "",
    rating:       extra.rating       || 0,
    reviews:      extra.reviews      || 0,
    available:    d.status === "active",
    createdAt:    new Date(d.created_at),
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Public API â€” same signatures as original; implementations now use Supabase
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fetch all car/vehicle rentals with optional filters.
 * RLS on `listings` ensures only active rows are returned to anonymous users.
 */
export const getCarRentals = async (
  filters?: CarRentalFilters,
): Promise<CarRental[]> => {
  let query = supabase
    .from("listings")
    .select("*, profiles:user_id (full_name, phone)")
    .eq("type", "vehicle")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  // Apply optional filters
  if (filters?.category)     query = query.eq("category", filters.category);
  if (filters?.location)     query = query.ilike("location", `%${filters.location}%`);
  if (filters?.minPrice)     query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice)     query = query.lte("price", filters.maxPrice);
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map(rowToCarRental);
};

/**
 * Get a single vehicle listing by ID.
 */
export const getCarRentalById = async (carId: string): Promise<CarRental> => {
  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles:user_id (full_name, phone)")
    .eq("id", carId)
    .eq("type", "vehicle")
    .maybeSingle();

  if (error)  throw new Error(error.message);
  if (!data)  throw new Error("Vehicle not found");

  return rowToCarRental(data);
};

/**
 * Create a new vehicle listing.
 * Requires the user to be authenticated (Supabase auth session).
 * RLS on `listings` enforces that user_id = auth.uid().
 */
export const createCarRental = async (
  carData: CarRentalData,
): Promise<CarRental> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to create a listing");

  const { data, error } = await supabase
    .from("listings")
    .insert({
      title:       `${carData.make} ${carData.model} ${carData.year}`,
      type:        "vehicle",
      status:      "active",
      price:       carData.pricePerDay,
      location:    carData.location,
      category:    carData.category,
      images:      carData.images,
      phone:       carData.contactPhone,
      user_id:     user.id,
      extra: {
        make:          carData.make,
        model:         carData.model,
        year:          carData.year,
        transmission:  carData.transmission,
        fuel:          carData.fuelType,
        seats:         carData.seats,
        features:      carData.features,
        contact_phone: carData.contactPhone,
      },
    })
    .select("*, profiles:user_id (full_name, phone)")
    .single();

  if (error) throw new Error(error.message);
  return rowToCarRental(data);
};

/**
 * Update an existing vehicle listing.
 * RLS ensures only the owner can update their own listing.
 */
export const updateCarRental = async (
  carId: string,
  carData: Partial<CarRentalData>,
): Promise<CarRental> => {
  const updates: Record<string, any> = {};

  if (carData.location)    updates.location = carData.location;
  if (carData.pricePerDay) updates.price    = carData.pricePerDay;
  if (carData.images)      updates.images   = carData.images;

  // Fields that live in extra{}
  const extraUpdates: Record<string, any> = {};
  if (carData.make)         extraUpdates.make         = carData.make;
  if (carData.model)        extraUpdates.model        = carData.model;
  if (carData.year)         extraUpdates.year         = carData.year;
  if (carData.transmission) extraUpdates.transmission = carData.transmission;
  if (carData.fuelType)     extraUpdates.fuel         = carData.fuelType;
  if (carData.seats)        extraUpdates.seats        = carData.seats;
  if (carData.features)     extraUpdates.features     = carData.features;
  if (carData.contactPhone) extraUpdates.contact_phone = carData.contactPhone;

  if (Object.keys(extraUpdates).length > 0) {
    // Merge with existing extra{} rather than overwrite
    const { data: existing } = await supabase
      .from("listings").select("extra").eq("id", carId).maybeSingle();
    updates.extra = { ...(existing?.extra || {}), ...extraUpdates };
  }

  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", carId)
    .select("*, profiles:user_id (full_name, phone)")
    .single();

  if (error) throw new Error(error.message);
  return rowToCarRental(data);
};

/**
 * Delete a vehicle listing.
 * RLS ensures only the owner can delete their listing.
 */
export const deleteCarRental = async (carId: string): Promise<void> => {
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", carId);

  if (error) throw new Error(error.message);
};

/**
 * Submit a booking / hire request for a vehicle.
 * Stored as a message with is_booking_message=true so the seller is notified.
 */
export const bookCarRental = async (
  carId: string,
  bookingData: BookingData,
): Promise<any> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to make a booking");

  // Fetch vehicle to get seller ID
  const { data: vehicle, error: fetchErr } = await supabase
    .from("listings")
    .select("user_id, seller_id, title")
    .eq("id", carId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);

  const sellerId = vehicle?.user_id || vehicle?.seller_id || null;

  const content = [
    `ðŸš— VEHICLE HIRE REQUEST`,
    `Vehicle: ${vehicle?.title || carId}`,
    `Dates: ${bookingData.startDate} â†’ ${bookingData.endDate}`,
    `Pickup: ${bookingData.pickupLocation}`,
    `Drop-off: ${bookingData.dropoffLocation}`,
    `Driver: ${bookingData.driverDetails.name} | ${bookingData.driverDetails.phone}`,
    `Licence: ${bookingData.driverDetails.licenseNumber}`,
    `â€” via Bambeh Marketplace`,
  ].join("\n");

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      sender_id:          user.id,
      recipient_id:       sellerId,
      content,
      listing_id:         carId,
      listing_type:       "vehicle",
      is_booking_message: true,
      created_at:         new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return msg;
};

/**
 * Get the current user's own vehicle listings.
 */
export const getMyCarRentals = async (): Promise<CarRental[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles:user_id (full_name, phone)")
    .eq("type", "vehicle")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(rowToCarRental);
};

/**
 * Get the current user's booking/hire requests (messages they sent).
 */
export const getMyCarBookings = async (): Promise<any[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("sender_id", user.id)
    .eq("listing_type", "vehicle")
    .eq("is_booking_message", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};
