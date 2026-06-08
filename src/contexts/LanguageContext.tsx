/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE CONTEXT - MULTI-LANGUAGE TRANSLATION SYSTEM
 * FILE LOCATION: src/contexts/LanguageContext.tsx
 *
 * IMPORTANT: This is the ONE true LanguageContext file.
 * Delete any file at src/context/LanguageContext.tsx (singular "context")
 * and use only this one at src/contexts/LanguageContext.tsx (plural "contexts").
 *
 * © 2026 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'en' | 'fr' | 'pcm' | 'ff' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

interface LanguageContextType {
  language: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: LanguageInfo[];
  isRTL: boolean;
}

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en',  name: 'English',        nativeName: 'English',  flag: '🇬🇧', rtl: false },
  { code: 'fr',  name: 'French',         nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'pcm', name: 'Pidgin English', nativeName: 'Pidgin',   flag: '🇨🇲', rtl: false },
  { code: 'ff',  name: 'Fulfulde',       nativeName: 'Fulfulde', flag: '🇨🇲', rtl: false },
  { code: 'ar',  name: 'Arabic',         nativeName: 'العربية',  flag: '🇸🇦', rtl: true  },
];

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const translations: Record<LanguageCode, Record<string, any>> = {

  // ── ENGLISH ────────────────────────────────────────────────────────────────
  en: {
    common: {
      welcome: 'Welcome', home: 'Home', search: 'Search', login: 'Login',
      logout: 'Logout', register: 'Register', profile: 'Profile', settings: 'Settings',
      help: 'Help', about: 'About', contact: 'Contact', save: 'Save', cancel: 'Cancel',
      delete: 'Delete', edit: 'Edit', submit: 'Submit', loading: 'Loading...',
      error: 'Error', success: 'Success', back: 'Back', next: 'Next',
      continue: 'Continue', close: 'Close', yes: 'Yes', no: 'No', ok: 'OK',
      confirm: 'Confirm', viewAll: 'View All', seeMore: 'See More', filter: 'Filter',
      sort: 'Sort', share: 'Share', report: 'Report', viewDetails: 'View Details',
      buy: 'Buy', sell: 'Sell', price: 'Price', quantity: 'Quantity',
      description: 'Description', category: 'Category', location: 'Location',
      uploadPhoto: 'Upload Photo', choosePhoto: 'Choose Photo',
      comingSoon: 'Coming Soon!',
    },
    nav: {
      home: 'Home', jobs: 'Jobs', marketplace: 'Marketplace', services: 'Services',
      rentals: 'Rentals', vehicles: 'Vehicles', exchange: 'Exchange',
      cart: 'Cart', favorites: 'Favorites', notifications: 'Notifications',
      community: 'Community', orders: 'Orders', myListings: 'My Listings',
    },
    auth: {
      signIn: 'Sign In', signUp: 'Sign Up', signOut: 'Sign Out',
      forgotPassword: 'Forgot Password?', rememberMe: 'Remember Me',
      createAccount: 'Create Account', alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      username: 'Username', password: 'Password', confirmPassword: 'Confirm Password',
      email: 'Email', phone: 'Phone Number',
      enterUsername: 'Enter username, phone number or user ID',
      enterPassword: 'Enter your password',
      loginSuccess: 'Login successful!', loginFailed: 'Login failed. Please try again.',
      registerSuccess: 'Account created successfully!',
      chooseUsername: 'Choose a unique username (no spaces)',
    },
    jobs: {
      findJob: 'Find a Job', postJob: 'Post a Job', jobTitle: 'Job Title',
      company: 'Company', salary: 'Salary', jobType: 'Job Type', fullTime: 'Full Time',
      partTime: 'Part Time', remote: 'Remote', applyNow: 'Apply Now',
      deadline: 'Deadline', experience: 'Experience Required', viewJob: 'View Job Details',
      noJobsFound: 'No jobs found. Be the first to post!',
    },
    marketplace: {
      buyItem: 'Buy Item', sellItem: 'Sell Item', addToCart: 'Add to Cart',
      makeOffer: 'Make Offer', contactSeller: 'Contact Seller', newArrival: 'New Arrival',
      featured: 'Featured', condition: 'Condition', new_: 'New', used: 'Used',
      noItemsFound: 'No items found.',
    },
    services: {
      offerService: 'Offer a Service', bookService: 'Book Service',
      contactProvider: 'Contact Provider', callProvider: 'Call Provider',
      rating: 'Rating', reviews: 'Reviews', availability: 'Availability',
      noServicesFound: 'No services found.',
    },
    rentals: {
      listProperty: 'List Property', bookVisit: 'Book a Visit', contactLandlord: 'Contact Landlord',
      bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', furnished: 'Furnished',
      monthlyRent: 'Monthly Rent', availableFrom: 'Available From',
      noRentalsFound: 'No rentals found.',
    },
    vehicles: {
      sellCar: 'Sell a Car', rentCar: 'Rent a Car', contactVendor: 'Contact Vendor',
      bookTestDrive: 'Book Test Drive', mileage: 'Mileage', year: 'Year',
      make: 'Make', model: 'Model', noVehiclesFound: 'No vehicles found.',
    },
    community: {
      createPost: 'Create Post', joinGroup: 'Join Group', createGroup: 'Create Group',
      members: 'Members', posts: 'Posts', joined: 'Joined', leaveGroup: 'Leave Group',
      groupName: 'Group Name', groupDescription: 'Group Description',
    },
    tontine: {
      createNjangi: 'Create Njangi Group', joinNjangi: 'Join Njangi',
      contribution: 'Contribution Amount', frequency: 'Frequency',
      members: 'Members', totalPool: 'Total Pool',
    },
    farmFresh: {
      buyProduce: 'Buy Produce', sellProduce: 'Sell Produce', productName: 'Product Name',
      harvestDate: 'Harvest Date', quantityAvailable: 'Quantity Available',
      pricePerKg: 'Price per Kg', submitListing: 'Submit Produce Listing',
      orderNow: 'Order Now',
    },
    tracking: {
      trackOrders: 'Track Orders', orderStatus: 'Order Status',
      estimatedDelivery: 'Estimated Delivery', delivered: 'Delivered',
      inTransit: 'In Transit', processing: 'Processing', shipped: 'Shipped',
      outForDelivery: 'Out for Delivery', reportIssue: 'Report Issue',
      contactSeller: 'Contact Seller',
    },
    settings: {
      editProfile: 'Edit Profile', changePhoto: 'Change Photo', changePassword: 'Change Password',
      language: 'Language', notifications: 'Notifications', privacy: 'Privacy',
      deleteAccount: 'Delete Account', myListings: 'My Listings', myFavorites: 'My Favorites',
      myOrders: 'My Orders',
    },
    voice: {
      voiceAssistant: 'Voice Assistant', listening: 'Listening...', speak: 'Speak now',
      tapToSpeak: 'Tap to speak', commandRecognized: 'Command recognized',
      tryAgain: 'Please try again', notSupported: 'Voice not supported on this browser',
    },
    vendor: {
      vendorPortal: 'Vendor Portal', becomeVendor: 'Become a Vendor',
      vendorDashboard: 'Vendor Dashboard', manageListings: 'Manage Listings',
      registerAsVendor: 'Register as Vendor', signInVendor: 'Sign In to Vendor Account',
    },
  },

  // ── FRENCH ─────────────────────────────────────────────────────────────────
  fr: {
    common: {
      welcome: 'Bienvenue', home: 'Accueil', search: 'Rechercher', login: 'Connexion',
      logout: 'Déconnexion', register: "S'inscrire", profile: 'Profil', settings: 'Paramètres',
      help: 'Aide', about: 'À propos', contact: 'Contact', save: 'Enregistrer',
      cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', submit: 'Envoyer',
      loading: 'Chargement...', error: 'Erreur', success: 'Succès', back: 'Retour',
      next: 'Suivant', continue: 'Continuer', close: 'Fermer', yes: 'Oui', no: 'Non',
      ok: 'OK', confirm: 'Confirmer', viewAll: 'Voir tout', filter: 'Filtrer',
      sort: 'Trier', share: 'Partager', report: 'Signaler', viewDetails: 'Voir les détails',
      buy: 'Acheter', sell: 'Vendre', price: 'Prix', quantity: 'Quantité',
      description: 'Description', category: 'Catégorie', location: 'Localisation',
      uploadPhoto: 'Télécharger une photo', choosePhoto: 'Choisir une photo',
      comingSoon: 'Bientôt disponible!',
    },
    nav: {
      home: 'Accueil', jobs: 'Emplois', marketplace: 'Marché', services: 'Services',
      rentals: 'Locations', vehicles: 'Véhicules', exchange: 'Échange',
      cart: 'Panier', favorites: 'Favoris', notifications: 'Notifications',
      community: 'Communauté', orders: 'Commandes', myListings: 'Mes Annonces',
    },
    auth: {
      signIn: 'Se connecter', signUp: "S'inscrire", signOut: 'Se déconnecter',
      forgotPassword: 'Mot de passe oublié?', createAccount: 'Créer un compte',
      alreadyHaveAccount: 'Vous avez déjà un compte?',
      dontHaveAccount: "Vous n'avez pas de compte?",
      username: "Nom d'utilisateur", password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe', email: 'Email', phone: 'Téléphone',
      enterUsername: "Entrez votre nom d'utilisateur, numéro de téléphone ou ID",
      enterPassword: 'Entrez votre mot de passe',
      loginSuccess: 'Connexion réussie!', loginFailed: 'Échec de la connexion.',
      registerSuccess: 'Compte créé avec succès!',
      chooseUsername: "Choisissez un nom d'utilisateur unique (sans espaces)",
    },
    jobs: {
      findJob: 'Trouver un emploi', postJob: 'Publier un emploi', jobTitle: "Titre du poste",
      company: 'Entreprise', salary: 'Salaire', jobType: "Type d'emploi",
      fullTime: 'Temps plein', partTime: 'Temps partiel', remote: 'Télétravail',
      applyNow: 'Postuler maintenant', deadline: 'Date limite', experience: 'Expérience requise',
      viewJob: "Voir les détails", noJobsFound: 'Aucun emploi trouvé.',
    },
    marketplace: {
      buyItem: 'Acheter', sellItem: 'Vendre', addToCart: 'Ajouter au panier',
      makeOffer: 'Faire une offre', contactSeller: 'Contacter le vendeur',
      newArrival: 'Nouvelle arrivée', featured: 'En vedette', condition: 'État',
      new_: 'Neuf', used: 'Occasion', noItemsFound: 'Aucun article trouvé.',
    },
    services: {
      offerService: 'Proposer un service', bookService: 'Réserver le service',
      contactProvider: 'Contacter le prestataire', callProvider: 'Appeler le prestataire',
      rating: 'Note', reviews: 'Avis', availability: 'Disponibilité',
      noServicesFound: 'Aucun service trouvé.',
    },
    rentals: {
      listProperty: 'Mettre en location', bookVisit: 'Réserver une visite',
      contactLandlord: 'Contacter le propriétaire', bedrooms: 'Chambres',
      bathrooms: 'Salles de bain', furnished: 'Meublé', monthlyRent: 'Loyer mensuel',
      availableFrom: 'Disponible à partir de', noRentalsFound: 'Aucune location trouvée.',
    },
    vehicles: {
      sellCar: 'Vendre une voiture', rentCar: 'Louer une voiture',
      contactVendor: 'Contacter le vendeur', bookTestDrive: 'Réserver un essai',
      mileage: 'Kilométrage', year: 'Année', make: 'Marque', model: 'Modèle',
      noVehiclesFound: 'Aucun véhicule trouvé.',
    },
    community: {
      createPost: 'Créer une publication', joinGroup: 'Rejoindre le groupe',
      createGroup: 'Créer un groupe', members: 'Membres', posts: 'Publications',
      joined: 'Rejoint', leaveGroup: 'Quitter le groupe',
      groupName: 'Nom du groupe', groupDescription: 'Description du groupe',
    },
    tontine: {
      createNjangi: 'Créer un groupe Njangi', joinNjangi: 'Rejoindre un Njangi',
      contribution: 'Montant de contribution', frequency: 'Fréquence',
      members: 'Membres', totalPool: 'Cagnotte totale',
    },
    farmFresh: {
      buyProduce: 'Acheter des produits', sellProduce: 'Vendre des produits',
      productName: 'Nom du produit', harvestDate: 'Date de récolte',
      quantityAvailable: 'Quantité disponible', pricePerKg: 'Prix par Kg',
      submitListing: 'Soumettre la liste', orderNow: 'Commander maintenant',
    },
    tracking: {
      trackOrders: 'Suivre les commandes', orderStatus: 'Statut de la commande',
      estimatedDelivery: 'Livraison estimée', delivered: 'Livré',
      inTransit: 'En transit', processing: 'En traitement', shipped: 'Expédié',
      outForDelivery: 'En cours de livraison', reportIssue: 'Signaler un problème',
      contactSeller: 'Contacter le vendeur',
    },
    settings: {
      editProfile: 'Modifier le profil', changePhoto: 'Changer la photo',
      changePassword: 'Changer le mot de passe', language: 'Langue',
      notifications: 'Notifications', privacy: 'Confidentialité',
      deleteAccount: 'Supprimer le compte', myListings: 'Mes annonces',
      myFavorites: 'Mes favoris', myOrders: 'Mes commandes',
    },
    voice: {
      voiceAssistant: 'Assistant vocal', listening: 'Écoute en cours...',
      speak: 'Parlez maintenant', tapToSpeak: 'Appuyez pour parler',
      commandRecognized: 'Commande reconnue', tryAgain: 'Veuillez réessayer',
      notSupported: 'Voix non supportée sur ce navigateur',
    },
    vendor: {
      vendorPortal: 'Portail Vendeur', becomeVendor: 'Devenir Vendeur',
      vendorDashboard: 'Tableau de bord Vendeur', manageListings: 'Gérer les annonces',
      registerAsVendor: 'S\'inscrire comme vendeur', signInVendor: 'Connexion Vendeur',
    },
  },

  // ── PIDGIN ENGLISH ─────────────────────────────────────────────────────────
  pcm: {
    common: {
      welcome: 'Welcome', home: 'Home', search: 'Find am', login: 'Enter',
      logout: 'Comot', register: 'Join', profile: 'My Page', settings: 'Set am',
      help: 'Help', about: 'About', contact: 'Contact', save: 'Keep am',
      cancel: 'No do am', delete: 'Throway', edit: 'Change am', submit: 'Send am',
      loading: 'E dey load...', error: 'Problem don happen', success: 'E don work!',
      back: 'Go back', next: 'Next', continue: 'Continue', close: 'Close',
      yes: 'Yes', no: 'No', ok: 'OK', confirm: 'Confirm', viewAll: 'See all',
      filter: 'Filter am', sort: 'Arrange am', share: 'Share am', report: 'Report am',
      viewDetails: 'See more', buy: 'Buy', sell: 'Sell', price: 'Price',
      quantity: 'How many', description: 'Explanation', category: 'Type',
      location: 'Where e dey', uploadPhoto: 'Put photo', choosePhoto: 'Pick photo',
      comingSoon: 'E go soon come!',
    },
    nav: {
      home: 'Home', jobs: 'Work', marketplace: 'Market', services: 'Service',
      rentals: 'Rent house', vehicles: 'Motor', exchange: 'Swap',
      cart: 'Basket', favorites: 'Like am', notifications: 'Alert',
      community: 'Ngwam', orders: 'My Orders', myListings: 'My Things',
    },
    auth: {
      signIn: 'Enter', signUp: 'Join', signOut: 'Comot',
      forgotPassword: 'You forget password?', createAccount: 'Open account',
      alreadyHaveAccount: 'You get account already?', dontHaveAccount: 'You no get account?',
      username: 'Your name for app', password: 'Secret word',
      confirmPassword: 'Write password again', email: 'Email', phone: 'Phone number',
      enterUsername: 'Put your username, phone or ID',
      enterPassword: 'Put your secret word',
      loginSuccess: 'You don enter!', loginFailed: 'E no work. Try again.',
      registerSuccess: 'Account don open!', chooseUsername: 'Pick your name (no space)',
    },
    jobs: {
      findJob: 'Find work', postJob: 'Post work', jobTitle: 'Name of work',
      company: 'Company', salary: 'Pay', jobType: 'Type of work',
      fullTime: 'Full time', partTime: 'Part time', remote: 'Work from house',
      applyNow: 'Apply now', deadline: 'Last day', experience: 'Experience wey dem want',
      viewJob: 'See work details', noJobsFound: 'No work dey here.',
    },
    marketplace: {
      buyItem: 'Buy item', sellItem: 'Sell item', addToCart: 'Put for basket',
      makeOffer: 'Make offer', contactSeller: 'Call seller', newArrival: 'New thing',
      featured: 'Special', condition: 'How e be', new_: 'New', used: 'Already used',
      noItemsFound: 'Nothing dey here.',
    },
    services: {
      offerService: 'Offer service', bookService: 'Book am',
      contactProvider: 'Call person', callProvider: 'Ring am',
      rating: 'Star', reviews: 'People talk', availability: 'When dem free',
      noServicesFound: 'No service dey.',
    },
    rentals: {
      listProperty: 'Put house for rent', bookVisit: 'Come see house',
      contactLandlord: 'Call landlord', bedrooms: 'Rooms', bathrooms: 'Toilet',
      furnished: 'With things inside', monthlyRent: 'Monthly price',
      availableFrom: 'E dey from', noRentalsFound: 'No house dey for rent.',
    },
    vehicles: {
      sellCar: 'Sell motor', rentCar: 'Rent motor', contactVendor: 'Call seller',
      bookTestDrive: 'Test drive am', mileage: 'Distance wey e don go',
      year: 'Year', make: 'Brand', model: 'Model', noVehiclesFound: 'No motor dey.',
    },
    community: {
      createPost: 'Write something', joinGroup: 'Enter group', createGroup: 'Make group',
      members: 'People', posts: 'Posts', joined: 'You don enter',
      leaveGroup: 'Comot for group', groupName: 'Group name', groupDescription: 'About group',
    },
    tontine: {
      createNjangi: 'Start Njangi', joinNjangi: 'Join Njangi',
      contribution: 'How much to put', frequency: 'How many times',
      members: 'People', totalPool: 'Total money',
    },
    farmFresh: {
      buyProduce: 'Buy farm thing', sellProduce: 'Sell farm thing',
      productName: 'Name of thing', harvestDate: 'When dem harvest am',
      quantityAvailable: 'How much dey', pricePerKg: 'Price for one kg',
      submitListing: 'Post am', orderNow: 'Order now',
    },
    tracking: {
      trackOrders: 'Track your order', orderStatus: 'How your order dey',
      estimatedDelivery: 'When e go reach', delivered: 'E don reach',
      inTransit: 'E dey road', processing: 'Dem dey arrange am',
      shipped: 'Dem don send am', outForDelivery: 'E dey come now',
      reportIssue: 'Report problem', contactSeller: 'Call seller',
    },
    settings: {
      editProfile: 'Change your page', changePhoto: 'Change picture',
      changePassword: 'Change secret word', language: 'Language',
      notifications: 'Alert', privacy: 'Privacy', deleteAccount: 'Delete account',
      myListings: 'My things', myFavorites: 'Things wey I like', myOrders: 'My orders',
    },
    voice: {
      voiceAssistant: 'Voice helper', listening: 'I dey hear...',
      speak: 'Talk now', tapToSpeak: 'Press to talk',
      commandRecognized: 'I hear you', tryAgain: 'Try am again',
      notSupported: 'This browser no support voice',
    },
    vendor: {
      vendorPortal: 'Seller place', becomeVendor: 'Become seller',
      vendorDashboard: 'Seller dashboard', manageListings: 'Manage your things',
      registerAsVendor: 'Join as seller', signInVendor: 'Enter seller account',
    },
  },

  // ── FULFULDE ───────────────────────────────────────────────────────────────
  ff: {
    common: {
      welcome: 'Jaaraama', home: 'Suudu', search: 'Yiyde', login: 'Naatirde',
      logout: 'Yaltude', register: 'Winndude', profile: 'Haayre', settings: 'Laabi',
      help: 'Ballal', about: 'Dow', save: 'Dannde', cancel: 'Haaytu',
      delete: 'Moofte', edit: 'Softo', submit: 'Neldu', loading: 'Doose...',
      error: 'Heso', success: 'Jaabii', back: 'Rutto', next: 'Yeeso',
      continue: 'Jokku', close: 'Uddu', yes: 'Eey', no: 'Alaa', ok: 'OK',
      confirm: 'Nufnitu', viewAll: 'Yiy fof', filter: 'Sifto', sort: 'Jaajnu',
      share: 'Hokku', report: 'Janga', viewDetails: 'Yiy kala',
      buy: 'Soodde', sell: 'Yoɓde', price: 'Njaru', quantity: 'Jumlal',
      description: 'Haala', category: 'Kiile', location: 'Dow',
      uploadPhoto: 'Neldu foto', choosePhoto: 'Suɓo foto', comingSoon: 'Ko ɓadii wara!',
    },
    nav: {
      home: 'Galle', jobs: 'Gollorɗe', marketplace: 'Luumo', services: 'Tiitooje',
      rentals: 'Hokkere', vehicles: 'Otooɓe', exchange: 'Njaldinaare',
      cart: 'Saakorde', favorites: 'Mbijiiɗe', notifications: 'Habraru',
      community: 'Jokkal', orders: 'Biyaaɗe', myListings: 'Teeŋte am',
    },
    auth: {
      signIn: 'Naatirde', signUp: 'Winndude', signOut: 'Yaltude',
      forgotPassword: 'A yari dingiral?', createAccount: 'Uddit limoore',
      username: 'Innde maa', password: 'Dingiral', email: 'Iimeel', phone: 'Telefon',
      enterUsername: 'Hollu innde, telefon walla ID maa',
      enterPassword: 'Hollu dingiral maa',
      loginSuccess: 'A naatii!', loginFailed: 'Naatirgal fewji.',
    },
    jobs: {
      findJob: 'Yiyde golle', postJob: 'Hollu golle', jobTitle: 'Innde golle',
      applyNow: 'Dara jooni', noJobsFound: 'Golle alaa.',
    },
    marketplace: {
      buyItem: 'Sooɗ', sellItem: 'Yoɓ', addToCart: 'Sos e saakorde',
      contactSeller: 'Noddu jeyanɗo', noItemsFound: 'Huunde alaa.',
    },
    services: {
      offerService: 'Hol tiitoore', bookService: 'Sos am',
      contactProvider: 'Noddu am', noServicesFound: 'Tiitoore alaa.',
    },
    rentals: {
      listProperty: 'Yoɓ suudu', bookVisit: 'Sos yillaade',
      contactLandlord: 'Noddu jom suudu', noRentalsFound: 'Suudu alaa.',
    },
    vehicles: {
      sellCar: 'Yoɓ oto', contactVendor: 'Noddu jeyanɗo',
      noVehiclesFound: 'Oto alaa.',
    },
    community: {
      createPost: 'Winnd ko', joinGroup: 'Naat e renndo',
      createGroup: 'Natt renndo', members: 'Yimɓe',
    },
    tontine: {
      createNjangi: 'Natt Njangi', joinNjangi: 'Naatir Njangi',
      members: 'Yimɓe', totalPool: 'Jinaa fof',
    },
    farmFresh: {
      buyProduce: 'Sooɗ lenyol', sellProduce: 'Yoɓ lenyol',
      orderNow: 'Biy jooni', submitListing: 'Neldu',
    },
    tracking: {
      trackOrders: 'Tiiɗnu biyaade', delivered: 'E yehi', inTransit: 'E laawol',
    },
    settings: {
      editProfile: 'Softu haayre', changePhoto: 'Waynu foto', language: 'Demngal',
      myListings: 'Teeŋte am', myOrders: 'Biyaaɗe am',
    },
    voice: {
      voiceAssistant: 'Ballotooɗo haala', listening: 'Mi heɗiima...',
      speak: 'Haala jooni', tapToSpeak: 'Tiiɗnu ko haala',
    },
    vendor: {
      vendorPortal: 'Portal Jeyanɗo', becomeVendor: 'Nawtu Jeyanɗo',
    },
  },

  // ── ARABIC ─────────────────────────────────────────────────────────────────
  ar: {
    common: {
      welcome: 'مرحباً', home: 'الرئيسية', search: 'بحث', login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج', register: 'إنشاء حساب', profile: 'الملف الشخصي',
      settings: 'الإعدادات', help: 'مساعدة', about: 'عن التطبيق',
      contact: 'اتصل بنا', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف',
      edit: 'تعديل', submit: 'إرسال', loading: 'جاري التحميل...', error: 'خطأ',
      success: 'نجح', back: 'رجوع', next: 'التالي', continue: 'متابعة',
      close: 'إغلاق', yes: 'نعم', no: 'لا', ok: 'موافق', confirm: 'تأكيد',
      viewAll: 'عرض الكل', filter: 'تصفية', sort: 'ترتيب', share: 'مشاركة',
      report: 'إبلاغ', viewDetails: 'عرض التفاصيل', buy: 'شراء', sell: 'بيع',
      price: 'السعر', quantity: 'الكمية', description: 'الوصف', category: 'الفئة',
      location: 'الموقع', uploadPhoto: 'رفع صورة', choosePhoto: 'اختر صورة',
      comingSoon: 'قريباً!',
    },
    nav: {
      home: 'الرئيسية', jobs: 'الوظائف', marketplace: 'السوق', services: 'الخدمات',
      rentals: 'الإيجارات', vehicles: 'المركبات', exchange: 'تبادل',
      cart: 'السلة', favorites: 'المفضلة', notifications: 'الإشعارات',
      community: 'المجتمع', orders: 'الطلبات', myListings: 'إعلاناتي',
    },
    auth: {
      signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', signOut: 'تسجيل الخروج',
      forgotPassword: 'نسيت كلمة المرور؟', createAccount: 'إنشاء حساب جديد',
      username: 'اسم المستخدم', password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور', email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      enterUsername: 'أدخل اسم المستخدم أو رقم الهاتف أو المعرف',
      enterPassword: 'أدخل كلمة المرور',
      loginSuccess: 'تم تسجيل الدخول!', loginFailed: 'فشل تسجيل الدخول.',
    },
    jobs: {
      findJob: 'البحث عن وظيفة', postJob: 'نشر وظيفة', jobTitle: 'المسمى الوظيفي',
      applyNow: 'تقدم الآن', noJobsFound: 'لا توجد وظائف.',
    },
    marketplace: {
      buyItem: 'شراء', sellItem: 'بيع', addToCart: 'أضف للسلة',
      contactSeller: 'تواصل مع البائع', noItemsFound: 'لا توجد منتجات.',
    },
    services: {
      offerService: 'تقديم خدمة', bookService: 'حجز الخدمة',
      contactProvider: 'التواصل مع المزود', noServicesFound: 'لا توجد خدمات.',
    },
    rentals: {
      listProperty: 'إضافة عقار', bookVisit: 'حجز زيارة',
      contactLandlord: 'تواصل مع المالك', noRentalsFound: 'لا توجد عقارات.',
    },
    vehicles: {
      sellCar: 'بيع سيارة', contactVendor: 'تواصل مع البائع',
      noVehiclesFound: 'لا توجد مركبات.',
    },
    community: {
      createPost: 'إنشاء منشور', joinGroup: 'الانضمام للمجموعة',
      createGroup: 'إنشاء مجموعة', members: 'الأعضاء',
    },
    tontine: {
      createNjangi: 'إنشاء مجموعة نجانجي', joinNjangi: 'الانضمام للنجانجي',
      members: 'الأعضاء', totalPool: 'المجموع',
    },
    farmFresh: {
      buyProduce: 'شراء المنتجات', sellProduce: 'بيع المنتجات',
      orderNow: 'اطلب الآن', submitListing: 'نشر الإعلان',
    },
    tracking: {
      trackOrders: 'تتبع الطلبات', delivered: 'تم التسليم', inTransit: 'في الطريق',
    },
    settings: {
      editProfile: 'تعديل الملف الشخصي', changePhoto: 'تغيير الصورة',
      language: 'اللغة', myListings: 'إعلاناتي', myOrders: 'طلباتي',
    },
    voice: {
      voiceAssistant: 'المساعد الصوتي', listening: 'أستمع...',
      speak: 'تحدث الآن', tapToSpeak: 'اضغط للتحدث',
    },
    vendor: {
      vendorPortal: 'بوابة البائع', becomeVendor: 'كن بائعاً',
    },
  },
};

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    // Read saved language from localStorage on mount
    const saved = localStorage.getItem('Bambeh_language') as LanguageCode | null;
    if (saved && AVAILABLE_LANGUAGES.some(l => l.code === saved)) {
      setLanguageState(saved);
      // Apply RTL direction for Arabic
      const info = AVAILABLE_LANGUAGES.find(l => l.code === saved);
      document.documentElement.dir = info?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('Bambeh_language', lang);
    const info = AVAILABLE_LANGUAGES.find(l => l.code === lang);
    // Apply RTL direction immediately for Arabic
    document.documentElement.dir = info?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    // Broadcast change so Header and other components can react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  // t('nav.jobs') → looks up translations[language].nav.jobs
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    const langTr = translations[language] || translations.en;
    let value: any = langTr;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    // Fall back to English if translation is missing
    if (value === undefined) {
      let fallback: any = translations.en;
      for (const k of keys) { fallback = fallback?.[k]; }
      value = fallback ?? key;
    }
    if (typeof value !== 'string') return key;
    // Replace {{param}} placeholders
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) =>
        String(params[k] ?? `{{${k}}}`));
    }
    return value;
  };

  const languageInfo = AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      language,
      languageInfo,
      setLanguage,
      t,
      availableLanguages: AVAILABLE_LANGUAGES,
      isRTL: languageInfo.rtl,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

export { LanguageContext };
export default LanguageContext;
