// API Configuration for Bambeh Marketplace
export const API_BASE_URL =
  "https://us-central1-bambe-marketplace.cloudfunctions.net";

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth-login`,
    register: `${API_BASE_URL}/auth-register`,
    verify: `${API_BASE_URL}/auth-verify`,
    logout: `${API_BASE_URL}/auth-logout`,
    refreshToken: `${API_BASE_URL}/auth-refresh`,
  },
  jobs: {
    list: `${API_BASE_URL}/jobs-list`,
    create: `${API_BASE_URL}/jobs-create`,
    detail: (id: string) => `${API_BASE_URL}/jobs-detail/${id}`,
    update: (id: string) => `${API_BASE_URL}/jobs-update/${id}`,
    delete: (id: string) => `${API_BASE_URL}/jobs-delete/${id}`,
  },
  marketplace: {
    list: `${API_BASE_URL}/marketplace-list`,
    create: `${API_BASE_URL}/marketplace-create`,
    detail: (id: string) => `${API_BASE_URL}/marketplace-detail/${id}`,
    update: (id: string) => `${API_BASE_URL}/marketplace-update/${id}`,
    delete: (id: string) => `${API_BASE_URL}/marketplace-delete/${id}`,
  },
  properties: {
    list: `${API_BASE_URL}/properties-list`,
    create: `${API_BASE_URL}/properties-create`,
    detail: (id: string) => `${API_BASE_URL}/properties-detail/${id}`,
    update: (id: string) => `${API_BASE_URL}/properties-update/${id}`,
    delete: (id: string) => `${API_BASE_URL}/properties-delete/${id}`,
  },
  services: {
    list: `${API_BASE_URL}/services-list`,
    create: `${API_BASE_URL}/services-create`,
    detail: (id: string) => `${API_BASE_URL}/services-detail/${id}`,
    update: (id: string) => `${API_BASE_URL}/services-update/${id}`,
    delete: (id: string) => `${API_BASE_URL}/services-delete/${id}`,
  },
  payments: {
    initiate: `${API_BASE_URL}/payment-initiate`,
    verify: `${API_BASE_URL}/payment-verify`,
    status: (id: string) => `${API_BASE_URL}/payment-status/${id}`,
  },
  subscriptions: {
    create: `${API_BASE_URL}/subscription-create`,
    cancel: `${API_BASE_URL}/subscription-cancel`,
    status: `${API_BASE_URL}/subscription-status`,
  },
  zerm: {
    balance: `${API_BASE_URL}/zerm-balance`,
    transfer: `${API_BASE_URL}/zerm-transfer`,
    history: `${API_BASE_URL}/zerm-history`,
  },
};

export const API_CONFIG = {
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};
