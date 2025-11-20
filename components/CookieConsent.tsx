/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent notification
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean // Always true, cannot be disabled
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let timeoutId: NodeJS.Timeout | null = null
    
    // Check if user has already consented
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Delay showing banner slightly for better UX
      timeoutId = setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent)
        setPreferences(savedPreferences)
      } catch (error) {
        console.error('Error parsing cookie preferences:', error)
      }
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allAccepted)
  }

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    savePreferences(necessaryOnly)
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    if (typeof window === 'undefined') return
    
    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(prefs))
    localStorage.setItem('cookieConsentDate', new Date().toISOString())

    // Initialize analytics if accepted
    if (prefs.analytics) {
      // Initialize Google Analytics or other analytics here
      console.log('[Cookie Consent] Analytics cookies enabled')
    }

    // Initialize marketing if accepted
    if (prefs.marketing) {
      // Initialize marketing cookies here
      console.log('[Cookie Consent] Marketing cookies enabled')
    }

    // Hide banner
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl border border-gray-200">
          {/* Main Banner */}
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Cookie Icon */}
                <div className="flex-shrink-0 text-4xl">🍪</div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    We Value Your Privacy
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    We use cookies to enhance your browsing experience, serve personalized content,
                    and analyze our traffic. By clicking "Accept All", you consent to our use of
                    cookies. You can customize your preferences or accept only necessary cookies.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    Read our{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    for more information.
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={acceptAll}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={acceptNecessary}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Necessary Only
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg border border-gray-300 font-semibold transition-colors"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Settings Panel */
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 text-4xl">⚙️</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Cookie Preferences</h3>
                  <p className="text-gray-600 text-sm">
                    Choose which cookies you want to accept. Necessary cookies cannot be disabled
                    as they are required for the website to function.
                  </p>
                </div>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Necessary Cookies{' '}
                          <span className="text-xs text-gray-500 font-normal">(Required)</span>
                        </h4>
                        <p className="text-sm text-gray-600">
                          Essential for the website to function. These cookies enable core
                          functionality such as security, authentication, and session management.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                        <p className="text-sm text-gray-600">
                          Help us understand how visitors interact with our website. We use this
                          data to improve user experience and site performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                        <p className="text-sm text-gray-600">
                          Used to track visitors across websites to display relevant advertisements
                          and measure campaign effectiveness.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveCustomPreferences}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg border border-gray-300 font-semibold transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Hook to check if user has consented to a specific cookie type
 */
export function useCookieConsent(type: keyof CookiePreferences): boolean {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const consent = localStorage.getItem('cookieConsent')
    if (consent) {
      try {
        const preferences: CookiePreferences = JSON.parse(consent)
        setHasConsent(preferences[type] || false)
      } catch (error) {
        setHasConsent(false)
      }
    }
  }, [type])

  return hasConsent
}
