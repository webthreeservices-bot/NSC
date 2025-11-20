'use client'

import React from 'react'
import { Package, Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';
import { formatDate as formatDateUtil } from '@/lib/date-utils'

interface PackageCardProps {
  packageType: 'NEO' | 'NEURAL' | 'ORACLE'
  amount: number
  roiPercentage: number
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING'
  investmentDate: Date | string
  expiryDate: Date | string
  totalRoiPaid: number
  roiPaidCount: number
  nextRoiDate?: Date | string | null
  onViewDetails?: () => void
}

export const PackageCard: React.FC<PackageCardProps> = ({
  packageType,
  amount,
  roiPercentage,
  status,
  investmentDate,
  expiryDate,
  totalRoiPaid,
  roiPaidCount,
  nextRoiDate,
  onViewDetails
}) => {
  const packageColors = {
    NEO: 'from-[#00ff00] to-[#00cc00]',
    NEURAL: 'from-green-500 to-green-700',
    ORACLE: 'from-emerald-500 to-emerald-700'
  }

  const packageLevels = {
    NEO: { level: 'Level 1', range: '$500 - $10,000' },
    NEURAL: { level: 'Level 2', range: '$10,000 - $50,000' },
    ORACLE: { level: 'Level 3', range: '$50,000 - $100,000' }
  }

  const statusBadge = {
    ACTIVE: { class: 'bg-green-900 text-green-400 border-green-700', icon: CheckCircle, text: 'Active' },
    EXPIRED: { class: 'bg-red-900 text-red-400 border-red-700', icon: AlertCircle, text: 'Expired' },
    PENDING: { class: 'bg-orange-900 text-orange-400 border-orange-700', icon: Clock, text: 'Pending' }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const StatusIcon = statusBadge[status].icon

  return (
    <div className="card bg-gray-900 border border-gray-800 hover:border-[#00ff00]/30 shadow-lg rounded-xl transition-all duration-300">
      {/* Card Header with Gradient */}
      <div className={`h-2 bg-gradient-to-r ${packageColors[packageType]} rounded-t-xl`}></div>
      
      <div className="card-body p-5">
        {/* Package Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-[#00ff00]/20 border border-[#00ff00]/30`}>
              <Package className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{packageType} Package</h3>
              <p className="text-sm text-gray-400">{packageLevels[packageType].level} • {packageLevels[packageType].range}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusBadge[status].class} flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {statusBadge[status].text}
          </div>
        </div>

        {/* Investment Level Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#00ff00]/10 border border-[#00ff00]/30">
            <Award className="h-4 w-4 text-[#00ff00]" />
            <span className="text-sm font-semibold text-[#00ff00]">{packageLevels[packageType].level}</span>
            <span className="text-xs text-gray-400">Investment Tier</span>
          </div>
        </div>

        {/* Investment Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Investment Amount</span>
            <span className="text-xl font-bold text-[#00ff00]">{formatCurrency(amount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Monthly ROI (Max)</span>
            <span className="font-semibold text-green-400">Up to {roiPercentage}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total ROI Earned</span>
            <span className="font-semibold text-white">{formatCurrency(totalRoiPaid)}</span>
          </div>

          <div className="divider my-2 bg-gray-800"></div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">ROI Progress</span>
              <span className="text-xs font-semibold text-white">{roiPaidCount}/12 months</span>
            </div>
            <progress 
              className="progress progress-success w-full bg-gray-800" 
              value={roiPaidCount} 
              max="12"
            ></progress>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-2 bg-gray-800 rounded-lg border border-gray-700">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-400">Invested</p>
              <p className="text-xs font-semibold text-white">{formatDateUtil(investmentDate)}</p>
            </div>
            <div className="text-center p-2 bg-gray-800 rounded-lg border border-gray-700">
              <Clock className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-400">Expires</p>
              <p className="text-xs font-semibold text-white">{formatDateUtil(expiryDate)}</p>
            </div>
          </div>

          {/* Next ROI Date */}
          {nextRoiDate && status === 'ACTIVE' && (
            <div className="alert alert-success py-2 bg-green-900/20 border border-green-700 rounded-lg mt-3">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-xs text-green-400">Next ROI Payment</p>
                <p className="text-sm font-semibold text-green-300">{formatDateUtil(nextRoiDate)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="card-actions mt-4">
          <button 
            className="btn bg-[#00ff00] hover:bg-[#00cc00] text-black border-0 btn-sm btn-block rounded-lg font-semibold"
            onClick={onViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default PackageCard
