import 'server-only';

import type { Game } from '@/types';

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:5000/api';

const withTimeout = (ms: number) => AbortSignal.timeout(ms);

const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(path, API_BASE);
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
    const response = await fetch(buildUrl(path, options.params), {
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
