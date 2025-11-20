'use client'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit 
              a website. They are widely used to make websites work more efficiently and provide information to website owners. 
              NSC Bot Platform uses cookies to enhance your user experience and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies for various purposes to ensure our platform functions properly and to provide you with 
              the best possible experience:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Authentication and security</li>
              <li>Remembering your preferences and settings</li>
              <li>Analyzing website usage and performance</li>
              <li>Personalizing content and advertisements</li>
              <li>Preventing fraud and enhancing security</li>
              <li>Providing customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Essential Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  These cookies are necessary for the website to function and cannot be switched off. They are usually 
                  set in response to actions made by you which amount to a request for services.
                </p>
                <div className="text-sm text-gray-400">
                  <strong>Examples:</strong> Authentication tokens, session management, security settings
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Performance Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  These cookies collect information about how visitors use our website, such as which pages are visited 
                  most often and if users get error messages. This data helps us improve our platform.
                </p>
                <div className="text-sm text-gray-400">
                  <strong>Examples:</strong> Google Analytics, page load times, error tracking
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Functional Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  These cookies enable the website to provide enhanced functionality and personalization. They may be 
                  set by us or by third-party providers whose services we have added to our pages.
                </p>
                <div className="text-sm text-gray-400">
                  <strong>Examples:</strong> Language preferences, theme settings, dashboard layouts
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Marketing Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  These cookies track your online activity to help advertisers deliver more relevant advertising or to 
                  limit how many times you see an ad. They may also be used to measure the effectiveness of advertising campaigns.
                </p>
                <div className="text-sm text-gray-400">
                  <strong>Examples:</strong> Advertising networks, social media plugins, conversion tracking
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our website may also use third-party cookies from trusted partners to enhance functionality and analyze usage:
            </p>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Third-Party Services We Use</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-[#00ff00] mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-300">Tracks website usage and performance metrics</p>
                </div>
                <div>
                  <h4 className="font-medium text-[#00ff00] mb-2">Cloudflare</h4>
                  <p className="text-sm text-gray-300">Provides security and performance optimization</p>
                </div>
                <div>
                  <h4 className="font-medium text-[#00ff00] mb-2">Payment Processors</h4>
                  <p className="text-sm text-gray-300">Handles secure payment transactions</p>
                </div>
                <div>
                  <h4 className="font-medium text-[#00ff00] mb-2">Support Chat</h4>
                  <p className="text-sm text-gray-300">Enables customer support functionality</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookie Duration</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Cookies can be classified by their duration:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#00ff00] mb-2">Session Cookies</h3>
                <p className="text-gray-300 text-sm">
                  Temporary cookies that are deleted when you close your browser. Used for essential functions 
                  like maintaining your login session.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#00ff00] mb-2">Persistent Cookies</h3>
                <p className="text-gray-300 text-sm">
                  Remain on your device for a set period or until manually deleted. Used to remember your 
                  preferences and settings across visits.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Managing Your Cookie Preferences</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have several options for managing cookies:
            </p>

            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Browser Settings</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-6">
              <li>Block all cookies</li>
              <li>Allow only first-party cookies</li>
              <li>Delete existing cookies</li>
              <li>Receive notifications when cookies are set</li>
            </ul>

            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of our platform. 
                Essential cookies cannot be disabled as they are necessary for the service to work properly.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Browser-Specific Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Chrome</h4>
                <p className="text-sm text-gray-300">Settings → Privacy and Security → Cookies and other site data</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Firefox</h4>
                <p className="text-sm text-gray-300">Settings → Privacy & Security → Cookies and Site Data</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Safari</h4>
                <p className="text-sm text-gray-300">Preferences → Privacy → Cookies and website data</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Edge</h4>
                <p className="text-sm text-gray-300">Settings → Cookies and site permissions → Cookies and site data</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookie Consent</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              When you first visit our website, you'll see a cookie consent banner. Your choices include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Accept All:</strong> Allows all cookies for optimal functionality</li>
              <li><strong>Essential Only:</strong> Only necessary cookies for basic functionality</li>
              <li><strong>Customize:</strong> Choose specific cookie categories</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              You can change your cookie preferences at any time by clicking the cookie settings link in our footer 
              or by adjusting your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices, technology, 
              or legal requirements. We will notify you of any material changes by posting the updated policy on 
              our website and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> privacy@nscbotplatform.com</p>
                <p><strong>Support:</strong> support@nscbotplatform.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            This Cookie Policy is part of our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}