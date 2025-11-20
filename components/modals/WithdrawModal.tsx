import React from 'react'

const WithdrawModal: React.FC<{ open?: boolean }> = ({ open }) => {
  if (!open) return null
  return <div className="p-4 bg-white rounded shadow">WithdrawModal placeholder</div>
}

export default WithdrawModal
