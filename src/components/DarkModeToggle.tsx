/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DARK MODE TOGGLE - THEME SWITCHER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE LOCATION: src/components/theme/DarkModeToggle.tsx
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  SunDim,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

interface DarkModeToggleProps {
  showBrightness?: boolean;
  showContrast?: boolean;
  compact?: boolean;
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  showBrightness = false,
  showContrast = false,
  compact = false,
  className = ''
}) => {
  const {
    theme,
    isDarkMode,
    brightness,
    contrast,
    setTheme,
    toggleDarkMode,
    setBrightness,
    setContrast,
    resetToDefaults
  } = useTheme();

  const [expanded, setExpanded] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  if (compact) {
    return (
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg transition-colors ${
          isDarkMode
            ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${className}`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-teal-100'}`}>
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-yellow-400" />
            ) : (
              <Sun className="w-5 h-5 text-teal-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Display Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {theme === 'system' ? 'System' : isDarkMode ? 'Dark Mode' : 'Light Mode'},
              {brightness < 100 && ` • ${brightness}% brightness`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="p-4 pt-0 space-y-4 border-t dark:border-slate-700">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                        : 'border-gray-200 dark:border-slate-600 hover:border-teal-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`text-xs font-medium ${
                      isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {(showBrightness || true) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <SunDim className="w-4 h-4" />
                  Brightness
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">{brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Dim</span>
                <span>Bright</span>
              </div>
            </div>
          )}

          {showContrast && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Contrast
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          )}

          <button
            onClick={resetToDefaults}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE TOGGLE BUTTON (for headers)
// ═══════════════════════════════════════════════════════════════════════════

export const DarkModeButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative p-2 rounded-full transition-all duration-300 ${
        isDarkMode
          ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
          isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
        }`} />
        <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
          isDarkMode ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
        }`} />
      </div>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BRIGHTNESS QUICK CONTROLS (for settings pages)
// ═══════════════════════════════════════════════════════════════════════════

export const BrightnessControl: React.FC = () => {
  const { brightness, setBrightness } = useTheme();

  const presets = [
    { value: 100, label: '100%', icon: '☀ï¸' },
    { value: 80, label: '80%', icon: '🌤ï¸' },
    { value: 60, label: '60%', icon: '⛅' },
    { value: 40, label: '40%', icon: '🌙' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Screen Brightness
        </span>
        <span className="text-sm text-gray-500">{brightness}%</span>
      </div>

      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setBrightness(preset.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              brightness === preset.value
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{preset.icon}</span>
            {preset.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min="20"
        max="100"
        value={brightness}
        onChange={(e) => setBrightness(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-teal-500"
      />
    </div>
  );
};

export default DarkModeToggle;


