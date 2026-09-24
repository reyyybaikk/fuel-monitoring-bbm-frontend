import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Simple modal popup for IT & Helpdesk assistance.
 * It collects a message from the user and sends it to the backend endpoint `/api/contact`.
 * The component is responsive: it takes the full width on small screens and a fixed max width on larger screens.
 */
export const HelpPopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject: 'Bantuan IT & Helpdesk' }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setStatus('sent');
      setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-slate-800">Bantuan IT &amp; Helpdesk</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Tuliskan pertanyaan atau masalah Anda..."
            className="w-full h-32 p-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00A2E8] resize-none"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="self-end px-4 py-2 bg-[#00A2E8] text-white rounded hover:bg-[#0085c1] transition-colors"
          >
            {status === 'sending' ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>
        {status === 'sent' && (
          <p className="mt-2 text-green-600">Pesan berhasil dikirim.</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-red-600">Gagal mengirim pesan. Silakan coba lagi.</p>
        )}
      </div>
    </div>
  );
};
