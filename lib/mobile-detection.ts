/**
 * Mobile Detection Utilities
 * Detects device type, OS, and browser for wallet connection flows
 */

export interface DeviceInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMetaMaskBrowser: boolean;
  isMetaMaskInstalled: boolean;
}

/**
 * Detect if user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for mobile device patterns
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
};

/**
 * Detect if user is on Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent);
};

/**
 * Detect if user is on iOS (iPhone, iPad, iPod)
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
};

/**
 * Check if user is already in MetaMask mobile browser
 */
export const isMetaMaskBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  return /MetaMask/i.test(userAgent);
};

/**
 * Check if MetaMask extension is installed (desktop) or app is installed (mobile)
 * CRITICAL: Must NEVER throw - this is called during component initialization
 */
export const isMetaMaskInstalled = (): boolean => {
  const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'
  if (WEB3_DISABLED) return false
  // Safety check: ensure we're in browser context
  if (typeof window === 'undefined') return false;

  try {
    // Safely access ethereum object
    const ethereum = (window as any).ethereum;

    // Check if ethereum provider exists and is MetaMask
    // Use optional chaining and nullish coalescing for safety
    return Boolean(
      ethereum &&
      (ethereum.isMetaMask === true || ethereum._metamask)
    );
  } catch (error) {
    // Catch any unexpected errors from accessing window.ethereum
    // This can happen if MetaMask extension is in an error state
    console.debug('MetaMask detection failed:', error);
    return false;
  }
};

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  return {
    isMobile: isMobileDevice(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isMetaMaskBrowser: isMetaMaskBrowser(),
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
};

/**
 * Get the appropriate app store URL based on device
 */
export const getAppStoreUrl = (): string | null => {
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isAndroid) {
    return 'https://play.google.com/store/apps/details?id=io.metamask';
  }

  if (deviceInfo.isIOS) {
    return 'https://apps.apple.com/app/metamask/id1438144202';
  }

  return null;
};
