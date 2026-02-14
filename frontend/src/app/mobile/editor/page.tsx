'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/Tabs';
import dynamic from 'next/dynamic';
import { WBWEngine, type WBWError } from '@/engine/wbw-game-engine';
import { useEditorStore } from '@/stores/editorStore';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Save, Plus, X, Play, Upload, Store } from 'lucide-react';
import { DEFAULT_WBW_TEMPLATE } from '@/lib/wbw-game-template';
import {
  applyTemplateToProject,
  WBW_BUILTIN_TEMPLATES,
  createTemplateScript,
  type WBWTemplateDefinition,
} from '@/lib/wbw-template-store';
import WBWTemplateStoreModal from '@/components/shared/wbw-template-store-modal';
import { lazyWithRetry } from '@/lib/lazy-with-retry';

const ManageGamesTab = dynamic(lazyWithRetry(() => import('../../editor/manage-games-tab')), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-10 text-slate-400">Loading...</div>
  ),
});

const WBWEditor = dynamic(
  lazyWithRetry(() => import('@/components/shared/wbw-code-editor').then((mod) => ({ default: mod.default }))),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-[#232323] bg-[#141414] p-6 text-slate-400">
        Loading editor...
      </div>
    ),
  }
);

export default function MobileEditorPage() {
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

  async function handlePublishGame() {
    if (!publishForm.title.trim()) {
      setPublishError('Game title is required');
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);

      let currentProject = project;
      let gameId = currentProject._id;

      if (!gameId) {
        try {
          await saveProject();
          await new Promise((resolve) => setTimeout(resolve, 200));
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

      await api.put(`/games/${gameId}`, {
        title: publishForm.title,
        description: publishForm.description,
        category: publishForm.category.length > 0 ? publishForm.category[0]?.toLowerCase() : 'other',
        tags: publishForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      });

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
          router.push('/mobile/games');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Publishing error:', error);
      setPublishError(
        error.response?.data?.error || error.message || 'Failed to publish game'
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="bg-[#0f0f10] px-4 pt-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">Project</p>
          <h1 className="text-lg font-semibold text-white">{project.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewActive(!isPreviewActive)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPreviewActive ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}
          >
            <Play size={12} className="inline mr-1" /> {isPreviewActive ? 'Stop' : 'Preview'}
          </button>
          <button
            onClick={() => saveProject()}
            disabled={!isModified || isSaving}
            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Save size={12} className="inline mr-1" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setShowTemplateStore(true)}
            className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white"
          >
            <Store size={12} className="inline mr-1" /> Templates
          </button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mt-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4 space-y-4">
          <details className="rounded-2xl border border-[#232323] bg-[#141414] p-3" open>
            <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-300">Code Explorer</summary>
            <div className="mt-3 flex items-center gap-2 overflow-x-auto">
              {project.scripts.map((script) => (
                <button
                  key={script.id}
                  onClick={() => setActiveTab(script.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    activeTabId === script.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                      : 'border-[#2b2b2b] text-slate-400'
                  }`}
                >
                  {script.name}
                </button>
              ))}
              <button
                onClick={() => setShowNewScriptDialog(true)}
                className="rounded-full border border-[#2b2b2b] px-3 py-1 text-xs text-slate-300"
              >
                <Plus size={12} className="inline mr-1" /> New
              </button>
              <button
                onClick={() => setShowTemplateStore(true)}
                className="rounded-full border border-[#2b2b2b] px-3 py-1 text-xs text-slate-300"
              >
                <Store size={12} className="inline mr-1" /> Store
              </button>
            </div>
          </details>

          <details className="rounded-2xl border border-[#232323] bg-[#141414] p-3" open>
            <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-400">Creator Store Template List</summary>
            <div className="mt-3 space-y-2">
              {WBW_BUILTIN_TEMPLATES.map((template) => (
                <div key={template.id} className="rounded border border-[#2b2b2b] bg-black/30 p-2">
                  <p className="text-xs font-semibold text-white">{template.title}</p>
                  <p className="text-[10px] text-slate-400">{template.category} • {template.difficulty}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => applyTemplate(template)}
                      className="flex-1 rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => createScriptFromTemplate(template)}
                      className="flex-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div className="rounded-2xl border border-[#232323] bg-[#141414] overflow-hidden">
            {currentScript ? (
              <WBWEditor
                value={currentScript.code}
                onChange={(val: string) => updateScript(currentScript.id, val)}
                readOnly={false}
              />
            ) : (
              <div className="p-6 text-slate-400">Select a script to edit</div>
            )}
          </div>

          <div className="rounded-2xl border border-[#232323] bg-[#141414] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-300 uppercase">Preview</p>
              <button
                onClick={() => setShowPublishDialog(true)}
                className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white"
              >
                <Upload size={12} className="inline mr-1" /> Publish
              </button>
            </div>
            <div className="rounded-xl border border-[#2b2b2b] bg-black/40 min-h-[200px] flex items-center justify-center">
              {isPreviewActive ? (
                wbwErrors.length > 0 ? (
                  <div className="text-left text-xs text-red-300 p-4 space-y-2">
                    <p className="font-semibold">WBW Syntax Errors</p>
                    {wbwErrors.slice(0, 4).map((err) => (
                      <p key={`${err.line}-${err.message}`}>
                        Line {err.line}: {err.message}
                      </p>
                    ))}
                  </div>
                ) : (
                  <canvas ref={canvasRef} className="max-w-full max-h-full bg-black" />
                )
              ) : (
                <p className="text-xs text-slate-400">Tap Preview to test your game</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <ManageGamesTab />
        </TabsContent>
      </Tabs>

      {showNewScriptDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm border border-slate-700">
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

      {showPublishDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Publish Game</h3>
            {publishError && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
                {publishError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Game Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Game"
                  value={publishForm.title}
                  onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe your game..."
                  value={publishForm.description}
                  onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <div className="space-y-2">
                  {['action', 'puzzle', 'adventure', 'sports', 'other'].map((cat) => (
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
                      />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="fun, fast-paced"
                  value={publishForm.tags}
                  onChange={(e) => setPublishForm({ ...publishForm, tags: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePublishGame}
                  disabled={isPublishing}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 rounded"
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
                <button
                  onClick={() => {
                    setShowPublishDialog(false);
                    setPublishError(null);
                  }}
                  disabled={isPublishing}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2 rounded"
                >
                  Cancel
                </button>
              </div>
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
  );
}

