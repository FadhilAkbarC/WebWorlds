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
  trackGamePlay: (gameId: string) => Promise<void>;
  updateGameStats: (gameId: string, stats: Partial<Game>) => void;
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
    // Prevent double-like: check if already liked
    try {
      const likeStatusResp = await api.get(`/games/${gameId}/like-status`);
      if (likeStatusResp.data?.data?.isLiked) {
        // Already liked, do nothing
        return;
      }
    } catch (e) {
      // If like-status fails, fallback to trying like
    }
    try {
      const response = await api.post(`/games/${gameId}/like`);
      const updatedGame = response.data.data;
      const games = get().games.map((g) =>
        g._id === gameId ? { ...g, likes: updatedGame.stats?.likes || g.likes + 1 } : g
      );
      set({ 
        games,
        currentGame: get().currentGame?._id === gameId 
          ? { ...get().currentGame!, likes: updatedGame.stats?.likes || get().currentGame!.likes + 1 }
          : get().currentGame
      });
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Already liked, do nothing
        return;
      }
      console.error('Failed to like game:', error);
    }
  },

  unlikeGame: async (gameId: string) => {
    try {
      const response = await api.post(`/games/${gameId}/unlike`);
      const updatedGame = response.data.data;
      
      const games = get().games.map((g) =>
        g._id === gameId ? { ...g, likes: updatedGame.stats?.likes ?? Math.max(0, g.likes - 1) } : g
      );
      
      set({ 
        games,
        currentGame: get().currentGame?._id === gameId 
          ? { ...get().currentGame!, likes: updatedGame.stats?.likes ?? Math.max(0, get().currentGame!.likes - 1) }
          : get().currentGame
      });
    } catch (error) {
      console.error('Failed to unlike game:', error);
    }
  },

  trackGamePlay: async (gameId: string) => {
    try {
      // The play count is incremented when fetching game (GET /games/:id)
      // This function is just for explicit tracking
      const response = await api.get(`/games/${gameId}`);
      if (response.data.data || response.data.success) {
        const gameData = response.data.data || response.data;
        set((state) => ({
          currentGame: state.currentGame?._id === gameId 
            ? { ...state.currentGame, plays: gameData.stats?.plays || gameData.plays || state.currentGame.plays }
            : state.currentGame
        }));
      }
    } catch (error) {
      console.error('Failed to track game play:', error);
    }
  },

  updateGameStats: (gameId: string, stats: Partial<Game>) => {
    set((state) => ({
      games: state.games.map((g) =>
        g._id === gameId ? { ...g, ...stats } : g
      ),
      currentGame: state.currentGame?._id === gameId
        ? { ...state.currentGame, ...stats }
        : state.currentGame
    }));
  },
}));
