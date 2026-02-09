import { create } from 'zustand';
import { Game, GameState } from '@/types';
import { apiClient } from '@/lib/api';
import { logger } from '@/utils/logger';

interface GameStoreActions {
  fetchGames: (page?: number, search?: string, category?: string, limit?: number) => Promise<void>;
  fetchGameById: (id: string) => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  likeGame: (gameId: string) => Promise<void>;
  unlikeGame: (gameId: string) => Promise<void>;
  updateGameStats: (gameId: string, stats: Partial<Game>) => void;
  clearCurrentGame: () => void;
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
  clearCurrentGame: () => set({ currentGame: null }),

  fetchGames: async (page = 1, search = '', category = '', limit = 12) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getGames({
        page,
        search,
        category,
        limit,
      });

      const data = response.data;

      if (data.success) {
        set({
          games: data.data,
          totalCount: data.meta?.pagination?.total || 0,
          page,
          isLoading: false,
        });
      } else {
        throw new Error('API did not return success');
      }
    } catch (error) {
      // Detect CORS errors vs other network errors
      let errorMsg = 'Failed to fetch games';
      
      if (error instanceof Error) {
        if (
          error.message.includes('CORS') ||
          error.message.includes('Access-Control') ||
          (error as any).code === 'ERR_NETWORK' ||
          (error as any).response?.status === 0
        ) {
          errorMsg =
            '❌ API Connection Error: Check backend CORS settings and NEXT_PUBLIC_API_URL environment variable. ' +
            'Verify backend is running and accessible from your frontend domain.';
          logger.error('CORS/Network Error:', {
            originalError: error.message,
            hint: 'Check backend CORS_ORIGIN and frontend NEXT_PUBLIC_API_URL',
          });
        } else {
          errorMsg = error.message;
        }
      }

      set({
        error: errorMsg,
        isLoading: false,
      });

      logger.error('Failed to fetch games', errorMsg);
    }
  },

  fetchGameById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getGame(id);
      const data = response.data;

      if (data.success) {
        set({ currentGame: data.data, isLoading: false });
      } else {
        throw new Error('API did not return success');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch game';
      set({
        error: errorMsg,
        isLoading: false,
      });

      logger.error('Failed to fetch game', errorMsg);
    }
  },

  likeGame: async (gameId: string) => {
    try {
      // Check like status first
      const statusResponse = await apiClient.getGameLikeStatus(gameId);
      if (statusResponse.data?.data?.isLiked) {
        return; // Already liked
      }

      // Like the game
      const response = await apiClient.likeGame(gameId);
      const updatedGame = response.data.data;

      // Update games list
      set((state) => ({
        games: state.games.map((g) =>
          g._id === gameId
            ? {
                ...g,
                stats: updatedGame.stats || g.stats,
              }
            : g
        ),
        currentGame:
          state.currentGame?._id === gameId
            ? {
                ...state.currentGame,
                stats: updatedGame.stats || state.currentGame.stats,
              }
            : state.currentGame,
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        // Already liked - silently return
        return;
      }

      logger.error('Failed to like game', error instanceof Error ? error.message : String(error));
    }
  },

  unlikeGame: async (gameId: string) => {
    try {
      const response = await apiClient.unlikeGame(gameId);
      const updatedGame = response.data.data;

      set((state) => ({
        games: state.games.map((g) =>
          g._id === gameId
            ? {
                ...g,
                stats: updatedGame.stats || g.stats,
              }
            : g
        ),
        currentGame:
          state.currentGame?._id === gameId
            ? {
                ...state.currentGame,
                stats: updatedGame.stats || state.currentGame.stats,
              }
            : state.currentGame,
      }));
    } catch (error) {
      logger.error('Failed to unlike game', error instanceof Error ? error.message : String(error));
    }
  },

  updateGameStats: (gameId: string, stats: Partial<Game>) => {
    set((state) => ({
      games: state.games.map((g) =>
        g._id === gameId ? { ...g, ...stats } : g
      ),
      currentGame:
        state.currentGame?._id === gameId
          ? { ...state.currentGame, ...stats }
          : state.currentGame,
    }));
  },
}));

/**
 * Selectors for optimal re-rendering
 */
export const selectGames = (state: GameState & GameStoreActions) => state.games;
export const selectCurrentGame = (state: GameState & GameStoreActions) => state.currentGame;
