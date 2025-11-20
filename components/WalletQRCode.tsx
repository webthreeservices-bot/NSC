'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'

interface WalletQRCodeProps {
  address: string
  network: 'BEP20' | 'TRC20'
  amount?: number
  className?: string
}
const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true'

export function WalletQRCode({ address, network, amount, className = '' }: WalletQRCodeProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateQR()
  }, [address, network, amount])

  const generateQR = async () => {
    try {
      setLoading(true)
      const QRCode = (await import('qrcode')).default

      // Generate payment URI with network switching support
      const paymentUri = generatePaymentUri()

      const qrDataUrl = await QRCode.toDataURL(paymentUri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCode(qrDataUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePaymentUri = () => {
    // If web3 is disabled or the address is a simulated off-chain address, return a simple OFFCHAIN label
    if (WEB3_DISABLED || address?.startsWith?.('OFFCHAIN_')) {
      return `OFFCHAIN:${address}`
    }
    if (network === 'BEP20') {
      // EIP-681 format for BSC - includes chain ID for automatic network switching
      // Format: ethereum:tokenAddress@chainId/transfer?address=recipient&uint256=amount
      const tokenAddress = '0x55d398326f99059fF775485246999027B3197955' // USDT on BSC
      const chainId = 56 // BSC Mainnet
      const amountInWei = amount ? (BigInt(amount) * BigInt(10 ** 18)).toString() : '0'

      // This format will prompt wallets to switch to BSC network
      return `ethereum:${tokenAddress}@${chainId}/transfer?address=${address}&uint256=${amountInWei}`
    } else {
      // TronLink deep link format for TRC20 - triggers TronLink to open
      // Format: tronlinkoutside://pull.activity?param={...}
      const tronLinkParams = {
        action: 'transfer',
        token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT TRC20
        to: address,
        amount: amount ? (amount * 1000000).toString() : '0', // USDT has 6 decimals on TRON
        chainId: 'mainnet'
      }

      // For TRON, use TronLink URL scheme
      const encodedParams = encodeURIComponent(JSON.stringify(tronLinkParams))
      return `tronlinkoutside://pull.activity?param=${encodedParams}`
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Network Badge */}
          <div className="flex justify-between items-center">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
              {network === 'BEP20' ? 'BEP20 (BSC)' : 'TRC20 (TRON)'}
            </div>
            {amount && (
              <div className="text-lg font-bold">
                ${amount} USDT
              </div>
            )}
          </div>

          {/* QR Code */}
          {WEB3_DISABLED || (address && address.startsWith && address.startsWith('OFFCHAIN_')) ? (
            <div className="p-6 text-center w-full">
              <div className="font-semibold text-foreground mb-2">OFF-CHAIN Deposit</div>
              <p className="text-sm text-muted-foreground">This deposit address is an internal, off-chain placeholder. Please follow the on-screen or admin instructions for manual deposit reconciliation.</p>
            </div>
          ) : (
          <div className="flex justify-center bg-white p-4 rounded-lg">
            {loading ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              ) : qrCode ? (
              <img
                src={qrCode}
                alt="Wallet QR Code"
                className="w-[300px] h-[300px]"
              />
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center text-muted-foreground">
                Failed to generate QR code
              </div>
            )}
          </div>
          )}

          {/* Wallet Address */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Wallet Address
            </p>
            <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
              <code className="flex-1 text-xs font-mono break-all">
                {address}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-yellow-900">
              Payment Instructions:
            </p>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Scan the QR code with your mobile wallet app</li>
              <li>Your wallet will automatically prompt you to switch to {network === 'BEP20' ? 'Binance Smart Chain' : 'TRON Network'}</li>
              <li>Confirm the network switch if prompted</li>
              <li>Review and send {amount ? `$${amount}` : 'the required amount of'} USDT</li>
              <li>Save your transaction hash for verification</li>
            </ul>
          </div>

          {/* Network Switch Notice */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              🔄 Automatic Network Switching
            </p>
            <p className="text-xs text-blue-800">
              This QR code includes network information. When scanned, compatible wallets like MetaMask, Trust Wallet, or TronLink will automatically prompt you to switch to the {network === 'BEP20' ? 'BSC (BEP20)' : 'TRON (TRC20)'} network.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
