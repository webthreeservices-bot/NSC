'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { botAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Zap,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Shield,
  Target,
  Award
} from 'lucide-react'

const BOT_CONFIG = {
  NEO: {
    fee: 50,
    packageRange: '$500 - $3,000',
    requiredPackage: 500,
    maxPackage: 3000,
    features: [
      'Automated ROI distribution',
      'Direct referral bonus (2%)',
      'Level 1-6 income distribution',
      'Real-time earnings tracking'
    ],
    color: 'from-gray-700 to-gray-900',
    icon: Zap,
    recommended: false
  },
  NEURAL: {
    fee: 100,
    packageRange: '$5,000 - $10,000',
    requiredPackage: 5000,
    maxPackage: 10000,
    features: [
      'All NEO bot features',
      'Priority ROI processing',
      'Enhanced commission rates',
      'Advanced analytics dashboard',
      'Dedicated support'
    ],
    color: 'from-gray-700 to-gray-900',
    icon: TrendingUp,
    recommended: true
  },
  ORACLE: {
    fee: 150,
    packageRange: '$25,000 - $50,000',
    requiredPackage: 25000,
    maxPackage: 50000,
    features: [
      'All NEURAL bot features',
      'VIP ROI processing',
      'Maximum commission rates',
      'Premium analytics & insights',
      'Personal account manager',
      'Early access to new features'
    ],
    color: 'from-gray-700 to-gray-900',
    icon: Award,
    recommended: false
  }
}

export default function BotsPage() {
  const [bots, setBots] = useState<any[]>([])
  const [eligibility, setEligibility] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBotsCount: 0,
    expiringCount: 0
  })

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const token = getTokenFromStorage()
        if (!token) {
          console.error('No token found')
          setLoading(false)
          return
        }

        console.log('Fetching bots from API...')
        const response: any = await botAPI.getMyBots(token)
        console.log('Bots API response:', response)

        const botsData = response.bots || []
        console.log('Bots data:', botsData)

        setBots(botsData)
        setEligibility(response.eligibility || null)

        // Calculate stats
        const activeBots = botsData.filter((b: any) => b.status === 'ACTIVE' && !b.isExpired)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        const expiringSoon = activeBots.filter((b: any) =>
          new Date(b.expiryDate) <= thirtyDaysFromNow
        )

        setStats({
          totalEarnings: botsData.reduce((sum: number, b: any) => sum + Number(b.totalEarnings || 0), 0),
          activeBotsCount: activeBots.length,
          expiringCount: expiringSoon.length
        })
      } catch (error) {
        console.error('Failed to fetch bots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBots()
  }, [])

  const getStatusColor = (status: string, isExpired: boolean) => {
    if (isExpired) return 'destructive'
    return status === 'ACTIVE' ? 'default' : 'secondary'
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff00] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading bot management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="h-7 w-7 text-[#00ff00]" />
            Bot Management
          </h1>
          <p className="text-gray-400 mt-1">Activate bots to unlock referral earnings</p>
        </div>
        <Link href="/bots/activate" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto active:scale-95 transition-transform bg-[#00ff00] hover:bg-[#00ff00]/90 text-black" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Activate New Bot
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Bots</p>
                <p className="text-2xl font-bold text-white">{stats.activeBotsCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#00ff00]/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#00ff00]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#00ff00]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#00ff00]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">{stats.expiringCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#00ff00]/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#00ff00]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why Activate Bot - Improved */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-[#00ff00]" />
            Why Do You Need a Bot?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            Bot activation is <strong className="text-white">mandatory</strong> to unlock the full earning potential of your investment.
            Without an active bot, you will only receive ROI on your package but miss out on lucrative referral income.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-[#00ff00]">
                <CheckCircle2 className="h-4 w-4" />
                With Active Bot
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff00] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Monthly ROI from your package (guaranteed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff00] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">2% direct referral bonus on every signup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff00] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Level income from 6 levels (0.75% - 0.10%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff00] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Passive income from your entire network</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-gray-400">
                <XCircle className="h-4 w-4" />
                Without Bot
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff00] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Monthly ROI from your package only</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">No direct referral bonus</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">No level income from network</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Missing 50%+ of potential earnings</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#00ff00] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Important Note</p>
              <p className="text-sm text-gray-400 mt-1">
                Each bot type must match your package tier. Bot activation is valid for 12 months and must be renewed to continue earning referral income.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Bots - Enhanced */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-[#00ff00]" />
          Available Bot Types
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.keys(BOT_CONFIG) as Array<keyof typeof BOT_CONFIG>).map((botType) => {
            const config = BOT_CONFIG[botType]
            const Icon = config.icon
            const activatedBot = bots.find(b => b.botType === botType && b.status === 'ACTIVE' && !b.isExpired)
            const isEligible = eligibility?.[botType]
            const daysLeft = activatedBot ? getDaysUntilExpiry(activatedBot.expiryDate) : 0

            return (
              <Card
                key={botType}
                className={`relative overflow-hidden border-gray-800 ${activatedBot ? 'ring-2 ring-[#00ff00] shadow-lg shadow-[#00ff00]/20' : ''} ${config.recommended ? 'ring-2 ring-gray-700' : ''}`}
              >
                {config.recommended && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-gray-700 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-white">{botType} Bot</CardTitle>
                      <CardDescription className="mt-2 text-gray-400">{config.packageRange} packages</CardDescription>
                    </div>
                    {activatedBot && (
                      <Badge variant="default" className="bg-[#00ff00] text-black">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                    <p className="text-3xl font-bold text-[#00ff00]">
                      ${config.fee}
                    </p>
                    <p className="text-sm text-gray-400">One-time activation fee</p>
                    <p className="text-xs text-gray-500 mt-1">Valid for 12 months</p>
                  </div>

                  {/* Active Bot Info */}
                  {activatedBot && (
                    <div className="space-y-2 bg-[#00ff00]/10 rounded-lg p-4 border border-[#00ff00]/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[#00ff00]" />
                        <span className="text-gray-400">Activated:</span>
                        <span className="font-medium text-white">{formatDate(new Date(activatedBot.activationDate))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#00ff00]" />
                        <span className="text-gray-400">Expires:</span>
                        <span className="font-medium text-white">{formatDate(new Date(activatedBot.expiryDate))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-[#00ff00]" />
                        <span className="text-gray-400">Total Earned:</span>
                        <span className="font-medium text-white">{formatCurrency(activatedBot.totalEarnings || 0)}</span>
                      </div>
                      {daysLeft <= 30 && daysLeft > 0 && (
                        <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700">
                          <p className="text-xs text-gray-300 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-[#00ff00]" />
                            Expires in {daysLeft} days - Renew soon!
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold mb-3 text-white">Features:</p>
                    <ul className="space-y-2">
                      {config.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#00ff00] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {!activatedBot && (
                    <div className="pt-4">
                      {isEligible ? (
                        <Link href={`/bots/activate?type=${botType}`} className="block">
                          <Button className="w-full bg-[#00ff00] hover:bg-[#00ff00]/90 text-black" size="lg">
                            Activate Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center space-y-2">
                          <p className="text-sm font-medium text-gray-400 flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Not Eligible
                          </p>
                          <p className="text-xs text-gray-500">
                            Purchase a {botType} package ({config.packageRange}) to activate this bot
                          </p>
                          <Link href="/packages/buy">
                            <Button variant="outline" size="sm" className="w-full mt-2 border-gray-600 text-gray-300 hover:bg-gray-700">
                              View Packages
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Bot History - Enhanced */}
      {bots.length > 0 && (
        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-[#00ff00]" />
              Bot Activation History
            </CardTitle>
            <CardDescription className="text-gray-400">Track all your bot activations and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-3">
                {bots.map((bot) => {
                  const daysLeft = getDaysUntilExpiry(bot.expiryDate)
                  const isExpiring = daysLeft <= 30 && daysLeft > 0

                  return (
                    <div
                      key={bot.id}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg transition-all hover:shadow-md hover:shadow-gray-700/50 ${
                        bot.status === 'ACTIVE' && !bot.isExpired ? 'bg-[#00ff00]/5 border-[#00ff00]/30' : 'bg-gray-800/30 border-gray-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${BOT_CONFIG[bot.botType as keyof typeof BOT_CONFIG]?.color || 'from-gray-700 to-gray-900'} flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{bot.botType[0]}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-white">{bot.botType} Bot</span>
                            <Badge variant={getStatusColor(bot.status, bot.isExpired)} className="ml-2">
                              {bot.isExpired ? 'Expired' : bot.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-2 text-sm text-gray-400">
                          <div>
                            <span className="block text-xs">Activated</span>
                            <span className="font-medium text-white">{formatDate(new Date(bot.activationDate))}</span>
                          </div>
                          <div>
                            <span className="block text-xs">Expires</span>
                            <span className={`font-medium ${isExpiring ? 'text-[#00ff00]' : 'text-white'}`}>
                              {formatDate(new Date(bot.expiryDate))}
                              {isExpiring && ` (${daysLeft}d)`}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs">Network</span>
                            <span className="font-medium text-white">{bot.network}</span>
                          </div>
                        </div>

                        {bot.paymentTxHash && (
                          <div className="text-xs text-gray-500 font-mono mt-2">
                            TX: {bot.paymentTxHash.substring(0, 30)}...
                          </div>
                        )}
                      </div>

                      <div className="text-right sm:ml-4">
                        <div className="font-bold text-xl text-white">${bot.activationFee}</div>
                        <div className="text-sm text-gray-400">Activation Fee</div>
                        {bot.totalEarnings > 0 && (
                          <div className="text-sm font-medium text-[#00ff00] mt-1">
                            +{formatCurrency(bot.totalEarnings)} earned
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {bots.length === 0 && (
        <Card className="py-12 border-gray-800 bg-gray-900/30">
          <CardContent className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-[#00ff00]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">No Bots Activated Yet</h3>
            <p className="text-gray-400 mb-6">
              Activate a bot to start earning referral commissions from your network
            </p>
            <Link href="/bots/activate">
              <Button size="lg" className="bg-[#00ff00] hover:bg-[#00ff00]/90 text-black">
                <Zap className="mr-2 h-4 w-4" />
                Activate Your First Bot
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
