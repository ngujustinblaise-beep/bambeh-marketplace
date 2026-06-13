/**
 * src/i18n/registerRentalsNamespace.ts — Bambeh Marketplace
 *
 * FIXED: Wrapped in try/catch and checks i18next is initialized before
 * calling hasResourceBundle(). The old version crashed with:
 *   TypeError: (intermediate value).hasResourceBundle is not a function
 * because it ran before i18next was initialized.
 */

// Dynamically import i18next so we never crash if it hasn't loaded yet
let i18n: any = null;
try {
  // This import is synchronous only after ./i18n has already run
  i18n = require("i18next").default ?? require("i18next");
} catch {
  // i18next not available yet — namespace will not be registered this tick
}

const rentalsEN = {
  rentals: "Rentals",
  postRental: "Post a Rental",
  rentalDetails: "Rental Details",
  monthlyRent: "Monthly Rent",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  furnished: "Furnished",
  unfurnished: "Unfurnished",
  available: "Available",
  unavailable: "Unavailable",
  contactLandlord: "Contact Landlord",
  viewOnMap: "View on Map",
  propertyType: "Property Type",
  apartment: "Apartment",
  house: "House",
  studio: "Studio",
  office: "Office",
  land: "Land",
  amenities: "Amenities",
  description: "Description",
  location: "Location",
  postedBy: "Posted by",
  reportListing: "Report Listing",
  shareListing: "Share Listing",
  similarProperties: "Similar Properties",
  perMonth: "/ month",
  negotiable: "Negotiable",
  deposit: "Deposit",
  leaseTerms: "Lease Terms",
};

const rentalsFR = {
  rentals: "Locations",
  postRental: "Publier une location",
  rentalDetails: "Détails de location",
  monthlyRent: "Loyer mensuel",
  bedrooms: "Chambres",
  bathrooms: "Salles de bain",
  furnished: "Meublé",
  unfurnished: "Non meublé",
  available: "Disponible",
  unavailable: "Indisponible",
  contactLandlord: "Contacter le propriétaire",
  viewOnMap: "Voir sur la carte",
  propertyType: "Type de propriété",
  apartment: "Appartement",
  house: "Maison",
  studio: "Studio",
  office: "Bureau",
  land: "Terrain",
  amenities: "Équipements",
  description: "Description",
  location: "Lieu",
  postedBy: "Publié par",
  reportListing: "Signaler l'annonce",
  shareListing: "Partager l'annonce",
  similarProperties: "Propriétés similaires",
  perMonth: "/ mois",
  negotiable: "Négociable",
  deposit: "Caution",
  leaseTerms: "Conditions de bail",
};

function safeRegister() {
  try {
    if (!i18n) return;
    // Guard: hasResourceBundle may not exist if i18next isn't initialized
    if (typeof i18n.hasResourceBundle !== "function") return;

    if (!i18n.hasResourceBundle("en", "rentals")) {
      i18n.addResourceBundle("en", "rentals", rentalsEN, true, true);
    }
    if (!i18n.hasResourceBundle("fr", "rentals")) {
      i18n.addResourceBundle("fr", "rentals", rentalsEN, true, true);
    }
  } catch (err) {
    // Never crash the app over a namespace registration failure
    console.warn("[Bambeh i18n] Could not register rentals namespace:", err);
  }
}

// Try immediately
safeRegister();

// Also try after a tick in case i18next finishes async init slightly later
setTimeout(safeRegister, 0);
setTimeout(safeRegister, 500);

export {};
