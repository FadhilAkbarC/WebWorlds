import { createWithEqualityFn } from 'zustand/traditional';
import { GameProject, GameAsset, GameScript } from '@/types';
import { api } from '@/lib/api-client';
import { DEFAULT_WBW_TEMPLATE } from '@/lib/wbw-game-template';
import { shallow } from 'zustand/shallow';

interface EditorStore {
  project: GameProject;
  isModified: boolean;
  activeTabId: string;
  isSaving: boolean;

  // Project management
  createNewProject: () => void;
  loadProject: (project: GameProject) => void;
  updateProject: (updates: Partial<GameProject>) => void;
  saveProject: () => Promise<void>;

  // Asset management
  addAsset: (asset: GameAsset) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<GameAsset>) => void;

  // Script management
  addScript: (script: GameScript) => void;
  removeScript: (scriptId: string) => void;
  updateScript: (scriptId: string, code: string) => void;

  // UI
  setActiveTab: (tabId: string) => void;
  setSaving: (saving: boolean) => void;
}

const defaultProject: GameProject = {
  title: 'WBW Template',
  description: 'Start with the official WBW template',
  assets: [],
  scripts: [
    {
      id: 'main',
      name: 'main.wbw',
      code: DEFAULT_WBW_TEMPLATE,
      language: 'wbw' as const,
      createdAt: new Date().toISOString(),
    },
  ],
  settings: {
    width: 800,
    height: 600,
    fps: 60,
    physics: false,
  },
};

export const useEditorStore = createWithEqualityFn<EditorStore>()(
  (set, get) => ({
  project: defaultProject,
  isModified: false,
  activeTabId: 'main',
  isSaving: false,

  createNewProject: () => {
    set({
      project: {
        ...defaultProject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isModified: false,
      activeTabId: 'main',
    });
  },

  loadProject: (project) => {
    set({ project, isModified: false });
  },

  updateProject: (updates) => {
    set((state) => ({
      project: { ...state.project, ...updates },
      isModified: true,
    }));
  },

  saveProject: async () => {
    set({ isSaving: true });
    try {
      const state = get();
      const project = state.project;

      const primaryScript =
        project.scripts.find((s) => s.id === 'main') || project.scripts[0];

      // If project has an ID, update existing game
      if (project._id) {
        await api.put(`/games/${project._id}`, {
          title: project.title,
          description: project.description,
          code: primaryScript?.code || '',
          scripts: project.scripts,
          assets: project.assets,
          settings: project.settings,
        });
        set({ isModified: false, isSaving: false });
      } else {
        // If no ID, create a new game (draft)
        const response = await api.post('/games', {
          title: project.title,
          description: project.description,
          code: primaryScript?.code || '',
        });

        if (response.data.success || response.data.data) {
          const gameData = response.data.data || response.data;
          set((state) => ({
            project: {
              ...state.project,
              _id: gameData._id || gameData.id,
            },
            isModified: false,
            isSaving: false,
          }));
        }
      }
    } catch (error: any) {
      console.error('Failed to save project:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  addAsset: (asset) => {
    set((state) => ({
      project: {
        ...state.project,
        assets: [...state.project.assets, asset],
      },
      isModified: true,
    }));
  },

  removeAsset: (assetId) => {
    set((state) => ({
      project: {
        ...state.project,
        assets: state.project.assets.filter((a) => a.id !== assetId),
      },
      isModified: true,
    }));
  },

  updateAsset: (assetId, updates) => {
    set((state) => ({
      project: {
        ...state.project,
        assets: state.project.assets.map((a) =>
          a.id === assetId ? { ...a, ...updates } : a
        ),
      },
      isModified: true,
    }));
  },

  addScript: (script) => {
    set((state) => ({
      project: {
        ...state.project,
        scripts: [...state.project.scripts, script],
      },
      isModified: true,
      activeTabId: script.id,
    }));
  },

  removeScript: (scriptId) => {
    set((state) => {
      if (scriptId === 'main') return state;
      if (state.project.scripts.length <= 1) return state;
      return {
        project: {
          ...state.project,
          scripts: state.project.scripts.filter((s) => s.id !== scriptId),
        },
        isModified: true,
      };
    });
  },

  updateScript: (scriptId, code) => {
    set((state) => ({
      project: {
        ...state.project,
        scripts: state.project.scripts.map((s) =>
          s.id === scriptId
            ? { ...s, code, createdAt: s.createdAt }
            : s
        ),
      },
      isModified: true,
    }));
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  setSaving: (saving) => {
    set({ isSaving: saving });
  },
  }),
  shallow
);
