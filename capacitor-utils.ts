import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Check if app is running on native platform
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get device information
 */
export const getDeviceInfo = async () => {
  try {
    const info = await Device.getInfo();
    return {
      platform: info.platform,
      model: info.model,
      manufacturer: info.manufacturer,
      osVersion: info.osVersion,
      isVirtual: info.isVirtual,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
};

/**
 * Share content using native share dialog
 */
export const shareContent = async (
  title: string,
  text: string,
  url?: string
): Promise<boolean> => {
  if (!isNative()) {
    // Fallback for web
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        console.error('Web share failed:', error);
        return false;
      }
    }
    return false;
  }

  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share via',
    });
    return true;
  } catch (error) {
    console.error('Native share failed:', error);
    return false;
  }
};

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (
  style: 'light' | 'medium' | 'heavy' = 'medium'
): Promise<void> => {
  if (!isNative()) return;

  try {
    const impactStyle =
      style === 'light'
        ? ImpactStyle.Light
        : style === 'heavy'
        ? ImpactStyle.Heavy
        : ImpactStyle.Medium;

    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('Haptic feedback failed:', error);
  }
};

/**
 * Trigger vibration feedback
 */
export const triggerVibration = async (duration = 100): Promise<void> => {
  if (!isNative()) {
    // Fallback for web
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
    return;
  }

  try {
    await Haptics.vibrate({ duration });
  } catch (error) {
    console.error('Vibration failed:', error);
  }
};

/**
 * Check network connectivity
 */
export const checkNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  } catch (error) {
    console.error('Error checking network status:', error);
    return { connected: true, connectionType: 'unknown' };
  }
};

/**
 * Listen to network status changes
 */
export const addNetworkListener = (
  callback: (status: { connected: boolean; connectionType: string }) => void
) => {
  if (!isNative()) return () => {};

  const listener = Network.addListener('networkStatusChange', (status) => {
    callback({
      connected: status.connected,
      connectionType: status.connectionType,
    });
  });

  return () => {
    listener.remove();
  };
};

/**
 * Set status bar color
 */
export const setStatusBarColor = async (
  color: string,
  style: 'light' | 'dark' = 'dark'
): Promise<void> => {
  if (!isNative()) return;

  try {
    await StatusBar.setBackgroundColor({ color });
    await StatusBar.setStyle({
      style: style === 'light' ? Style.Light : Style.Dark,
    });
  } catch (error) {
    console.error('Error setting status bar:', error);
  }
};

/**
 * Hide status bar
 */
export const hideStatusBar = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Error hiding status bar:', error);
  }
};

/**
 * Show status bar
 */
export const showStatusBar = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Error showing status bar:', error);
  }
};

/**
 * Copy text to clipboard (Capacitor-compatible)
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (isNative()) {
      // Use Capacitor Clipboard plugin if available
      // @ts-ignore - Clipboard plugin would be imported separately if needed
      if (window.Capacitor?.Plugins?.Clipboard) {
        // @ts-ignore
        await window.Capacitor.Plugins.Clipboard.write({ string: text });
        return true;
      }
    }
    
    // Fallback to web API
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Get safe area insets for notched devices
 */
export const getSafeAreaInsets = () => {
  if (!isNative()) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
  };
};

/**
 * Format phone number for 
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +237 prefix if not present
  if (!cleaned.startsWith('237')) {
    return `+237${cleaned}`;
  }
  
  return `+${cleaned}`;
};

/**
 * Validate  phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  //  phone numbers are 9 digits (6XX XXX XXX)
  // With country code: 237 6XX XXX XXX (12 digits total)
  return cleaned.length === 9 || (cleaned.startsWith('237') && cleaned.length === 12);
};

/**
 * Format XAF currency
 */
export const formatXAF = (amount: number): string => {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on web
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

