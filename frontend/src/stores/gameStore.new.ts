import { create } from 'zustand';
import { Game, GameState } from '@/types';
import { apiClient } from '@/lib/api';
import { logger } from '@/utils/logger';

interface GameStoreActions {
  fetchGames: (page?: number, search?: string, category?: string) => Promise<void>;
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

  fetchGames: async (page = 1, search = '', category = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getGames({
        page,
        search,
        category,
        limit: 12,
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch games';
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
 * Only subscribe to the specific data you need
 */
export const selectGames = (state: GameState & GameStoreActions) => state.games;
export const selectCurrentGame = (state: GameState & GameStoreActions) => state.currentGame;
export const selectIsLoading = (state: GameState & GameStoreActions) => state.isLoading;
export const selectError = (state: GameState & GameStoreActions) => state.error;
export const selectPagination = (state: GameState & GameStoreActions) => ({
  page: state.page,
  totalCount: state.totalCount,
});

/**
 * Usage example:
 * const games = useGameStore(selectGames);
 * const { page, totalCount } = useGameStore(selectPagination);
 *
 * This prevents re-renders when other parts of the store update
 */
