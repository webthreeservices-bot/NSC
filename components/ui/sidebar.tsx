'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Home, 
  Package, 
  Bot, 
  TrendingUp, 
  Users, 
  Wallet,
  Settings,
  HelpCircle,
  Shield,
  Activity,
  LogOut,
  Receipt,
  Zap,
  Gift,
  BarChart3,
  CreditCard,
  UserCircle2,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [expandedSection, setExpandedSection] = useState<string | null>('main')

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    {
      id: 'main',
      title: 'Main Menu',
      icon: Home,
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Home, badge: null },
        { href: '/packages', label: 'Packages', icon: Package, badge: null },
        { href: '/bots', label: 'My Bots', icon: Bot, badge: 'Active' },
      ]
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: Wallet,
      items: [
        { href: '/earnings', label: 'Earnings', icon: TrendingUp, badge: null },
        { href: '/withdrawals', label: 'Withdraw', icon: Wallet, badge: null },
        { href: '/transactions', label: 'Transactions', icon: Receipt, badge: null },
      ]
    },
    {
      id: 'network',
      title: 'Network',
      icon: Users,
      items: [
        { href: '/network', label: 'Referral Tree', icon: Users, badge: null },
        { href: '/team-performance', label: 'Performance', icon: BarChart3, badge: null },
      ]
    },
    {
      id: 'account',
      title: 'Settings',
      icon: Settings,
      items: [
        { href: '/profile', label: 'My Profile', icon: UserCircle2, badge: null },
        { href: '/security', label: 'Security', icon: Shield, badge: null },
        { href: '/support', label: 'Help & Support', icon: HelpCircle, badge: null },
      ]
    }
  ]

  const isActive = (href: string) => pathname === href
  
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50
      w-72 bg-gradient-to-b from-gray-950 via-black to-gray-950
      border-r border-gray-800/50
      h-screen flex flex-col
      md:translate-x-0 md:block
      transition-transform duration-300 ease-in-out
      shadow-2xl
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo Section with Glow Effect */}
      <div className="relative p-5 border-b border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-black backdrop-blur-sm flex-shrink-0">
        <div className="absolute inset-0 bg-[#00ff00]/5 blur-xl" />
        <Link 
          href="/dashboard" 
          className="relative flex items-center gap-4 active:opacity-70 transition-all duration-200 group" 
          onClick={onClose}
        >
          <div className="relative w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00ff00]/30 group-hover:shadow-[#00ff00]/50 transition-all duration-300 group-hover:scale-105">
            <Zap className="w-7 h-7 text-black" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-[#00ff00]/20 rounded-xl blur-md" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">NSC Bot</h2>
            <p className="text-gray-400 text-xs font-medium">AI Trading Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-1 custom-scrollbar">
        {menuItems.map((section) => {
          const SectionIcon = section.icon
          const isExpanded = expandedSection === section.id
          const hasActiveItem = section.items.some(item => isActive(item.href))
          
          return (
            <div key={section.id} className="mb-2">
              {/* Section Header - Collapsible */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold
                  transition-all duration-200 group
                  ${hasActiveItem || isExpanded
                    ? 'text-[#00ff00] bg-[#00ff00]/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">{section.title}</span>
                </div>
                <ChevronRight 
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </button>

              {/* Section Items */}
              <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
              `}>
                <ul className="space-y-0.5 pl-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`
                            relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                            transition-all duration-200 group overflow-hidden
                            ${active
                              ? 'bg-gradient-to-r from-[#00ff00] to-[#00cc00] text-black font-semibold shadow-lg shadow-[#00ff00]/20'
                              : 'hover:bg-gray-800/70 text-gray-300 hover:text-white hover:translate-x-1'
                            }
                          `}
                        >
                          {active && (
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00ff00]/20 to-transparent animate-pulse" />
                          )}
                          <Icon className={`h-4 w-4 flex-shrink-0 relative z-10 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                          <span className="flex-1 font-medium relative z-10">{item.label}</span>
                          {item.badge && (
                            <span className={`
                              px-2 py-0.5 rounded-full text-[10px] font-bold relative z-10
                              ${active 
                                ? 'bg-black/20 text-black' 
                                : 'bg-[#00ff00]/20 text-[#00ff00]'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Quick Stats Card */}
      <div className="mx-3 mb-3 p-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700/50 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#00ff00]/10 rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5 text-[#00ff00]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium">Quick Action</p>
            <p className="text-sm text-white font-bold">Upgrade Now</p>
          </div>
        </div>
        <Link 
          href="/packages/buy" 
          className="block w-full bg-gradient-to-r from-[#00ff00] to-[#00cc00] hover:from-[#00cc00] hover:to-[#00ff00] text-black px-4 py-2.5 rounded-lg font-bold text-sm text-center transition-all active:scale-95 shadow-lg shadow-[#00ff00]/20 hover:shadow-[#00ff00]/40" 
          onClick={onClose}
        >
          Buy Package
        </Link>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-800/80 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 active:bg-red-800 text-gray-300 hover:text-white px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 border border-gray-700/50 hover:border-red-500/50"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 0, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 0, 0.4);
        }
      `}</style>
    </aside>
  )
}

export default Sidebar
