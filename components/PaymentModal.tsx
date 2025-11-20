'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WalletQRCode } from '@/components/WalletQRCode'
import { Wallet, QrCode, CheckCircle2, AlertCircle, Loader2, Smartphone, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDeviceInfo } from '@/lib/mobile-detection'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  network: 'BEP20' | 'TRC20'
  adminWalletAddress: string
  onSuccess: (txHash: string) => void
}

const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true'

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  network,
  adminWalletAddress,
  onSuccess
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'qrcode'>('wallet');
  const [showWalletSelect, setShowWalletSelect] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [qrTxHash, setQrTxHash] = useState<string>('');
  const [isSubmittingQr, setIsSubmittingQr] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [selectedQrNetwork, setSelectedQrNetwork] = useState<'BEP20' | 'TRC20'>(network);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof getDeviceInfo> | null>(null);

  useEffect(() => { setDeviceInfo(getDeviceInfo()) }, [network])

  useEffect(() => {
    if (!isOpen) {
      setError('')
      setTxHash('')
      setQrTxHash('')
      setTxStatus('idle')
      setIsSending(false)
      setIsSubmittingQr(false)
      if (!walletAddress) setShowWalletSelect(true)
    }
  }, [isOpen, walletAddress])

  const BSC_NETWORK = { chainId: '0x38', chainName: 'BNB Smart Chain', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, rpcUrls: ['https://bsc-dataseed.binance.org/'], blockExplorerUrls: ['https://bscscan.com/'] }

  const checkWalletConnection = async () => {
    if (!isOpen || typeof window === 'undefined') return
    if (WEB3_DISABLED) return
    await new Promise(resolve => setTimeout(resolve, 100))
    try { const ethereum = (window as any).ethereum; if (!ethereum || typeof ethereum.request !== 'function') return; try { const accounts = await ethereum.request({ method: 'eth_accounts' }); if (accounts && Array.isArray(accounts) && accounts.length > 0) { setWalletAddress(accounts[0]); setShowWalletSelect(false); if (network === 'BEP20') { try { const chainId = await ethereum.request({ method: 'eth_chainId' }); if (chainId !== BSC_NETWORK.chainId) console.debug('Wrong network detected') } catch {} } } } catch {} } catch {}
  }

  useEffect(() => { if (isOpen && !WEB3_DISABLED) checkWalletConnection().catch(() => {}) }, [isOpen, network])

  const connectWallet = async (_walletType: 'metamask' | 'trust' | 'injected' | 'tronlink') => { setError('Wallet-based payments are disabled. Please use QR Code payment or contact support.'); setIsConnecting(false); return }

  const sendPayment = async () => { setError(''); setIsSending(true); setTxStatus('pending'); try { throw new Error('Wallet payments are disabled. Please use QR Code payment.') } catch (err: any) { setError(err.message || 'Payment failed'); setTxStatus('error'); setIsSending(false) } }

  const disconnectWallet = () => { setWalletAddress(''); setShowWalletSelect(true); setError(''); setTxHash(''); setTxStatus('idle') }

  const handleQrPaymentSubmit = async () => { if (!qrTxHash || qrTxHash.trim() === '') { setError('Please enter your transaction hash'); return } setError(''); setIsSubmittingQr(true); setTxStatus('success'); try { await new Promise(resolve => setTimeout(resolve, 1000)); onSuccess(qrTxHash) } catch (err: any) { setError(err.message || 'Failed to submit transaction'); setTxStatus('error') } finally { setIsSubmittingQr(false) } }

  const getAdminWallet = () => network === 'BEP20' ? (process.env.NEXT_PUBLIC_ADMIN_WALLET_BSC || '0xE177859890C71Ab134cB90Dd03F4698802F6C8cb') : (process.env.NEXT_PUBLIC_ADMIN_WALLET_TRON || 'TAxwG7ADfQcZjDUvm8vQgKbWSGQruviDMG')
  const getQrAdminWallet = (qrNetwork: 'BEP20' | 'TRC20') => qrNetwork === 'BEP20' ? (process.env.NEXT_PUBLIC_ADMIN_WALLET_BSC || '0xE177859890C71Ab134cB90Dd03F4698802F6C8cb') : (process.env.NEXT_PUBLIC_ADMIN_WALLET_TRON || 'TAxwG7ADfQcZjDUvm8vQgKbWSGQruviDMG')
  const getExplorerUrl = () => { if (!txHash) return ''; return network === 'BEP20' ? `https://bscscan.com/tx/${txHash}` : `https://tronscan.org/#/transaction/${txHash}` }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-full mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Complete Payment - ${amount} USDT</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Choose your preferred payment method</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'wallet' | 'qrcode')}>
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="wallet" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Pay with Wallet</span>
              <span className="sm:hidden">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <QrCode className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              QR Code
            </TabsTrigger>
          </TabsList>

          {WEB3_DISABLED ? (
            <TabsContent value="wallet" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Wallet payments are temporarily disabled</p>
                    <p className="text-sm text-muted-foreground">The platform is currently running in web2 mode. Please use the QR Code method or contact support if you need assisted payouts.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ) : (
            <TabsContent value="wallet" className="space-y-4">
              <Card className="border-2 w-full">
                <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 px-3 sm:px-6">
                  <div className="text-center mb-3 sm:mb-4">
                    <Wallet className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-primary" />
                    <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-foreground">Select Your Wallet</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Choose your preferred wallet to connect</p>
                  </div>

                  <div className="grid gap-2 sm:gap-3 w-full">
                    {network === 'TRC20' ? (
                      <Button onClick={() => setError('Wallet payments are disabled. Please use QR Code or contact support.')} disabled={isConnecting} size="lg" variant="outline" className="w-full h-auto py-3 sm:py-4 justify-start border-2 hover:border-primary hover:bg-primary/5 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0"><Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" /></div>
                          <div className="text-left flex-1 min-w-0"><div className="font-semibold text-foreground text-sm sm:text-base truncate">TronLink Wallet</div><div className="text-[10px] sm:text-xs text-muted-foreground truncate">Connect to your TronLink wallet for TRC20</div></div>
                        </div>
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => setError('Wallet payments are disabled. Please use QR Code or contact support.')} disabled={isConnecting || !!walletAddress} size="lg" variant="outline" className="w-full h-auto py-3 sm:py-4 justify-start border-2 hover:border-primary hover:bg-primary/5 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {deviceInfo?.isMobile && !deviceInfo?.isMetaMaskInstalled ? (
                                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                              ) : deviceInfo?.isMobile ? (
                                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                              ) : (
                                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                              )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-foreground text-sm sm:text-base truncate">{walletAddress ? 'Connected' : 'MetaMask / WalletConnect'}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{walletAddress ? 'Wallet connected' : 'Connect to MetaMask or any WalletConnect wallet'}</div>
                            </div>
                          </div>
                        </Button>

                        {/* Other Wallets */}
                        <Button onClick={() => setError('Wallet payments are disabled. Please use QR Code or contact support.')} disabled={isConnecting} size="lg" variant="outline" className="w-full h-auto py-3 sm:py-4 justify-start border-2 hover:border-primary hover:bg-primary/5 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/50 border border-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-foreground text-sm sm:text-base truncate">Other Wallets</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">Binance, Coinbase, or other Web3 wallets</div>
                            </div>
                          </div>
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-center text-muted-foreground">Don't have a wallet?{' '}<button onClick={() => setActiveTab('qrcode')} className="text-primary hover:underline font-medium">Use QR Code instead</button></p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* QR Code section */}
          <TabsContent value="qrcode" className="space-y-4">
            <Card className="border-2">
              <CardContent className="pt-4">
                <div className="text-center">Please use QR Code to complete the payment.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Extend Window interface for ethereum and TronLink
declare global { interface Window { tronWeb?: any } }
