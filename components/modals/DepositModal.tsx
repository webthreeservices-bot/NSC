import React from 'react'

const DepositModal: React.FC<{ open?: boolean }> = ({ open }) => {
  if (!open) return null
  return <div className="p-4 bg-white rounded shadow">DepositModal placeholder</div>
}

export default DepositModal
