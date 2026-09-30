/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GROQ Query Studio: Live Content Lake Explorer
 * Executes real-time GROQ queries against documents, parses projections,
 * measures execution latency, and inspects JSON payloads.
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, Copy, Check, Sparkles, 
  Clock, Database, Layers, ArrowDownRight, RefreshCw 
} from 'lucide-react';
import { sanityLake } from '../../services/sanityClient';

const PRESET_QUERIES = [
  {
    name: 'All Anomalies with Workflow Projection',
    query: `*[_type == "anomaly"]{\n  title,\n  hazardClass,\n  dangerLevel,\n  quantumFrequencyMhz,\n  "stage": workflow.currentStage\n}`,
  },
  {
    name: 'Critical Threats (Danger > 60)',
    query: `*[_type == "anomaly" && dangerLevel > 60] | order(dangerLevel desc){\n  title,\n  hazardClass,\n  dangerLevel,\n  discoveredLocation\n}`,
  },
  {
    name: 'Pending Lead Chronicler Review',
    query: `*[_type == "anomaly" && workflow.currentStage == "human_review"]{\n  title,\n  hazardClass,\n  "assignedEditor": workflow.assignedEditor,\n  decryptedCipher\n}`,
  },
  {
    name: 'Anomalies with Custom GIF Assets',
    query: `*[_type == "anomaly" && defined(videoGlitchAsset)]{\n  title,\n  "assetId": videoGlitchAsset.assetId,\n  "filterMode": videoGlitchAsset.filterMode,\n  "fileSizeKb": videoGlitchAsset.fileSizeKb\n}`,
  },
  {
    name: 'Total Anomaly Count',
    query: `count(*[_type == "anomaly"])`,
  },
];

export const GroqPlayground: React.FC = () => {
  const [query, setQuery] = useState<string>(PRESET_QUERIES[0].query);
  const [result, setResult] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const executeGroq = async (queryString: string) => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      const data = await sanityLake.fetch(queryString);
      const duration = Math.round((performance.now() - start) * 10) / 10;
      setResult(data);
      setLatencyMs(duration);
      setItemCount(Array.isArray(data) ? data.length : 1);
    } catch (err: any) {
      setResult({ error: err.message || 'GROQ Evaluation Error' });
      setLatencyMs(0);
      setItemCount(0);
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    executeGroq(query);
  }, []);

  const handleCopyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-purple-950/60 text-purple-400 border border-purple-500/30 mb-2">
            <Terminal className="w-3.5 h-3.5" />
            Sanity Content Lake • GROQ Query Studio
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            Real-time GROQ Query Runner
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
            Query the multiversal Content Lake in real time using Sanity's Graph Relational Object Queries (GROQ). Test custom projections, filters, joins, and slice operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => executeGroq(query)}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold shadow-lg shadow-red-900/30 transition-all"
          >
            {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Execute GROQ
          </button>
        </div>
      </div>

      {/* Preset Queries Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">Presets:</span>
        {PRESET_QUERIES.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(p.query);
              executeGroq(p.query);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono whitespace-nowrap transition-all ${
              query === p.query
                ? 'bg-zinc-800 text-cyan-400 border-cyan-500/50 shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Query & Result Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query Editor */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="bg-zinc-900/80 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                GROQ Query Buffer
              </span>
              <span className="text-[10px] text-zinc-500">Ctrl+Enter to Run</span>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  executeGroq(query);
                }
              }}
              rows={14}
              spellCheck={false}
              className="w-full bg-black/80 text-cyan-300 font-mono text-xs p-4 leading-relaxed focus:outline-none resize-none selection:bg-cyan-900"
            />
          </div>

          {/* Quick GROQ Reference cheat card */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/80 p-3 text-[11px] font-mono text-zinc-400 space-y-1">
            <div className="text-zinc-500 uppercase text-[10px] font-bold">GROQ Syntax Tips:</div>
            <div>• <code className="text-purple-400">*[_type == "anomaly"]</code>: Filter by type</div>
            <div>• <code className="text-purple-400">&#123; title, "stage": workflow.currentStage &#125;</code>: Projections & aliases</div>
            <div>• <code className="text-purple-400">| order(dangerLevel desc)</code>: Sort ordering</div>
            <div>• <code className="text-purple-400">count(*[_type == "anomaly"])</code>: Aggregation</div>
          </div>
        </div>

        {/* Right: JSON Result Inspector */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl flex flex-col h-full">
            <div className="bg-zinc-900/80 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  {latencyMs} ms
                </span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-300">{itemCount} items</span>
              </div>

              <button
                onClick={handleCopyResult}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="flex-1 p-4 bg-black/80 overflow-auto max-h-[460px]">
              <pre className="font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
