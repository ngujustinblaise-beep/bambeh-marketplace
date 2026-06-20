/**
 * BAMBÃ‰ MARKETPLACE - ENVIRONMENT CONFIGURATION
 * Advanced Features Configuration
 * Version: 1.0.0
 */

export const ENV_CONFIG = {
  // Google Maps Configuration
  GOOGLE_MAPS: {
    API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_HERE", // Get from Google Cloud Console,
    LIBRARIES: ["places", "geometry", "directions"] as const,
    DEFAULT_CENTER: {
      lat: 3.848, // YaoundÃ©, ,
      lng: 11.5021,
    },
    DEFAULT_ZOOM: 13,
    MAP_STYLES: {
      height: "400px",
      width: "100%",
    },
  },

  // MTN Mobile Money Configuration
  MTN_MOMO: {
    API_URL: "https://sandbox.momodeveloper.mtn.com", // Change to production URL when ready,
    PRIMARY_KEY: "YOUR_MTN_PRIMARY_KEY_HERE",
    SECONDARY_KEY: "YOUR_MTN_SECONDARY_KEY_HERE",
    CALLBACK_URL: "https://yourdomain.com/api/mtn/callback",
    CURRENCY: "XAF",
    ENVIRONMENT: "sandbox", // Change to 'production' when ready
  },

  // Orange Money Configuration
  ORANGE_MONEY: {
    API_URL: "https://api.orange.com/orange-money-webpay/cm/v1",
    MERCHANT_KEY: "YOUR_ORANGE_MERCHANT_KEY_HERE",
    MERCHANT_ID: "YOUR_ORANGE_MERCHANT_ID_HERE",
    CALLBACK_URL: "https://yourdomain.com/api/orange/callback",
    CURRENCY: "XAF",
    COUNTRY_CODE: "CM",
  },

  // Africa's Talking SMS Configuration
  AFRICAS_TALKING: {
    API_KEY: "YOUR_AFRICAS_TALKING_API_KEY_HERE",
    USERNAME: "YOUR_AFRICAS_TALKING_USERNAME",
    SENDER_ID: "BAMBE",
    SMS_GATEWAY_URL: "https://api.africastalking.com/version1/messaging",
  },

  // Push Notification Configuration
  PUSH_NOTIFICATIONS: {
    VAPID_PUBLIC_KEY: "YOUR_VAPID_PUBLIC_KEY_HERE",
    FCM_SERVER_KEY: "YOUR_FCM_SERVER_KEY_HERE",
    FCM_SENDER_ID: "YOUR_FCM_SENDER_ID_HERE",
  },

  // Email Configuration (Using SendGrid or your preferred service)
  EMAIL: {
    SMTP_HOST: "smtp.sendgrid.net",
    SMTP_PORT: 587,
    SMTP_USER: "apikey",
    SMTP_PASSWORD: "YOUR_SENDGRID_API_KEY_HERE",
    FROM_EMAIL: "noreply@bambe.cm",
    FROM_NAME: "BambÃ© Marketplace",
  },

  // Backend API Configuration
  API: {
    BASE_URL: "https://api.bambe.cm", // Your backend API URL,
    TIMEOUT: 30000,
    WEBSOCKET_URL: "wss://api.bambe.cm/socket",
  },

  // Feature Flags
  FEATURES: {
    GPS_TRACKING_ENABLED: true,
    PUSH_NOTIFICATIONS_ENABLED: true,
    SMS_NOTIFICATIONS_ENABLED: true,
    EMAIL_NOTIFICATIONS_ENABLED: true,
    MTN_MOMO_ENABLED: true,
    ORANGE_MONEY_ENABLED: true,
    ADMIN_PANEL_ENABLED: true,
  },
};

export default ENV_CONFIG;

