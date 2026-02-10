'use client';

import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'ww_chunk_reload_count';
const MAX_RELOADS = 1;

const isChunkError = (message: string) =>
  /ChunkLoadError|Loading chunk|failed to fetch dynamically imported module|CSS chunk|webpackChunk/.test(message);

const getMessage = (event: Event) => {
  if ('reason' in event) {
    const reason = (event as PromiseRejectionEvent).reason as any;
    return reason?.message || String(reason || '');
  }
  if ('message' in event) {
    return (event as ErrorEvent).message || '';
  }
  return '';
};

const ChunkRecovery: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const message = getMessage(event);
      if (!message || !isChunkError(message)) return;

      const attempts = Number(sessionStorage.getItem(STORAGE_KEY) || '0');
      if (attempts < MAX_RELOADS) {
        sessionStorage.setItem(STORAGE_KEY, String(attempts + 1));
        window.location.reload();
        return;
      }

      setShowBanner(true);
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', handler);

    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[1000] mx-auto max-w-md rounded-xl border border-red-500/40 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-lg">
      <p className="font-semibold text-red-300">Update detected</p>
      <p className="mt-1 text-slate-300">
        Some files failed to load. Please refresh to continue.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 w-full rounded-lg bg-red-500/80 py-2 text-sm font-semibold text-white hover:bg-red-500"
      >
        Reload now
      </button>
    </div>
  );
};

export default ChunkRecovery;
