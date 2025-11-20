'use client'

import { useState } from 'react'
import { HelpCircle, MessageCircle, Mail, Phone, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getTokenFromStorage } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

export default function SupportPage() {
  const { success, error } = useToast()
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Submit support ticket
      const token = getTokenFromStorage()
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        success('Support ticket submitted successfully! We will get back to you within 24 hours.')
        setFormData({ subject: '', category: 'general', message: '' })
      } else {
        error('Failed to submit ticket. Please try again.')
      }
    } catch (err) {
      error('Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const faqItems = [
    {
      question: "How do I make my first investment?",
      answer: "Navigate to the Packages section, choose your desired package, and follow the payment instructions. You'll need to send USDT to the provided wallet address."
    },
    {
      question: "When will I receive my ROI payments?",
      answer: "ROI payments are processed monthly on the same date you made your investment. You'll receive notifications via email when payments are processed."
    },
    {
      question: "How do I activate my trading bot?",
      answer: "Go to the Bot Activation section, select your bot type, and complete the activation fee payment. Bots are required to earn referral commissions."
    },
    {
      question: "What are the withdrawal limits and fees?",
      answer: "Minimum withdrawal is $20 USDT with a 10% processing fee. There's a 30-day cooldown period between withdrawals."
    },
    {
      question: "How does the referral system work?",
      answer: "Share your referral code with others. When they invest, you earn commissions up to 6 levels deep. Bot activation is required to receive referral earnings."
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Help & Support</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Options */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-black rounded-lg">
                <Mail className="h-5 w-5 text-[#00ff00]" />
                <div>
                  <p className="text-white font-medium">Email Support</p>
                  <p className="text-gray-400 text-sm">support@nscbot.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-black rounded-lg">
                <MessageCircle className="h-5 w-5 text-[#00ff00]" />
                <div>
                  <p className="text-white font-medium">Live Chat</p>
                  <p className="text-gray-400 text-sm">Available 24/7</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-black rounded-lg">
                <Phone className="h-5 w-5 text-[#00ff00]" />
                <div>
                  <p className="text-white font-medium">Phone Support</p>
                  <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            
            <div className="space-y-2">
              <a href="/terms" className="block text-gray-400 hover:text-[#00ff00] transition-colors">
                Terms of Service
              </a>
              <a href="/privacy" className="block text-gray-400 hover:text-[#00ff00] transition-colors">
                Privacy Policy
              </a>
              <a href="/security" className="block text-gray-400 hover:text-[#00ff00] transition-colors">
                Security Guidelines
              </a>
              <a href="/pricing" className="block text-gray-400 hover:text-[#00ff00] transition-colors">
                Pricing Information
              </a>
            </div>
          </div>
        </div>

        {/* Support Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Submit a Support Ticket</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="bg-black border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="withdrawal">Withdrawal Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="referral">Referral Question</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-black border-gray-700 text-white min-h-32"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-black rounded-lg hover:bg-gray-800 transition-colors">
                <span className="text-white font-medium">{faq.question}</span>
                <HelpCircle className="h-5 w-5 text-[#00ff00] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2 p-4 text-gray-400 bg-gray-800 rounded-lg">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}