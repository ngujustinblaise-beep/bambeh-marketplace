/**
 * src/pages/SellVehicle.tsx â€” Bambeh Marketplace
 * Full vehicle listing form: multilingual, Supabase storage image upload,
 * category, price, location, phone, description â€” zero errors.
 * Â© 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Car, Loader2, CheckCircle2, ImagePlus,
  X, MapPin, Phone, AlignLeft, Tag, Gauge, Fuel,
  Cog, Calendar, Users, Palette, DollarSign, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/hooks/useAppLang";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// i18n
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const I18N: Record<string, Record<string, string>> = {
  en: {
    pageTitle: "Sell Your Vehicle",
    pageSubtitle: "Reach thousands of buyers across Cameroon",
    back: "Vehicles",
    photos: "Photos",
    photosHint: "Add up to 6 photos. First photo is the cover.",
    addPhoto: "Add Photo",
    title: "Title *",
    titlePlaceholder: "e.g. Toyota Camry 2020",
    category: "Category *",
    price: "Price (XAF) *",
    pricePlaceholder: "e.g. 8500000",
    location: "Location *",
    locationPlaceholder: "e.g. YaoundÃ©, Bastos",
    phone: "Contact Phone *",
    phonePlaceholder: "e.g. +237 6XX XXX XXX",
    description: "Description",
    descPlaceholder: "Describe your vehicle â€” condition, history, features, reason for sellingâ€¦",
    year: "Year",
    yearPlaceholder: "e.g. 2020",
    mileage: "Mileage",
    mileagePlaceholder: "e.g. 45,000 km",
    fuel: "Fuel Type",
    transmission: "Transmission",
    color: "Colour",
    colorPlaceholder: "e.g. Silver",
    seats: "Seats",
    seatsPlaceholder: "e.g. 5",
    submit: "Post Listing",
    submitting: "Postingâ€¦",
    success: "Your vehicle has been listed!",
    successHint: "Buyers can now find and contact you.",
    viewListing: "View My Listing",
    postAnother: "Post Another",
    loginRequired: "You must be logged in to post a listing.",
    login: "Log In",
    errorGeneric: "Something went wrong. Please try again.",
    required: "Please fill in all required fields.",
    selectCategory: "Select category",
    selectFuel: "Select fuel type",
    selectTransmission: "Select transmission",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    hybrid: "Hybrid",
    automatic: "Automatic",
    manual: "Manual",
    vehicleDetails: "Vehicle Details",
    contactInfo: "Contact & Location",
    uploadingImages: "Uploading imagesâ€¦",
    imageError: "Failed to upload one or more images.",
  },
  fr: {
    pageTitle: "Vendre votre vÃ©hicule",
    pageSubtitle: "Atteignez des milliers d'acheteurs Ã  travers le Cameroun",
    back: "VÃ©hicules",
    photos: "Photos",
    photosHint: "Ajoutez jusqu'Ã  6 photos. La premiÃ¨re est la couverture.",
    addPhoto: "Ajouter une photo",
    title: "Titre *",
    titlePlaceholder: "ex: Toyota Camry 2020",
    category: "CatÃ©gorie *",
    price: "Prix (XAF) *",
    pricePlaceholder: "ex: 8500000",
    location: "Localisation *",
    locationPlaceholder: "ex: YaoundÃ©, Bastos",
    phone: "TÃ©lÃ©phone *",
    phonePlaceholder: "ex: +237 6XX XXX XXX",
    description: "Description",
    descPlaceholder: "DÃ©crivez votre vÃ©hicule â€” Ã©tat, historique, caractÃ©ristiques, raison de la venteâ€¦",
    year: "AnnÃ©e",
    yearPlaceholder: "ex: 2020",
    mileage: "KilomÃ©trage",
    mileagePlaceholder: "ex: 45 000 km",
    fuel: "Carburant",
    transmission: "Transmission",
    color: "Couleur",
    colorPlaceholder: "ex: ArgentÃ©",
    seats: "SiÃ¨ges",
    seatsPlaceholder: "ex: 5",
    submit: "Publier l'annonce",
    submitting: "Publicationâ€¦",
    success: "Votre vÃ©hicule est maintenant en ligne!",
    successHint: "Les acheteurs peuvent vous trouver et vous contacter.",
    viewListing: "Voir mon annonce",
    postAnother: "Publier une autre",
    loginRequired: "Vous devez Ãªtre connectÃ© pour publier une annonce.",
    login: "Se connecter",
    errorGeneric: "Une erreur est survenue. Veuillez rÃ©essayer.",
    required: "Veuillez remplir tous les champs obligatoires.",
    selectCategory: "SÃ©lectionner une catÃ©gorie",
    selectFuel: "SÃ©lectionner le carburant",
    selectTransmission: "SÃ©lectionner la transmission",
    petrol: "Essence",
    diesel: "Diesel",
    electric: "Ã‰lectrique",
    hybrid: "Hybride",
    automatic: "Automatique",
    manual: "Manuel",
    vehicleDetails: "DÃ©tails du vÃ©hicule",
    contactInfo: "Contact & Localisation",
    uploadingImages: "Chargement des imagesâ€¦",
    imageError: "Impossible de charger une ou plusieurs images.",
  },
  ha: {
    pageTitle: "Sayar da Abin Hawanku",
    pageSubtitle: "Kai ga dubun-dubun masu siya ko'ina a Kamaru",
    back: "Ababen Hawa",
    photos: "Hotuna",
    photosHint: "Æ˜ara zuwa hoto 6. Na farko shine murfin.",
    addPhoto: "Æ˜ara Hoto",
    title: "Take *",
    titlePlaceholder: "misali: Toyota Camry 2020",
    category: "Rukunin *",
    price: "Farashi (XAF) *",
    pricePlaceholder: "misali: 8500000",
    location: "Wurin *",
    locationPlaceholder: "misali: YaoundÃ©, Bastos",
    phone: "Waya *",
    phonePlaceholder: "misali: +237 6XX XXX XXX",
    description: "Bayanin",
    descPlaceholder: "Bayyana abin hawankaâ€¦",
    year: "Shekara",
    yearPlaceholder: "misali: 2020",
    mileage: "Nisan Tafiya",
    mileagePlaceholder: "misali: 45,000 km",
    fuel: "Nau'in Man Fetur",
    transmission: "Watsa Iko",
    color: "Launi",
    colorPlaceholder: "misali: Azurfa",
    seats: "Kujeru",
    seatsPlaceholder: "misali: 5",
    submit: "Buga Lissafin",
    submitting: "Ana bugaâ€¦",
    success: "An lissafa abin hawanku!",
    successHint: "Masu siya yanzu za su iya samun ku.",
    viewListing: "Duba Lissafina",
    postAnother: "Buga Wani",
    loginRequired: "Dole ne ku shiga don buga lissafi.",
    login: "Shiga",
    errorGeneric: "Wani abu ya fita. Da fatan a sake gwadawa.",
    required: "Da fatan a cika duk filayen da ake bukata.",
    selectCategory: "ZaÉ“i rukuni",
    selectFuel: "ZaÉ“i nau'in man fetur",
    selectTransmission: "ZaÉ“i watsa iko",
    petrol: "Petrol",
    diesel: "Dizal",
    electric: "Lantarki",
    hybrid: "Hybrid",
    automatic: "Atomatik",
    manual: "Hannu",
    vehicleDetails: "Bayanan Abin Hawa",
    contactInfo: "Waya & Wuri",
    uploadingImages: "Ana loda hotunaâ€¦",
    imageError: "Kuskure wajen loda hotunan.",
  },
  ar: {
    pageTitle: "Ø¨ÙŠØ¹ Ù…Ø±ÙƒØ¨ØªÙƒ",
    pageSubtitle: "ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø¢Ù„Ø§Ã™Â Ø§Ù„Ù…Ø´ØªØ±ÙŠÙ† Ã™ÂÙŠ Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ†",
    back: "Ø§Ù„Ù…Ø±ÙƒØ¨Ø§Øª",
    photos: "Ø§Ù„ØµÙˆØ±",
    photosHint: "Ø£Ø¶Ã™Â Ø­ØªÙ‰ 6 ØµÙˆØ±. Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ù‡ÙŠ Ø§Ù„ØºÙ„Ø§Ã™Â.",
    addPhoto: "Ø¥Ø¶Ø§Ã™ÂØ© ØµÙˆØ±Ø©",
    title: "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† *",
    titlePlaceholder: "Ù…Ø«Ø§Ù„: Toyota Camry 2020",
    category: "Ø§Ù„Ã™ÂØ¦Ø© *",
    price: "Ø§Ù„Ø³Ø¹Ø± (XAF) *",
    pricePlaceholder: "Ù…Ø«Ø§Ù„: 8500000",
    location: "Ø§Ù„Ù…ÙˆÙ‚Ø¹ *",
    locationPlaceholder: "Ù…Ø«Ø§Ù„: ÙŠØ§ÙˆÙ†Ø¯ÙŠØŒ Ø¨Ø§Ø³ØªÙˆØ³",
    phone: "Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÃ™Â *",
    phonePlaceholder: "Ù…Ø«Ø§Ù„: +237 6XX XXX XXX",
    description: "Ø§Ù„ÙˆØµÃ™Â",
    descPlaceholder: "ØµÃ™Â Ù…Ø±ÙƒØ¨ØªÙƒ â€” Ø§Ù„Ø­Ø§Ù„Ø©ØŒ Ø§Ù„ØªØ§Ø±ÙŠØ®ØŒ Ø§Ù„Ù…Ù…ÙŠØ²Ø§ØªØŒ Ø³Ø¨Ø¨ Ø§Ù„Ø¨ÙŠØ¹â€¦",
    year: "Ø§Ù„Ø³Ù†Ø©",
    yearPlaceholder: "Ù…Ø«Ø§Ù„: 2020",
    mileage: "Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…Ø³Ø§Ã™ÂØ©",
    mileagePlaceholder: "Ù…Ø«Ø§Ù„: 45,000 ÙƒÙ…",
    fuel: "Ù†ÙˆØ¹ Ø§Ù„ÙˆÙ‚ÙˆØ¯",
    transmission: "Ù†Ø§Ù‚Ù„ Ø§Ù„Ø­Ø±ÙƒØ©",
    color: "Ø§Ù„Ù„ÙˆÙ†",
    colorPlaceholder: "Ù…Ø«Ø§Ù„: Ã™ÂØ¶ÙŠ",
    seats: "Ø§Ù„Ù…Ù‚Ø§Ø¹Ø¯",
    seatsPlaceholder: "Ù…Ø«Ø§Ù„: 5",
    submit: "Ù†Ø´Ø± Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†",
    submitting: "Ø¬Ø§Ø±Ã™Â Ø§Ù„Ù†Ø´Ø±â€¦",
    success: "ØªÙ… Ù†Ø´Ø± Ù…Ø±ÙƒØ¨ØªÙƒ!",
    successHint: "ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø´ØªØ±ÙŠÙ† Ø§Ù„Ø¢Ù† Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙƒ ÙˆØ§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ.",
    viewListing: "Ø¹Ø±Ø¶ Ø¥Ø¹Ù„Ø§Ù†ÙŠ",
    postAnother: "Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù† Ø¢Ø®Ø±",
    loginRequired: "ÙŠØ¬Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù†.",
    login: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„",
    errorGeneric: "Ø­Ø¯Ø« Ø®Ø·Ø£ Ù…Ø§. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.",
    required: "ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.",
    selectCategory: "Ø§Ø®ØªØ± Ø§Ù„Ã™ÂØ¦Ø©",
    selectFuel: "Ø§Ø®ØªØ± Ù†ÙˆØ¹ Ø§Ù„ÙˆÙ‚ÙˆØ¯",
    selectTransmission: "Ø§Ø®ØªØ± Ù†Ø§Ù‚Ù„ Ø§Ù„Ø­Ø±ÙƒØ©",
    petrol: "Ø¨Ù†Ø²ÙŠÙ†",
    diesel: "Ø¯ÙŠØ²Ù„",
    electric: "ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠ",
    hybrid: "Ù‡Ø¬ÙŠÙ†",
    automatic: "Ø£ÙˆØªÙˆÙ…Ø§ØªÙŠÙƒ",
    manual: "ÙŠØ¯ÙˆÙŠ",
    vehicleDetails: "ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø±ÙƒØ¨Ø©",
    contactInfo: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹",
    uploadingImages: "Ø¬Ø§Ø±Ã™Â Ø±Ã™ÂØ¹ Ø§Ù„ØµÙˆØ±â€¦",
    imageError: "Ã™ÂØ´Ù„ Ø±Ã™ÂØ¹ ØµÙˆØ±Ø© ÙˆØ§Ø­Ø¯Ø© Ø£Ùˆ Ø£ÙƒØ«Ø±.",
  },
  pcm: {
    pageTitle: "Sell Your Motor",
    pageSubtitle: "Reach plenty buyers all over Cameroon",
    back: "Motors",
    photos: "Photos",
    photosHint: "Add up to 6 photos. First photo na cover.",
    addPhoto: "Add Photo",
    title: "Title *",
    titlePlaceholder: "e.g. Toyota Camry 2020",
    category: "Category *",
    price: "Price (XAF) *",
    pricePlaceholder: "e.g. 8500000",
    location: "Location *",
    locationPlaceholder: "e.g. YaoundÃ©, Bastos",
    phone: "Phone Number *",
    phonePlaceholder: "e.g. +237 6XX XXX XXX",
    description: "Description",
    descPlaceholder: "Describe your motor â€” condition, story, features, why you dey sellâ€¦",
    year: "Year",
    yearPlaceholder: "e.g. 2020",
    mileage: "Mileage",
    mileagePlaceholder: "e.g. 45,000 km",
    fuel: "Fuel Type",
    transmission: "Transmission",
    color: "Colour",
    colorPlaceholder: "e.g. Silver",
    seats: "Seats",
    seatsPlaceholder: "e.g. 5",
    submit: "Post Ad",
    submitting: "Postingâ€¦",
    success: "Your motor don enter the platform!",
    successHint: "Buyers go see you now.",
    viewListing: "See My Post",
    postAnother: "Post Another",
    loginRequired: "You must log in before you post.",
    login: "Log In",
    errorGeneric: "Something go wrong. Try again.",
    required: "Fill all the required fields.",
    selectCategory: "Select category",
    selectFuel: "Select fuel type",
    selectTransmission: "Select transmission",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    hybrid: "Hybrid",
    automatic: "Automatic",
    manual: "Manual",
    vehicleDetails: "Motor Details",
    contactInfo: "Contact & Location",
    uploadingImages: "Uploading photosâ€¦",
    imageError: "Problem uploading photos.",
  },
  ff: {
    pageTitle: "Yillitu LaaÉ“al Maa",
    pageSubtitle: "Njangu tumaraneeÉ“e ko'e Kameruun",
    back: "LaaÉ“e",
    photos: "Sawru",
    photosHint: "Æeydu sawru haa 6. Adannde wonata koloore.",
    addPhoto: "Æeydu Sawru",
    title: "Tiitoonde *",
    titlePlaceholder: "Toyota Camry 2020",
    category: "Sifo *",
    price: "Njaru (XAF) *",
    pricePlaceholder: "8500000",
    location: "Wuro *",
    locationPlaceholder: "YaoundÃ©, Bastos",
    phone: "Wowloore *",
    phonePlaceholder: "+237 6XX XXX XXX",
    description: "Tinndi",
    descPlaceholder: "Tinndu laaÉ“al maaâ€¦",
    year: "Hitaande",
    yearPlaceholder: "2020",
    mileage: "Laawol",
    mileagePlaceholder: "45,000 km",
    fuel: "Susiyel",
    transmission: "Watse",
    color: "Ranynde",
    colorPlaceholder: "HaaÉ—di",
    seats: "TooÉ—e",
    seatsPlaceholder: "5",
    submit: "JaÉ“du JaÅ‹tere",
    submitting: "Yilliteeâ€¦",
    success: "LaaÉ“al maa jaÅ‹teraa!",
    successHint: "SoodotooÉ“e mbaawi yiytude maa.",
    viewListing: "Yiy JaÅ‹tere Am",
    postAnother: "JaÉ“du GoÉ—É—o",
    loginRequired: "Tiimto ko adii jaÉ“dude.",
    login: "Tiimto",
    errorGeneric: "Ko woÉ—É—aani hawi. Ngaloo kadi.",
    required: "Æeydu batu keeriiÉ—e.",
    selectCategory: "SuÉ“o sifo",
    selectFuel: "SuÉ“o susiyel",
    selectTransmission: "SuÉ“o watse",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Elektrik",
    hybrid: "Hybrid",
    automatic: "Otomatik",
    manual: "JuuÉ—e",
    vehicleDetails: "BayÉ—e LaaÉ“al",
    contactInfo: "Wowloore & Wuro",
    uploadingImages: "Sawruuje njilloyineeâ€¦",
    imageError: "Sawru ujaaki.",
  },
};

const CATEGORIES = ["Sedan", "SUV", "Pickup", "Motorcycle", "Van", "Minibus", "Truck", "Other"];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Form state shape
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FormState {
  title:        string;
  category:     string;
  price:        string;
  location:     string;
  phone:        string;
  description:  string;
  year:         string;
  mileage:      string;
  fuel:         string;
  transmission: string;
  color:        string;
  seats:        string;
}

const EMPTY_FORM: FormState = {
  title:"", category:"", price:"", location:"", phone:"",
  description:"", year:"", mileage:"", fuel:"", transmission:"",
  color:"", seats:"",
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Upload images to Supabase Storage
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext  = file.name.split(".").pop() || "jpg";
    const path = `vehicles/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SellVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lang     = (useLang() || "en") as string;
  const tr       = (key: string) => (I18N[lang] || I18N.en)[key] || I18N.en[key] || key;
  const isRtl    = lang === "ar";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form,             setForm]             = useState<FormState>(EMPTY_FORM);
  const [imageFiles,       setImageFiles]       = useState<File[]>([]);
  const [imagePreviews,    setImagePreviews]    = useState<string[]>([]);
  const [submitting,       setSubmitting]       = useState(false);
  const [uploadingImgs,    setUploadingImgs]    = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [successId,        setSuccessId]        = useState<string | null>(null);

  // â”€â”€ Field update helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // â”€â”€ Image picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
    // reset input so same file can be re-picked
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (i: number) => {
    setImageFiles((prev)    => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.category || !form.price || !form.location || !form.phone) {
      setError(tr("required"));
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload images
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImgs(true);
        try {
          imageUrls = await uploadImages(imageFiles);
        } catch (imgErr: any) {
          console.warn("[SellVehicle] image upload partial fail:", imgErr);
          setError(tr("imageError"));
          // continue without images rather than blocking the listing
        } finally {
          setUploadingImgs(false);
        }
      }

      // 2. Expire 30 days from now
      const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();

      // 3. Insert listing
      const { data, error: sbErr } = await supabase
        .from("listings")
        .insert({
          title:        form.title.trim(),
          type:         "vehicle",
          status:       "active",
          price:        parseInt(form.price.replace(/\D/g, ""), 10) || 0,
          location:     form.location.trim(),
          category:     form.category,
          images:       imageUrls,
          contact_phone:form.phone.trim(),
          contact_name: user?.user_metadata?.full_name || user?.email || "",
          user_id:      user!.id,
          description:  form.description.trim(),
          expires_at:   expiresAt,
          extra: {
            year:         form.year         ? parseInt(form.year, 10) : undefined,
            mileage:      form.mileage.trim()      || undefined,
            fuel:         form.fuel                || undefined,
            transmission: form.transmission        || undefined,
            color:        form.color.trim()        || undefined,
            seats:        form.seats ? parseInt(form.seats, 10) : undefined,
          },
        })
        .select("id")
        .single();

      if (sbErr) throw sbErr;
      setSuccessId(data.id);
    } catch (err: any) {
      console.error("[SellVehicle] submit error:", err);
      setError(err?.message || tr("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Not logged in
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center max-w-sm w-full">
          <Car className="w-14 h-14 text-green-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("pageTitle")}</h2>
          <p className="text-gray-500 text-sm mb-6">{tr("loginRequired")}</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
          >
            {tr("login")}
          </button>
        </div>
      </div>
    );
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Success
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (successId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center max-w-sm w-full">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("success")}</h2>
          <p className="text-gray-500 text-sm mb-6">{tr("successHint")}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/vehicles/${successId}`)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              {tr("viewListing")}
            </button>
            <button
              onClick={() => { setSuccessId(null); setForm(EMPTY_FORM); setImageFiles([]); setImagePreviews([]); }}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all"
            >
              {tr("postAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Form
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none
    focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white placeholder-gray-400`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir={isRtl ? "rtl" : "ltr"}>

      {/* â”€â”€ Top bar â”€â”€ */}
      <div className={`sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
        <button
          onClick={() => navigate("/vehicles")}
          className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          aria-label={tr("back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{tr("pageTitle")}</h1>
          <p className="text-xs text-gray-500">{tr("pageSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* â”€â”€ Error banner â”€â”€ */}
        {error && (
          <div className={`flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* â”€â”€ Photos â”€â”€ */}
        <div>
          <p className={`text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ImagePlus className="w-4 h-4 text-green-600" /> {tr("photos")}
          </p>
          <p className="text-xs text-gray-400 mb-3">{tr("photosHint")}</p>

          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[9px] text-center py-0.5">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {imageFiles.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">{tr("addPhoto")}</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImagePick}
          />
        </div>

        {/* â”€â”€ Basic info â”€â”€ */}
        <div className="bg-white rounded-2xl border p-4 space-y-4">

          {/* Title */}
          <div>
            <label className={labelClass}>
              <Tag className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />{tr("title")}
            </label>
            <input className={inputClass} value={form.title} onChange={set("title")} placeholder={tr("titlePlaceholder")} required />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>{tr("category")}</label>
            <select className={inputClass} value={form.category} onChange={set("category")} required>
              <option value="">{tr("selectCategory")}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>
              <DollarSign className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />{tr("price")}
            </label>
            <input
              className={inputClass}
              value={form.price}
              onChange={set("price")}
              placeholder={tr("pricePlaceholder")}
              inputMode="numeric"
              required
            />
          </div>
        </div>

        {/* â”€â”€ Vehicle details â”€â”€ */}
        <div className="bg-white rounded-2xl border p-4 space-y-4">
          <p className={`text-sm font-bold text-gray-700 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Car className="w-4 h-4 text-green-600" /> {tr("vehicleDetails")}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className={labelClass}>
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("year")}
              </label>
              <input className={inputClass} value={form.year} onChange={set("year")} placeholder={tr("yearPlaceholder")} inputMode="numeric" />
            </div>

            {/* Seats */}
            <div>
              <label className={labelClass}>
                <Users className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("seats")}
              </label>
              <input className={inputClass} value={form.seats} onChange={set("seats")} placeholder={tr("seatsPlaceholder")} inputMode="numeric" />
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className={labelClass}>
              <Gauge className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("mileage")}
            </label>
            <input className={inputClass} value={form.mileage} onChange={set("mileage")} placeholder={tr("mileagePlaceholder")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel */}
            <div>
              <label className={labelClass}>
                <Fuel className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("fuel")}
              </label>
              <select className={inputClass} value={form.fuel} onChange={set("fuel")}>
                <option value="">{tr("selectFuel")}</option>
                <option value="Petrol">{tr("petrol")}</option>
                <option value="Diesel">{tr("diesel")}</option>
                <option value="Electric">{tr("electric")}</option>
                <option value="Hybrid">{tr("hybrid")}</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className={labelClass}>
                <Cog className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("transmission")}
              </label>
              <select className={inputClass} value={form.transmission} onChange={set("transmission")}>
                <option value="">{tr("selectTransmission")}</option>
                <option value="Automatic">{tr("automatic")}</option>
                <option value="Manual">{tr("manual")}</option>
              </select>
            </div>
          </div>

          {/* Colour */}
          <div>
            <label className={labelClass}>
              <Palette className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("color")}
            </label>
            <input className={inputClass} value={form.color} onChange={set("color")} placeholder={tr("colorPlaceholder")} />
          </div>
        </div>

        {/* â”€â”€ Contact & location â”€â”€ */}
        <div className="bg-white rounded-2xl border p-4 space-y-4">
          <p className={`text-sm font-bold text-gray-700 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Phone className="w-4 h-4 text-green-600" /> {tr("contactInfo")}
          </p>

          {/* Location */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("location")}
            </label>
            <input className={inputClass} value={form.location} onChange={set("location")} placeholder={tr("locationPlaceholder")} required />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>
              <Phone className="w-3.5 h-3.5 inline mr-1 text-green-600" />{tr("phone")}
            </label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={set("phone")}
              placeholder={tr("phonePlaceholder")}
              type="tel"
              required
            />
          </div>
        </div>

        {/* â”€â”€ Description â”€â”€ */}
        <div className="bg-white rounded-2xl border p-4">
          <label className={`${labelClass} flex items-center gap-2`}>
            <AlignLeft className="w-3.5 h-3.5 text-green-600" />{tr("description")}
          </label>
          <textarea
            className={`${inputClass} h-32 resize-none`}
            value={form.description}
            onChange={set("description")}
            placeholder={tr("descPlaceholder")}
          />
        </div>

        {/* â”€â”€ Submit â”€â”€ */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 pt-3 pb-6 z-[60]">
          <div className="max-w-2xl mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base
                         hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadingImgs ? tr("uploadingImages") : tr("submitting")}
                </>
              ) : (
                <>
                  <Car className="w-5 h-5" />
                  {tr("submit")}
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SellVehicle;






