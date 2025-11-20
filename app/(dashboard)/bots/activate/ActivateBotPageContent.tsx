'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BotActivationCard } from '@/components/BotActivationCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PaymentModal } from '@/components/PaymentModal'
import { Loader2, Info, ArrowRight } from 'lucide-react'
import { getTokenFromStorage } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import dynamic from 'next/dynamic'

interface BotEligibility {
  eligible: boolean
  isActive: boolean
  packages: any[]
  activationFee: number
  requiredPackageRange: string
}

// Dynamically import PaymentModal with no SSR to avoid window/ethereum issues
const DynamicPaymentModal = dynamic(
  () => import('@/components/PaymentModal').then(mod => ({ default: mod.PaymentModal })),
  { ssr: false }
)

function ActivateBotPageContent() {
  const router = useRouter()
  const { error: showError, success: showSuccess } = useToast()

  const [eligibility, setEligibility] = useState<{
    NEO: BotEligibility
    NEURAL: BotEligibility
    ORACLE: BotEligibility
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBot, setSelectedBot] = useState<{
    botType: string
    packageId: string
    activationFee: number
    botId?: string
    network?: 'BEP20' | 'TRC20'
  } | null>(null)

  useEffect(() => {
    fetchEligibility()
  }, [])

  const fetchEligibility = async () => {
    try {
      const token = getTokenFromStorage()
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/bots/eligibility', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bot eligibility')
      }

      const data = await response.json()
      setEligibility(data.eligibility)
    } catch (error) {
      console.error('Failed to fetch eligibility:', error)
      showError('Failed to load bot eligibility status')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateBot = async (botType: string, packageId: string) => {
    const fees = {
      NEO: 50,
      NEURAL: 100,
      ORACLE: 150
    }

    try {
      const token = getTokenFromStorage()
      if (!token) {
        router.push('/login')
        return
      }

      setActivating(true)

      // Create bot activation with payment first (this creates a PENDING bot)
      const createResponse = await fetch('/api/bots/activate-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          botType,
          network: 'BEP20' // Default to BEP20, can be made selectable later
        })
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create bot activation')
      }

      const botId = createData.data?.bot?.id

      if (!botId) {
        throw new Error('Bot ID not found in response')
      }

      setSelectedBot({
        botType,
        packageId,
        activationFee: fees[botType as keyof typeof fees],
        botId,
        network: 'BEP20'
      })
      setShowPaymentModal(true)
    } catch (error: any) {
      console.error('Error creating bot activation:', error)
      showError(error.message || 'Failed to initialize bot activation')
    } finally {
      setActivating(false)
    }
  }

  const handlePaymentSuccess = async (txHash: string) => {
    if (!selectedBot || !selectedBot.botId) {
      showError('Bot activation not found. Please try again.')
      return
    }

    setActivating(true)

    try {
      const token = getTokenFromStorage()
      if (!token) {
        router.push('/login')
        return
      }

      // Automatically submit transaction hash for verification
      const verifyResponse = await fetch(`/api/bots/${selectedBot.botId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          txHash,
          network: selectedBot.network || 'BEP20'
        })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to submit transaction hash')
      }

      showSuccess('Transaction hash submitted successfully! Your bot will be activated after admin verification.')
      setShowPaymentModal(false)
      setSelectedBot(null)

      // Refresh eligibility status
      await fetchEligibility()

    } catch (error: any) {
      console.error('Bot activation error:', error)
      showError(error.message || 'Failed to submit transaction hash')
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  const hasAnyPackage = eligibility && (
    (eligibility.NEO?.packages?.length > 0) ||
    (eligibility.NEURAL?.packages?.length > 0) ||
    (eligibility.ORACLE?.packages?.length > 0)
  )

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bot Activation</h1>
        <p className="text-gray-400">
          Activate trading bots to maximize your returns and unlock referral earnings
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 bg-blue-500/10 border-blue-500">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Each bot type requires a matching package tier. Once activated, your bot will:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Generate monthly ROI on your investment</li>
            <li>Enable referral commissions and level income</li>
            <li>Provide direct bonus on referral purchases</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* No Packages Warning */}
      {!hasAnyPackage && (
        <Card className="mb-8 border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-orange-500">No Active Packages</CardTitle>
            <CardDescription>
              You need to purchase a package before you can activate a bot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/packages/buy')}
              className="bg-gradient-to-r from-orange-500 to-red-500"
            >
              Browse Packages
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {eligibility && (
          <>
            <BotActivationCard
              botType="NEO"
              activationFee={eligibility.NEO?.activationFee || 50}
              requiredPackageRange={eligibility.NEO?.requiredPackageRange || '$500-$3,000'}
              isEligible={eligibility.NEO?.eligible || false}
              isActive={eligibility.NEO?.isActive || false}
              activePackages={eligibility.NEO?.packages || []}
              onActivate={handleActivateBot}
              loading={activating}
            />

            <BotActivationCard
              botType="NEURAL"
              activationFee={eligibility.NEURAL?.activationFee || 100}
              requiredPackageRange={eligibility.NEURAL?.requiredPackageRange || '$5,000-$10,000'}
              isEligible={eligibility.NEURAL?.eligible || false}
              isActive={eligibility.NEURAL?.isActive || false}
              activePackages={eligibility.NEURAL?.packages || []}
              onActivate={handleActivateBot}
              loading={activating}
            />

            <BotActivationCard
              botType="ORACLE"
              activationFee={eligibility.ORACLE?.activationFee || 150}
              requiredPackageRange={eligibility.ORACLE?.requiredPackageRange || '$25,000-$50,000'}
              isEligible={eligibility.ORACLE?.eligible || false}
              isActive={eligibility.ORACLE?.isActive || false}
              activePackages={eligibility.ORACLE?.packages || []}
              onActivate={handleActivateBot}
              loading={activating}
            />
          </>
        )}
      </div>

      {/* Bot Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Comparison</CardTitle>
          <CardDescription>
            Compare features and requirements across all bot types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">NEO Bot</th>
                  <th className="text-center py-3 px-4">NEURAL Bot</th>
                  <th className="text-center py-3 px-4">ORACLE Bot</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Activation Fee</td>
                  <td className="text-center py-3 px-4">$50</td>
                  <td className="text-center py-3 px-4">$100</td>
                  <td className="text-center py-3 px-4">$150</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Package Range</td>
                  <td className="text-center py-3 px-4">$500-$3,000</td>
                  <td className="text-center py-3 px-4">$5,000-$10,000</td>
                  <td className="text-center py-3 px-4">$25,000-$50,000</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Monthly ROI</td>
                  <td className="text-center py-3 px-4 text-green-400">3%</td>
                  <td className="text-center py-3 px-4 text-green-400">4%</td>
                  <td className="text-center py-3 px-4 text-green-400">5%</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Total ROI (12 months)</td>
                  <td className="text-center py-3 px-4 text-green-400">36%</td>
                  <td className="text-center py-3 px-4 text-green-400">48%</td>
                  <td className="text-center py-3 px-4 text-green-400">60%</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Referral Bonus</td>
                  <td className="text-center py-3 px-4">2%</td>
                  <td className="text-center py-3 px-4">2%</td>
                  <td className="text-center py-3 px-4">2%</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Level Income</td>
                  <td className="text-center py-3 px-4">Up to 6 levels</td>
                  <td className="text-center py-3 px-4">Up to 6 levels</td>
                  <td className="text-center py-3 px-4">Up to 6 levels</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Best For</td>
                  <td className="text-center py-3 px-4">Beginners</td>
                  <td className="text-center py-3 px-4">Intermediate</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && selectedBot && (
        <DynamicPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedBot(null)
          }}
          amount={selectedBot.activationFee}
          network="BEP20"
          // PaymentModal expects NEXT_PUBLIC_ADMIN_WALLET_BSC (BSC) env var name
          adminWalletAddress={process.env.NEXT_PUBLIC_ADMIN_WALLET_BSC || ''}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default ActivateBotPageContent