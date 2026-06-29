/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THEME CONTEXT - DARK MODE & BRIGHTNESS CONTROL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This context provides:
 * - Light/Dark mode toggle
 * - Brightness control (0-100%)
 * - Persists settings to localStorage
 * - Works in both regular app and vendor section
 *
 * FILE LOCATION: src/contexts/ThemeContext.tsx
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { 
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from "react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeSettings {
  mode: ThemeMode;
  brightness: number; // 0-100
  contrast: number; // 0-100
  reducedMotion: boolean;
}

export interface ThemeContextType {
  // Current state
  theme: ThemeMode;
  isDarkMode: boolean;
  brightness: number;
  contrast: number;
  reducedMotion: boolean;
  settings: ThemeSettings;

  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
  resetToDefaults: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: "light",
  brightness: 100,
  contrast: 100,
  reducedMotion: false,
};

const STORAGE_KEY = "bambeh_theme_settings";

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeProviderProps { children: ReactNode;  }

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.error("Error loading theme settings:", err);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error("Error saving theme settings:", err);
    }
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Determine actual dark mode
    let isDark = settings.mode === "dark";
    if (settings.mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Apply dark mode class
    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark-mode");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark-mode");
    }

    // Apply brightness filter
    const brightnessValue = settings.brightness / 100;
    const contrastValue = settings.contrast / 100;

    // Create or update the brightness overlay
    let overlay = document.getElementById("bambeh-brightness-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "bambeh-brightness-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99999;
        transition: background-color 0.3s ease;
      `;
      document.body.appendChild(overlay);
    }

    // Apply brightness as a dark overlay (lower brightness = darker overlay)
    if (settings.brightness < 100) {
      const darkness = 1 - brightnessValue;
      overlay.style.backgroundColor = `rgba(0, 0, 0, ${darkness * 0.7})`;
    } else {
      overlay.style.backgroundColor = "transparent";
    }

    // Apply contrast via CSS filter on root
    root.style.filter = contrastValue !== 1 ? `contrast(${contrastValue})` : "";

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [settings]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Force re-render to apply system theme
      setSettings((prev) => ({ ...prev }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.mode]);

  // Calculate isDarkMode
  const isDarkMode =
    settings.mode === "dark" ||
    (settings.mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Actions
  const setTheme = useCallback((mode: ThemeMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      mode: prev.mode === "dark" ? "light" : "dark",
    }));
  }, []);

  const setBrightness = useCallback((value: number) => {
    const clamped = Math.max(20, Math.min(100, value)); // Min 20% for readability
    setSettings((prev) => ({ ...prev, brightness: clamped }));
  }, []);

  const setContrast = useCallback((value: number) => {
    const clamped = Math.max(50, Math.min(150, value));
    setSettings((prev) => ({ ...prev, contrast: clamped }));
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value: ThemeContextType = {
    theme: settings.mode,
    isDarkMode,
    brightness: settings.brightness,
    contrast: settings.contrast,
    reducedMotion: settings.reducedMotion,
    settings,
    setTheme,
    toggleDarkMode,
    setBrightness,
    setContrast,
    setReducedMotion,
    resetToDefaults
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;





