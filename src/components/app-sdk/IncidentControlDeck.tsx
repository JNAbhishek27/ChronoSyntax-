/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sanity App SDK: Incident Control Deck & Live Operational App
 * Demonstrates a custom application built ON TOP OF Sanity content,
 * featuring real-time bidirectional data mutations, live event subscriptions,
 * auditory signal rendering, and field report dispatching.
 */

import React, { useState, useEffect } from 'react';
import { 
  Radio, Zap, Shield, Anchor, Activity, Send, 
  Volume2, VolumeX, AlertTriangle, Sparkles, Filter, 
  RefreshCw, CheckCircle2, Plus, Terminal, ArrowUpRight
} from 'lucide-react';
import { AnomalyDocument, RealtimeMutationEvent } from '../../types/sanity';
import { sanityLake } from '../../services/sanityClient';
import { audioSynth } from '../../utils/audioSynth';

interface IncidentControlDeckProps {
  onSelectDocInStudio?: (docId: string) => void;
}

export const IncidentControlDeck: React.FC<IncidentControlDeckProps> = ({ onSelectDocInStudio }) => {
  const [documents, setDocuments] = useState<AnomalyDocument[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDocument | null>(null);
  const [recentMutations, setRecentMutations] = useState<RealtimeMutationEvent[]>([]);
  const [activeAudioDocId, setActiveAudioDocId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Field Report creation modal
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportLocation, setReportLocation] = useState<string>('');
  const [reportTranscript, setReportTranscript] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // Optimistic pulse animation state
  const [pulsingDocId, setPulsingDocId] = useState<string | null>(null);

  // Subscribe to real-time Sanity Content Lake
  useEffect(() => {
    setDocuments(sanityLake.getDocuments());
    setRecentMutations(sanityLake.getMutationHistory());

    const unsubscribe = sanityLake.subscribe((event) => {
      setDocuments(sanityLake.getDocuments());
      setRecentMutations(sanityLake.getMutationHistory());
    });

    return () => {
      unsubscribe();
      audioSynth.stopDrone();
    };
  }, []);

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesClass = filterClass === 'all' || doc.hazardClass === filterClass;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.discoveredLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.originDimension.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Sound Drone toggle
  const toggleAudio = (doc: AnomalyDocument) => {
    if (activeAudioDocId === doc._id) {
      audioSynth.stopDrone();
      setActiveAudioDocId(null);
    } else {
      audioSynth.playDrone(doc.quantumFrequencyMhz, doc.audioModulation || 'sine');
      setActiveAudioDocId(doc._id);
    }
  };

  // Real-time Mutation 1: Inject Quantum Resonance Pulse
  const handleInjectResonancePulse = async (docId: string) => {
    setPulsingDocId(docId);
    try {
      await sanityLake.patch(docId)
        .inc({ containmentIntegrity: 4 })
        .set({ quantumFrequencyMhz: parseFloat((sanityLake.getDocumentById(docId)!.quantumFrequencyMhz + (Math.random() * 0.4 - 0.2)).toFixed(2)) })
        .commit({
          actor: 'App SDK Incident Operator (Field Probe)',
          description: `Injected stabilizing resonance pulse into ${docId}`,
        });
      setTimeout(() => setPulsingDocId(null), 800);
    } catch (err) {
      console.error('Mutation error:', err);
      setPulsingDocId(null);
    }
  };

  // Real-time Mutation 2: Cast Reality Anchor
  const handleCastRealityAnchor = async (docId: string) => {
    try {
      await sanityLake.patch(docId)
        .inc({ realityAnchors: 1, fieldReportsCount: 1 })
        .commit({
          actor: 'App SDK Field Operative',
          description: `Reinforced dimensional reality anchors on ${docId}`,
        });
    } catch (err) {
      console.error('Mutation error:', err);
    }
  };

  // Create Field Report (Mutation: create document into Lake)
  const handleCreateFieldReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    setIsSubmittingReport(true);
    try {
      const newDoc = await sanityLake.create({
        title: reportTitle,
        discoveredLocation: reportLocation || 'Unsurveyed Galactic Meridian',
        rawTranscript: reportTranscript || 'Radio telemetry anomaly recorded via mobile field transceiver.',
        hazardClass: 'Unclassified',
        dangerLevel: Math.floor(Math.random() * 40) + 40,
        quantumFrequencyMhz: parseFloat((Math.random() * 300 + 40).toFixed(2)),
      });

      setShowReportModal(false);
      setReportTitle('');
      setReportLocation('');
      setReportTranscript('');
      setSelectedAnomaly(newDoc);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* App SDK Hero Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-red-950/80 text-red-400 border border-red-500/40">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Sanity App SDK • Real-time Interactive Control Deck
            </div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              Multiversal Anomaly Incident Control Mesh
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/30">
                LIVE MUTATIONS ACTIVE
              </span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Not another read-only blog template. This custom operational app executes bidirectional mutations against the Sanity Content Lake in real-time, monitors telemetry pulses, casts reality anchors, and streams live event subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold shadow-lg shadow-red-900/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Dispatch New Field Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Cards & Live Mutation Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter Bar & Anomaly Telemetry Cards */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anomalies, coordinates, or frequencies..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Filter:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Threat Classes</option>
                <option value="Safe">Safe</option>
                <option value="Euclid">Euclid</option>
                <option value="Keter">Keter</option>
                <option value="Reality-Bending">Reality-Bending</option>
                <option value="Unclassified">Unclassified</option>
              </select>
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => {
              const isPulsing = pulsingDocId === doc._id;
              const isAudioPlaying = activeAudioDocId === doc._id;

              return (
                <div
                  key={doc._id}
                  onClick={() => setSelectedAnomaly(doc)}
                  className={`relative rounded-2xl bg-zinc-900/90 border p-4 space-y-3 transition-all cursor-pointer shadow-lg hover:shadow-zinc-950/60 ${
                    selectedAnomaly?._id === doc._id
                      ? 'border-red-500/80 ring-1 ring-red-500/40'
                      : 'border-zinc-800 hover:border-zinc-700'
                  } ${isPulsing ? 'scale-[1.02] border-cyan-400 ring-2 ring-cyan-500/50' : ''}`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded uppercase font-semibold ${
                        doc.hazardClass === 'Keter'
                          ? 'bg-red-950 text-red-400 border border-red-500/30'
                          : doc.hazardClass === 'Reality-Bending'
                          ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                          : doc.hazardClass === 'Euclid'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {doc.hazardClass}
                    </span>

                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      {doc.quantumFrequencyMhz} MHz
                    </span>
                  </div>

                  {/* Title & Dimension */}
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 leading-snug group-hover:text-red-400">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                      {doc.discoveredLocation}
                    </p>
                  </div>

                  {/* Video/GIF Thumbnail if exists */}
                  {doc.videoGlitchAsset?.dataUri && (
                    <div className="relative rounded-xl overflow-hidden aspect-[16/7] border border-zinc-800 bg-black">
                      <img
                        src={doc.videoGlitchAsset.dataUri}
                        alt="Glitch Asset"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-cyan-300">
                        {doc.videoGlitchAsset.filterMode}
                      </div>
                    </div>
                  )}

                  {/* Telemetry Meters */}
                  <div className="space-y-1.5 text-[11px] font-mono pt-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Containment Integrity:</span>
                      <span className="text-emerald-400 font-semibold">{doc.containmentIntegrity}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${doc.containmentIntegrity}%` }}
                      />
                    </div>
                  </div>

                  {/* App SDK Operational Controls (Live Mutation Triggers) */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {/* Audio Drone */}
                      <button
                        onClick={() => toggleAudio(doc)}
                        className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
                          isAudioPlaying
                            ? 'bg-purple-950 border-purple-500 text-purple-300 animate-pulse'
                            : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                        title="Toggle Audio Drone"
                      >
                        {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      {/* Cast Anchor Mutation */}
                      <button
                        onClick={() => handleCastRealityAnchor(doc._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                        title="Cast Reality Anchor (Patches Document)"
                      >
                        <Anchor className="w-3 h-3 text-amber-400" />
                        <span>{doc.realityAnchors}</span>
                      </button>
                    </div>

                    {/* Inject Resonance Pulse Mutation */}
                    <button
                      onClick={() => handleInjectResonancePulse(doc._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium transition-colors"
                      title="Mutate Content Lake: Boosts Integrity & Syncs Frequency"
                    >
                      <Zap className="w-3 h-3 text-cyan-400" />
                      Pulse Lake
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Mutation Stream & Document Deep Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Sanity Mutation Bus */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Live Content Lake Event Stream
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[11px] pr-1">
              {recentMutations.slice(0, 8).map((evt) => (
                <div key={evt.id} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-0.5">
                  <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                    <span className="text-cyan-400 uppercase font-bold">{evt.mutationType}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-zinc-200 truncate">{evt.description}</div>
                  <div className="text-[10px] text-zinc-500">By: {evt.actor}</div>
                </div>
              ))}

              {recentMutations.length === 0 && (
                <div className="text-zinc-500 text-center py-4 text-xs">
                  Awaiting lake mutations...
                </div>
              )}
            </div>
          </div>

          {/* Selected Anomaly Details / Studio Jump */}
          {selectedAnomaly ? (
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="font-bold text-zinc-100 text-sm">{selectedAnomaly.title}</h4>
                  <span className="text-zinc-500 text-[11px]">{selectedAnomaly._id}</span>
                </div>
                {onSelectDocInStudio && (
                  <button
                    onClick={() => onSelectDocInStudio(selectedAnomaly._id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1"
                    title="Open in Sanity Studio Editor"
                  >
                    Studio <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">ORIGIN DIMENSION</span>
                <span className="text-zinc-300">{selectedAnomaly.originDimension}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">DECRYPTED CIPHER</span>
                <p className="text-cyan-300 text-[11px] mt-0.5 leading-relaxed bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  {selectedAnomaly.decryptedCipher || 'No cipher decrypted yet. Intercept raw signal in Studio.'}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">CONTAINMENT SPECIFICATION</span>
                <p className="text-zinc-300 text-[11px] mt-0.5 leading-relaxed bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  {selectedAnomaly.containmentProtocol || 'Standard damping grid.'}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-between text-zinc-500 text-[11px]">
                <span>Stage: <strong className="text-emerald-400">{selectedAnomaly.workflow.currentStage}</strong></span>
                <span>Reports: <strong className="text-zinc-300">{selectedAnomaly.fieldReportsCount}</strong></span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-xs font-mono">
              Click any anomaly card on the left to inspect its multiversal coordinates and decrypted ciphers.
            </div>
          )}
        </div>
      </div>

      {/* Field Report Modal (Creates document into Lake) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-400" />
                Dispatch New Anomaly Field Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-mono">
              Submits a live document to the Sanity Content Lake. It will automatically enter Stage 1 (Raw Intercept) of the workflow engine.
            </p>

            <form onSubmit={handleCreateFieldReport} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Anomaly Designation / Title:</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. The Singing Geode of Crater Lake"
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Discovered Location Coordinates:</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  placeholder="e.g. Sector 4, Oregon Cascade Range"
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Raw Intercept / Sensor Log:</label>
                <textarea
                  value={reportTranscript}
                  onChange={(e) => setReportTranscript(e.target.value)}
                  rows={3}
                  placeholder="Describe initial auditory, electromagnetic, or spatial readings..."
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-900/30"
                >
                  {isSubmittingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Commit to Sanity Lake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
