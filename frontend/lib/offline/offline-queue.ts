'use client';

import { openDB } from 'idb';
import { getApiBaseUrl } from '@/lib/api-config';

const DB_NAME = 'idara-offline-db';
const STORE_PENDING = 'pending-requests';

type PendingRequest = {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: unknown;
  headers?: Record<string, string>;
  createdAt: number;
};

const getDb = async () => {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return null;
  }

  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'id' });
      }
    },
  });
};

const toAbsoluteUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) return endpoint;
  return `${getApiBaseUrl()}${endpoint}`;
};

const getClientHeaders = (headers?: Record<string, string>): Record<string, string> => {
  if (typeof window === 'undefined') return headers || {};
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenant_id');

  return {
    ...(headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
  };
};

export const enqueueOfflineRequest = async (request: Omit<PendingRequest, 'id' | 'createdAt'>) => {
  const db = await getDb();
  if (!db) return;
  await db.put(STORE_PENDING, {
    ...request,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  } satisfies PendingRequest);
};

export const getPendingRequestCount = async () => {
  const db = await getDb();
  if (!db) return 0;
  return db.count(STORE_PENDING);
};

export const flushOfflineQueue = async (): Promise<number> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 0;

  const db = await getDb();
  if (!db) return 0;
  const pending = (await db.getAll(STORE_PENDING)) as PendingRequest[];
  let synced = 0;

  for (const item of pending.sort((a, b) => a.createdAt - b.createdAt)) {
    try {
      const response = await fetch(toAbsoluteUrl(item.endpoint), {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...getClientHeaders(item.headers),
        },
        credentials: 'include',
        body: JSON.stringify(item.body),
      });

      if (!response.ok) {
        continue;
      }

      await db.delete(STORE_PENDING, item.id);
      synced += 1;
    } catch {
      break;
    }
  }

  return synced;
};
