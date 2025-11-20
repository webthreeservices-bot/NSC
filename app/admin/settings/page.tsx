'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettings() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/dashboard"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900/30 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-red-400">Admin Settings</h1>
              <p className="text-xs text-gray-500">System Configuration</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-400" />
                Administrative Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Settings Panel</h3>
                <p className="text-gray-400">Admin settings will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}