'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/Tabs';
import dynamic from 'next/dynamic';
import { WBWEngine, type WBWError } from '@/engine/wbw-game-engine';
import { useEditorStore } from '@/stores/editorStore';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Save, Plus, X, Play, Settings, Upload } from 'lucide-react';
import WBWEditor from '@/components/shared/wbw-code-editor';
import { DEFAULT_WBW_TEMPLATE } from '@/lib/wbw-game-template';
import { lazyWithRetry } from '@/lib/lazy-with-retry';
import {
  applyTemplateToProject,
  WBW_BUILTIN_TEMPLATES,
  createTemplateScript,
  type WBWTemplateDefinition,
} from '@/lib/wbw-template-store';
import WBWTemplateStoreModal from '@/components/shared/wbw-template-store-modal';

const ManageGamesTab = dynamic(lazyWithRetry(() => import('./manage-games-tab')), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12 text-slate-400">
      Loading your games...
    </div>
  ),
});

// --- Component ---
export default function EditorPage() {
  const router = useRouter();
  const {
    project,
    isModified,
    activeTabId,
    isSaving,
    updateProject,
    updateScript,
    saveProject,
    addScript,
    removeScript,
    loadProject,
    setActiveTab,
  } = useEditorStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WBWEngine | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [wbwErrors, setWbwErrors] = useState<WBWError[]>([]);
  const [newScriptName, setNewScriptName] = useState('');
  const [showNewScriptDialog, setShowNewScriptDialog] = useState(false);
  const [showTemplateStore, setShowTemplateStore] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    category: [] as string[],
    tags: '',
    thumbnail: '',
  });
  const currentScript = project.scripts.find((s) => s.id === activeTabId);

  // --- Effects ---
  useEffect(() => {
    const current = useEditorStore.getState().project;
    if (current.scripts && current.scripts.length > 0) return;

    loadProject({
      ...current,
      title: 'WBW Template',
      description: 'Start with the official WBW template',
      assets: [],
      scripts: [
        {
          id: 'main',
          name: 'main.wbw',
          code: DEFAULT_WBW_TEMPLATE,
          language: 'wbw',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setActiveTab('main');
  }, [loadProject, setActiveTab]);

  useEffect(() => {
    if (!isPreviewActive || !canvasRef.current || !currentScript) {
      engineRef.current?.destroy();
      engineRef.current = null;
      setWbwErrors([]);
      return;
    }

    const canvas = canvasRef.current;
    const width = project.settings.width;
    const height = project.settings.height;
    const fps = project.settings.fps;

    const engine = new WBWEngine(canvas, { width, height, fps });
    const result = engine.load(currentScript.code);
    setWbwErrors(result.errors);

    if (result.errors.length === 0) {
      engine.start();
    }

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [
    currentScript,
    currentScript?.code,
    isPreviewActive,
    project.settings.width,
    project.settings.height,
    project.settings.fps,
  ]);

  // --- Handlers ---
  const handleAddScript = () => {
    if (!newScriptName.trim()) return;
    const newScript = {
      id: `script_${Date.now()}`,
      name: newScriptName.endsWith('.wbw') ? newScriptName : `${newScriptName}.wbw`,
      code: '// Start coding WBW...\n',
      language: 'wbw' as const,
      createdAt: new Date().toISOString(),
    };
    addScript(newScript);
    setNewScriptName('');
    setShowNewScriptDialog(false);
  };

  const applyTemplate = (template: WBWTemplateDefinition) => {
    const baseProject = useEditorStore.getState().project;
    loadProject(applyTemplateToProject(baseProject, template));
    setActiveTab('main');
    setShowTemplateStore(false);
  };

  const createScriptFromTemplate = (template: WBWTemplateDefinition) => {
    addScript({
      ...createTemplateScript(template),
      id: `template_${template.id}_${Date.now()}`,
      name: `${template.id}.wbw`,
    });
    setShowTemplateStore(false);
  };


  // --- Handlers ---
  async function handlePublishGame() {
    // Validate form
    if (!publishForm.title.trim()) {
      setPublishError('Game title is required');
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);

      let currentProject = project;
      let gameId = currentProject._id;

      // If game not saved yet, save it first
      if (!gameId) {
        try {
          await saveProject();
          // Wait a moment for async state update
          await new Promise(resolve => setTimeout(resolve, 200));
          currentProject = useEditorStore.getState().project;
          gameId = currentProject._id;
        } catch (saveError) {
          console.error('Failed to save game:', saveError);
          setPublishError('Failed to save game. Please try again.');
          setIsPublishing(false);
          return;
        }
      }

      if (!gameId || typeof gameId === 'undefined') {
        setPublishError('Game ID is missing. Please save first.');
        setIsPublishing(false);
        return;
      }

      // 1. First update game with new title and description
      await api.put(`/games/${gameId}`, {
        title: publishForm.title,
        description: publishForm.description,
        category: publishForm.category.length > 0 ? publishForm.category[0]?.toLowerCase() : 'other',
        tags: publishForm.tags.split(',').map(t => t.trim()).filter(t => t),
      });

      // 2. Then publish the game
      const publishResponse = await api.post(`/games/${gameId}/publish`);

      if (publishResponse.data.success) {
        setShowPublishDialog(false);
        setPublishForm({
          title: '',
          description: '',
          category: [],
          tags: '',
          thumbnail: '',
        });
        alert('Game published successfully! Redirecting to games page...');
        setTimeout(() => {
          router.push('/games');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Publishing error:', error);
      setPublishError(
        error.response?.data?.error ||
        error.message ||
        'Failed to publish game'
      );
    } finally {
      setIsPublishing(false);
    }
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <div className="bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          {isModified && <span className="bg-yellow-500 px-2 py-1 rounded text-xs font-bold">Modified</span>}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPreviewActive(!isPreviewActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-semibold ${isPreviewActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <Play size={18} />
            {isPreviewActive ? 'Stop' : 'Preview'}
          </button>
          <button
            onClick={() => saveProject()}
            disabled={!isModified || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors font-semibold"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setShowPublishDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors font-semibold"
          >
            <Upload size={18} />
            Publish
          </button>
        </div>
      </div>
      {/* Tabs UI for Editor and Manage My Games */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <Tabs defaultValue="editor">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="manage">Manage My Games</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex flex-1 gap-4 overflow-hidden">
            {/* Left Panel - File Explorer */}
            <div className="w-64 bg-slate-900 rounded-lg border border-slate-700 p-4 overflow-y-auto">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-300 uppercase mb-2">Scripts</h2>
                <button
                  onClick={() => setShowNewScriptDialog(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm transition-colors"
                >
                  <Plus size={16} />
                  New Script
                </button>
                <button
                  onClick={() => {
                    addScript({
                      id: `script_${Date.now()}`,
                      name: 'template.wbw',
                      code: DEFAULT_WBW_TEMPLATE,
                      language: 'wbw',
                      createdAt: new Date().toISOString(),
                    });
                  }}
                  className="flex items-center gap-2 w-full mt-2 px-3 py-2 bg-green-800 hover:bg-green-700 text-white rounded text-sm transition-colors"
                >
                  <Plus size={16} />
                  WBW Game Template
                </button>
                <button
                  onClick={() => setShowTemplateStore(true)}
                  className="flex items-center gap-2 w-full mt-2 px-3 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                >
                  <Plus size={16} />
                  Template Store / Creator
                </button>
              </div>
              <div className="space-y-1">
                {project.scripts.map((script) => (
                  <div
                    key={script.id}
                    onClick={() => setActiveTab(script.id)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm transition-colors ${activeTabId === script.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    <span className="flex-1">{script.name}</span>
                    {script.id !== 'main' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeScript(script.id);
                        }}
                        className="p-1 hover:bg-red-600 rounded"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-700 pt-4">
                <h3 className="mb-2 text-xs font-bold uppercase text-slate-400">Creator Store Templates</h3>
                <div className="space-y-2">
                  {WBW_BUILTIN_TEMPLATES.map((template) => (
                    <div key={template.id} className="rounded border border-slate-700 bg-slate-800 p-2">
                      <p className="text-xs font-semibold text-white">{template.title}</p>
                      <p className="text-[11px] text-slate-400">{template.category} • {template.difficulty}</p>
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={() => applyTemplate(template)}
                          className="flex-1 rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => createScriptFromTemplate(template)}
                          className="flex-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* New Script Dialog */}
              {showNewScriptDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-slate-800 rounded-lg p-6 w-96 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">New Script</h3>
                      <input
                        type="text"
                        placeholder="level.wbw"
                      value={newScriptName}
                      onChange={(e) => setNewScriptName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddScript();
                        if (e.key === 'Escape') setShowNewScriptDialog(false);
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white mb-4 focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowNewScriptDialog(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddScript}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <WBWTemplateStoreModal
                open={showTemplateStore}
                onClose={() => setShowTemplateStore(false)}
                onUseAsProject={applyTemplate}
                onAddScript={createScriptFromTemplate}
              />
            </div>
            {/* Center Panel - Code Editor */}
            <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
              {currentScript ? (
                <>
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
                    <p className="text-sm text-slate-400">{currentScript.name}</p>
                  </div>
                  <WBWEditor
                    value={currentScript.code}
                    onChange={(val: string) => updateScript(currentScript.id, val)}
                    readOnly={false}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center text-slate-400">
                  Select a script to edit
                </div>
              )}
            </div>
            {/* Right Panel - Preview */}
            <div className="w-96 bg-slate-900 rounded-lg border border-slate-700 p-4 overflow-hidden flex flex-col">
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Preview</h3>
              <div className="flex-1 bg-slate-800 rounded border border-slate-700 overflow-auto flex items-center justify-center">
                {isPreviewActive ? (
                  wbwErrors.length > 0 ? (
                    <div className="text-left text-sm text-red-300 p-4 space-y-2">
                      <p className="font-semibold">WBW Syntax Errors</p>
                      {wbwErrors.slice(0, 6).map((err) => (
                        <p key={`${err.line}-${err.message}`}>
                          Line {err.line}: {err.message}
                        </p>
                      ))}
                      {wbwErrors.length > 6 && (
                        <p>+{wbwErrors.length - 6} more errors...</p>
                      )}
                    </div>
                  ) : (
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-full bg-slate-950"
                    />
                  )
                ) : (
                  <div className="text-center text-slate-400">
                    <Play size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Click Preview to test your game</p>
                  </div>
                )}
              </div>
              {/* Settings */}
              <div className="mt-4 border-t border-slate-700 pt-4">
                <details className="text-sm text-slate-300">
                  <summary className="cursor-pointer font-semibold flex items-center gap-2">
                    <Settings size={16} />
                    Game Settings
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-xs text-slate-400">Width</label>
                      <input
                        type="number"
                        value={project.settings.width}
                        onChange={(e) =>
                          updateProject({
                            settings: {
                              ...project.settings,
                              width: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Height</label>
                      <input
                        type="number"
                        value={project.settings.height}
                        onChange={(e) =>
                          updateProject({
                            settings: {
                              ...project.settings,
                              height: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">FPS</label>
                      <input
                        type="number"
                        value={project.settings.fps}
                        onChange={(e) =>
                          updateProject({
                            settings: {
                              ...project.settings,
                              fps: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                </details>
                <details className="text-xs text-slate-300 mt-4">
                  <summary className="cursor-pointer font-semibold">WBW Syntax Guide</summary>
                  <div className="mt-3 space-y-2 text-slate-400">
                    <p><code>player x y [w h]</code> spawn the player</p>
                    <p><code>size w h</code> / <code>pcolor #hex</code> player defaults</p>
                    <p><code>speed n</code> / <code>gravity n</code> / <code>friction n</code></p>
                    <p><code>set NAME value</code> / <code>add|sub|mul|div|mod</code> variables</p>
                    <p><code>rand NAME min max</code> random value</p>
                    <p><code>bg #hex</code> / <code>color #hex</code> background &amp; draw color</p>
                    <p><code>platform x y w h</code> solid ground</p>
                    <p><code>rect x y w h</code> / <code>circle x y r</code> / <code>line x1 y1 x2 y2</code></p>
                    <p><code>tri x1 y1 x2 y2 x3 y3</code> triangle</p>
                    <p><code>text &quot;Hello&quot; x y</code> / <code>textsize n</code> / <code>hud &quot;HP&quot; x y</code></p>
                    <p><code>spawn enemy|item [id] x y [w h]</code> entities</p>
                    <p><code>patrol id minX maxX speed</code> simple AI</p>
                    <p><code>on left move -1 0</code> hold input</p>
                    <p><code>onpress up jump 9</code> / <code>onpress space shoot 1</code></p>
                    <p><code>onrelease left vel 0 0</code> release input</p>
                    <p><code>loop N ... end</code> repeat block</p>
                    <p><code>if HP &lt;= 0 goto gameover</code> conditional jump</p>
                    <p><code>checkpoint x y</code> / <code>respawn</code> save &amp; reset</p>
                    <p><code>msg &quot;Text&quot; [sec]</code> / <code>shake 8 [sec]</code> / <code>stop</code></p>
                  </div>
                </details>
              </div>
            </div>
            {/* Publish Dialog */}
            {showPublishDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-4">Publish Game</h3>
                  {publishError && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
                      {publishError}
                    </div>
                  )}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Game Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="My Awesome Game"
                        value={publishForm.title}
                        onChange={(e) =>
                          setPublishForm({ ...publishForm, title: e.target.value })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your game..."
                        value={publishForm.description}
                        onChange={(e) =>
                          setPublishForm({ ...publishForm, description: e.target.value })
                        }
                        rows={4}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <div className="space-y-2">
                        {['action', 'puzzle', 'adventure', 'sports', 'other'].map(
                          (cat) => (
                            <label key={cat} className="flex items-center gap-2 text-slate-300">
                              <input
                                type="radio"
                                checked={publishForm.category.length > 0 && publishForm.category[0] === cat}
                                onChange={() => {
                                  setPublishForm({
                                    ...publishForm,
                                    category: [cat],
                                  });
                                }}
                                className="rounded"
                              />
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="fun, fast-paced, colorful"
                        value={publishForm.tags}
                        onChange={(e) =>
                          setPublishForm({ ...publishForm, tags: e.target.value })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handlePublishGame}
                        disabled={isPublishing}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
                      >
                        {isPublishing ? 'Publishing...' : 'Publish'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPublishDialog(false);
                          setPublishError(null);
                        }}
                        disabled={isPublishing}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="manage" className="flex-1 overflow-auto">
            <ManageGamesTab />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
