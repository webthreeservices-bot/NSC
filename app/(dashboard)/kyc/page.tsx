'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Camera, Shield, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTokenFromStorage } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

export default function KYCPage() {
  const { success, error } = useToast()
  const [kycStatus, setKycStatus] = useState<string>('PENDING')
  const [submitting, setSubmitting] = useState(false)
  const [documents, setDocuments] = useState({
    documentType: 'NATIONAL_ID',
    documentNumber: '',
    frontFile: null as File | null,
    backFile: null as File | null,
    selfieFile: null as File | null
  })

  useEffect(() => {
    fetchKYCStatus()
  }, [])

  const fetchKYCStatus = async () => {
    try {
      const token = getTokenFromStorage()
      const response = await fetch('/api/user/kyc', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setKycStatus(data.kycStatus)
      }
    } catch (error) {
      // Silent fail - error handled by UI state
    }
  }

  const handleFileChange = (field: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('documentType', documents.documentType)
      formData.append('documentNumber', documents.documentNumber)
      
      if (documents.frontFile) formData.append('frontFile', documents.frontFile)
      if (documents.backFile) formData.append('backFile', documents.backFile)
      if (documents.selfieFile) formData.append('selfieFile', documents.selfieFile)

      const token = getTokenFromStorage()
      const response = await fetch('/api/user/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setKycStatus('PENDING')
        success('KYC documents submitted successfully! We will review your submission within 24-48 hours.')
      } else {
        error('Failed to submit KYC documents. Please try again.')
      }
    } catch (err) {
      error('Failed to submit KYC documents. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case 'REJECTED':
        return <XCircle className="h-6 w-6 text-red-400" />
      default:
        return <Clock className="h-6 w-6 text-yellow-400" />
    }
  }

  const getStatusColor = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return 'bg-green-900 text-green-400 border-green-700'
      case 'REJECTED':
        return 'bg-red-900 text-red-400 border-red-700'
      default:
        return 'bg-yellow-900 text-yellow-400 border-yellow-700'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">Status: {kycStatus}</span>
        </div>
      </div>

      {/* KYC Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-[#00ff00] mt-1" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Why KYC Verification?</h3>
            <p className="text-gray-400 mb-4">
              KYC (Know Your Customer) verification helps us comply with financial regulations and ensures 
              the security of your account. Verified accounts have higher withdrawal limits and enhanced security.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#00ff00]" />
                <span className="text-gray-300">Enhanced Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#00ff00]" />
                <span className="text-gray-300">Higher Limits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#00ff00]" />
                <span className="text-gray-300">Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {kycStatus === 'APPROVED' ? (
        <div className="bg-green-900 border border-green-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Verification Complete!</h3>
              <p className="text-green-300">
                Your KYC verification has been approved. You now have access to all platform features 
                and enhanced withdrawal limits.
              </p>
            </div>
          </div>
        </div>
      ) : kycStatus === 'REJECTED' ? (
        <div className="bg-red-900 border border-red-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Verification Rejected</h3>
              <p className="text-red-300 mb-4">
                Your KYC submission was rejected. Please review the requirements and submit again 
                with clear, valid documents.
              </p>
              <Button
                onClick={() => setKycStatus('PENDING')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Submit New Documents
              </Button>
            </div>
          </div>
        </div>
      ) : kycStatus === 'PENDING' && documents.frontFile ? (
        <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Under Review</h3>
              <p className="text-yellow-300">
                Your KYC documents are being reviewed. This process typically takes 24-48 hours. 
                We'll notify you once the review is complete.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Submit KYC Documents</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-gray-300">Document Type</Label>
                <select
                  id="documentType"
                  value={documents.documentType}
                  onChange={(e) => setDocuments(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white"
                >
                  <option value="NATIONAL_ID">National ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentNumber" className="text-gray-300">Document Number</Label>
                <Input
                  id="documentNumber"
                  type="text"
                  placeholder="Enter document number"
                  value={documents.documentNumber}
                  onChange={(e) => setDocuments(prev => ({ ...prev, documentNumber: e.target.value }))}
                  className="bg-black border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Front Document */}
              <div className="space-y-2">
                <Label className="text-gray-300">Document Front</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-2">Upload front side</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('frontFile', e.target.files?.[0] || null)}
                    className="bg-black border-gray-700 text-white"
                    required
                  />
                </div>
              </div>

              {/* Back Document */}
              <div className="space-y-2">
                <Label className="text-gray-300">Document Back</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-2">Upload back side</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('backFile', e.target.files?.[0] || null)}
                    className="bg-black border-gray-700 text-white"
                    required
                  />
                </div>
              </div>

              {/* Selfie */}
              <div className="space-y-2">
                <Label className="text-gray-300">Selfie with Document</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-2">Upload selfie</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('selfieFile', e.target.files?.[0] || null)}
                    className="bg-black border-gray-700 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Document Requirements:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Documents must be clear and readable</li>
                <li>• All corners of the document must be visible</li>
                <li>• Selfie should show you holding the document next to your face</li>
                <li>• Accepted formats: JPG, PNG (max 5MB each)</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !documents.frontFile || !documents.backFile || !documents.selfieFile}
                className="bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}