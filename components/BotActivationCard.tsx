'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lock, AlertCircle, Loader2 } from 'lucide-react'

interface BotActivationCardProps {
  botType: 'NEO' | 'NEURAL' | 'ORACLE'
  activationFee: number
  requiredPackageRange: string
  isEligible: boolean
  isActive: boolean
  activePackages: any[]
  onActivate: (botType: string, packageId: string) => void
  loading?: boolean
}

export function BotActivationCard({
  botType,
  activationFee,
  requiredPackageRange,
  isEligible,
  isActive,
  activePackages,
  onActivate,
  loading = false
}: BotActivationCardProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')

  const botColors = {
    NEO: 'from-blue-500 to-cyan-500',
    NEURAL: 'from-purple-500 to-pink-500',
    ORACLE: 'from-orange-500 to-red-500'
  }

  const botIcons = {
    NEO: '🚀',
    NEURAL: '⚡',
    ORACLE: '💎'
  }

  const botDescriptions = {
    NEO: 'Entry-Level Trading Bot',
    NEURAL: 'Mid-Level Trading Bot',
    ORACLE: 'High-Level Trading Bot'
  }

  const roiRates = {
    NEO: '3%',
    NEURAL: '4%',
    ORACLE: '5%'
  }

  const [inlineError, setInlineError] = useState<string>('')

  const handleActivate = async () => {
    setInlineError('')

    if (!selectedPackageId && activePackages.length === 1) {
      setSelectedPackageId(activePackages[0].id)
    }

    const packageId = selectedPackageId || activePackages[0]?.id
    
    if (!packageId) {
      setInlineError('Please select a package to activate this bot.')
      return
    }

    onActivate(botType, packageId)
  }

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        isActive 
          ? 'border-green-500 shadow-lg shadow-green-500/20' 
          : !isEligible 
          ? 'opacity-60 border-gray-700' 
          : 'border-gray-800 hover:border-gray-600'
      }`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${botColors[botType]} opacity-5`} />
      
      <CardHeader className="relative">
        <div className="flex justify-between items-start mb-2">
          <div className="text-5xl">{botIcons[botType]}</div>
          
          {isActive ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : !isEligible ? (
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-600">
              <Lock className="w-3 h-3 mr-1" />
              Not Eligible
            </Badge>
          ) : (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
              <AlertCircle className="w-3 h-3 mr-1" />
              Available
            </Badge>
          )}
        </div>

        <CardTitle className="text-2xl font-bold">{botType} Bot</CardTitle>
        <CardDescription>{botDescriptions[botType]}</CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Activation Fee */}
        <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">Activation Fee</span>
          <span className="text-lg font-bold text-white">${activationFee}</span>
        </div>

        {/* Required Package */}
        <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">Required Package</span>
          <span className="text-sm font-medium text-white">{requiredPackageRange}</span>
        </div>

        {/* Monthly ROI */}
        <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">Monthly ROI</span>
          <span className="text-lg font-bold text-green-400">{roiRates[botType]}</span>
        </div>

        {/* Package Selection (if user has multiple eligible packages) */}
        {isEligible && !isActive && activePackages.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Select Package</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Choose a package</option>
              {activePackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  ${pkg.amount} - {pkg.packageType}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Inline error for package selection */}
        {inlineError && (
          <div className="flex items-center gap-2 p-2 text-sm text-red-300 bg-red-950/40 border border-red-700 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span>{inlineError}</span>
          </div>
        )}

        {/* Activation Button */}
        {!isActive && (
          <Button
            onClick={handleActivate}
            disabled={!isEligible || loading}
            className={`w-full ${
              isEligible
                ? 'bg-gradient-to-r ' + botColors[botType] + ' hover:opacity-90'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !isEligible ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Purchase Package
              </>
            ) : (
              'Activate Bot'
            )}
          </Button>
        )}

        {/* Info Text */}
        {!isEligible && (
          <p className="text-xs text-gray-500 text-center">
            You need an active {botType} package to activate this bot.
          </p>
        )}
        
        {isActive && (
          <p className="text-xs text-green-400 text-center">
            Bot is currently generating returns on your investment.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
