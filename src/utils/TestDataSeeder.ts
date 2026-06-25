/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST DATA SEEDER - POPULATE SAMPLE DATA FOR SEARCH
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✅ Seeds sample jobs, products, services, rentals, vehicles
 * ✅ Realistic  data
 * ✅ Can be called on app init or manually
 * ✅ Doesn't overwrite if data exists
 *
 * Usage:
 * import { seedTestData, clearTestData } from '@/utils/TestDataSeeder';
 * seedTestData(); // Populate data
 * clearTestData(); // Clear all data
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Sample Jobs
const SAMPLE_JOBS = [
  {
    id: "job_1",
    title: "Senior Software Developer",
    company: "TechCorp ",
    location: "Yaoundé, Centre",
    salary: "500,000 - 800,000 XAF",
    type: "Full-time",
    description:
      "Looking for experienced React/Node.js developer to join our team.",
    requirements: ["5+ years experience", "React", "Node.js", "TypeScript"],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Technology",
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
    ],
  },
  {
    id: "job_2",
    title: "Marketing Manager",
    company: "Orange ",
    location: "Douala, Littoral",
    salary: "400,000 - 600,000 XAF",
    type: "Full-time",
    description: "Lead marketing campaigns for telecommunications products.",
    requirements: [
      "Marketing degree",
      "3+ years experience",
      "Digital marketing",
    ],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Marketing",
    images: ["https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400"],
  },
  {
    id: "job_3",
    title: "Accountant",
    company: "BGFI Bank ",
    location: "Yaoundé, Centre",
    salary: "350,000 - 500,000 XAF",
    type: "Full-time",
    description: "Manage financial records and prepare reports.",
    requirements: ["Accounting degree", "CPA preferred", "Excel proficiency"],
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Finance",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400"],
  },
  {
    id: "job_4",
    title: "Sales Representative",
    company: "MTN ",
    location: "Bamenda, Northwest",
    salary: "200,000 - 350,000 XAF",
    type: "Full-time",
    description: "Sell mobile products and services to customers.",
    requirements: ["Sales experience", "Good communication", "Target driven"],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Sales",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"],
  },
  {
    id: "job_5",
    title: "Teacher - English",
    company: "International School of ",
    location: "Yaoundé, Centre",
    salary: "250,000 - 400,000 XAF",
    type: "Full-time",
    description: "Teach English to secondary school students.",
    requirements: [
      "Teaching degree",
      "Native/fluent English",
      "Experience preferred",
    ],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    images: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400",
    ],
  },
];

// Sample Products
const SAMPLE_PRODUCTS = [
  {
    id: "prod_1",
    title: "iPhone 14 Pro Max - 256GB",
    price: "650000",
    currency: "XAF",
    condition: "Used - Like New",
    location: "Bastos, Yaoundé",
    description:
      "Excellent condition iPhone 14 Pro Max. Battery health 95%. Comes with original box and accessories.",
    category: "Electronics",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
    ],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_2",
    title: "Samsung Galaxy S23 Ultra",
    price: "580000",
    currency: "XAF",
    condition: "Brand New",
    location: "Akwa, Douala",
    description:
      "Brand new Samsung Galaxy S23 Ultra. 512GB storage. Factory sealed.",
    category: "Electronics",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    ],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_3",
    title: "HP Laptop - Core i7, 16GB RAM",
    price: "450000",
    currency: "XAF",
    condition: "Used - Good",
    location: "Mokolo, Yaoundé",
    description:
      "HP ProBook with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for work and gaming.",
    category: "Electronics",
    brand: "HP",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    ],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_4",
    title: "Honda Generator - 5KVA",
    price: "280000",
    currency: "XAF",
    condition: "Used - Good",
    location: "Biyem-Assi, Yaoundé",
    description:
      "Reliable Honda generator. Low fuel consumption. Well maintained.",
    category: "Home & Garden",
    brand: "Honda",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_5",
    title: "Complete Living Room Furniture Set",
    price: "350000",
    currency: "XAF",
    condition: "Used - Like New",
    location: "Bonanjo, Douala",
    description:
      "Beautiful sofa set with center table. Modern design. Barely used.",
    category: "Furniture",
    brand: "Local",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample Services
const SAMPLE_SERVICES = [
  {
    id: "serv_1",
    title: "Professional House Cleaning",
    price: "15000",
    currency: "XAF",
    location: "Yaoundé",
    description:
      "Deep cleaning services for homes and offices. We bring our own equipment.",
    category: "Cleaning",
    provider: "CleanPro Services",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    ],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "serv_2",
    title: "Plumbing Repairs & Installation",
    price: "25000",
    currency: "XAF",
    location: "Douala",
    description:
      "Expert plumbing services. Pipe repairs, installation, and maintenance.",
    category: "Home Services",
    provider: "PlumbFix ",
    images: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
    ],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "serv_3",
    title: "Web Development Services",
    price: "150000",
    currency: "XAF",
    location: "Remote / Yaoundé",
    description: "Professional website development. React, Node.js, WordPress.",
    category: "Technology",
    provider: "DevStudio CM",
    images: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    ],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "serv_4",
    title: "Private Tutoring - Mathematics",
    price: "10000",
    currency: "XAF",
    location: "Yaoundé",
    description: "One-on-one math tutoring for primary and secondary students.",
    category: "Education",
    provider: "MathGenius Tutors",
    images: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400",
    ],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "serv_5",
    title: "Catering Services for Events",
    price: "200000",
    currency: "XAF",
    location: "Douala",
    description:
      "Professional catering for weddings, parties, and corporate events.",
    category: "Food & Catering",
    provider: "Delicious Events CM",
    images: ["https://images.unsplash.com/photo-1555244162-803834f70033?w=400"],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample Rentals
const SAMPLE_RENTALS = [
  {
    id: "rent_1",
    title: "3 Bedroom Apartment - Bastos",
    price: "350000",
    currency: "XAF",
    period: "month",
    location: "Bastos, Yaoundé",
    city: "Yaoundé",
    description:
      "Modern 3-bedroom apartment in prestigious Bastos neighborhood. Air-conditioned, furnished.",
    bedrooms: 3,
    bathrooms: 2,
    features: ["Air Conditioning", "Furnished", "Security", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    ],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rent_2",
    title: "Studio Apartment - Akwa",
    price: "80000",
    currency: "XAF",
    period: "month",
    location: "Akwa, Douala",
    city: "Douala",
    description:
      "Cozy studio apartment in the heart of Akwa. Perfect for singles or couples.",
    bedrooms: 1,
    bathrooms: 1,
    features: ["Furnished", "Water Tank", "Near Market"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    ],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rent_3",
    title: "Office Space - 50sqm",
    price: "150000",
    currency: "XAF",
    period: "month",
    location: "Centre-ville, Yaoundé",
    city: "Yaoundé",
    description:
      "Professional office space in central Yaoundé. Reception area included.",
    features: ["Air Conditioning", "Security", "Parking", "Internet Ready"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    ],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rent_4",
    title: "Villa - 5 Bedrooms with Pool",
    price: "800000",
    currency: "XAF",
    period: "month",
    location: "Bonapriso, Douala",
    city: "Douala",
    description:
      "Luxurious villa with swimming pool. Perfect for expat families.",
    bedrooms: 5,
    bathrooms: 4,
    features: ["Pool", "Garden", "Security", "Generator", "Fully Furnished"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    ],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rent_5",
    title: "Shop Space - Mokolo Market",
    price: "50000",
    currency: "XAF",
    period: "month",
    location: "Mokolo, Yaoundé",
    city: "Yaoundé",
    description:
      "Prime shop location in busy Mokolo market. High foot traffic.",
    features: ["High Traffic", "Storage Room", "Security"],
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    ],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample Vehicles
const SAMPLE_VEHICLES = [
  {
    id: "veh_1",
    title: "Toyota Corolla 2020",
    price: "8500000",
    currency: "XAF",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    mileage: "45,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    condition: "Used - Excellent",
    location: "Yaoundé",
    description:
      "Well-maintained Toyota Corolla. One owner. Full service history.",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
    ],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "veh_2",
    title: "Mercedes-Benz C200 2019",
    price: "15000000",
    currency: "XAF",
    make: "Mercedes-Benz",
    model: "C200",
    year: 2019,
    mileage: "55,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    condition: "Used - Excellent",
    location: "Douala",
    description: "Luxury Mercedes C200. Leather interior. Navigation system.",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400",
    ],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "veh_3",
    title: "Honda CR-V 2018",
    price: "9000000",
    currency: "XAF",
    make: "Honda",
    model: "CR-V",
    year: 2018,
    mileage: "70,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    condition: "Used - Good",
    location: "Yaoundé",
    description: "Reliable Honda SUV. Family-friendly. 4WD available.",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
    ],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "veh_4",
    title: "TVS Apache RTR 160",
    price: "850000",
    currency: "XAF",
    make: "TVS",
    model: "Apache RTR 160",
    year: 2022,
    mileage: "5,000 km",
    transmission: "Manual",
    fuel: "Petrol",
    condition: "Used - Like New",
    location: "Bamenda",
    description: "Sporty motorcycle. Excellent fuel economy. Low mileage.",
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400"],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "veh_5",
    title: "Ford Ranger 2017 - 4x4",
    price: "12000000",
    currency: "XAF",
    make: "Ford",
    model: "Ranger",
    year: 2017,
    mileage: "85,000 km",
    transmission: "Manual",
    fuel: "Diesel",
    condition: "Used - Good",
    location: "Douala",
    description:
      "Powerful pickup truck. 4x4 capability. Perfect for work and adventure.",
    images: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400"],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Seed test data into localStorage
 */
export const seedTestData = (forceOverwrite = false) => {
  const keys = {
    jobs: "bambe-jobs",
    products: "bambe-products",
    services: "bambe-services",
    rentals: "bambe-rentals",
    vehicles: "bambe-vehicles",
  };

  // Seed jobs
  if (forceOverwrite || !localStorage.getItem(keys.jobs)) {
    localStorage.setItem(keys.jobs, JSON.stringify(SAMPLE_JOBS));
    console.log("✅ Seeded jobs data");

  // Seed products
  if (forceOverwrite || !localStorage.getItem(keys.products)) {
    localStorage.setItem(keys.products, JSON.stringify(SAMPLE_PRODUCTS));
    console.log("✅ Seeded products data");

  // Seed services
  if (forceOverwrite || !localStorage.getItem(keys.services)) {
    localStorage.setItem(keys.services, JSON.stringify(SAMPLE_SERVICES));
    console.log("✅ Seeded services data");

  // Seed rentals
  if (forceOverwrite || !localStorage.getItem(keys.rentals)) {
    localStorage.setItem(keys.rentals, JSON.stringify(SAMPLE_RENTALS));
    console.log("✅ Seeded rentals data");

  // Seed vehicles
  if (forceOverwrite || !localStorage.getItem(keys.vehicles)) {
    localStorage.setItem(keys.vehicles, JSON.stringify(SAMPLE_VEHICLES));
    console.log("✅ Seeded vehicles data");

  console.log("✅ Test data seeding complete!");

/**
 * Clear all test data from localStorage
 */
}
}
}
}
}
}
export const clearTestData = () => {
  localStorage.removeItem("bambe-jobs");
  localStorage.removeItem("bambe-products");
  localStorage.removeItem("bambe-services");
  localStorage.removeItem("bambe-rentals");
  localStorage.removeItem("bambe-vehicles");
  console.log("🗑ï¸ Test data cleared");

/**
 * Check if test data exists
 */
}
export const hasTestData = (): boolean => {
  return !!(
    localStorage.getItem("bambe-jobs") ||
    localStorage.getItem("bambe-products") ||
    localStorage.getItem("bambe-services") ||
    localStorage.getItem("bambe-rentals") ||
    localStorage.getItem("bambe-vehicles")
  );

}
export default { seedTestData, clearTestData, hasTestData };


