'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Phone, Send, ArrowLeft } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Referral Code Assistance',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call with proper cleanup
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      // In a real implementation, you would send this data to your backend
      console.log('Contact form submitted:', formData)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 w-full max-w-md shadow-xl rounded-xl hover:border-[#00ff00]/30 transition-all">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-sm nsc-text-secondary mb-4 hover:text-[#00ff00] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold nsc-text-primary">Contact Support</h2>
            <p className="nsc-text-secondary text-xs mt-1">We're here to help with your referral code issues</p>
          </div>

          {submitted ? (
            <div className="bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-lg p-4 text-center">
              <h3 className="text-[#00ff00] font-semibold mb-2">Message Received!</h3>
              <p className="text-gray-300 text-sm mb-4">
                Thank you for reaching out. Our support team will contact you shortly.
              </p>
              <Link 
                href="/register" 
                className="inline-block bg-[#00ff00] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#00cc00] transition-all"
              >
                Return to Registration
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium nsc-text-primary mb-1">Your Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="nsc-input w-full pl-9 text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium nsc-text-primary mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="nsc-input w-full pl-9 text-sm"
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium nsc-text-primary mb-1">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="nsc-input w-full text-sm"
                  required
                >
                  <option value="Referral Code Assistance">Referral Code Assistance</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium nsc-text-primary mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="nsc-input w-full text-sm min-h-[120px]"
                  placeholder="Please describe your issue in detail"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="nsc-btn-primary w-full py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-semibold nsc-text-primary mb-3">Other Ways to Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#00ff00]/10 p-2 rounded-full">
                  <Mail className="h-4 w-4 text-[#00ff00]" />
                </div>
                <div>
                  <p className="text-xs nsc-text-secondary">Email</p>
                  <p className="text-sm nsc-text-primary">support@nscbot.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#00ff00]/10 p-2 rounded-full">
                  <Phone className="h-4 w-4 text-[#00ff00]" />
                </div>
                <div>
                  <p className="text-xs nsc-text-secondary">Phone</p>
                  <p className="text-sm nsc-text-primary">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Missing component definition
function User(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
