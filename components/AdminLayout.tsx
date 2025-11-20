'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Settings,
  Shield,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Percent
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Stats'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage Users'
  },
  {
    title: 'Packages',
    href: '/admin/packages',
    icon: Package,
    description: 'Bot Packages'
  },
  {
    title: 'Transactions',
    href: '/admin/transactions',
    icon: Receipt,
    description: 'All Transactions'
  },
  {
    title: 'Withdrawals',
    href: '/admin/withdrawals',
    icon: DollarSign,
    description: 'Withdrawal Requests'
  },
  {
    title: 'Statistics',
    href: '/admin/statistics',
    icon: BarChart3,
    description: 'Analytics & Reports'
  },
  {
    title: 'ROI Settings',
    href: '/admin/roi-settings',
    icon: Percent,
    description: 'Manage ROI Distribution'
  },
  {
    title: 'Compliance',
    href: '/admin/compliance',
    icon: Shield,
    description: 'Legal & Compliance'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System Settings'
  }
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, initializing, validateToken } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle authentication redirects in useEffect to avoid render-time state updates
  useEffect(() => {
    // If not authenticated and not on login page, redirect
    if (!initializing && !user && !pathname.includes('/admin/login')) {
      router.push('/admin/login')
    }
  }, [user, initializing, pathname, router])

  // Show loading while checking authentication
  if (initializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff00] mx-auto mb-4"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and not on login page, show loading while redirecting
  if (!user && !pathname.includes('/admin/login')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff00] mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // If user is not admin, show access denied
  if (user && !user.isAdmin) {
    const handleReturnToDashboard = () => {
      router.push('/')
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need administrator privileges to access this area.</p>
          <button
            onClick={handleReturnToDashboard}
            className="bg-[#00ff00] text-black px-4 py-2 rounded hover:bg-[#00cc00] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#00ff00]" />
            <span className="text-white font-bold text-lg">Admin Panel</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <MobileSidebar 
              navItems={adminNavItems} 
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-gray-900 border-r border-gray-800 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              {sidebarOpen ? (
                <>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-[#00ff00]" />
                    <span className="text-white font-bold text-lg">Admin</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-400 hover:text-white mx-auto"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#00ff00]/10 text-[#00ff00] border border-[#00ff00]/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            {sidebarOpen ? (
              <>
                <div className="mb-3 px-3">
                  <div className="text-sm text-gray-400">Logged in as</div>
                  <div className="text-white font-medium truncate">{user?.email || 'Admin'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`lg:transition-all lg:duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } pt-16 lg:pt-0`}
      >
        <div className="min-h-screen bg-black">
          <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ 
  navItems, 
  pathname, 
  user, 
  onLogout,
  onClose 
}: { 
  navItems: typeof adminNavItems
  pathname: string
  user: any
  onLogout: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#00ff00]" />
          <span className="text-white font-bold text-lg">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#00ff00]/10 text-[#00ff00] border border-[#00ff00]/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-3 px-3">
          <div className="text-sm text-gray-400">Logged in as</div>
          <div className="text-white font-medium truncate">{user?.email || 'Admin'}</div>
        </div>
        <button
          onClick={() => {
            onLogout()
            onClose()
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

// Also export as default for compatibility
export default AdminLayout
