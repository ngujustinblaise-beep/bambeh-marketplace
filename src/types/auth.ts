export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  photoURL?: string;
  tier?: "free" | "basic" | "premium" | "enterprise";
  role?: string;
  isVendor?: boolean;
  isAdmin?: boolean;
  phoneNumber?: string;
  createdAt?: string;
}
