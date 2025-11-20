/**
 * MetaMask Mobile Deep Linking Utilities - FIXED VERSION
 * Handles connection, deep linking, and app store redirects for mobile devices
 */

import {
  getDeviceInfo,
  getAppStoreUrl,
  isMetaMaskBrowser,
  isMetaMaskInstalled,
} from './mobile-detection';
import { getRecommendedTimeout } from './mobile-utils';

const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'

export interface MetaMaskMobileOptions {
  redirectUrl?: string;
  fallbackUrl?: string;
}

/**
 * Wait for MetaMask provider to be available
 * CRITICAL FIX: Prevents "Failed to connect" errors on page load
 */
const waitForMetaMask = async (maxWait = 3000): Promise<boolean> => {
  if (WEB3_DISABLED) return false
  if (typeof window === 'undefined') return false;
  
  const start = Date.now();
  
  // Check every 100ms for ethereum provider
  while (Date.now() - start < maxWait) {
    if (window.ethereum) {
      // Extra check for isMetaMask to avoid other wallet conflicts
      if ((window as any).ethereum?.isMetaMask) {
        return true;
      }
      // If ethereum exists but no isMetaMask flag, wait a bit more
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return Boolean(window.ethereum);
};

/**
 * Generate MetaMask deep link URL for mobile
 * Opens the current dApp in MetaMask mobile browser
 */
export const generateMetaMaskDeepLink = (options?: MetaMaskMobileOptions): string => {
  const currentUrl = options?.redirectUrl || window.location.href;

  // Remove protocol and encode URL properly to handle special characters
  const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');
  const encodedUrl = encodeURIComponent(urlWithoutProtocol);
  
  // MetaMask mobile deep link format
  const deepLink = `https://metamask.app.link/dapp/${encodedUrl}`;

  return deepLink;
};

/**
 * Generate MetaMask transaction deep link for mobile
 * Opens MetaMask with transaction pre-filled
 */
export const generateMetaMaskTransactionDeepLink = (
  to: string,
  amount: string,
  contractAddress?: string,
  chainId?: string
): string => {
  // USDT BSC Contract Address
  const USDT_BSC_CONTRACT = contractAddress || '0x55d398326f99059fF775485246999027B3197955';
  const BSC_CHAIN_ID = chainId || '0x38'; // BSC mainnet
  
  // Convert amount to wei (USDT has 18 decimals on BSC)
  const amountInWei = BigInt(Math.floor(Number(amount) * 1e18)).toString();
  
  // MetaMask transaction deep link format
  // Format: https://link.metamask.io/send/{contractAddress}@{chainId}?address={to}&uint256={amount}
  const params = new URLSearchParams({
    address: to,
    uint256: amountInWei,
  });
  
  const deepLink = `https://link.metamask.io/send/${USDT_BSC_CONTRACT}@${parseInt(BSC_CHAIN_ID, 16)}?${params.toString()}`;
  
  return deepLink;
};

/**
 * Open MetaMask mobile app with deep link
 */
export const openMetaMaskMobile = (options?: MetaMaskMobileOptions): void => {
  if (WEB3_DISABLED) {
    console.warn('WEB3_DISABLED: openMetaMaskMobile no-op')
    return
  }
  const deviceInfo = getDeviceInfo();

  // If already in MetaMask browser, no need to redirect
  if (deviceInfo.isMetaMaskBrowser) {
    console.log('Already in MetaMask browser');
    return;
  }

  const deepLink = generateMetaMaskDeepLink(options);

  // On mobile, we must use location.href for deep links to work properly
  // This will navigate away from the page to open MetaMask browser
  window.location.href = deepLink;
  
  // Note: We don't automatically redirect to app store because:
  // 1. If MetaMask is installed, it will open the dapp
  // 2. If MetaMask is not installed, the deep link will fail gracefully
  // 3. User can manually install MetaMask if needed
};

/**
 * Open MetaMask mobile app with transaction pre-filled
 */
export const openMetaMaskMobileWithTransaction = (
  to: string,
  amount: string,
  contractAddress?: string,
  chainId?: string
): void => {
  if (WEB3_DISABLED) {
    console.warn('WEB3_DISABLED: openMetaMaskMobileWithTransaction no-op')
    return
  }
  const deviceInfo = getDeviceInfo();

  // If already in MetaMask browser, no need to redirect
  if (deviceInfo.isMetaMaskBrowser) {
    console.log('Already in MetaMask browser');
    return;
  }

  const transactionDeepLink = generateMetaMaskTransactionDeepLink(to, amount, contractAddress, chainId);
  
  console.log('Opening MetaMask with transaction:', transactionDeepLink);

  // On mobile, we must use location.href for deep links to work
  // This will navigate away from the page, but MetaMask will open with transaction
  // User will complete transaction in MetaMask, then return to page to enter hash
  window.location.href = transactionDeepLink;
  
  // Note: We don't redirect to app store here because:
  // 1. If MetaMask is installed, it will open
  // 2. If MetaMask is not installed, the deep link will fail and user can manually install
  // 3. The user can always return to the page and use QR code payment instead
};

/**
 * Redirect user to appropriate app store
 */
export const redirectToAppStore = (): void => {
  const appStoreUrl = getAppStoreUrl();

  if (appStoreUrl) {
    window.location.href = appStoreUrl;
  } else {
    console.error('Unable to determine app store URL for this device');
  }
};

/**
 * Handle MetaMask connection based on device type
 * Returns a promise that resolves with connection result
 * FIXED: Added proper provider detection and error handling
 */
export const connectMetaMaskMobile = async (): Promise<{
  success: boolean;
  account?: string;
  error?: string;
  action?: 'installed' | 'redirect' | 'app_store';
}> => {
  try {
    if (WEB3_DISABLED) {
      return { success: false, error: 'Web3 wallet support disabled.' }
    }
    // CRITICAL FIX: Ensure we're in browser context
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'Not in browser context. Please refresh the page.',
      };
    }

    const deviceInfo = getDeviceInfo();

    // ========================================
    // DESKTOP OR METAMASK ALREADY DETECTED
    // ========================================
    if (!deviceInfo.isMobile || deviceInfo.isMetaMaskInstalled || deviceInfo.isMetaMaskBrowser) {
      console.log('Attempting desktop/installed MetaMask connection...');
      
      try {
        // CRITICAL FIX: Wait for MetaMask to load (prevents race conditions)
        const isReady = await waitForMetaMask();
        
        if (!isReady) {
          console.warn('MetaMask provider not detected after waiting');
          
          // On desktop, this means MetaMask isn't installed
          if (!deviceInfo.isMobile) {
            return {
              success: false,
              error: 'MetaMask is not installed. Please install from metamask.io or use QR Code payment.',
            };
          }
          
          // On mobile, fall through to mobile-specific logic below
        } else {
          // Provider is ready, proceed with connection
          const ethereum = (window as any).ethereum;

          // Double-check ethereum exists (TypeScript safety)
          if (!ethereum) {
            return {
              success: false,
              error: 'MetaMask provider disappeared. Please refresh and try again.',
            };
          }

          // Verify it has the request method
          if (typeof ethereum.request !== 'function') {
            return {
              success: false,
              error: 'Invalid wallet provider. Please use MetaMask or try QR Code payment.',
            };
          }

          // CRITICAL FIX: Check if MetaMask is locked
          try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              console.log('Already connected to MetaMask');
              return {
                success: true,
                account: accounts[0],
                action: 'installed',
              };
            }
          } catch (checkError) {
            console.log('Not connected yet, will request connection');
          }

          // FIXED: Better timeout handling (30s for user interaction)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), 30000);
          });

          try {
            // Request account access with proper timeout
            const accounts = await Promise.race([
              ethereum.request({
                method: 'eth_requestAccounts'
              }),
              timeoutPromise
            ]);

            if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
              return {
                success: false,
                error: 'No accounts found. Please unlock MetaMask or create an account.',
              };
            }

            console.log('Successfully connected to MetaMask:', accounts[0]);

            return {
              success: true,
              account: accounts[0],
              action: 'installed',
            };

          } catch (requestError: any) {
            // FIXED: Better error handling with specific messages
            console.error('MetaMask request error:', requestError);

            // Check if it's the timeout error we created
            if (requestError.message === 'TIMEOUT') {
              return {
                success: false,
                error: 'Connection timed out. Please ensure MetaMask is unlocked and try again.',
              };
            }

            let errorMessage = 'Failed to connect to MetaMask';

            // Handle MetaMask-specific error codes
            if (requestError.code === 4001) {
              errorMessage = 'You rejected the connection request. Please try again and approve.';
            } else if (requestError.code === -32002) {
              errorMessage = 'Connection request already pending. Please check your MetaMask extension and approve or reject the pending request.';
            } else if (requestError.code === -32603) {
              errorMessage = 'MetaMask internal error. Please close and reopen MetaMask, then try again.';
            } else if (requestError.message) {
              const msg = requestError.message.toLowerCase();
              
              if (msg.includes('user denied') || msg.includes('user rejected')) {
                errorMessage = 'Connection was denied. Please try again and approve the request.';
              } else if (msg.includes('already processing')) {
                errorMessage = 'Please complete or cancel the pending request in MetaMask before trying again.';
              } else if (msg.includes('not connected') || msg.includes('disconnected')) {
                errorMessage = 'MetaMask disconnected. Please refresh the page and try again.';
              } else {
                // Include original message for debugging
                errorMessage = `Connection failed: ${requestError.message}`;
              }
            }

            return {
              success: false,
              error: errorMessage,
            };
          }
        }
      } catch (error: any) {
        console.error('Unexpected MetaMask connection error:', error);
        
        return {
          success: false,
          error: 'Unexpected error connecting to MetaMask. Please try QR Code payment.',
        };
      }
    }

    // ========================================
    // MOBILE DEVICE WITHOUT METAMASK BROWSER
    // ========================================
    if (deviceInfo.isMobile && !deviceInfo.isMetaMaskBrowser) {
      console.log('Mobile device detected, checking for MetaMask app...');
      
      // Wait briefly for ethereum provider (some mobile wallets inject it)
      const hasProvider = await waitForMetaMask(1000);

      if (hasProvider) {
        console.log('MetaMask provider detected on mobile, attempting direct connection...');
        
        // Try direct connection first (user might have MetaMask mobile injected)
        try {
          const ethereum = (window as any).ethereum;
          
          if (ethereum && typeof ethereum.request === 'function') {
            const accounts = await ethereum.request({
              method: 'eth_requestAccounts'
            });

            if (accounts && accounts.length > 0) {
              return {
                success: true,
                account: accounts[0],
                action: 'installed',
              };
            }
          }
        } catch (directError) {
          console.log('Direct connection failed, falling back to deep link');
        }

        // If direct connection failed, try deep link
        try {
          openMetaMaskMobile();
          return {
            success: false,
            error: 'Opening MetaMask mobile app...',
            action: 'redirect',
          };
        } catch (openError) {
          console.error('Failed to open MetaMask mobile:', openError);
        }
      }

      // No provider detected, redirect to app store
      console.log('No MetaMask detected, redirecting to app store...');
      try {
        redirectToAppStore();
      } catch (redirectError) {
        console.error('Failed to redirect to app store:', redirectError);
      }
      
      return {
        success: false,
        error: 'MetaMask not installed. Redirecting to app store...',
        action: 'app_store',
      };
    }

    // Fallback for any unhandled cases
    return {
      success: false,
      error: 'Unable to connect. Please try QR Code payment instead.',
    };

  } catch (unexpectedError: any) {
    // Catch-all for truly unexpected errors
    console.error('Unexpected error in connectMetaMaskMobile:', unexpectedError);
    return {
      success: false,
      error: 'An unexpected error occurred. Please refresh and try again, or use QR Code payment.',
    };
  }
};

/**
 * Show user-friendly instruction based on device
 */
export const getConnectionInstructions = (): string => {
  if (WEB3_DISABLED) return 'Wallet features are disabled. Use QR code or contact support.'
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMetaMaskBrowser) {
    return 'Click connect to authorize this dApp in MetaMask.';
  }

  if (deviceInfo.isMobile && !deviceInfo.isMetaMaskInstalled) {
    const platform = deviceInfo.isAndroid ? 'Play Store' : 'App Store';
    return `MetaMask app is required. You'll be redirected to ${platform} to install it.`;
  }

  if (deviceInfo.isMobile && deviceInfo.isMetaMaskInstalled) {
    return 'Click connect to open this page in MetaMask mobile browser.';
  }

  return 'Click connect to open MetaMask extension.';
};

/**
 * Check if we should show mobile-specific UI
 */
export const shouldShowMobileUI = (): boolean => {
  if (WEB3_DISABLED) return false
  const deviceInfo = getDeviceInfo();
  return deviceInfo.isMobile;
};

/**
 * Get appropriate button text based on device state
 */
export const getConnectButtonText = (): string => {
  if (WEB3_DISABLED) return 'Wallets Disabled'
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMetaMaskBrowser) {
    return 'Connect Wallet';
  }

  if (deviceInfo.isMobile) {
    if (deviceInfo.isMetaMaskInstalled) {
      return 'Open in MetaMask';
    } else {
      return 'Install MetaMask';
    }
  }

  return 'Connect MetaMask';
};