import React from 'react'

const QRCodeGenerator: React.FC<{ text?: string }> = ({ text }) => {
  return <div className="p-4 bg-gray-900/10 rounded">QR code for: {text || '—'}</div>
}

export default QRCodeGenerator
