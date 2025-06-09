'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      setError('Invalid session ID');
      return;
    }

    if (message.length > 280) {
      setError('Message must be 280 characters or less');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/update-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setStatus('success');
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Your Message</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message (max 280 characters)"
                className="w-full h-32 p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                maxLength={280}
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                {message.length}/280 characters
              </p>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            {status === 'success' && (
              <div className="text-green-500 text-sm">
                Message updated successfully! Redirecting...
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl ${
                (status === 'loading' || status === 'success') && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {status === 'loading' ? 'Updating...' : 'Update Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 