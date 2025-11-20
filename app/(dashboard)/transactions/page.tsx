'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getTokenFromStorage } from '@/lib/auth'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Search, Filter, Download, ExternalLink, ArrowUpRight, DollarSign, TrendingUp } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number | string
  status: string
  description: string
  txHash: string | null
  network: string | null
  createdAt: string
  updatedAt: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const { error: showError, success: showSuccess } = useToast()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const token = getTokenFromStorage()
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      showError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      COMPLETED: { className: 'bg-green-500/20 text-green-400 border-green-500', label: 'Completed' },
      PENDING: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', label: 'Pending' },
      FAILED: { className: 'bg-red-500/20 text-red-400 border-red-500', label: 'Failed' },
      CANCELLED: { className: 'bg-gray-500/20 text-gray-400 border-gray-500', label: 'Cancelled' },
    }

    const config = variants[status] || { className: 'bg-gray-500/20 text-gray-400 border-gray-500', label: status }

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      PACKAGE_PURCHASE: 'Package Purchase',
      BOT_ACTIVATION: 'Bot Activation',
      WITHDRAWAL: 'Withdrawal',
      REFERRAL_BONUS: 'Referral Bonus',
      LEVEL_INCOME: 'Level Income',
      ROI_PAYMENT: 'ROI Payment',
      DEPOSIT: 'Deposit',
      REFUND: 'Refund',
    }

    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500">
        {typeLabels[type] || type.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const getExplorerUrl = (txHash: string, network: string) => {
    if (!txHash) return null
    
    if (network === 'BEP20' || network === 'BSC') {
      return `https://bscscan.com/tx/${txHash}`
    } else if (network === 'TRC20' || network === 'TRON') {
      return `https://tronscan.org/#/transaction/${txHash}`
    }
    return null
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'ALL' || tx.type === filterType
    const matchesStatus = filterStatus === 'ALL' || tx.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const exportTransactions = () => {
    const csvData = filteredTransactions.map(tx => ({
      Date: formatDateTime(tx.createdAt),
      Type: tx.type,
      Amount: `$${tx.amount}`,
      Status: tx.status,
      Description: tx.description,
      'Transaction Hash': tx.txHash || 'N/A',
      Network: tx.network || 'N/A'
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    showSuccess('Transactions exported successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  const totalAmount = transactions.reduce((sum, t) => t.status === 'COMPLETED' ? sum + Number(t.amount) : sum, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-sm text-muted-foreground">
          View all your transactions including purchases, activations, and earnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-green-400">
              {transactions.filter(t => t.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Loader2 className="h-3.5 w-3.5 text-yellow-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-yellow-400">
              {transactions.filter(t => t.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-purple-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-purple-400">
              ${totalAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by description, transaction hash, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PACKAGE_PURCHASE">Package Purchase</SelectItem>
                <SelectItem value="BOT_ACTIVATION">Bot Activation</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="ROI_PAYMENT">ROI Payment</SelectItem>
                <SelectItem value="REFERRAL_BONUS">Referral Bonus</SelectItem>
                <SelectItem value="LEVEL_INCOME">Level Income</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              onClick={exportTransactions}
              variant="outline"
              className="w-full md:w-auto"
              disabled={filteredTransactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ArrowUpRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDateTime(tx.createdAt)}
                      </TableCell>
                      <TableCell>{getTypeBadge(tx.type)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${Number(tx.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        {tx.network ? (
                          <Badge variant="outline" className="text-xs">
                            {tx.network}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.txHash ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-gray-400">
                              {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                            </code>
                            {tx.network && getExplorerUrl(tx.txHash, tx.network) && (
                              <a
                                href={getExplorerUrl(tx.txHash, tx.network)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
