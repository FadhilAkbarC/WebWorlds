'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { GameEngine } from '@/engine/GameEngine';
import { useEditorStore } from '@/stores/editorStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Save, Plus, X, Play, Settings, Upload } from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const {
    project,
    isModified,
    activeTabId,
    isSaving,
    updateProject,
    updateScript,
    createNewProject,
    saveProject,
    addScript,
    removeScript,
  } = useEditorStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [showNewScriptDialog, setShowNewScriptDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    genre: [] as string[],
    tags: '',
    thumbnail: '',
  });

  // Initialize editor on mount
  useEffect(() => {
    if (!project._id) {
      createNewProject();
    }
  }, []);

  // Initialize game engine for preview
  useEffect(() => {
    if (!canvasRef.current || !isPreviewActive) return;

    engineRef.current = new GameEngine(canvasRef.current, {
      width: project.settings.width,
      height: project.settings.height,
      fps: project.settings.fps,
    });

    // Simple example: draw a rectangle and handle input
    const engine = engineRef.current;
    const mainScript = project.scripts.find((s) => s.id === 'main');

    if (mainScript) {
      try {
        // Create a safe execution context
        const gameContext = {
          engine,
          game: {
            width: project.settings.width,
            height: project.settings.height,
            draw: (x: number, y: number, w: number, h: number, color: string) => {
              engine.drawRect(x, y, w, h, color);
            },
            circle: (x: number, y: number, r: number, color: string) => {
              engine.drawCircle(x, y, r, color);
            },
            text: (text: string, x: number, y: number, color: string) => {
              engine.drawText(text, x, y, { color });
            },
          },
        };

        engine.onRender((ctx) => {
          engine.clearCanvas('#1e293b');
          gameContext.game.draw(50, 50, 100, 100, '#3b82f6');
          gameContext.game.circle(250, 150, 40, '#ec4899');
          gameContext.game.text('WebWorlds Game Engine', 100, 300, '#fff');
        });

        engine.start();
      } catch (error) {
        console.error('Failed to execute game code:', error);
      }
    }

    return () => {
      engine?.stop();
    };
  }, [isPreviewActive, project]);

  const handleAddScript = () => {
    if (!newScriptName.trim()) return;

    const newScript = {
      id: `script_${Date.now()}`,
      name: newScriptName.endsWith('.js')
        ? newScriptName
        : `${newScriptName}.js`,
      code: '// Start coding...\n',
      language: 'javascript' as const,
      createdAt: new Date().toISOString(),
    };

    addScript(newScript);
    setNewScriptName('');
    setShowNewScriptDialog(false);
  };

  const handlePublishGame = async () => {
    // Validate form
    if (!publishForm.title.trim()) {
      setPublishError('Game title is required');
      return;
    }

    if (!project._id) {
      setPublishError('Game not saved. Please save first.');
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);

      // 1. First update game with new title and description
      await api.put(`/games/${project._id}`, {
        title: publishForm.title,
        description: publishForm.description,
        category: publishForm.genre.length > 0 ? publishForm.genre[0] : 'Action',
        tags: publishForm.tags.split(',').map(t => t.trim()).filter(t => t),
      });

      // 2. Then publish the game
      const publishResponse = await api.post(`/games/${project._id}/publish`);

      if (publishResponse.data.success) {
        setShowPublishDialog(false);
        setPublishForm({
          title: '',
          description: '',
          genre: [],
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
  };

  const currentScript = project.scripts.find((s) => s.id === activeTabId);

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
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-semibold ${
              isPreviewActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
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

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
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
          </div>

          <div className="space-y-1">
            {project.scripts.map((script) => (
              <div
                key={script.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm transition-colors ${
                  activeTabId === script.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span
                  onClick={() => updateProject({ /*...activeTabId: script.id */ })}
                  className="flex-1"
                >
                  {script.name}
                </span>
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

          {/* New Script Dialog */}
          {showNewScriptDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-lg p-6 w-96 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">New Script</h3>
                <input
                  type="text"
                  placeholder="script.js"
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
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          {currentScript ? (
            <>
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
                <p className="text-sm text-slate-400">{currentScript.name}</p>
              </div>
              <textarea
                value={currentScript.code}
                onChange={(e) => updateScript(currentScript.id, e.target.value)}
                className="flex-1 bg-slate-950 text-slate-100 font-mono text-sm p-4 resize-none focus:outline-none border-0"
                spellCheck="false"
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
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full bg-slate-950"
              />
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

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Genre
                  </label>
                  <div className="space-y-2">
                    {['Action', 'Puzzle', 'Adventure', 'Casual', 'Strategy'].map(
                      (genre) => (
                        <label key={genre} className="flex items-center gap-2 text-slate-300">
                          <input
                            type="checkbox"
                            checked={publishForm.genre.includes(genre)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPublishForm({
                                  ...publishForm,
                                  genre: [...publishForm.genre, genre],
                                });
                              } else {
                                setPublishForm({
                                  ...publishForm,
                                  genre: publishForm.genre.filter((g) => g !== genre),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          {genre}
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
      </div>
    </div>
  );
}
