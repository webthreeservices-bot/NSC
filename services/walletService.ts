'use client';
import { useState, useEffect } from 'react';

type WalletType = 'metamask' | 'tronlink' | 'trustwallet' | 'walletconnect' | 'coinbase';

type TransactionData = {
  to: string;
  amount: string;
  network: 'BEP20' | 'TRC20';
  packageId?: string;
  botId?: string;
};

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const BSC_CHAIN_ID = '0x38';
const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const BSC_NETWORK = {
  chainId: BSC_CHAIN_ID,
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/']
};

const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'

export function detectWallet(): WalletType | null {
  if (typeof window === 'undefined') return null;
  if (WEB3_DISABLED) return null;
  
  const { ethereum, tronWeb } = window as any;

  if (ethereum) {
    if (ethereum.isMetaMask) return 'metamask';
    if (ethereum.isTrust) return 'trustwallet';
    if (ethereum.isCoinbaseWallet) return 'coinbase';
  }
  
  if (tronWeb && tronWeb.ready) return 'tronlink';
  return 'walletconnect';
}

function buildMetaMaskDeeplink(data: TransactionData) {
  const isNative = data.network === 'TRC20';
  if (isNative) {
    // TRON deep-link still needs standard tronlink handler
    return null;
  }

  const amountInWei = BigInt(Math.floor(Number(data.amount) * 1e6)) * BigInt(1e12); // convert USDT (6 decimals) to 18 for BSC display
  const params = new URLSearchParams({
    address: data.to,
    uint256: amountInWei.toString(),
  });

  return `https://link.metamask.io/send/${USDT_BSC_CONTRACT}@${parseInt(BSC_CHAIN_ID, 16)}?${params.toString()}`;
}

export async function initiateTransaction(
  wallet: WalletType,
  transactionData: TransactionData,
  onStatusUpdate?: (status: TransactionStatus, txHash?: string, error?: string) => void
) {
  try {
    onStatusUpdate?.('pending');

    if (transactionData.network === 'TRC20') {
      return await sendTRC20Payment(transactionData, onStatusUpdate);
    } else {
      return await sendBEP20Payment(transactionData, onStatusUpdate);
    }
  } catch (error: any) {
    console.error('Transaction failed:', error);
    onStatusUpdate?.('error', undefined, error.message || 'Transaction failed');
    throw error;
  }
}

async function sendBEP20Payment(
  data: TransactionData,
  onStatusUpdate?: (status: TransactionStatus, txHash?: string, error?: string) => void
) {
  if (WEB3_DISABLED) {
    // Simulate a BEP20 tx when web3 is not available
    const mockHash = `OFFCHAIN_BEP20_TX_${Date.now()}`;
    onStatusUpdate?.('success', mockHash);
    return mockHash;
  }

  const { ethereum } = window as any;
  if (!ethereum) throw new Error('No wallet detected');

  // If web3 were enabled this block would create provider and send the tx.
  // Since we've removed web3 libraries in the hard-cleanup, keep the logic minimal and informative.
  throw new Error('Web3 wallet support is disabled in this build. Set NEXT_PUBLIC_WEB3_DISABLED=false to enable web3 features.');
}

async function sendTRC20Payment(
  data: TransactionData,
  onStatusUpdate?: (status: TransactionStatus, txHash?: string, error?: string) => void
) {
  if (WEB3_DISABLED) {
    const mockTx = `OFFCHAIN_TRC20_TX_${Date.now()}`;
    onStatusUpdate?.('success', mockTx);
    return mockTx;
  }

  throw new Error('TronLink support is disabled in this build. Set NEXT_PUBLIC_WEB3_DISABLED=false to enable web3 features.');
}

async function checkAndSwitchNetwork() {
  const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'
  if (WEB3_DISABLED) throw new Error('Web3 is disabled in this build.');

  const { ethereum } = window as any;
  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' });

    if (chainId !== BSC_CHAIN_ID) {
      try {
        // Try to switch to BSC
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });
      } catch (switchError: any) {
        // If BSC is not added, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK],
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (err: any) {
    throw new Error('Failed to switch to BSC network: ' + err.message);
  }
}

export function useWalletDetection() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [transactionError, setTransactionError] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');

  useEffect(() => {
    setWallet(detectWallet());
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  const handleStatusUpdate = (status: TransactionStatus, txHash?: string, error?: string) => {
    setTransactionStatus(status);
    setTransactionHash(txHash || '');
    setTransactionError(error || '');
  };

  const resetTransactionStatus = () => {
    setTransactionStatus('idle');
    setTransactionError('');
    setTransactionHash('');
  };

  return {
    wallet,
    isMobile,
    isWalletAvailable: !!wallet,
    transactionStatus,
    transactionError,
    transactionHash,
    handleStatusUpdate,
    resetTransactionStatus
  };
}

export function isWalletPathAvailable(wallet: WalletType, network: 'BEP20' | 'TRC20'): boolean {
  if (WEB3_DISABLED) return false;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  if (network === 'TRC20') {
    // TRC20 requires TronLink
    return wallet === 'tronlink' && !isMobile; // Mobile TronLink support might be limited
  }

  if (network === 'BEP20') {
    // BEP20 supports MetaMask, Trust Wallet, Coinbase
    if (isMobile) {
      // On mobile, check if we're in a wallet browser or can use deep links
      const { ethereum } = window as any;
      return !!(ethereum && (ethereum.isMetaMask || ethereum.isTrust || ethereum.isCoinbaseWallet));
    }
    // Desktop - standard Web3 wallets
    return !!(window as any).ethereum;
  }

  return false;
}
