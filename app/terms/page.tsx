/**
 * Terms of Service Page
 * Legal agreement between the platform and users
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | NSC Bot Platform',
  description: 'Terms of Service and User Agreement for NSC Bot Platform',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">{new Date().toLocaleDateString()}</span>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
          {/* 1. Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using the NSC Bot Platform ("Platform", "Service", "we", "us", or
              "our"), you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              NSC Bot Platform provides cryptocurrency trading bot services and investment packages
              with monthly ROI (Return on Investment). Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Automated cryptocurrency trading bots (Grid Bot, DCA Bot, Arbitrage Bot)</li>
              <li>Investment packages (Silver, Gold, Diamond) with monthly ROI</li>
              <li>Referral program with multi-level commissions</li>
              <li>Portfolio management and analytics</li>
              <li>Cryptocurrency deposits and withdrawals</li>
            </ul>
          </section>

          {/* 3. User Registration and Account */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. User Registration and Account
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Registration</h3>
            <p className="text-gray-700 mb-4">
              To use our services, you must register for an account by providing accurate,
              complete, and current information. You must be at least 18 years old to use this
              service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
            <p className="text-gray-700 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You must immediately notify us
              of any unauthorized use of your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 KYC Requirements</h3>
            <p className="text-gray-700 mb-4">
              We may require identity verification (Know Your Customer - KYC) to comply with
              regulatory requirements. Failure to complete KYC may result in account limitations or
              suspension.
            </p>
          </section>

          {/* 4. Investment Packages */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Investment Packages</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Package Types</h3>
            <p className="text-gray-700 mb-4">
              We offer three investment packages: Silver (2% monthly ROI), Gold (2.5% monthly ROI),
              and Diamond (3% monthly ROI). Each package has a 12-month term.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 ROI Payments</h3>
            <p className="text-gray-700 mb-4">
              Monthly ROI payments are processed automatically on the 30-day anniversary of your
              investment. After 12 months, your initial capital will be returned to your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Risk Disclosure</h3>
            <p className="text-gray-700 mb-4 font-semibold text-red-600">
              IMPORTANT: Cryptocurrency trading involves substantial risk of loss. Past performance
              is not indicative of future results. You should not invest money you cannot afford to
              lose. We do not guarantee profits or returns.
            </p>
          </section>

          {/* 5. Trading Bots */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Trading Bots</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Bot Services</h3>
            <p className="text-gray-700 mb-4">
              Our trading bots are automated software that execute trades based on predefined
              strategies. Bot performance depends on market conditions and is not guaranteed.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Bot Subscription</h3>
            <p className="text-gray-700 mb-4">
              Bot subscriptions are valid for the purchased duration. Subscriptions automatically
              expire and require renewal. We reserve the right to modify or discontinue bot
              services.
            </p>
          </section>

          {/* 6. Payments and Withdrawals */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments and Withdrawals</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Deposits</h3>
            <p className="text-gray-700 mb-4">
              Deposits are made via cryptocurrency (USDT) on supported networks (BSC, Polygon,
              Ethereum). Minimum deposit amounts apply. Deposits to incorrect addresses cannot be
              recovered.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Withdrawals</h3>
            <p className="text-gray-700 mb-4">
              Withdrawal requests are processed within 24-48 hours. Minimum withdrawal amounts and
              network fees apply. We reserve the right to request additional verification for large
              withdrawals.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Anti-Money Laundering</h3>
            <p className="text-gray-700 mb-4">
              We comply with anti-money laundering (AML) regulations. Suspicious activities may
              result in account freezing and reporting to authorities.
            </p>
          </section>

          {/* 7. Referral Program */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Referral Program</h2>
            <p className="text-gray-700 mb-4">
              Our referral program offers multi-level commissions (Level 1: 8%, Level 2: 4%, Level
              3: 2%). Referral abuse, fraud, or manipulation will result in commission forfeiture
              and account termination.
            </p>
          </section>

          {/* 8. Prohibited Activities */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Use the service for illegal activities or money laundering</li>
              <li>Manipulate or exploit the referral system</li>
              <li>Create multiple accounts to abuse promotions</li>
              <li>Attempt to hack, disrupt, or compromise the platform</li>
              <li>Use bots or automated tools to manipulate trading</li>
              <li>Provide false information during registration or KYC</li>
              <li>Transfer or sell your account to third parties</li>
            </ul>
          </section>

          {/* 9. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, trademarks, logos, and intellectual property on the Platform are owned
              by NSC Bot Platform. You may not reproduce, distribute, or create derivative works
              without our written permission.
            </p>
          </section>

          {/* 10. Disclaimers and Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Disclaimers and Limitations
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 No Warranties</h3>
            <p className="text-gray-700 mb-4">
              The service is provided "as is" without warranties of any kind. We do not guarantee
              uninterrupted, error-free, or secure service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              10.2 Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits,
              data, or investment losses.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Not Financial Advice</h3>
            <p className="text-gray-700 mb-4 font-semibold text-red-600">
              Our services do not constitute financial, investment, or trading advice. You should
              consult with a qualified financial advisor before making investment decisions.
            </p>
          </section>

          {/* 11. Account Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Account Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account at any time for violations
              of these terms, suspicious activity, or at our sole discretion. Upon termination,
              your access will be revoked, and we will return any remaining funds (minus applicable
              fees) after investigation.
            </p>
          </section>

          {/* 12. Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              Any disputes arising from these terms will be resolved through binding arbitration.
              You agree to waive your right to participate in class action lawsuits.
            </p>
          </section>

          {/* 13. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the service constitutes acceptance of
              the modified terms.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@nscbotplatform.com
              </p>
              <p className="text-gray-700">
                <strong>Support:</strong> support@nscbotplatform.com
              </p>
            </div>
          </section>

          {/* Agreement Confirmation */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mt-8">
            <p className="text-gray-800 font-semibold mb-2">Agreement Confirmation</p>
            <p className="text-gray-700">
              By using the NSC Bot Platform, you acknowledge that you have read, understood, and
              agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
