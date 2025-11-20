'use client';
import { useState, useEffect } from 'react';
import { useWalletDetection, initiateTransaction, isWalletPathAvailable } from '@/services/walletService';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

export default function PurchaseButton({
  type,
  id,
  amount,
  network,
}: {
  type: 'package' | 'bot';
  id: string;
  amount: string;
  network: 'BEP20' | 'TRC20';
}) {
  const {
    wallet,
    isMobile,
    isWalletAvailable,
    transactionStatus,
    transactionError,
    transactionHash,
    handleStatusUpdate,
    resetTransactionStatus
  } = useWalletDetection();

  const [isProcessing, setIsProcessing] = useState(false);

  const adminWalletAddress = network === 'BEP20'
    ? (process.env.NEXT_PUBLIC_ADMIN_WALLET_BSC || '0xE177859890C71Ab134cB90Dd03F4698802F6C8cb')
    : (process.env.NEXT_PUBLIC_ADMIN_WALLET_TRON || 'TAxwG7ADfQcZjDUvm8vQgKbWSGQruviDMG');

  const handlePurchase = async () => {
    if (!wallet) {
      alert('Please install a supported wallet');
      return;
    }

    if (!adminWalletAddress) {
      alert('Admin wallet address is not configured. Please try again later.');
      return;
    }

    // Check if wallet path is available
    if (!isWalletPathAvailable(wallet, network)) {
      alert(`Your current wallet setup doesn't support ${network} transactions. Please use ${network === 'BEP20' ? 'MetaMask, Trust Wallet, or Coinbase Wallet' : 'TronLink extension'}.`);
      return;
    }

    setIsProcessing(true);
    resetTransactionStatus();

    try {
      const transactionData = {
        to: adminWalletAddress,
        amount,
        network,
        ...(type === 'package' ? { packageId: id } : { botId: id }),
      };

      await initiateTransaction(wallet, transactionData, handleStatusUpdate);

    } catch (error: any) {
      console.error('Purchase failed:', error);
      // Error is already handled by handleStatusUpdate
    } finally {
      setIsProcessing(false);
    }
  };

  const getExplorerUrl = () => {
    if (!transactionHash) return '';
    if (network === 'BEP20') {
      return `https://bscscan.com/tx/${transactionHash}`;
    }
    return `https://tronscan.org/#/transaction/${transactionHash}`;
  };

  const getStatusDisplay = () => {
    switch (transactionStatus) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 p-3 bg-blue-950/50 border border-blue-500 rounded-lg">
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-100">Transaction Pending</p>
              <p className="text-xs text-muted-foreground">
                Please wait while your transaction is being confirmed...
              </p>
              {transactionHash && (
                <a
                  href={getExplorerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on Explorer
                </a>
              )}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex items-center gap-2 p-3 bg-green-950/50 border border-green-500 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-100">Payment Successful!</p>
              <p className="text-xs text-muted-foreground">
                Your payment has been confirmed
              </p>
              {transactionHash && (
                <a
                  href={getExplorerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  View on Explorer
                </a>
              )}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-100">Transaction Failed</p>
              <p className="text-xs text-red-600">{transactionError}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {getStatusDisplay()}

      <Button
        onClick={handlePurchase}
        disabled={!isWalletAvailable || isProcessing || transactionStatus === 'success'}
        size="lg"
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : transactionStatus === 'success' ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Payment Complete
          </>
        ) : !isWalletAvailable ? (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Wallet Not Available
          </>
        ) : (
          `Purchase Now - $${amount} USDT`
        )}
      </Button>

      {!isWalletAvailable && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {network === 'BEP20'
              ? 'Install MetaMask, Trust Wallet, or Coinbase Wallet to continue'
              : 'Install TronLink extension to continue'
            }
          </p>
        </div>
      )}

      {isWalletAvailable && (
        <div className="bg-blue-950/50 border-2 border-blue-800 p-3 rounded-lg">
          <p className="text-xs text-center text-blue-300 font-medium">
            💡 {network === 'BEP20'
              ? 'Make sure you have enough BNB for gas fees (~$0.50)'
              : 'Make sure you have enough TRX for gas fees (~$0.10)'}
          </p>
        </div>
      )}
    </div>
  );
}
