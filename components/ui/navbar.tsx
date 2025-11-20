'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  Bot, 
  TrendingUp, 
  Users, 
  Wallet,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  DollarSign,
  Shield
} from 'lucide-react'

interface NavbarProps {
  user?: {
    fullName?: string
    email?: string
    referralCode?: string
  }
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/pricing', label: 'Pricing', icon: DollarSign },
    { href: '/packages', label: 'Packages', icon: Package },
    { href: '/bots', label: 'Bot Activation', icon: Bot },
    { href: '/earnings', label: 'Earnings', icon: TrendingUp },
    { href: '/network', label: 'Network', icon: Users },
    { href: '/withdrawals', label: 'Withdrawals', icon: Wallet },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-3 lg:px-6 h-14 min-h-14">
      {/* Logo and Brand */}
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </label>
          {isMobileMenuOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-xl bg-base-100 rounded-xl w-48">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg py-2 text-sm ${isActive(item.href) ? 'active bg-primary text-primary-content' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <Link href="/dashboard" className="btn btn-ghost text-base font-bold gap-1 hover:bg-transparent h-auto min-h-0 px-2">
          <span className="text-primary">NSC</span>
          <span className="text-base-content">Bot</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${isActive(item.href) ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Right Side - Notifications and Profile */}
      <div className="navbar-end gap-2">
        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle hover:bg-base-200">
            <div className="indicator">
              <Bell className="h-4 w-4" />
            </div>
          </label>
          <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-64 shadow-xl bg-base-100 mt-2 rounded-xl">
            <div className="card-body p-3">
              <h3 className="font-bold text-sm mb-2">Notifications</h3>
              <div className="bg-base-200 rounded-lg p-3">
                <div className="text-xs text-base-content/60 text-center">
                  No new notifications
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-sm flex items-center gap-2 hover:bg-base-200 px-2 rounded-lg h-auto min-h-0 py-1.5"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-7 h-7">
                <span className="text-xs font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
              </div>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-base-content leading-tight">{user?.fullName || 'User'}</div>
              <div className="text-[10px] text-base-content/60 leading-tight">{user?.email || 'user@example.com'}</div>
            </div>
            <ChevronDown className="h-3 w-3 text-base-content/60" />
          </label>
          {isProfileOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-xl bg-base-100 rounded-xl w-48">
              <li className="menu-title px-2 py-1">
                <span className="text-[10px] text-base-content/60">{user?.email || 'user@example.com'}</span>
              </li>
              <li>
                <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="rounded-lg py-2 text-sm">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/security" onClick={() => setIsProfileOpen(false)} className="rounded-lg py-2 text-sm">
                  <Shield className="h-3.5 w-3.5" />
                  Security
                </Link>
              </li>
              <div className="divider my-0.5"></div>
              <li>
                <button className="text-error hover:bg-error/10 rounded-lg py-2 text-sm">
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
