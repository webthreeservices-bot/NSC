'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTokenFromStorage } from '@/lib/auth'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ExternalLink, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface BlockchainData {
  hash: string
  from: string
  to: string
  value: number
  blockNumber: number
  timestamp: string | null
  status: 'confirmed' | 'pending' | 'failed'
  network: 'BEP20' | 'TRC20'
  explorerUrl: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string
  txHash: string | null
  network: 'BEP20' | 'TRC20' | null
  createdAt: string
  updatedAt: string
  blockchain: BlockchainData | null
}

export default function TransactionsWithBlockchainPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const token = getTokenFromStorage()
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/transactions/with-blockchain', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error: any) {
      toast('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
    setRefreshing(false)
    toast('Blockchain data refreshed')
  }

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 12) return addr
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PACKAGE_PURCHASE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'BOT_ACTIVATION':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'ROI_PAYMENT':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'WITHDRAWAL':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const transactionsWithBlockchain = transactions.filter(t => t.blockchain !== null)
  const transactionsWithoutBlockchain = transactions.filter(t => t.blockchain === null)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-muted-foreground">View your transaction history with live blockchain data</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Blockchain Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{transactionsWithBlockchain.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              ${transactions.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              ${transactionsWithBlockchain.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-slate-700">
          <TabsTrigger value="all">All Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="blockchain">With Blockchain ({transactionsWithBlockchain.length})</TabsTrigger>
          <TabsTrigger value="internal">Internal ({transactionsWithoutBlockchain.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          {transactionsWithBlockchain.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </TabsContent>

        <TabsContent value="internal" className="space-y-4">
          {transactionsWithoutBlockchain.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const { blockchain } = transaction

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 12) return addr
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PACKAGE_PURCHASE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'BOT_ACTIVATION':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'ROI_PAYMENT':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'WITHDRAWAL':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(transaction.type)}>
                  {transaction.type.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {transaction.network || 'Internal'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{transaction.description}</div>
              <div className="text-xs text-muted-foreground">
                {formatDateTime(transaction.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ${Number(transaction.amount).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">USDT</div>
            </div>
          </div>

          {/* Blockchain Data */}
          {blockchain && (
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(blockchain.status)}
                  <span className="text-sm font-medium text-white capitalize">
                    {blockchain.status}
                  </span>
                </div>
                <a
                  href={blockchain.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">From Address</div>
                  <div className="font-mono text-xs text-white">
                    {truncateAddress(blockchain.from)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">To Address</div>
                  <div className="font-mono text-xs text-white">
                    {truncateAddress(blockchain.to)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Block Number</div>
                  <div className="font-mono text-xs text-white">
                    #{blockchain.blockNumber.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Blockchain Value</div>
                  <div className="font-mono text-xs text-white">
                    ${blockchain.value.toLocaleString()} USDT
                  </div>
                </div>
              </div>

              {blockchain.timestamp && (
                <div className="text-xs text-muted-foreground">
                  On-chain time: {formatDateTime(blockchain.timestamp)}
                </div>
              )}
            </div>
          )}

          {/* Transaction Hash (if no blockchain data) */}
          {!blockchain && transaction.txHash && transaction.txHash !== 'N/A' && (
            <div className="border-t border-slate-700 pt-4">
              <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
              <div className="font-mono text-xs text-white break-all">
                {transaction.txHash}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
