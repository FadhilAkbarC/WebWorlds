import axios, { AxiosInstance, AxiosError } from 'axios';

// Get backend URL from environment, default to localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const baseConfig = {
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const api: AxiosInstance = axios.create(baseConfig);

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const authState = localStorage.getItem('auth-storage');
        if (authState) {
          const parsed = JSON.parse(authState);
          const token = parsed.state?.token || parsed.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Failed to read auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiClient = {
  // Games
  getGames: (params?: Record<string, unknown>) =>
    api.get('/games', { params }),

  getGame: (id: string) => api.get(`/games/${id}`),

  createGame: (data: FormData) =>
    api.post('/games', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateGame: (id: string, data: Record<string, unknown>) =>
    api.put(`/games/${id}`, data),

  deleteGame: (id: string) => api.delete(`/games/${id}`),

  likeGame: (id: string) => api.post(`/games/${id}/like`),

  unlikeGame: (id: string) => api.post(`/games/${id}/unlike`),

  // Users
  getUser: (id: string) => api.get(`/users/${id}`),

  getCurrentUser: () => api.get('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    api.put('/users/profile', data),

  getLeaderboard: (gameId: string) =>
    api.get(`/games/${gameId}/leaderboard`),

  // Sessions
  createSession: (gameId: string) =>
    api.post('/sessions', { gameId }),

  endSession: (sessionId: string, data: Record<string, unknown>) =>
    api.put(`/sessions/${sessionId}`, data),

  // Search & Discovery
  search: (query: string, filters?: Record<string, unknown>) =>
    api.get('/search', { params: { q: query, ...filters } }),

  getTrending: () => api.get('/games/trending'),

  getFeaturedGames: () => api.get('/games/featured'),

  // Categories
  getCategories: () => api.get('/categories'),

  // Comments
  getGameComments: (gameId: string) =>
    api.get(`/games/${gameId}/comments`),

  postComment: (gameId: string, comment: string) =>
    api.post(`/games/${gameId}/comments`, { comment }),

  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
};
