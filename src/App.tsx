/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { WorkflowBoard } from './components/studio/WorkflowBoard';
import { DocumentEditor } from './components/studio/DocumentEditor';
import { VideoToGifStudio } from './components/components-lab/VideoToGifStudio';
import { IncidentControlDeck } from './components/app-sdk/IncidentControlDeck';
import { GroqPlayground } from './components/groq/GroqPlayground';
import { HonestWriteup } from './components/writeup/HonestWriteup';
import { sanityLake } from './services/sanityClient';
import { AnomalyDocument } from './types/sanity';
import { LayoutGrid, Edit3, Plus, Radio, Film, Bot, Layers, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [studioSubView, setStudioSubView] = useState<'board' | 'editor'>('board');
  const [documents, setDocuments] = useState<AnomalyDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('anomaly-echo-77');
  const [lakeRevisionTick, setLakeRevisionTick] = useState<number>(0);

  // Subscribe to real-time Sanity Lake events
  useEffect(() => {
    setDocuments(sanityLake.getDocuments());

    const unsubscribe = sanityLake.subscribe((event) => {
      setDocuments(sanityLake.getDocuments());
      setLakeRevisionTick((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  const refreshLake = () => {
    setDocuments(sanityLake.getDocuments());
    setLakeRevisionTick((prev) => prev + 1);
  };

  const handleLakeReset = () => {
    sanityLake.resetToInitial();
    refreshLake();
    setSelectedDocId('anomaly-echo-77');
  };

  const handleSelectDocFromBoard = (docId: string) => {
    setSelectedDocId(docId);
    setStudioSubView('editor');
  };

  const handleCreateNewDocument = async () => {
    const newDoc = await sanityLake.create({
      title: 'Intercept #' + Math.floor(Math.random() * 9000 + 1000),
      discoveredLocation: 'Uncharted Sector',
      hazardClass: 'Unclassified',
      dangerLevel: 50,
      quantumFrequencyMhz: parseFloat((Math.random() * 200 + 50).toFixed(2)),
    });
    setSelectedDocId(newDoc._id);
    setStudioSubView('editor');
    refreshLake();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentsCount={documents.length}
        onLakeReset={handleLakeReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: STUDIO & WORKFLOWS */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Studio Sub-view Switcher Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStudioSubView('board')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    studioSubView === 'board'
                      ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                  Workflow State Board (Kanban)
                </button>

                <button
                  onClick={() => setStudioSubView('editor')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    studioSubView === 'editor'
                      ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  Document Desk Inspector & Editor
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateNewDocument}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-red-400" />
                  New Anomaly Document
                </button>
              </div>
            </div>

            {/* View Mode 1: Visual State Board */}
            {studioSubView === 'board' && (
              <WorkflowBoard
                documents={documents}
                onSelectDocument={handleSelectDocFromBoard}
                onRefresh={refreshLake}
              />
            )}

            {/* View Mode 2: Desk Split Inspector */}
            {studioSubView === 'editor' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Desk: Document List */}
                <div className="lg:col-span-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 p-3 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-2 py-1 border-b border-zinc-800/80">
                    <span>DOCUMENTS ({documents.length})</span>
                    <span className="text-[10px] text-zinc-500">Sanity Desk</span>
                  </div>

                  <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
                    {documents.map((d) => (
                      <button
                        key={d._id}
                        onClick={() => setSelectedDocId(d._id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-mono space-y-1 ${
                          selectedDocId === d._id
                            ? 'bg-zinc-800/90 border-red-500/80 shadow-md text-white'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              d.hazardClass === 'Keter'
                                ? 'bg-red-950 text-red-400'
                                : d.hazardClass === 'Reality-Bending'
                                ? 'bg-purple-950 text-purple-400'
                                : d.hazardClass === 'Euclid'
                                ? 'bg-amber-950 text-amber-400'
                                : 'bg-emerald-950 text-emerald-400'
                            }`}
                          >
                            {d.hazardClass}
                          </span>
                          <span className="text-[10px] text-zinc-500">{d.workflow.currentStage}</span>
                        </div>
                        <div className="font-semibold text-zinc-200 truncate">{d.title}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{d.discoveredLocation}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Desk: Document Editor Form */}
                <div className="lg:col-span-8">
                  <DocumentEditor
                    documentId={selectedDocId}
                    onNavigateToLab={() => setActiveTab('components_lab')}
                    onRefresh={refreshLake}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOM INPUT LAB (VIDEO-TO-GIF) */}
        {activeTab === 'components_lab' && (
          <VideoToGifStudio
            activeDocId={selectedDocId}
            onAssetSaved={(asset, docId) => {
              setSelectedDocId(docId);
              refreshLake();
            }}
          />
        )}

        {/* TAB 3: APP SDK CONTROL DECK */}
        {activeTab === 'app_sdk' && (
          <IncidentControlDeck
            onSelectDocInStudio={(docId) => {
              setSelectedDocId(docId);
              setActiveTab('studio');
              setStudioSubView('editor');
            }}
          />
        )}

        {/* TAB 4: GROQ QUERY STUDIO */}
        {activeTab === 'groq' && <GroqPlayground />}

        {/* TAB 5: HONEST WRITE-UP & SCHEMAS */}
        {activeTab === 'writeup' && <HonestWriteup />}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950/80 py-4 px-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built for <strong className="text-zinc-300">Sanity Path Two: Vibe-Code Something Strange</strong>
          </div>
          <div className="flex items-center gap-3">
            <span>Powered by Sanity Content Lake Architecture</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('writeup')}
              className="text-red-400 hover:underline"
            >
              Read Build Write-up
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
