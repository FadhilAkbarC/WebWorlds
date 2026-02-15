import axios, { AxiosInstance, AxiosError } from 'axios';

// ============ Backend URL Configuration ============
// CRITICAL: Must be set in Vercel environment as NEXT_PUBLIC_API_URL
// Examples:
// - Production: https://web-production-3dc36.up.railway.app/api
// - Development: http://localhost:5000/api
const normalizeApiBase = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

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

const BACKEND_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalized = normalizeApiBase(envUrl);

  if (typeof window !== 'undefined') {
    const isProduction = !window.location.hostname.includes('localhost');

    if (isProduction && normalized.includes('localhost')) {
      console.warn(
        'WARNING: Frontend is using localhost API in production. ' +
        'Update NEXT_PUBLIC_API_URL to your production backend.'
      );
    }
  }

  return normalized || '/api';
})();

// Validate URL format
if (BACKEND_URL && !BACKEND_URL.startsWith('http') && !BACKEND_URL.startsWith('/')) {
  console.error('BACKEND_URL must start with http://, https://, or /api', BACKEND_URL);
}

/**
 * Token Manager - keeps token in memory to avoid localStorage parsing on every request
 * Only reads/writes localStorage on auth state changes
 */
class TokenManager {
  private token: string | null = null;
  private isInitialized = false;

  /**
   * Initialize token from localStorage (called once on app startup)
   */
  initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      const authState = localStorage.getItem('auth-storage');
      if (authState) {
        const parsed = JSON.parse(authState);
        this.token = parsed.state?.token || parsed.token || null;
      }
    } catch {
      // Silently fail if localStorage is not available or parsing fails
    }

    this.isInitialized = true;
  }

  /**
   * Get current token from memory (no localStorage parsing)
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Set token in both memory and localStorage
   */
  setToken(token: string | null): void {
    this.token = token;

    if (typeof window === 'undefined') return;

    try {
      if (token) {
        // Update localStorage with new token
        const authState = localStorage.getItem('auth-storage');
        if (authState) {
          const parsed = JSON.parse(authState);
          parsed.state = parsed.state || {};
          parsed.state.token = token;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
      } else {
        // Clear token from localStorage
        localStorage.removeItem('auth-storage');
      }
    } catch {
      // Silently fail - localStorage is optional
    }
  }

  /**
   * Clear token
   */
  clear(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-storage');
      } catch {
        // Silently fail
      }
    }
  }
}

// Global token manager instance
const tokenManager = new TokenManager();

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  tokenManager.initialize();
}

// Create API instance with optimal config
const baseConfig = {
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
};

export const api: AxiosInstance = axios.create(baseConfig);

/**
 * Request interceptor - adds token from memory (incredibly fast)
 */
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handles 401 and redirects to login
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      tokenManager.clear();

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper functions for common API operations
 */
export const apiClient = {
  // Authentication
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  // Games
  getGames: (params?: Record<string, unknown>) =>
    api.get('/games', { params }),

  getGame: (id: string) => api.get(`/games/${id}`),

  createGame: (data: Record<string, unknown>) =>
    api.post('/games', data),

  updateGame: (id: string, data: Record<string, unknown>) =>
    api.put(`/games/${id}`, data),

  deleteGame: (id: string) => api.delete(`/games/${id}`),

  publishGame: (id: string) => api.post(`/games/${id}/publish`),

  likeGame: (id: string) => api.post(`/games/${id}/like`),

  unlikeGame: (id: string) => api.post(`/games/${id}/unlike`),

  getGameLikeStatus: (id: string) => api.get(`/games/${id}/like-status`),

  getGamesByCreator: (creatorId: string, params?: Record<string, unknown>) =>
    api.get(`/games/creator/${creatorId}`, { params }),

  // Groups
  getGroups: (params?: Record<string, unknown>) =>
    api.get('/groups', { params }),

  getMyGroups: () => api.get('/groups/mine'),

  createGroup: (data: Record<string, unknown>) => api.post('/groups', data),

  joinGroup: (id: string) => api.post(`/groups/${id}/join`),

  leaveGroup: (id: string) => api.post(`/groups/${id}/leave`),

  // Users
  getCurrentUser: () => api.get('/auth/me'),

  getUser: (id: string) => api.get(`/auth/profile/${id}`),

  searchUsers: (params?: Record<string, unknown>) =>
    api.get('/users', { params }),

  updateProfile: (data: Record<string, unknown>) =>
    api.put('/auth/profile', data),

  // Broadcast refresh alerts
  getBroadcastRefreshAlert: () => api.get('/broadcast-alert'),

  setBroadcastRefreshAlert: (message: string) =>
    api.post('/broadcast-alert', { message }),

  consumeBroadcastRefreshAlert: () => api.post('/broadcast-alert/consume'),

  // Comments
  getGameComments: (gameId: string, params?: Record<string, unknown>) =>
    api.get(`/games/${gameId}/comments`, { params }),

  postComment: (gameId: string, comment: string) =>
    api.post(`/games/${gameId}/comments`, { text: comment }),

  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),

  // Activities
  getActivities: (params?: Record<string, unknown>) =>
    api.get('/activities', { params }),

  // Discovery
  getTrending: (params?: Record<string, unknown>) =>
    api.get('/games', { params: { ...params, sort: 'trending' } }),

  search: (query: string, params?: Record<string, unknown>) =>
    api.get('/games', { params: { ...params, search: query } }),
};

/**
 * Export token manager for use in auth stores
 */
export { tokenManager };

