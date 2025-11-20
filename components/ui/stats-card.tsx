'use client'

import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-900 border-gray-800',
    primary: 'bg-[#00ff00]/10 border-[#00ff00]/20',
    success: 'bg-green-900/20 border-green-600/30',
    warning: 'bg-orange-900/20 border-orange-500/30',
    error: 'bg-red-900/20 border-red-500/30',
    info: 'bg-blue-900/20 border-blue-500/30',
  }

  const iconColors = {
    default: 'text-gray-400',
    primary: 'text-[#00ff00]',
    success: 'text-green-400',
    warning: 'text-orange-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }

  return (
    <div className={`card ${variantClasses[variant]} border shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all ${className}`}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="font-medium">{trend.value}%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg bg-gray-800/50 ${iconColors[variant]}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
