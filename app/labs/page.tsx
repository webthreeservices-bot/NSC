'use client'

import { SplineSceneBasic } from "@/components/ui/spline-scene-demo"

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 bg-black/95 backdrop-blur-lg z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold">NSC Bot</a>
            <nav className="hidden md:flex space-x-8">
              <a href="/#packages" className="hover:text-[#00ff00] transition-colors">Packages</a>
              <a href="/#bots" className="hover:text-[#00ff00] transition-colors">Bots</a>
              <a href="/roi" className="hover:text-[#00ff00] transition-colors">ROI</a>
              <a href="/#referral" className="hover:text-[#00ff00] transition-colors">Referral</a>
              <a href="/#about" className="hover:text-[#00ff00] transition-colors">About</a>
            </nav>
            <a href="/register" className="bg-[#00ff00] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#00cc00] transition-all">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Scene */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 3D Interactive Scene Component */}
          <SplineSceneBasic />
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-5xl font-black text-[#00ff00] mb-2">3-5%</h3>
            <p className="text-gray-400">Monthly ROI</p>
          </div>
          <div>
            <h3 className="text-5xl font-black text-[#00ff00] mb-2">$500</h3>
            <p className="text-gray-400">Minimum Entry</p>
          </div>
          <div>
            <h3 className="text-5xl font-black text-[#00ff00] mb-2">7</h3>
            <p className="text-gray-400">Investment Packages</p>
          </div>
          <div>
            <h3 className="text-5xl font-black text-[#00ff00] mb-2">1 Year</h3>
            <p className="text-gray-400">Investment Period</p>
          </div>
        </div>
      </section>

      {/* Coming Soon Message for Other Sections */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border-2 border-[#00ff00] rounded-2xl p-12 bg-[#00ff00]/5">
            <h2 className="text-4xl font-black mb-4">More Sections Coming Soon</h2>
            <p className="text-gray-400 text-lg">
              We're building additional sections including Packages, Bots, Referral System, and more.
              Ready for files 3 & 4 to continue implementation!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">NSC Bot</h4>
            <p className="text-gray-400">Automated USDT trading platform powered by advanced AI algorithms.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#packages" className="block text-gray-400 hover:text-[#00ff00]">Packages</a>
              <a href="#bots" className="block text-gray-400 hover:text-[#00ff00]">Bots</a>
              <a href="#referral" className="block text-gray-400 hover:text-[#00ff00]">Referral</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">Support</h4>
            <div className="space-y-2">
              <a href="/faq" className="block text-gray-400 hover:text-[#00ff00]">FAQ</a>
              <a href="/contact" className="block text-gray-400 hover:text-[#00ff00]">Contact Us</a>
              <a href="/terms" className="block text-gray-400 hover:text-[#00ff00]">Terms</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">Connect</h4>
            <div className="space-y-2">
              <a href="https://twitter.com/nscbot" className="block text-gray-400 hover:text-[#00ff00]">Twitter</a>
              <a href="https://t.me/nscbot" className="block text-gray-400 hover:text-[#00ff00]">Telegram</a>
              <a href="https://discord.gg/nscbot" className="block text-gray-400 hover:text-[#00ff00]">Discord</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; 2025 NSC Bot. All rights reserved. Investment involves risk.</p>
        </div>
      </footer>
    </div>
  )
}
