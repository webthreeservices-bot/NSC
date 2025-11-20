/**
 * Privacy Policy Page
 * Explains how user data is collected, used, and protected
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | NSC Bot Platform',
  description: 'Privacy Policy and Data Protection information for NSC Bot Platform',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">{new Date().toLocaleDateString()}</span>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              NSC Bot Platform ("we", "us", or "our") is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our cryptocurrency trading platform and services.
            </p>
            <p className="text-gray-700 mb-4">
              By using our service, you agree to the collection and use of information in
              accordance with this policy. If you do not agree with this policy, please do not use
              our service.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              1.1 Personal Information
            </h3>
            <p className="text-gray-700 mb-4">
              When you register for an account, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Username and password</li>
              <li>Cryptocurrency wallet addresses</li>
              <li>Phone number (if provided)</li>
              <li>Referral information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              1.2 KYC Information (Identity Verification)
            </h3>
            <p className="text-gray-700 mb-4">For compliance purposes, we may collect:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Government-issued ID (passport, driver's license)</li>
              <li>Proof of address documents</li>
              <li>Selfie/photo verification</li>
              <li>Date of birth and nationality</li>
              <li>Tax identification number (if required)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Financial Information</h3>
            <p className="text-gray-700 mb-4">We collect and process:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Transaction history (deposits, withdrawals, trades)</li>
              <li>Investment package purchases</li>
              <li>Bot subscription payments</li>
              <li>Referral earnings and commissions</li>
              <li>Blockchain transaction hashes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              1.4 Technical Information
            </h3>
            <p className="text-gray-700 mb-4">We automatically collect:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>IP address and geolocation</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Cookies and tracking data</li>
              <li>Usage patterns and interactions</li>
              <li>Login timestamps and session data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              1.5 Communication Data
            </h3>
            <p className="text-gray-700 mb-4">We store:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Support ticket messages</li>
              <li>Email correspondence</li>
              <li>Chat logs (if applicable)</li>
              <li>Feedback and surveys</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Provide Services</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Create and manage your account</li>
              <li>Process transactions (deposits, withdrawals, investments)</li>
              <li>Execute trading bot operations</li>
              <li>Calculate and distribute ROI payments</li>
              <li>Process referral commissions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Compliance and Security</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Verify your identity (KYC/AML compliance)</li>
              <li>Prevent fraud and unauthorized access</li>
              <li>Detect and prevent money laundering</li>
              <li>Comply with legal obligations and regulations</li>
              <li>Investigate suspicious activities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Communication</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Send transaction confirmations and notifications</li>
              <li>Provide customer support</li>
              <li>Send service updates and announcements</li>
              <li>Send marketing communications (with consent)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.4 Analytics and Improvement</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Analyze platform usage and performance</li>
              <li>Improve our services and features</li>
              <li>Develop new products and services</li>
              <li>Conduct market research</li>
            </ul>
          </section>

          {/* 3. How We Share Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. How We Share Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information with:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Service Providers</h3>
            <p className="text-gray-700 mb-4">
              Third-party vendors who help us operate the platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Payment processors (blockchain networks)</li>
              <li>KYC verification services</li>
              <li>Email service providers</li>
              <li>Cloud hosting providers</li>
              <li>Analytics services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">
              We may disclose your information to comply with:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Legal obligations and court orders</li>
              <li>Law enforcement requests</li>
              <li>Regulatory authorities</li>
              <li>Anti-money laundering investigations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Business Transfers</h3>
            <p className="text-gray-700 mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be
              transferred to the acquiring entity.
            </p>
          </section>

          {/* 4. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Encryption of sensitive data (SSL/TLS)</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits and updates</li>
              <li>Firewall and intrusion detection systems</li>
              <li>Access controls and authentication</li>
              <li>Regular data backups</li>
            </ul>
            <p className="text-gray-700 mb-4 font-semibold text-red-600">
              However, no method of transmission over the internet is 100% secure. We cannot
              guarantee absolute security of your data.
            </p>
          </section>

          {/* 5. Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">We use cookies to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage and traffic</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can control cookies through your browser settings. Disabling cookies may affect
              functionality.
            </p>
          </section>

          {/* 6. Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Provide our services</li>
              <li>Comply with legal obligations (typically 5-7 years for financial records)</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Prevent fraud</li>
            </ul>
            <p className="text-gray-700 mb-4">
              After account closure, we may retain certain information for compliance and legal
              purposes.
            </p>
          </section>

          {/* 7. Your Rights and Choices */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Access and Update</h3>
            <p className="text-gray-700 mb-4">
              Access and update your personal information through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Data Portability</h3>
            <p className="text-gray-700 mb-4">
              Request a copy of your data in a portable format.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Deletion</h3>
            <p className="text-gray-700 mb-4">
              Request deletion of your account and data (subject to legal retention requirements).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.4 Marketing Opt-Out</h3>
            <p className="text-gray-700 mb-4">
              Unsubscribe from marketing emails at any time using the unsubscribe link.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.5 Cookie Management</h3>
            <p className="text-gray-700 mb-4">
              Control or delete cookies through your browser settings.
            </p>
          </section>

          {/* 8. GDPR Compliance (EU Users) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. GDPR Compliance (EU Users)
            </h2>
            <p className="text-gray-700 mb-4">
              If you are in the European Economic Area (EEA), you have additional rights under
              GDPR:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Right to be informed about data processing</li>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Rights related to automated decision-making</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Our lawful basis for processing your data includes: contract performance, legal
              compliance, legitimate interests, and consent.
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our service is not intended for individuals under 18 years of age. We do not
              knowingly collect information from children. If we discover that a child has provided
              personal information, we will delete it immediately.
            </p>
          </section>

          {/* 10. International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your
              own. We ensure appropriate safeguards are in place for international transfers,
              including standard contractual clauses.
            </p>
          </section>

          {/* 11. Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Changes to Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated "Last Updated" date. Significant changes will be communicated
              via email.
            </p>
          </section>

          {/* 12. Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Contact Us - Data Protection
            </h2>
            <p className="text-gray-700 mb-4">
              For privacy-related questions, data access requests, or to exercise your rights,
              contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Data Protection Officer:</strong> privacy@nscbotplatform.com
              </p>
              <p className="text-gray-700">
                <strong>Legal Team:</strong> legal@nscbotplatform.com
              </p>
              <p className="text-gray-700">
                <strong>Support:</strong> support@nscbotplatform.com
              </p>
            </div>
          </section>

          {/* Privacy Commitment */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mt-8">
            <p className="text-gray-800 font-semibold mb-2">Our Privacy Commitment</p>
            <p className="text-gray-700">
              We are committed to protecting your privacy and handling your data responsibly. Your
              trust is important to us, and we continuously work to safeguard your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
