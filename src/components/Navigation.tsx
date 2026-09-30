/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Radio, Film, Bot, Terminal, FileText, 
  Settings, RefreshCw, Layers, Sparkles, ExternalLink 
} from 'lucide-react';
import { sanityLake } from '../services/sanityClient';

export type ActiveTab = 'studio' | 'components_lab' | 'app_sdk' | 'groq' | 'writeup';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  documentsCount: number;
  onLakeReset: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  documentsCount,
  onLakeReset,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [projectId, setProjectId] = useState(sanityLake.getConfig().projectId);
  const [dataset, setDataset] = useState(sanityLake.getConfig().dataset);
  const [token, setToken] = useState(sanityLake.getConfig().token || '');
  const [savedBadge, setSavedBadge] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    sanityLake.setConfig({
      projectId,
      dataset,
      token: token || undefined,
    });
    setSavedBadge(true);
    setTimeout(() => {
      setSavedBadge(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-tight text-white">
                  ChronoSyntax
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">
                  SANITY LAKE
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                App SDK & Workflows-as-Data
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'studio'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              Studio & Workflows
            </button>

            <button
              onClick={() => setActiveTab('components_lab')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'components_lab'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Film className="w-4 h-4 text-amber-400" />
              Custom Input Lab (Video-to-GIF)
            </button>

            <button
              onClick={() => setActiveTab('app_sdk')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'app_sdk'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              App SDK Control Deck
            </button>

            <button
              onClick={() => setActiveTab('groq')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'groq'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              GROQ Studio
            </button>

            <button
              onClick={() => setActiveTab('writeup')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'writeup'
                  ? 'bg-red-950/80 text-red-300 font-semibold border border-red-500/40'
                  : 'text-zinc-400 hover:text-red-300 hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-4 h-4 text-red-400" />
              Honest Write-up
            </button>
          </nav>

          {/* Right Status & Lake Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Lake Connection Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLakeReset}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
              title="Reset Test Anomalies Dataset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-zinc-900 gap-1 text-[11px] font-mono scrollbar-none">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'studio' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('components_lab')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'components_lab' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
            }`}
          >
            Video-GIF
          </button>
          <button
            onClick={() => setActiveTab('app_sdk')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'app_sdk' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
            }`}
          >
            App SDK
          </button>
          <button
            onClick={() => setActiveTab('groq')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'groq' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
            }`}
          >
            GROQ
          </button>
          <button
            onClick={() => setActiveTab('writeup')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'writeup' ? 'bg-red-950 text-red-300 font-bold' : 'text-zinc-400'
            }`}
          >
            Write-up
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                Sanity Content Lake Configuration
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-400 text-[11px] leading-relaxed">
              ChronoSyntax includes a fully functional simulated Content Lake & GROQ interpreter in browser storage. You can also specify an external Sanity Cloud project ID and dataset if desired.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Sanity Project ID:</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Dataset Name:</label>
                <input
                  type="text"
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">API Token (Optional):</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="sk..."
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <span className="text-[11px] text-zinc-500">
                  {savedBadge ? <span className="text-emerald-400">Settings Saved!</span> : 'Local & Cloud Synced'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                  >
                    Save Config
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
