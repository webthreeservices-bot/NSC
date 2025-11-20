'use client'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Privacy Policy
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
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              NSC Bot Platform ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our automated 
              cryptocurrency trading platform and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Personal Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-6">
              <li>Name, email address, and contact information</li>
              <li>Account credentials and authentication information</li>
              <li>Financial information for payment processing</li>
              <li>Identity verification documents (KYC/AML compliance)</li>
              <li>Communication preferences and support inquiries</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Usage Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We automatically collect certain information about your use of our services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-6">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage patterns and interaction data</li>
              <li>Trading activity and performance metrics</li>
              <li>Log files and error reports</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Trading Data</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              In connection with our trading services, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Cryptocurrency wallet addresses</li>
              <li>Transaction histories and trade executions</li>
              <li>Portfolio balances and performance data</li>
              <li>Risk preferences and trading parameters</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Provide and maintain our trading services</li>
              <li>Process transactions and manage your account</li>
              <li>Verify your identity and comply with legal requirements</li>
              <li>Improve our services and user experience</li>
              <li>Send important notifications and updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Detect and prevent fraud or security breaches</li>
              <li>Conduct analytics and market research</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Service Providers</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may share information with trusted third-party service providers who assist us in operating our platform, 
              including payment processors, cloud hosting providers, and analytics services.
            </p>

            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Legal Compliance</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may disclose your information when required by law, legal process, or to comply with regulatory requirements 
              such as anti-money laundering (AML) and know-your-customer (KYC) regulations.
            </p>

            <h3 className="text-lg font-semibold text-[#00ff00] mb-3">Business Transfers</h3>
            <p className="text-gray-300 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, 
              subject to the same privacy protections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Multi-factor authentication requirements</li>
              <li>Regular security audits and penetration testing</li>
              <li>Secure data centers with physical access controls</li>
              <li>Employee training on data protection practices</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet 
                or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-6">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              To exercise these rights, please contact us using the information provided in the Contact section below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal 
              obligations. Generally, we retain account information for the duration of your relationship with us plus 
              additional periods required by applicable law (typically 5-7 years for financial records).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how you use our services</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Provide relevant content and advertisements</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              You can control cookie settings through your browser preferences, though disabling certain cookies may affect 
              platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards 
              are in place for international transfers, including standard contractual clauses and adequacy decisions where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If we become aware that we have collected information from a child, we will 
              take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
              Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> privacy@nscbotplatform.com</p>
                <p><strong>Support:</strong> support@nscbotplatform.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@nscbotplatform.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is part of our Terms of Service and governs your use of NSC Bot Platform.
          </p>
        </div>
      </div>
    </div>
  )
}