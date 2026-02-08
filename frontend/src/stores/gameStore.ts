import { create } from 'zustand';
import { Game, GameState } from '@/types';
import { api } from '@/lib/api';

interface GameStoreActions {
  fetchGames: (page?: number, search?: string, category?: string) => Promise<void>;
  fetchGameById: (id: string) => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  likeGame: (gameId: string) => Promise<void>;
  unlikeGame: (gameId: string) => Promise<void>;
}

export const useGameStore = create<GameState & GameStoreActions>((set, get) => ({
  games: [],
  currentGame: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  page: 1,

  setCurrentGame: (game) => set({ currentGame: game }),
  setPage: (page) => set({ page }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchGames: async (page = 1, search = '', category = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/games', {
        params: {
          page,
          search,
          category,
          limit: 12,
        },
      });
      
      if (response.data.success) {
        set({
          games: response.data.data,
          totalCount: response.data.pagination.total,
          page,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch games',
        isLoading: false,
      });
    }
  },

  fetchGameById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/games/${id}`);
      if (response.data.success) {
        set({ currentGame: response.data.data, isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch game',
        isLoading: false,
      });
    }
  },

  likeGame: async (gameId: string) => {
    try {
      await api.post(`/games/${gameId}/like`);
      const games = get().games.map((g) =>
        g._id === gameId ? { ...g, likes: g.likes + 1 } : g
      );
      set({ games });
    } catch (error) {
      console.error('Failed to like game:', error);
    }
  },

  unlikeGame: async (gameId: string) => {
    try {
      await api.post(`/games/${gameId}/unlike`);
      const games = get().games.map((g) =>
        g._id === gameId ? { ...g, likes: Math.max(0, g.likes - 1) } : g
      );
      set({ games });
    } catch (error) {
      console.error('Failed to unlike game:', error);
    }
  },
}));
