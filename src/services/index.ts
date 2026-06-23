// src/services/index.ts
// Compatibility layer for existing imports

import * as jobs from "./jobs.service";
import * as marketplace from "./marketplace.service";
import * as services from "./services.service";
import * as properties from "./properties.service";
import * as carRentals from "./carRentals.service";
import * as cart from "./cart.service";
import * as favorites from "./favorites.service";
import * as vendor from "./vendor.service";
import * as auth from "./auth.service";
import * as profile from "./profile.service";

// Export as objects for backwards compatibility
export const jobsService = jobs;
export const marketplaceService = marketplace;
export const servicesService = services;
export const propertiesService = properties;
export const carRentalsService = carRentals;
export const cartService = cart;
export const favoritesService = favorites;
export const vendorService = vendor;
export const authService = auth;
export const profileService = profile;

// Also export everything individually
export * from "./jobs.service";
export * from "./marketplace.service";
export * from "./services.service";
export * from "./properties.service";
export * from "./carRentals.service";
export * from "./cart.service";
export * from "./favorites.service";
export * from "./vendor.service";
export * from "./auth.service";
export * from "./profile.service";
export * from "./api.config";
