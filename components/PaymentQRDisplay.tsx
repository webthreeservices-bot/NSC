/**
 * Payment QR Display Component
 * Displays QR code and payment instructions for cryptocurrency payments
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PaymentQRDisplayProps {
  paymentRequestId: string
  amount: number
  network: 'BEP20' | 'TRC20'
  depositAddress: string
  qrCode: string
  expiresAt: Date
  onPaymentComplete?: () => void
}

export function PaymentQRDisplay({
  paymentRequestId,
  amount,
  network,
  depositAddress,
  qrCode,
  expiresAt,
  onPaymentComplete,
}: PaymentQRDisplayProps) {
  const [status, setStatus] = useState<string>('PENDING')
  const [confirmations, setConfirmations] = useState<number>(0)
  const [requiredConfirmations, setRequiredConfirmations] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Poll payment status every 10 seconds
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null
    let isMounted = true

    const pollPaymentStatus = async () => {
      if (!isMounted) return

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const response = await fetch(`/api/payments/status?paymentRequestId=${paymentRequestId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (response.ok && isMounted) {
          const data = await response.json()
          setStatus(data.data.status)

          if (data.data.confirmationInfo) {
            setConfirmations(data.data.confirmationInfo.confirmations)
            setRequiredConfirmations(data.data.confirmationInfo.requiredConfirmations)
          }

          if (data.data.status === 'COMPLETED') {
            if (pollInterval) {
              clearInterval(pollInterval)
              pollInterval = null
            }
            onPaymentComplete?.()
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error polling payment status:', error)
        }
      }
    }

    // Start polling immediately
    pollPaymentStatus()

    // Set up interval for subsequent polls
    pollInterval = setInterval(pollPaymentStatus, 10000)

    // Cleanup function
    return () => {
      isMounted = false
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }
  }, [paymentRequestId, onPaymentComplete])

  // Update countdown timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null
    let isMounted = true

    const updateTimer = () => {
      if (!isMounted) return

      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const distance = expiry - now

      if (distance < 0) {
        setTimeLeft('EXPIRED')
        if (timerInterval) {
          clearInterval(timerInterval)
          timerInterval = null
        }
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    // Update immediately
    updateTimer()

    // Set up interval
    timerInterval = setInterval(updateTimer, 1000)

    // Cleanup function
    return () => {
      isMounted = false
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }, [expiresAt])

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    
    // Clear the copied state after 2 seconds
    const timeout = setTimeout(() => setCopied(false), 2000)
    
    // Store timeout reference for potential cleanup
    return () => clearTimeout(timeout)
  }

  const networkName = network === 'BEP20' ? 'Binance Smart Chain (BEP20)' : 'TRON (TRC20)'
  const confirmationsRequired = network === 'BEP20' ? 3 : 19

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Status Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Complete Payment</h2>
          <StatusBadge status={status} />
        </div>
        {status === 'PENDING' && (
          <p className="text-sm text-gray-600">
            Expires in: <span className="font-semibold text-red-600">{timeLeft}</span>
          </p>
        )}
      </div>

      {/* Payment Status Messages */}
      {status === 'PENDING' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Waiting for payment. Scan the QR code or send {amount} USDT to the address below.
          </p>
        </div>
      )}

      {status === 'CONFIRMING' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 mb-2">
            Payment detected! Waiting for confirmations...
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Confirmations</span>
              <span className="font-semibold">
                {confirmations} / {requiredConfirmations}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (confirmations / confirmationsRequired) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {status === 'COMPLETED' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            Payment completed successfully! Your package/bot has been activated.
          </p>
        </div>
      )}

      {status === 'EXPIRED' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            This payment request has expired. Please create a new one.
          </p>
        </div>
      )}

      {/* QR Code and Instructions */}
      {(status === 'PENDING' || status === 'CONFIRMING') && (
        <>
          {/* QR Code */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
              <Image
                src={qrCode}
                alt="Payment QR Code"
                width={300}
                height={300}
                className="rounded"
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <p className="text-lg font-semibold">{networkName}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Send
              </label>
              <p className="text-2xl font-bold text-green-600">{amount} USDT</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Address
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm break-all">
                  {depositAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Payment Instructions</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                  1
                </span>
                <span>Open your crypto wallet and select {networkName} network</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                  2
                </span>
                <span>Scan the QR code or copy the deposit address above</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                  3
                </span>
                <span>
                  Send exactly <strong>{amount} USDT</strong> to the address
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                  4
                </span>
                <span>
                  Wait for {confirmationsRequired} confirmations. This page will update
                  automatically.
                </span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Make sure to send the exact amount ({amount} USDT)
              on the {networkName} network. Sending a different amount or using a different
              network may result in loss of funds.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: 'Pending Payment', color: 'bg-gray-100 text-gray-800' },
    CONFIRMING: { label: 'Confirming', color: 'bg-yellow-100 text-yellow-800' },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-800' },
    FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export default PaymentQRDisplay
