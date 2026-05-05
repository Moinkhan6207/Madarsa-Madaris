'use client';

import { useEffect } from 'react';
import { flushOfflineQueue } from '@/lib/offline/offline-queue';

const SYNC_MESSAGE = { type: 'SYNC_OFFLINE_QUEUE' };

export default function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const triggerSync = async () => {
      await flushOfflineQueue();

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage(SYNC_MESSAGE);
      }
    };

    const handleOnline = () => {
      void triggerSync();
    };

    window.addEventListener('online', handleOnline);

    void triggerSync();

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return <>{children}</>;
}
