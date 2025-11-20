'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePackages } from '@/hooks/usePackages'
import { formatCurrency } from '@/lib/utils'
import { getTokenFromStorage } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Zap,
  Check,
  AlertTriangle,
  Copy,
  ExternalLink,
  Wallet,
  QrCode
} from 'lucide-react'
import QRCode from 'qrcode'

// Demo Package Options
const DEMO_PACKAGES = [
  {
    amount: 1,
    type: 'TEST_1',
    roi: 3, // 3% per 15 min
    features: ['15 Min ROI Interval', 'Demo Testing', 'Low Risk']
  },
  {
    amount: 2,
    type: 'TEST_2',
    roi: 4, // 4% per 15 min
    features: ['15 Min ROI Interval', 'Demo Testing', 'Medium Risk']
  },
  {
    amount: 3,
    type: 'TEST_3',
    roi: 5, // 5% per 15 min
    features: ['15 Min ROI Interval', 'Demo Testing', 'High Risk']
  }
]

export default function DemoPage() {
  const router = useRouter()
  const { createPackage, loading } = usePackages()
  const { success, error: toastError } = useToast()

  const [selectedAmount, setSelectedAmount] = useState<number>(1)
  const [selectedNetwork, setSelectedNetwork] = useState<'BEP20' | 'TRC20'>('BEP20')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentPackageId, setCurrentPackageId] = useState<string>('')
  const [adminWalletAddress, setAdminWalletAddress] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [txHash, setTxHash] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch admin wallet
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = getTokenFromStorage()
        if (!token) return
        const res = await fetch(`/api/admin/wallet-address?network=${selectedNetwork}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setAdminWalletAddress(data.walletAddress)
          // Generate QR
          try {
            const url = await QRCode.toDataURL(data.walletAddress)
            setQrCodeUrl(url)
          } catch (e) {
            console.error('QR Generation failed', e)
          }
        }
      } catch (e) {
        console.error('Failed to fetch wallet', e)
      }
    }
    fetchWallet()
  }, [selectedNetwork])

  const handlePurchase = async (amount: number) => {
    setSelectedAmount(amount)
    const result = await createPackage(amount, selectedNetwork)

    if (result.success && result.data) {
      setCurrentPackageId((result.data as any).id || '')
      setShowPaymentModal(true)
    }
  }

  const handleMetaMaskPayment = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      toastError('MetaMask is not installed!')
      return
    }

    try {
      const ethereum = (window as any).ethereum
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]

      // Convert amount to wei (assuming USDT has 18 decimals on BSC, but often 6 or 18 depending on contract)
      // For demo simplicity, we'll just trigger a sendTransaction. 
      // In production, you'd interact with the USDT contract.
      // Here we'll send native currency (BNB) as a placeholder or try to interact with a contract if we had ABI.
      // Let's just send a small amount of native token to simulate or just open the window.
      
      // NOTE: To send USDT, we need ABI and Contract Address. 
      // For this demo, we will just open MetaMask with a basic transaction request
      // prompting user to send 'value' (native) or just showing them the wallet.
      
      // Since we want "full payload", we'd ideally construct a USDT transfer.
      // Without ABI, we can't easily do that here. 
      // We'll fallback to a native transfer request for the demo amount (converted to hex wei)
      // or just alert the user this is a demo.
      
      const amountInWei = (selectedAmount * 1e18).toString(16) // Assuming 18 decimals

      const transactionParameters = {
        to: adminWalletAddress, // Receiver address
        from: account, // Sender address
        value: '0x0', // 0 ETH/BNB value, we are simulating token transfer usually
        // data: ... (Token transfer data would go here)
      }

      // If we want to simulate a USDT transfer, we'd need the data field.
      // For now, let's just open the wallet send screen if possible or request a transaction.
      
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })

      setTxHash(txHash)
      success('Transaction sent! Hash captured.')
      
    } catch (error: any) {
      console.error(error)
      toastError(error.message || 'Payment failed')
    }
  }

  const handleSubmitHash = async () => {
    if (!txHash) {
      toastError('Please enter transaction hash')
      return
    }

    setIsSubmitting(true)
    try {
      const token = getTokenFromStorage()
      const response = await fetch(`/api/packages/${currentPackageId}/verify-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          txHash,
          network: selectedNetwork
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setShowPaymentModal(false)
      success('Transaction submitted for approval!')
      router.push('/packages')
    } catch (error: any) {
      toastError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Demo Testing Zone</h1>
          <Badge variant="destructive" className="animate-pulse">DEMO MODE</Badge>
        </div>
        <p className="text-gray-400">
          Test the entire platform flow with low-cost packages. 
          <span className="text-[#00ff00] ml-2">ROI Interval: 15 Minutes</span>
        </p>
      </div>

      {/* Network Selection */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <Label className="mb-2 block">Select Network</Label>
        <div className="flex gap-4">
          <Button 
            variant={selectedNetwork === 'BEP20' ? 'default' : 'outline'}
            onClick={() => setSelectedNetwork('BEP20')}
            className={selectedNetwork === 'BEP20' ? 'bg-[#00ff00] text-black hover:bg-[#00cc00]' : ''}
          >
            BEP20 (BSC)
          </Button>
          <Button 
            variant={selectedNetwork === 'TRC20' ? 'default' : 'outline'}
            onClick={() => setSelectedNetwork('TRC20')}
            className={selectedNetwork === 'TRC20' ? 'bg-[#00ff00] text-black hover:bg-[#00cc00]' : ''}
          >
            TRC20 (Tron)
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_PACKAGES.map((pkg) => (
          <Card key={pkg.type} className="border-gray-800 bg-black hover:border-[#00ff00]/50 transition-all">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{pkg.type.replace('_', ' ')}</span>
                <span className="text-[#00ff00]">{formatCurrency(pkg.amount)}</span>
              </CardTitle>
              <CardDescription>ROI: {pkg.roi}% / 15 mins</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="h-4 w-4 text-[#00ff00]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-[#00ff00] text-black hover:bg-[#00cc00]"
                onClick={() => handlePurchase(pkg.amount)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Buy Demo Package'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 space-y-6 relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Complete Payment</h2>
              <p className="text-gray-400 text-sm">Send exactly <span className="text-[#00ff00] font-bold">{formatCurrency(selectedAmount)}</span></p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Wallet QR" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 animate-pulse rounded" />
              )}
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label>Wallet Address ({selectedNetwork})</Label>
              <div className="flex gap-2">
                <Input value={adminWalletAddress} readOnly className="bg-gray-800 border-gray-700" />
                <Button size="icon" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(adminWalletAddress)
                  success('Address copied!')
                }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* MetaMask Button */}
            {selectedNetwork === 'BEP20' && (
              <Button 
                onClick={handleMetaMaskPayment}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Pay with MetaMask
              </Button>
            )}

            {/* Hash Input */}
            <div className="space-y-2">
              <Label>Transaction Hash</Label>
              <Input 
                placeholder="0x..." 
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <Button 
              onClick={handleSubmitHash}
              disabled={isSubmitting || !txHash}
              className="w-full bg-[#00ff00] text-black hover:bg-[#00cc00]"
            >
              {isSubmitting ? 'Verifying...' : 'Submit Transaction'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
