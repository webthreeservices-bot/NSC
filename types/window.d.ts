/**
 * Window type declarations for Web3 providers
 * Extends the global Window interface with crypto wallet types
 */

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isTrust?: boolean;
    isOkx?: boolean;
    isCoinbaseWallet?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    removeAllListeners?: (event?: string) => void;
    selectedAddress?: string | null;
    chainId?: string;
    networkVersion?: string;
  };
  tronWeb?: any;
  tronLink?: any;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isTrust?: boolean;
      isOkx?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners?: (event?: string) => void;
      selectedAddress?: string | null;
      chainId?: string;
      networkVersion?: string;
    };
    tronWeb?: any;
    tronLink?: any;
  }
}

export {};
