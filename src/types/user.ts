// ============================================
// USER TYPE DEFINITIONS - FIXED VERSION
// File: src/types/user.ts
// ============================================

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  role: "admin" | "vendor" | "user";
  tier?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile extends User {
  bio?: string;
  location?: {
    region: string;
    city: string;
    address: string;
  };
  preferredLanguage?: string;
  verified?: boolean;
}

export interface SignUpData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

