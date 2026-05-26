// globals.d.ts - Bambeh Marketplace
// Stubs for React Native APIs used in web code

declare const __DEV__: boolean;

declare const AsyncStorage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};

declare const GoogleSignin: {
  configure: (options: Record<string, unknown>) => void;
  signIn: () => Promise<{ idToken?: string }>;
  signOut: () => Promise<void>;
  isSignedIn: () => Promise<boolean>;
  hasPlayServices: () => Promise<boolean>;
  supportedAuthenticationTypesAsync?: () => Promise<number[]>;
  AuthenticationType?: {
    FINGERPRINT: number;
    FACIAL_RECOGNITION: number;
    IRIS: number;
  };
};

declare const LocalAuthentication: {
  authenticateAsync: (
    options?: Record<string, unknown>,
  ) => Promise<{ success: boolean }>;
  hasHardwareAsync: () => Promise<boolean>;
  isEnrolledAsync: () => Promise<boolean>;
  supportedAuthenticationTypesAsync: () => Promise<number[]>;
  AuthenticationType: {
    FINGERPRINT: number;
    FACIAL_RECOGNITION: number;
    IRIS: number;
  };
};

declare const Store: unknown;

interface Window {
  gtag?: (...args: unknown[]) => void;
}
