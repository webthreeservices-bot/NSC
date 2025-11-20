import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  network: string;
  status: string;
  txHash: string;
  depositAddress: string;
}

export default function PaymentApprovalDashboard() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/payments/pending');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  async function approvePayment(paymentId: string, userWallet: string) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRequestId: paymentId, userWallet }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Payment approved and payout sent!');
        fetchPayments();
      } else {
        setError(data.error || 'Approval failed');
      }
    } catch (e: any) {
      setError(e.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pending Payment Approvals</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading && <div>Loading...</div>}
      <table className="w-full border mt-2">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Network</th>
            <th>Tx Hash</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.userId}</td>
              <td>{p.amount}</td>
              <td>{p.network}</td>
              <td>
                <a href={p.network === 'BEP20' ? `https://bscscan.com/tx/${p.txHash}` : `https://tronscan.org/#/transaction/${p.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {p.txHash.slice(0, 10)}...
                </a>
              </td>
              <td>
                <Button onClick={() => approvePayment(p.id, p.depositAddress)} disabled={loading}>
                  Approve & Pay
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
