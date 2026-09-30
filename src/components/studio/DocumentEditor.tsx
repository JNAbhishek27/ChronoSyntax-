/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sanity Studio Document Inspector & Form Editor
 * Replicates the feel of Sanity Studio v3 with custom field inputs,
 * live revision counters, and inline workflow actions.
 */

import React, { useState, useEffect } from 'react';
import { 
  Save, Sparkles, Send, Radio, Bot, UserCheck, 
  Shield, AlertTriangle, Layers, Film, ArrowRight, 
  CheckCircle2, RefreshCw, Volume2, VolumeX, Eye
} from 'lucide-react';
import { AnomalyDocument } from '../../types/sanity';
import { sanityLake } from '../../services/sanityClient';
import { runAgentEnrichmentWorkflow } from '../../services/workflowRunner';
import { WORKFLOW_STAGES_CONFIG } from '../../data/initialData';
import { audioSynth } from '../../utils/audioSynth';

interface DocumentEditorProps {
  documentId: string;
  onNavigateToLab?: () => void;
  onRefresh?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  documentId, 
  onNavigateToLab, 
  onRefresh 
}) => {
  const [doc, setDoc] = useState<AnomalyDocument | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Form local states
  const [title, setTitle] = useState('');
  const [hazardClass, setHazardClass] = useState<AnomalyDocument['hazardClass']>('Euclid');
  const [dangerLevel, setDangerLevel] = useState(50);
  const [containmentIntegrity, setContainmentIntegrity] = useState(75);
  const [discoveredLocation, setDiscoveredLocation] = useState('');
  const [originDimension, setOriginDimension] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [decryptedCipher, setDecryptedCipher] = useState('');
  const [containmentProtocol, setContainmentProtocol] = useState('');

  // Load document
  useEffect(() => {
    const found = sanityLake.getDocumentById(documentId);
    if (found) {
      setDoc(found);
      setTitle(found.title);
      setHazardClass(found.hazardClass);
      setDangerLevel(found.dangerLevel);
      setContainmentIntegrity(found.containmentIntegrity);
      setDiscoveredLocation(found.discoveredLocation);
      setOriginDimension(found.originDimension);
      setRawTranscript(found.rawTranscript);
      setDecryptedCipher(found.decryptedCipher || '');
      setContainmentProtocol(found.containmentProtocol || '');
    }
  }, [documentId]);

  // Audio tone playback
  const toggleAudioResonance = () => {
    if (!doc) return;
    if (isPlayingAudio) {
      audioSynth.stopDrone();
      setIsPlayingAudio(false);
    } else {
      audioSynth.playDrone(doc.quantumFrequencyMhz, doc.audioModulation || 'sine');
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    return () => {
      audioSynth.stopDrone();
    };
  }, []);

  // Save changes via Sanity Client Patch
  const handleSave = async () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      await sanityLake.patch(doc._id).set({
        title,
        hazardClass,
        dangerLevel,
        containmentIntegrity,
        discoveredLocation,
        originDimension,
        rawTranscript,
        decryptedCipher,
        containmentProtocol,
      }).commit({
        actor: 'Sanity Studio Desk Editor',
        description: `Updated metadata for "${title}"`,
      });

      const updated = sanityLake.getDocumentById(doc._id);
      if (updated) setDoc(updated);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to commit patch:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Run AI Agent Step
  const handleRunAgent = async () => {
    if (!doc) return;
    setIsEnriching(true);
    try {
      const res = await runAgentEnrichmentWorkflow(doc._id);
      const updated = sanityLake.getDocumentById(doc._id);
      if (updated) {
        setDoc(updated);
        setDecryptedCipher(updated.decryptedCipher || '');
        setContainmentProtocol(updated.containmentProtocol || '');
        setHazardClass(updated.hazardClass);
        setDangerLevel(updated.dangerLevel);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Enrichment failed:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  // Transition to next stage
  const handleAdvanceStage = async (nextStage: any, note: string) => {
    if (!doc) return;
    try {
      const updated = await sanityLake.transitionWorkflowStage(
        doc._id,
        nextStage,
        { type: 'human', name: 'Dr. Evelyn Cross (Desk Editor)' },
        note
      );
      setDoc(updated);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed stage transition:', err);
    }
  };

  if (!doc) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-sm">
        Select a document from the left desk panel to inspect and edit.
      </div>
    );
  }

  const currentStageConfig = WORKFLOW_STAGES_CONFIG[doc.workflow.currentStage];

  return (
    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Studio Document Top Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {doc._type}
          </span>
          <span className="text-zinc-500 font-mono text-xs">/</span>
          <span className="text-zinc-200 font-mono text-xs font-semibold">{doc._id}</span>
          <span className="text-xs font-mono text-zinc-500">rev: {doc._rev.slice(0, 10)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio Resonance Tester */}
          <button
            onClick={toggleAudioResonance}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              isPlayingAudio
                ? 'bg-purple-950 border border-purple-500 text-purple-300 animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300'
            }`}
            title="Play quantum carrier frequency tone via Web Audio API"
          >
            {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            {isPlayingAudio ? `${doc.quantumFrequencyMhz} MHz Playing` : 'Drone Audio'}
          </button>

          {/* AI Agent Trigger */}
          <button
            onClick={handleRunAgent}
            disabled={isEnriching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
          >
            {isEnriching ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            )}
            {isEnriching ? 'Agent Analyzing...' : 'Run Gemini Occult Agent'}
          </button>

          {/* Commit Changes */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold transition-all shadow-md shadow-red-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Committing...' : 'Commit to Lake'}
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="bg-emerald-950 border-b border-emerald-500/30 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Document mutations committed to Sanity Content Lake! Revision updated.
        </div>
      )}

      {/* Workflow Status Strip */}
      <div className={`px-6 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 ${currentStageConfig.bgColor}`}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400">WORKFLOW STATE:</span>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${currentStageConfig.borderColor} ${currentStageConfig.color} bg-black/40`}>
            {currentStageConfig.label}
          </span>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Assigned: <strong className="text-zinc-200">{doc.workflow.assignedAgent || 'None'}</strong>
          </span>
        </div>

        {/* Quick Transition Advance buttons */}
        <div className="flex items-center gap-2">
          {doc.workflow.currentStage === 'draft' && (
            <button
              onClick={() => handleAdvanceStage('agent_enrichment', 'Passed to Agent Enrichment queue.')}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              Push to Agent Queue <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {doc.workflow.currentStage === 'agent_enrichment' && (
            <button
              onClick={() => handleAdvanceStage('human_review', 'Agent results forwarded to Lead Chronicler.')}
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              Forward to Human Review <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {doc.workflow.currentStage === 'human_review' && (
            <button
              onClick={() => handleAdvanceStage('approved', 'Approved by Lead Chronicler.')}
              className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1"
            >
              Approve Document <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {doc.workflow.currentStage === 'approved' && (
            <button
              onClick={() => handleAdvanceStage('published', 'Published to live broadcast CDN.')}
              className="text-xs font-mono text-red-400 hover:underline flex items-center gap-1"
            >
              Publish to App SDK Feed <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Left Column: Core Fields */}
        <div className="lg:col-span-8 space-y-5">
          {/* Document Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Anomaly Designation / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Location & Dimension */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Discovered Location
              </label>
              <input
                type="text"
                value={discoveredLocation}
                onChange={(e) => setDiscoveredLocation(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3.5 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Origin Dimension
              </label>
              <input
                type="text"
                value={originDimension}
                onChange={(e) => setOriginDimension(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3.5 py-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* Raw Intercept Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400">
                Raw Sensor Intercept / Audio Carrier Log
              </label>
              <span className="text-[10px] font-mono text-zinc-500">Unprocessed Field Capture</span>
            </div>
            <textarea
              value={rawTranscript}
              onChange={(e) => setRawTranscript(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-xl p-3 text-xs font-mono leading-relaxed"
            />
          </div>

          {/* AI Decrypted Cipher Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                Decrypted Occult Cipher (Agent-Gemini-Theta)
              </label>
              <span className="text-[10px] font-mono text-cyan-500">AI Synthesized</span>
            </div>
            <textarea
              value={decryptedCipher}
              onChange={(e) => setDecryptedCipher(e.target.value)}
              rows={3}
              placeholder="No cipher decrypted yet. Run the Gemini Occult Agent above to decrypt."
              className="w-full bg-zinc-950/80 border border-cyan-500/30 text-cyan-200 rounded-xl p-3 text-xs font-mono leading-relaxed focus:border-cyan-500"
            />
          </div>

          {/* Containment Protocol */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Containment & Dampening Protocol
            </label>
            <textarea
              value={containmentProtocol}
              onChange={(e) => setContainmentProtocol(e.target.value)}
              rows={3}
              placeholder="Specify electromagnetic or cryogenic dampening specifications."
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-xl p-3 text-xs font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Visual GIF Asset & Telemetry Meters */}
        <div className="lg:col-span-4 space-y-5">
          {/* Custom Input: Video-to-GIF Asset Field */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-zinc-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Custom GIF Asset Input
              </label>
              {onNavigateToLab && (
                <button
                  onClick={onNavigateToLab}
                  className="text-[11px] font-mono text-amber-400 hover:underline"
                >
                  Open Studio Lab
                </button>
              )}
            </div>

            {doc.videoGlitchAsset ? (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden aspect-[3/2] border border-zinc-700 bg-black">
                  <img
                    src={doc.videoGlitchAsset.dataUri || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80'}
                    alt="Glitch Asset Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-cyan-300 border border-zinc-800">
                    {doc.videoGlitchAsset.filterMode.toUpperCase()} | {doc.videoGlitchAsset.frameCount} FRAMES
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-400 space-y-0.5">
                  <div>Asset ID: <span className="text-zinc-200">{doc.videoGlitchAsset.assetId}</span></div>
                  <div>Payload Size: <span className="text-emerald-400">{doc.videoGlitchAsset.fileSizeKb} KB</span></div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-xs font-mono text-zinc-500 space-y-2">
                <Film className="w-6 h-6 mx-auto text-zinc-600" />
                <p>No animated GIF asset attached.</p>
                {onNavigateToLab && (
                  <button
                    onClick={onNavigateToLab}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 text-xs font-mono hover:bg-zinc-800"
                  >
                    Synthesize Glitch GIF
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Threat Class & Sliders */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-4 font-mono text-xs">
            <h4 className="text-zinc-400 uppercase text-[11px] font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              Containment Telemetry
            </h4>

            <div>
              <label className="block text-zinc-400 mb-1 text-[11px]">Hazard Classification:</label>
              <select
                value={hazardClass}
                onChange={(e) => setHazardClass(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg p-2 font-mono"
              >
                <option value="Safe">Safe</option>
                <option value="Euclid">Euclid</option>
                <option value="Keter">Keter</option>
                <option value="Reality-Bending">Reality-Bending</option>
                <option value="Unclassified">Unclassified</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1 text-[11px]">
                <span>Danger Level:</span>
                <span className="text-red-400">{dangerLevel}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={dangerLevel}
                onChange={(e) => setDangerLevel(parseInt(e.target.value, 10))}
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1 text-[11px]">
                <span>Containment Integrity:</span>
                <span className="text-emerald-400">{containmentIntegrity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={containmentIntegrity}
                onChange={(e) => setContainmentIntegrity(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-500">
              <span>Carrier Frequency:</span>
              <span className="text-cyan-400">{doc.quantumFrequencyMhz} MHz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
