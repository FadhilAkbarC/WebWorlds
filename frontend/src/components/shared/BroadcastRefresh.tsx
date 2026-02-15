'use client';

import React, { useEffect, useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type BroadcastAlert = {
  message: string;
  createdAt: string;
} | null;

export const BroadcastRefreshBanner: React.FC = () => {
  const [alertData, setAlertData] = useState<BroadcastAlert>(null);

  useEffect(() => {
    let isMounted = true;

    const syncAlert = async () => {
      try {
        const response = await apiClient.getBroadcastRefreshAlert();
        if (isMounted) {
          setAlertData(response.data?.data ?? null);
        }
      } catch {
        if (isMounted) {
          setAlertData(null);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void syncAlert();
    }, 0);

    const intervalId = window.setInterval(() => {
      void syncAlert();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const handleRefreshNow = async () => {
    try {
      await apiClient.consumeBroadcastRefreshAlert();
      setAlertData(null);
      window.location.reload();
    } catch {
      // Ignore network errors to avoid blocking users.
    }
  };

  if (!alertData) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-400/40 px-4 py-2 text-amber-100">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          <span className="font-semibold">Refresh diperlukan:</span> {alertData.message}
        </p>
        <button
          onClick={handleRefreshNow}
          className="px-3 py-1.5 rounded-md bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300"
        >
          Refresh sekarang
        </button>
      </div>
    </div>
  );
};

export const BroadcastRefreshSettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBroadcast = async () => {
    const message = reason.trim();
    if (!message || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiClient.setBroadcastRefreshAlert(message);
      setReason('');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-[#2a2a2a] border border-[#343434] text-slate-300"
        title="Broadcast refresh setting"
        aria-label="Open broadcast refresh settings"
      >
        <Settings2 size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-[#343434] bg-[#1f1f1f] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Broadcast Alert Refresh</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-[#2a2a2a] text-slate-300"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <label className="block mt-4 text-sm text-slate-300" htmlFor="broadcast-reason">
              Message reason
            </label>
            <input
              id="broadcast-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Deploy update baru, mohon refresh"
              className="mt-2 w-full bg-[#2a2a2a] border border-[#343434] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleBroadcast}
              disabled={!reason.trim() || isSubmitting}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold"
            >
              {isSubmitting ? 'Broadcasting...' : 'Broadcast alert refresh'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
