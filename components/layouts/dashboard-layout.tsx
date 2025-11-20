'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/ui/sidebar'
import { ThemeToggler } from '@/components/ui/theme-toggler'
import { Menu } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    fullName?: string
    email?: string
    referralCode?: string
  }
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar - Visible on tablet and up */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 w-full min-w-0">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden sticky top-0 z-40 p-4 bg-black/95 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between">
            <button
              className="text-[#00ff00] hover:bg-[#00ff00]/10 active:bg-[#00ff00]/20 p-2 rounded-lg transition-all active:scale-95"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00ff00] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">N</span>
              </div>
              <span className="text-white font-bold">NSC Bot</span>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Theme Toggler - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggler />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  )
}

export default DashboardLayout
