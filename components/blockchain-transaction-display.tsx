'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

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
  txHash: string
  network: 'BEP20' | 'TRC20'
  description: string
  status: string
  createdAt: string
  blockchain: BlockchainData | null
}

interface BlockchainTransactionCardProps {
  transaction: Transaction
}

export function BlockchainTransactionCard({ transaction }: BlockchainTransactionCardProps) {
  const { blockchain, txHash, network } = transaction
  
  if (!blockchain) {
    return (
      <div className="text-sm text-muted-foreground">
        No blockchain data available
      </div>
    )
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
  
  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(blockchain.status)}
            <span className="text-sm font-medium text-white">
              {blockchain.status.charAt(0).toUpperCase() + blockchain.status.slice(1)}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {blockchain.network}
          </Badge>
        </div>
        
        {/* Transaction Value */}
        <div className="text-2xl font-bold text-white">
          ${blockchain.value.toLocaleString()} USDT
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">From</div>
            <div className="font-mono text-xs text-white">
              {truncateAddress(blockchain.from)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">To</div>
            <div className="font-mono text-xs text-white">
              {truncateAddress(blockchain.to)}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Block</div>
            <div className="font-mono text-xs text-white">
              #{blockchain.blockNumber.toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Time</div>
            <div className="text-xs text-white">
              {blockchain.timestamp ? formatDate(blockchain.timestamp) : 'Pending'}
            </div>
          </div>
        </div>
        
        {/* Explorer Link */}
        <a
          href={blockchain.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View on {blockchain.network === 'BEP20' ? 'BSCScan' : 'TronScan'}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </Card>
  )
}

interface BlockchainTransactionListProps {
  userId?: string // If provided, fetch user transactions, else fetch all (admin)
  isAdmin?: boolean
}

export function BlockchainTransactionList({ userId, isAdmin = false }: BlockchainTransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchTransactions()
  }, [userId, isAdmin])
  
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const endpoint = isAdmin 
        ? '/api/admin/transactions/with-blockchain'
        : '/api/transactions/with-blockchain'
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Error: {error}
      </div>
    )
  }
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No transactions found
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="space-y-2">
          {/* Transaction Info */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-white">{transaction.description}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(transaction.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg text-white">
                ${transaction.amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {transaction.type}
              </div>
            </div>
          </div>
          
          {/* Blockchain Data */}
          {transaction.blockchain ? (
            <BlockchainTransactionCard transaction={transaction} />
          ) : transaction.txHash && transaction.txHash !== 'N/A' ? (
            <div className="text-sm text-yellow-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Fetching blockchain data...</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
