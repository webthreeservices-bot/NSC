'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWithdrawals } from '@/hooks/useWithdrawals'
import { formatCurrency } from '@/lib/utils'
import { detectWallet } from '@/services/walletService'
import { getAdminWallet } from '@/lib/blockchain'
import { Network } from '@/types'
import { Loader2, Wallet, Smartphone, Download, CheckCircle2 } from 'lucide-react'

export default function RequestWithdrawalPage() {
  const router = useRouter()
  const { eligibility, loading, checkEligibility, requestWithdrawal } = useWithdrawals()

  const [formData, setFormData] = useState({
    amount: '',
    type: 'ROI_ONLY',
    walletAddress: '',
    network: 'BEP20',
    twoFactorCode: '',
    txHash: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [wallet, setWallet] = useState<string | null>(null)
  const [selectedTypeAvailable, setSelectedTypeAvailable] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<{
    isMobile: boolean
    isIOS: boolean
    isAndroid: boolean
    isMetaMaskBrowser: boolean
    isMetaMaskInstalled: boolean
  } | null>(null)

  const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'

  useEffect(() => {
    if (eligibility) {
      let maxAmount = 0;
      switch (formData.type) {
        case 'ROI_ONLY':
          maxAmount = (eligibility.roiBalance || 0) + (eligibility.referralBalance || 0) + (eligibility.levelBalance || 0);
          break;
        case 'CAPITAL':
          maxAmount = eligibility.availableCapital || 0;
          break;
        case 'FULL_AMOUNT':
          maxAmount = (eligibility.availableBalance || 0) + (eligibility.availableCapital || 0);
          break;
        default:
          maxAmount = eligibility.availableBalance || 0;
      }
      setSelectedTypeAvailable(maxAmount);
    }
  }, [formData.type, eligibility])

  useEffect(() => {
    checkEligibility()
    const detectedWallet = detectWallet()
    setWallet(detectedWallet)
    
    // Try to get wallet address if wallet is already connected
    if (detectedWallet && !WEB3_DISABLED) {
      try {
        if (detectedWallet === 'tronlink' && (window as any).tronWeb?.ready && (window as any).tronWeb.defaultAddress) {
          setFormData(prev => ({ ...prev, walletAddress: window.tronWeb.defaultAddress.base58 }))
        } else if ((window as any).ethereum?.selectedAddress) {
          setFormData(prev => ({ ...prev, walletAddress: window.ethereum.selectedAddress }))
        }
      } catch (err) {
        console.log('Could not get existing wallet address:', err)
      }
    }
    
    // Device detection
    const userAgent = navigator.userAgent
    const isMobile = /Mobi|Android/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const isMetaMaskBrowser = /MetaMaskMobile/.test(userAgent)
    const isMetaMaskInstalled = !WEB3_DISABLED && ((window as any).ethereum?.isMetaMask || false)
    
    setDeviceInfo({
      isMobile,
      isIOS,
      isAndroid,
      isMetaMaskBrowser,
      isMetaMaskInstalled
    })
  }, [])

  const calculateFee = (amount: number) => {
    return Number((amount * 0.10).toFixed(2)) // 10% fee, rounded to 2 decimal places
  }

  const calculateNet = (amount: number) => {
    return Number((amount - calculateFee(amount)).toFixed(2)) // Net amount, rounded to 2 decimal places
  }

  const connectWallet = async (walletType: 'metamask' | 'trust' | 'tronlink') => {
    setError('')
    setIsConnecting(true)

    try {
      let walletAddress = ''

      if (WEB3_DISABLED) {
        throw new Error('Web3 wallet support is disabled in this build. Set NEXT_PUBLIC_WEB3_DISABLED=false to enable web3 features.')
      }

      if (walletType === 'tronlink') {
        // TRC20 network requires TronLink
        if (!(window as any).tronWeb || !(window as any).tronWeb.ready) {
          throw new Error('TronLink wallet not detected. Please install TronLink extension.')
        }

        // Request TronLink access
        try {
          await window.tronWeb.request({ method: 'tron_requestAccounts' })
          // Get the connected address
          walletAddress = window.tronWeb.defaultAddress.base58
          setWallet('tronlink')
        } catch (err: any) {
          throw new Error('Failed to connect to TronLink. Please approve the connection.')
        }
      } else {
        // BEP20 network - use MetaMask/Web3 wallets
        if (!(window as any).ethereum) {
          throw new Error('No crypto wallet detected. Please install MetaMask or Trust Wallet.')
        }

        // Request account access
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          walletAddress = accounts[0]
          if (window.ethereum.isMetaMask) {
            setWallet('metamask')
          } else if (window.ethereum.isTrust) {
            setWallet('trustwallet')
          } else {
            setWallet('metamask') // fallback
          }
        } else {
          throw new Error('No accounts found. Please unlock your wallet.')
        }
      }

      // Auto-populate the wallet address in the form
      if (walletAddress) {
        setFormData(prev => ({ ...prev, walletAddress }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    setFormData(prev => ({ ...prev, walletAddress: '' }))
  }

  const switchWallet = () => {
    setWallet(null)
    setFormData(prev => ({ ...prev, walletAddress: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const amount = parseFloat(formData.amount)

    // Amount validation
    if (amount < 20) {
      setError('Minimum withdrawal is $20')
      setSubmitting(false)
      return
    }

    if (amount > 10000) {
      setError('Maximum withdrawal is $10,000 per request')
      setSubmitting(false)
      return
    }

    // Decimal precision validation
    if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      setError('Amount can only have up to 2 decimal places')
      setSubmitting(false)
      return
    }

    // Balance check based on withdrawal type
    let maxAmount = 0;
    switch (formData.type) {
      case 'ROI_ONLY':
        maxAmount = (eligibility?.roiBalance || 0) + (eligibility?.referralBalance || 0) + (eligibility?.levelBalance || 0);
        break;
      case 'CAPITAL':
        maxAmount = eligibility?.availableCapital || 0;
        break;
      case 'FULL_AMOUNT':
        maxAmount = (eligibility?.availableBalance || 0) + (eligibility?.availableCapital || 0);
        break;
      default:
        maxAmount = eligibility?.availableBalance || 0;
    }

    if (amount > maxAmount) {
      const typeNames = {
        'ROI_ONLY': 'ROI earnings',
        'CAPITAL': 'available capital',
        'FULL_AMOUNT': 'total available balance'
      };
      setError(`Insufficient balance. Available for ${typeNames[formData.type as keyof typeof typeNames] || 'withdrawal'}: $${maxAmount.toFixed(2)}`);
      setSubmitting(false);
      return;
    }

    // Wallet address validation
    const { walletAddress, network } = formData
    if (!walletAddress || walletAddress.trim().length === 0) {
      setError('Wallet address is required')
      setSubmitting(false)
      return
    }

    if (network === 'BEP20') {
      // BEP20: Must start with 0x followed by 40 hexadecimal characters
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        setError('Invalid BEP20 wallet address. Must be 42 characters starting with 0x')
        setSubmitting(false)
        return
      }
    } else if (network === 'TRC20') {
      // TRC20: Must start with T followed by 33 characters
      if (!/^T[a-zA-Z0-9]{33}$/.test(walletAddress)) {
        setError('Invalid TRC20 wallet address. Must be 34 characters starting with T')
        setSubmitting(false)
        return
      }
    }

    if (!eligibility?.eligible) {
      setError('You are not eligible to withdraw at this time')
      setSubmitting(false)
      return
    }

    // Calculate net amount (amount - 10% fee)
    const feeAmount = calculateFee(amount)
    const netAmount = calculateNet(amount)

    // Submit the withdrawal request with net amount
    try {
      const result = await requestWithdrawal({
        amount: netAmount, // Send net amount, fee is automatically deducted
        type: formData.type,
        walletAddress: formData.walletAddress,
        network: formData.network,
        twoFactorCode: formData.twoFactorCode || undefined,
        txHash: null // No fee transaction needed
      })

      setSubmitting(false)

      if (result.success) {
        router.push('/withdrawals')
      } else {
        setError((result as any).error || 'Failed to submit withdrawal request')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!eligibility?.eligible && eligibility !== null) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Not Eligible</CardTitle>
            <CardDescription>{eligibility?.reason}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/withdrawals">
              <Button>Back to Withdrawals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = calculateFee(amount)
  const netAmount = calculateNet(amount)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Request Withdrawal</h1>

      {/* Wallet Connection Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet (Optional)
          </CardTitle>
          <CardDescription>
            Connect your wallet to auto-populate your address. This is optional - you can also enter your address manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {WEB3_DISABLED && (
            <div className="mb-3 p-3 rounded border border-yellow-200 bg-yellow-50 text-yellow-900">
              Wallet connections are disabled in this build. You can still manually enter your wallet address.
            </div>
          )}
          {wallet ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {wallet === 'metamask' ? 'MetaMask' : wallet === 'trustwallet' ? 'Trust Wallet' : 'TronLink'} Connected
                    </p>
                    <p className="text-sm text-green-600">
                      Wallet address auto-populated
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={switchWallet}
                    className="text-xs"
                  >
                    Switch
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* MetaMask */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => connectWallet('metamask')}
                  disabled={isConnecting || WEB3_DISABLED}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src="/metamask-icon.svg" alt="MetaMask" className="h-6 w-6" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  )}
                  <div className="text-left">
                    <div className="font-medium">MetaMask</div>
                    <div className="text-xs text-muted-foreground">BEP20 Network</div>
                  </div>
                </Button>

                {/* Trust Wallet */}
                {deviceInfo?.isMobile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => connectWallet('trust')}
                    disabled={isConnecting || WEB3_DISABLED}
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Smartphone className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <div className="font-medium">Trust Wallet</div>
                      <div className="text-xs text-muted-foreground">Mobile Wallet</div>
                    </div>
                  </Button>
                )}

                {/* TronLink */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => connectWallet('tronlink')}
                  disabled={isConnecting || WEB3_DISABLED}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src="/tronlink-icon.svg" alt="TronLink" className="h-6 w-6" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  )}
                  <div className="text-left">
                    <div className="font-medium">TronLink</div>
                    <div className="text-xs text-muted-foreground">TRC20 Network</div>
                  </div>
                </Button>
              </div>

              {/* Download Links */}
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-2">Don't have a wallet?</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('https://metamask.io/download/', '_blank')}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Download className="h-3 w-3" />
                    MetaMask
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('https://www.tronlink.org/', '_blank')}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Download className="h-3 w-3" />
                    TronLink
                  </Button>
                  {deviceInfo?.isMobile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open('https://trustwallet.com/', '_blank')}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Download className="h-3 w-3" />
                      Trust Wallet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Available Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI Earnings:</span>
              <span className="font-bold">{formatCurrency(eligibility?.roiBalance || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referral Earnings:</span>
              <span className="font-bold">{formatCurrency(eligibility?.referralBalance || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level Income:</span>
              <span className="font-bold">{formatCurrency(eligibility?.levelBalance || 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Available for {formData.type.replace('_', ' ').toLowerCase()}:</span>
              <span className="font-bold text-green-600 text-lg">
                {formatCurrency(selectedTypeAvailable)}
              </span>
            </div>
            {(eligibility?.availableCapital || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Capital:</span>
                <span className="font-bold">{formatCurrency(eligibility.availableCapital)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Fee Information */}
        <Card className="border-[#00ff00]/30 bg-gradient-to-br from-[#00ff00]/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <svg className="h-5 w-5 text-[#00ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Withdrawal Fee: 10%
            </CardTitle>
            <CardDescription className="text-gray-400">
              A 10% fee is automatically deducted from your withdrawal amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Withdrawal Amount</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Fee (10%)</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Net Amount Received</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-3">$20</td>
                    <td className="py-2 px-3 text-red-400">$2</td>
                    <td className="py-2 px-3 text-[#00ff00] font-semibold">$18</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-3">$50</td>
                    <td className="py-2 px-3 text-red-400">$5</td>
                    <td className="py-2 px-3 text-[#00ff00] font-semibold">$45</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-3">$100</td>
                    <td className="py-2 px-3 text-red-400">$10</td>
                    <td className="py-2 px-3 text-[#00ff00] font-semibold">$90</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-3">$500</td>
                    <td className="py-2 px-3 text-red-400">$50</td>
                    <td className="py-2 px-3 text-[#00ff00] font-semibold">$450</td>
                  </tr>
                  <tr className="hover:bg-gray-800/50">
                    <td className="py-2 px-3">$1,000</td>
                    <td className="py-2 px-3 text-red-400">$100</td>
                    <td className="py-2 px-3 text-[#00ff00] font-semibold">$900</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
              <p className="text-xs text-gray-400">
                <strong className="text-white">Formula:</strong> Net Amount = Withdrawal Amount - (Withdrawal Amount × 10%)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <strong className="text-white">Example:</strong> $100 withdrawal = $100 - ($100 × 10%) = $100 - $10 = <span className="text-[#00ff00]">$90</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Withdrawal Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROI_ONLY">ROI Only (Earnings)</SelectItem>
              {(eligibility?.availableCapital || 0) > 0 && (
                <>
                  <SelectItem value="CAPITAL">Capital Only (Expired Packages)</SelectItem>
                  <SelectItem value="FULL_AMOUNT">Full Amount (Earnings + Capital)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="20"
            placeholder="Minimum $20"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <p className="text-sm text-muted-foreground">
            Minimum withdrawal: $20 USDT
          </p>
        </div>

        {/* Network */}
        <div className="space-y-2">
          <Label htmlFor="network">Network</Label>
          <Select value={formData.network} onValueChange={(value) => setFormData({ ...formData, network: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
              <SelectItem value="TRC20">TRC20 (TRON)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <Label htmlFor="walletAddress">Wallet Address</Label>
          <Input
            id="walletAddress"
            type="text"
            placeholder="Enter your wallet address"
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            required
          />
        </div>

        {/* 2FA Code (if enabled) */}
        <div className="space-y-2">
          <Label htmlFor="twoFactorCode">2FA Code (if enabled)</Label>
          <Input
            id="twoFactorCode"
            type="text"
            maxLength={6}
            placeholder="000000"
            value={formData.twoFactorCode}
            onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
          />
        </div>

        {/* Summary */}
        {amount >= 20 && (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Withdrawal Amount:</span>
                <span className="font-bold">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (10%):</span>
                <span className="font-bold text-red-600">-{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">You will receive:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(netAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Important:
          </p>
          <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
            <li>The 10% fee is automatically deducted from your withdrawal</li>
            <li>Admin will review and process your withdrawal within 24-48 hours</li>
            <li>You will receive the net amount directly to your wallet</li>
            <li>Next withdrawal available after 30 days</li>
            <li>Double-check your wallet address</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Link href="/withdrawals" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Extend Window interface for TronLink
declare global {
  interface Window {
    tronWeb?: any
  }
}