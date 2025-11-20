import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BotActivation {
  id: string;
  userId: string;
  botType: string;
  status: string;
  paymentTxHash: string;
}

export default function BotApprovalDashboard() {
  const [bots, setBots] = useState<BotActivation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bots/pending');
      const data = await res.json();
      setBots(data.bots || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load bots');
    } finally {
      setLoading(false);
    }
  }

  async function approveBot(botId: string) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/bots/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botActivationId: botId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Bot activation approved!');
        fetchBots();
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
      <h2 className="text-xl font-bold mb-4">Pending Bot Activations</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading && <div>Loading...</div>}
      <table className="w-full border mt-2">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Bot Type</th>
            <th>Status</th>
            <th>Tx Hash</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {bots.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.userId}</td>
              <td>{b.botType}</td>
              <td>{b.status}</td>
              <td>
                <a href={`https://bscscan.com/tx/${b.paymentTxHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {b.paymentTxHash.slice(0, 10)}...
                </a>
              </td>
              <td>
                <Button onClick={() => approveBot(b.id)} disabled={loading}>
                  Approve
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
