/**
 * TronLink Wallet Connection Utilities
 * Handles TronLink detection, connection, and deep linking
 */

export interface TronLinkConnectionResult {
  success: boolean;
  address?: string;
  error?: string;
  action?: 'installed' | 'redirect' | 'install_needed';
}

const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'

/**
 * Wait for TronLink to be injected and ready
 */
const waitForTronLink = async (maxWait = 3000): Promise<boolean> => {
  if (WEB3_DISABLED) return false
  if (typeof window === 'undefined') return false;

  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const tronWeb = (window as any).tronWeb;

    // Check if TronLink is injected AND ready
    if (tronWeb && tronWeb.ready) {
      return true;
    }

    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // After timeout, check one more time if tronWeb exists (might not be ready but exists)
  return Boolean((window as any).tronWeb);
};

/**
 * Check if TronLink extension is installed
 */
export const isTronLinkInstalled = (): boolean => {
  if (WEB3_DISABLED) return false
  if (typeof window === 'undefined') return false;

  try {
    // TronLink injects window.tronWeb
    const tronWeb = (window as any).tronWeb;
    return Boolean(tronWeb);
  } catch (error) {
    console.debug('TronLink detection failed:', error);
    return false;
  }
};

/**
 * Connect to TronLink wallet
 * This will trigger the TronLink extension popup if not already connected
 */
export const connectTronLink = async (): Promise<TronLinkConnectionResult> => {
  try {
    if (WEB3_DISABLED) {
      return { success: false, error: 'Web3 wallet support disabled.' }
    }
    // Ensure browser context
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'Not in browser context. Please refresh the page.',
      };
    }

    // Wait for TronLink to be available
    const isAvailable = await waitForTronLink();

    if (!isAvailable) {
      // TronLink not detected
      return {
        success: false,
        error: 'TronLink extension not found. Please install TronLink from tronlink.org or use QR Code payment.',
        action: 'install_needed',
      };
    }

    const tronWeb = (window as any).tronWeb;

    // Check if TronLink is ready (user is logged in)
    if (!tronWeb.ready) {
      // TronLink is installed but not ready (user not logged in or locked)

      // Try to request connection anyway - this should trigger TronLink popup
      try {
        // Wait a bit for TronLink to initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check again after waiting
        if (tronWeb.ready) {
          const address = tronWeb.defaultAddress?.base58;

          if (!address) {
            return {
              success: false,
              error: 'TronLink is locked or no account selected. Please unlock TronLink and try again.',
            };
          }

          return {
            success: true,
            address: address,
            action: 'installed',
          };
        }

        // Still not ready - ask user to unlock
        return {
          success: false,
          error: 'Please unlock your TronLink wallet and refresh the page, then try again.',
        };
      } catch (readyError) {
        console.error('TronLink ready check error:', readyError);
        return {
          success: false,
          error: 'TronLink is not ready. Please unlock your TronLink wallet and try again.',
        };
      }
    }

    // TronLink is ready, get the address
    const address = tronWeb.defaultAddress?.base58;

    if (!address) {
      return {
        success: false,
        error: 'No TronLink account found. Please create or import a wallet in TronLink.',
      };
    }

    // Success
    return {
      success: true,
      address: address,
      action: 'installed',
    };

  } catch (error: any) {
    console.error('TronLink connection error:', error);

    return {
      success: false,
      error: error.message || 'Failed to connect to TronLink. Please try QR Code payment.',
    };
  }
};

/**
 * Request TronLink account access
 * This is the NEW TronLink API that should trigger the popup
 */
export const requestTronLinkAccess = async (): Promise<TronLinkConnectionResult> => {
  try {
    if (WEB3_DISABLED) {
      return { success: false, error: 'Web3 wallet support disabled.' }
    }
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'Not in browser context.',
      };
    }

    // Wait for TronLink
    const isAvailable = await waitForTronLink(5000);

    if (!isAvailable) {
      return {
        success: false,
        error: 'TronLink extension not found. Please install TronLink.',
        action: 'install_needed',
      };
    }

    const tronLink = (window as any).tronLink;
    const tronWeb = (window as any).tronWeb;

    // Try the new TronLink API first (v4.0+)
    if (tronLink && typeof tronLink.request === 'function') {
      try {
        console.log('Requesting TronLink accounts using new API...')

        // This should trigger the TronLink popup
        const response = await tronLink.request({
          method: 'tron_requestAccounts',
        });

        console.log('TronLink response:', response)

        if (response && response.code === 200) {
          // Get the address from tronWeb
          const address = tronWeb?.defaultAddress?.base58;

          if (address) {
            return {
              success: true,
              address: address,
              action: 'installed',
            };
          }
        } else if (response && response.code === 4001) {
          return {
            success: false,
            error: 'Connection request was rejected. Please approve the request and try again.',
          };
        } else {
          // Unknown response
          console.error('Unknown TronLink response:', response);
        }
      } catch (requestError: any) {
        console.error('TronLink request error:', requestError);

        // Check for specific error codes
        if (requestError.code === 4001) {
          return {
            success: false,
            error: 'You rejected the connection request.',
          };
        }
      }
    }

    // Fallback to old API or already-connected check
    if (tronWeb && tronWeb.ready) {
      const address = tronWeb.defaultAddress?.base58;

      if (address) {
        return {
          success: true,
          address: address,
          action: 'installed',
        };
      }
    }

    // If we get here, connection failed
    return {
      success: false,
      error: 'Failed to connect to TronLink. Please ensure TronLink is unlocked and try again.',
    };

  } catch (error: any) {
    console.error('TronLink access request error:', error);
    return {
      success: false,
      error: 'Unexpected error connecting to TronLink. Please try again.',
    };
  }
};

/**
 * Get TronLink connection instructions
 */
export const getTronLinkInstructions = (): string => {
  const installed = isTronLinkInstalled();

  if (!installed) {
    return 'TronLink extension required. Click to install from Chrome Web Store.';
  }

  return 'Click to connect your TronLink wallet.';
};

/**
 * Get TronLink download URL
 */
export const getTronLinkDownloadUrl = (): string => {
  return 'https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec';
};

// Extend Window interface for TronLink
declare global {
  interface Window {
    tronWeb?: any;
    tronLink?: any;
  }
}
