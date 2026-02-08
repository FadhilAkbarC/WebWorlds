import { create } from 'zustand';
import { GameProject, GameAsset, GameScript } from '@/types';
import { api } from '@/lib/api';

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
  title: 'My First Game',
  description: 'A simple game created with WebWorlds',
  assets: [],
  scripts: [
    {
      id: 'main',
      name: 'main.js',
      code: `// WebWorlds Game Template - Ready to Publish & Play!
// This is a simple example game. Modify it to create your own!

let score = 0;
let playerX = game.width / 2 - 25;
let playerY = game.height - 50;
const playerWidth = 50;
const playerHeight = 30;
const playerSpeed = 5;

let enemyX = 100;
let enemyY = 100;
const enemySize = 30;

// Game loop - called automatically
function update() {
  // Handle player movement
  if (game.input.keys['a'] || game.input.keys['arrowleft']) {
    playerX = Math.max(0, playerX - playerSpeed);
  }
  if (game.input.keys['d'] || game.input.keys['arrowright']) {
    playerX = Math.min(game.width - playerWidth, playerX + playerSpeed);
  }

  // Simple enemy AI
  if (Math.random() < 0.02) {
    enemyX = Math.random() * (game.width - enemySize);
  }
}

function render() {
  // Clear canvas with dark background
  game.clearCanvas('#0f172a');

  // Draw game title
  game.drawText('WebWorlds Game Demo', 20, 30, {
    color: '#60a5fa',
    size: 24,
    font: 'bold 24px Arial',
  });

  // Draw score
  game.drawText('Score: ' + score, 20, 65, {
    color: '#10b981',
    size: 18,
  });

  // Draw controls info
  game.drawText('Use A/D or Arrow Keys to move', 20, game.height - 20, {
    color: '#94a3b8',
    size: 14,
  });

  // Draw player (colored rectangle)
  game.drawRect(playerX, playerY, playerWidth, playerHeight, '#3b82f6');
  game.drawText('Player', playerX + 10, playerY + 20, {
    color: '#ffffff',
    size: 12,
  });

  // Draw enemy (colored circle)
  game.drawCircle(enemyX + enemySize / 2, enemyY, enemySize / 2, '#ef4444');

  // Draw instruction
  game.drawText('Click publish to share your game!', game.width / 2 - 100, game.height / 2, {
    color: '#fbbf24',
    size: 16,
  });
}

// Game update and render loop
if (typeof update===typeof function(){}) {
  // Update called regularly
  setInterval(update, 16); // ~60 FPS
}

if (typeof render===typeof function(){}) {
  // Render called regularly
  setInterval(render, 16); // ~60 FPS
}
`,
      language: 'javascript' as const,
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

export const useEditorStore = create<EditorStore>((set, get) => ({
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

      // If project has an ID, update existing game
      if (project._id) {
        await api.put(`/games/${project._id}`, {
          title: project.title,
          description: project.description,
          code: project.scripts.find(s => s.id === 'main')?.code || '',
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
          code: project.scripts.find(s => s.id === 'main')?.code || '',
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
    if (scriptId === 'main') return; // Cannot delete main script

    set((state) => ({
      project: {
        ...state.project,
        scripts: state.project.scripts.filter((s) => s.id !== scriptId),
      },
      isModified: true,
    }));
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
}));
