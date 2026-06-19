import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { db } from "@/utils/firebase/firebaseConfig";

// ========================================
// RENTAL QUERIES
// ========================================

export const getRentalById = async (id: string) => {
  try {
    const docRef = doc(db, "rentals", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
    return null;
  } catch (error) {
    console.error("Error fetching rental:", error);
    throw error;
  }
};

export const getRentals = async (filters?: {
  city?: string;
  type?: string;
  maxPrice?: number;
  limit?: number;
}) => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.city) {
      constraints.push(where("city", "==", filters.city));
    }
    if (filters?.type) {
      constraints.push(where("type", "==", filters.type));
    }
    if (filters?.maxPrice) {
      constraints.push(where("price", "<=", filters.maxPrice));
    }

        constraints.push(orderBy("createdAt", "desc"));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

        const q = query(collection(db, "rentals"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching rentals:", error);
    throw error;
  }
};

// ========================================
// JOB QUERIES
// ========================================

export const getJobById = async (id: string) => {
  try {
    const docRef = doc(db, "jobs", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
    return null;
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
};

export const getJobs = async (filters?: {
  category?: string;
  location?: string;
  type?: string;
  limit?: number;
}) => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.location) {
      constraints.push(where("location", "==", filters.location));
    }
    if (filters?.type) {
      constraints.push(where("type", "==", filters.type));
    }

        constraints.push(orderBy("postedDate", "desc"));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

        const q = query(collection(db, "jobs"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// ========================================
// PRODUCT QUERIES
// ========================================

export const getProductById = async (id: string) => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const getProducts = async (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  limit?: number;
}) => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.minPrice) {
      constraints.push(where("price", ">=", filters.minPrice));
    }
    if (filters?.maxPrice) {
      constraints.push(where("price", "<=", filters.maxPrice));
    }
    if (filters?.condition) {
      constraints.push(where("condition", "==", filters.condition));
    }

        constraints.push(orderBy("createdAt", "desc"));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

        const q = query(collection(db, "products"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// ========================================
// SERVICE QUERIES
// ========================================

export const getServiceById = async (id: string) => {
  try {
    const docRef = doc(db, "services", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
    return null;
  } catch (error) {
    console.error("Error fetching service:", error);
    throw error;
  }
};

export const getServices = async (filters?: {
  category?: string;
  location?: string;
  priceRange?: string;
  limit?: number;
}) => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.location) {
      constraints.push(where("location", "==", filters.location));
    }
    if (filters?.priceRange) {
      constraints.push(where("priceRange", "==", filters.priceRange));
    }

        constraints.push(orderBy("createdAt", "desc"));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

        const q = query(collection(db, "services"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// ========================================
// VEHICLE QUERIES
// ========================================

export const getVehicleById = async (id: string) => {
  try {
    const docRef = doc(db, "vehicles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
    return null;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    throw error;
  }
};

export const getVehicles = async (filters?: {
  make?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  limit?: number;
}) => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.make) {
      constraints.push(where("make", "==", filters.make));
    }
    if (filters?.vehicleType) {
      constraints.push(where("vehicleType", "==", filters.vehicleType));
    }
    if (filters?.minPrice) {
      constraints.push(where("price", ">=", filters.minPrice));
    }
    if (filters?.maxPrice) {
      constraints.push(where("price", "<=", filters.maxPrice));
    }
    if (filters?.condition) {
      constraints.push(where("condition", "==", filters.condition));
    }

        constraints.push(orderBy("postedDate", "desc"));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

        const q = query(collection(db, "vehicles"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

// ========================================
// MARKETPLACE QUERIES (same as products but separate collection)
// ========================================

export const getMarketplaceItemById = async (id: string) => {
  try {
    const docRef = doc(db, "marketplace", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
    return null;
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    throw error;
  }
};

export const getMarketplaceItems = async (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  limit?: number;
}) => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.minPrice) {
      constraints.push(where("price", ">=", filters.minPrice));
    }
    if (filters?.maxPrice) {
      constraints.push(where("price", "<=", filters.maxPrice));
    }
    if (filters?.condition) {
      constraints.push(where("condition", "==", filters.condition));
    }

        constraints.push(orderBy("postedDate", "desc"));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

        const q = query(collection(db, "marketplace"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    throw error;
  }
};

// ========================================
// SEARCH QUERIES (Cross-collection)
// ========================================

export const searchAll = async (searchTerm: string) => {
  try {
    const results = {
      jobs: [] as any[],
      products: [] as any[],
      services: [] as any[],
      rentals: [] as any[],
      vehicles: [] as any[],
    };

    // Search in jobs
    const jobsQuery = query(
      collection(db, "jobs"),
      where("title", ">=", searchTerm),
      where("title", "<=", searchTerm + "\uf8ff"),
      limit(10),
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    results.jobs = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search in products
    const productsQuery = query(
      collection(db, "products"),
      where("title", ">=", searchTerm),
      where("title", "<=", searchTerm + "\uf8ff"),
      limit(10),
    );
    const productsSnapshot = await getDocs(productsQuery);
    results.products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search in services
    const servicesQuery = query(
      collection(db, "services"),
      where("title", ">=", searchTerm),
      where("title", "<=", searchTerm + "\uf8ff"),
      limit(10),
    );
    const servicesSnapshot = await getDocs(servicesQuery);
    results.services = servicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search in rentals
    const rentalsQuery = query(
      collection(db, "rentals"),
      where("title", ">=", searchTerm),
      where("title", "<=", searchTerm + "\uf8ff"),
      limit(10),
    );
    const rentalsSnapshot = await getDocs(rentalsQuery);
    results.rentals = rentalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search in vehicles
    const vehiclesQuery = query(
      collection(db, "vehicles"),
      where("model", ">=", searchTerm),
      where("model", "<=", searchTerm + "\uf8ff"),
      limit(10),
    );
    const vehiclesSnapshot = await getDocs(vehiclesQuery);
    results.vehicles = vehiclesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return results;
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
};
