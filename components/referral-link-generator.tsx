'use client'

import { useState } from 'react'
import { Copy, CheckCircle, Share2 } from 'lucide-react'

interface ReferralLinkGeneratorProps {
  referralCode: string
}

export default function ReferralLinkGenerator({ referralCode }: ReferralLinkGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  
  // Check if referral code is empty or undefined
  // Default to main user's referral code if none is provided
  const hasValidCode = referralCode && referralCode.trim() !== ''
  const codeToUse = hasValidCode ? referralCode : 'NSCREF1000'
  const referralLink = `${baseUrl}/register?ref=${codeToUse}`

  const copyToClipboard = async () => {
    try {
      // Always have a valid link since we default to main user's code
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareReferralLink = async () => {
    // Always have a valid link since we default to main user's code
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join NSC Bot with my referral link',
          text: 'Sign up for NSC Bot using my referral link and start earning!',
          url: referralLink
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      copyToClipboard()
    }
  }

  // If user's referral code is not available, show that we're using the main code
  if (!hasValidCode) {
    return (
      <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
        <h3 className="text-lg font-semibold text-[#00ff00] mb-2">Using Main Referral Code</h3>
        <p className="text-gray-400 text-sm mb-3">
          Your personal referral code is not available yet. You can still share the main referral code below.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <button
            onClick={copyToClipboard}
            className="bg-[#00ff00]/10 hover:bg-[#00ff00]/20 border border-[#00ff00]/30 rounded-lg p-2 transition-all"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle className="h-5 w-5 text-[#00ff00]" /> : <Copy className="h-5 w-5 text-[#00ff00]" />}
          </button>
        </div>
        <button
          onClick={shareReferralLink}
          className="w-full bg-[#00ff00] text-black font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00cc00] transition-all"
        >
          <Share2 className="h-4 w-4" />
          Share Main Referral Link
        </button>
      </div>
    );
  }
  
  // Normal display when referral code is valid
  return (
    <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
      <h3 className="text-lg font-semibold text-[#00ff00] mb-2">Your Referral Link</h3>
      <p className="text-gray-400 text-sm mb-3">
        Share this link to invite others and earn referral commissions
      </p>
      
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        />
        <button
          onClick={copyToClipboard}
          className="bg-[#00ff00]/10 hover:bg-[#00ff00]/20 border border-[#00ff00]/30 rounded-lg p-2 transition-all"
          title="Copy to clipboard"
        >
          {copied ? <CheckCircle className="h-5 w-5 text-[#00ff00]" /> : <Copy className="h-5 w-5 text-[#00ff00]" />}
        </button>
      </div>
      
      <button
        onClick={shareReferralLink}
        className="w-full bg-[#00ff00] text-black font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00cc00] transition-all"
      >
        <Share2 className="h-4 w-4" />
        Share Referral Link
      </button>
    </div>
  )
}
