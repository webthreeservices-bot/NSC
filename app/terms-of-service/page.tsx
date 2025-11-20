'use client'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Terms of Service
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
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using the NSC Bot Platform ("Service"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              NSC Bot Platform provides automated cryptocurrency trading services through algorithmic trading bots. 
              Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Automated trading bot subscriptions</li>
              <li>Portfolio management and analytics</li>
              <li>Real-time market data and insights</li>
              <li>Risk management tools</li>
              <li>Customer support and educational resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To access our services, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Providing accurate and complete registration information</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Financial Risks and Disclaimers</h2>
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-300 font-semibold mb-2">⚠️ Important Risk Warning</p>
              <p className="text-gray-300 leading-relaxed">
                Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors. 
                Past performance does not guarantee future results. You should carefully consider whether trading 
                is suitable for you in light of your circumstances, knowledge, and financial resources.
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              By using our services, you acknowledge that you understand these risks and agree that NSC Bot Platform 
              is not responsible for any losses incurred through the use of our trading bots or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Payment and Subscriptions</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our services are provided on a subscription basis. Payment terms include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>All fees are charged in advance and are non-refundable except as required by law</li>
              <li>Subscription fees are billed according to the package selected</li>
              <li>We reserve the right to change our pricing with 30 days notice</li>
              <li>Failed payments may result in service suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may not use our service:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To attempt to gain unauthorized access to the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The service and its original content, features, and functionality are and will remain the exclusive 
              property of NSC Bot Platform and its licensors. The service is protected by copyright, trademark, 
              and other laws. Our trademarks and trade dress may not be used in connection with any product or 
              service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may terminate or suspend your account and bar access to the service immediately, without prior 
              notice or liability, under our sole discretion, for any reason whatsoever and without limitation, 
              including but not limited to a breach of the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              In no event shall NSC Bot Platform, nor its directors, employees, partners, agents, suppliers, 
              or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which NSC Bot Platform 
              operates, without regard to its conflict of law provisions. Our failure to enforce any right or 
              provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material, we will provide at least 30 days notice prior to any new terms taking effect. 
              What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300">
                <strong>Email:</strong> legal@nscbotplatform.com<br/>
                <strong>Support:</strong> support@nscbotplatform.com
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            By using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}