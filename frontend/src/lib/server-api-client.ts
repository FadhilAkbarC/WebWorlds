import 'server-only';

import type { Game } from '@/types';
import { headers } from 'next/headers';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
  };
};

const DEFAULT_API_BASE = 'http://localhost:5000/api';

const withTimeout = (ms: number) => {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

const normalizeApiBase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('/')) {
    if (trimmed === '/api' || trimmed.startsWith('/api/')) {
      return trimmed.replace(/\/+$/, '');
    }
    return '/api';
  }

  try {
    const url = new URL(trimmed);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/api';
    } else if (!url.pathname.startsWith('/api')) {
      url.pathname = `${url.pathname.replace(/\/$/, '')}/api`;
    }
    return url.toString().replace(/\/+$/, '');
  } catch {
    return trimmed;
  }
};

const getRequestOrigin = async () => {
  try {
    const hdrs = await headers();
    const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host');
    if (!host) return '';
    const proto = hdrs.get('x-forwarded-proto') ?? 'http';
    return `${proto}://${host}`;
  } catch {
    return '';
  }
};

const isLocalOrigin = (origin: string) =>
  /localhost|127\.0\.0\.1/i.test(origin);

const resolveApiBase = async () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  if (envUrl) {
    const normalized = normalizeApiBase(envUrl);
    if (normalized.startsWith('/')) {
      const origin = await getRequestOrigin();
      if (origin) {
        return normalizeApiBase(`${origin}${normalized}`);
      }
      return DEFAULT_API_BASE;
    }
    return normalized;
  }

  const origin = await getRequestOrigin();
  if (origin && !isLocalOrigin(origin)) {
    return normalizeApiBase(`${origin}/api`);
  }

  return DEFAULT_API_BASE;
};

const normalizeBase = (base: string) => (base.endsWith('/') ? base : `${base}/`);
const normalizePath = (path: string) => (path.startsWith('/') ? path.slice(1) : path);

const buildUrl = async (path: string, params?: Record<string, string | number | undefined>) => {
  const base = normalizeBase(await resolveApiBase());
  const url = new URL(normalizePath(path), base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

async function fetchApi<T>(
  path: string,
  options: {
    params?: Record<string, string | number | undefined>;
    revalidate?: number;
    cache?: RequestCache;
    tags?: string[];
    timeoutMs?: number;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const timeoutMs = options.timeoutMs ?? 5000;
    const requestUrl = await buildUrl(path, options.params);
    const response = await fetch(requestUrl, {
      cache: options.cache ?? 'force-cache',
      next: { revalidate: options.revalidate ?? 30, tags: options.tags },
      signal: withTimeout(timeoutMs),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Request failed with ${response.status}`,
      };
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fetch failed',
    };
  }
}

export async function getGamesList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  revalidate?: number;
  timeoutMs?: number;
}): Promise<ApiResponse<Game[]>> {
  return fetchApi<Game[]>('/games', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 12,
      search: params?.search ?? '',
      category: params?.category ?? '',
      sort: params?.sort ?? '',
    },
    revalidate: params?.revalidate ?? 30,
    timeoutMs: params?.timeoutMs,
    tags: ['games'],
  });
}

export async function getGameById(gameId: string, revalidate = 60, timeoutMs = 6000) {
  return fetchApi<Game>(`/games/${gameId}`, {
    revalidate,
    timeoutMs,
    tags: ['game', `game:${gameId}`],
  });
}

export async function getTrendingGames(limit = 12, revalidate = 45, timeoutMs = 5000) {
  return fetchApi<Game[]>('/games', {
    params: {
      sort: 'trending',
      limit,
    },
    revalidate,
    timeoutMs,
    tags: ['games', 'trending'],
  });
}
