/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sanity Workflows Engine: Visual State Transition Board
 * Models editorial and operational processes as first-class data alongside content.
 * Coordinates autonomous agent transitions and human editorial sign-offs.
 */

import React, { useState } from 'react';
import { 
  Bot, UserCheck, ShieldAlert, Sparkles, Send, 
  ArrowRight, Clock, CheckCircle2, History, AlertTriangle, 
  Radio, RefreshCw, FileText, ChevronRight 
} from 'lucide-react';
import { AnomalyDocument, WorkflowStageId } from '../../types/sanity';
import { WORKFLOW_STAGES_CONFIG } from '../../data/initialData';
import { sanityLake } from '../../services/sanityClient';
import { runAgentEnrichmentWorkflow, dispatchManualWebhook } from '../../services/workflowRunner';

interface WorkflowBoardProps {
  documents: AnomalyDocument[];
  onSelectDocument: (docId: string) => void;
  onRefresh: () => void;
}

export const WorkflowBoard: React.FC<WorkflowBoardProps> = ({ documents, onSelectDocument, onRefresh }) => {
  const [runningAgentDocId, setRunningAgentDocId] = useState<string | null>(null);
  const [publishingDocId, setPublishingDocId] = useState<string | null>(null);
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<AnomalyDocument | null>(null);
  const [reviewModalDoc, setReviewModalDoc] = useState<AnomalyDocument | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('Data integrity verified. No hazardous cognitive contaminants found.');
  const [reviewerName, setReviewerName] = useState<string>('Dr. Evelyn Cross');

  // Webhook modal
  const [webhookModalDoc, setWebhookModalDoc] = useState<AnomalyDocument | null>(null);
  const [customWebhookUrl, setCustomWebhookUrl] = useState<string>('https://occult-relay.chronosyntax.internal/v1/webhook');
  const [isFiringWebhook, setIsFiringWebhook] = useState<boolean>(false);
  const [lastWebhookResult, setLastWebhookResult] = useState<any | null>(null);

  const stageKeys: WorkflowStageId[] = [
    'draft',
    'agent_enrichment',
    'translation_qc',
    'human_review',
    'approved',
    'published',
  ];

  // Group documents by stage
  const docsByStage: Record<WorkflowStageId, AnomalyDocument[]> = {
    draft: [],
    agent_enrichment: [],
    translation_qc: [],
    human_review: [],
    approved: [],
    published: [],
  };

  documents.forEach((doc) => {
    const stage = doc.workflow?.currentStage || 'draft';
    if (docsByStage[stage]) {
      docsByStage[stage].push(doc);
    } else {
      docsByStage.draft.push(doc);
    }
  });

  // Execute Agent Enrichment Step
  const handleRunAgent = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRunningAgentDocId(docId);
    try {
      await runAgentEnrichmentWorkflow(docId);
      onRefresh();
    } catch (err) {
      console.error('Agent workflow failed:', err);
    } finally {
      setRunningAgentDocId(null);
    }
  };

  // Submit Human Sign-Off
  const handleConfirmHumanSignOff = async () => {
    if (!reviewModalDoc) return;
    try {
      await sanityLake.transitionWorkflowStage(
        reviewModalDoc._id,
        'approved',
        { type: 'human', name: reviewerName },
        reviewNote
      );
      setReviewModalDoc(null);
      onRefresh();
    } catch (err) {
      console.error('Failed human sign off:', err);
    }
  };

  // Publish to App SDK Feed
  const handlePublish = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPublishingDocId(docId);
    try {
      await sanityLake.transitionWorkflowStage(
        docId,
        'published',
        { type: 'system', name: 'Edge Broadcast Mesh' },
        'Dispatched to live Incident Control App SDK feed.'
      );
      onRefresh();
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishingDocId(null);
    }
  };

  // Dispatch Webhook
  const handleFireWebhook = async () => {
    if (!webhookModalDoc) return;
    setIsFiringWebhook(true);
    setLastWebhookResult(null);
    try {
      const result = await dispatchManualWebhook(
        webhookModalDoc._id,
        customWebhookUrl,
        'workflow.manual_inspection_event'
      );
      setLastWebhookResult(result);
      onRefresh();
    } catch (err: any) {
      setLastWebhookResult({ error: err.message });
    } finally {
      setIsFiringWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflows Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              <Bot className="w-3.5 h-3.5" />
              Sanity Workflows as Data Engine
            </div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              Autonomous Agent & Editorial State Machine
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Processes are modeled as first-class data alongside documents. Autonomous agents analyze, enrich, and dispatch webhooks before seamlessly handing off drafts to human archivists for cryptographic review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs font-mono text-zinc-400">
              <div>Content Lake: <span className="text-emerald-400 font-semibold">{documents.length} Docs</span></div>
              <div>Published Live: <span className="text-red-400 font-semibold">{docsByStage.published.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-start">
        {stageKeys.map((stageKey, colIdx) => {
          const config = WORKFLOW_STAGES_CONFIG[stageKey];
          const stageDocs = docsByStage[stageKey];

          return (
            <div
              key={stageKey}
              className={`flex flex-col rounded-2xl border ${config.borderColor} ${config.bgColor} p-3.5 min-h-[460px] transition-all`}
            >
              {/* Column Header */}
              <div className="border-b border-zinc-800/80 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${config.color} uppercase tracking-wider`}>
                    Stage {colIdx + 1}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {stageDocs.length}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mt-1">{config.label}</h3>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Document Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageDocs.map((doc) => {
                  const isAgentRunning = runningAgentDocId === doc._id;
                  const isPublishing = publishingDocId === doc._id;

                  return (
                    <div
                      key={doc._id}
                      onClick={() => onSelectDocument(doc._id)}
                      className="group cursor-pointer rounded-xl bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 p-3.5 space-y-2.5 transition-all shadow-md hover:shadow-zinc-950/50"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
                            doc.hazardClass === 'Keter'
                              ? 'bg-red-950 text-red-400 border border-red-500/40'
                              : doc.hazardClass === 'Reality-Bending'
                              ? 'bg-purple-950 text-purple-400 border border-purple-500/40'
                              : doc.hazardClass === 'Euclid'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {doc.hazardClass}
                        </span>
                        <span className="text-zinc-500">{doc._id.replace('anomaly-', '#')}</span>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-red-400 transition-colors leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {doc.discoveredLocation}
                        </p>
                      </div>

                      {/* Frequency & Danger Progress */}
                      <div className="pt-1 space-y-1 text-[10px] font-mono">
                        <div className="flex justify-between text-zinc-400">
                          <span>Danger:</span>
                          <span className={doc.dangerLevel > 70 ? 'text-red-400' : 'text-amber-400'}>
                            {doc.dangerLevel}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              doc.dangerLevel > 70 ? 'bg-red-500' : doc.dangerLevel > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${doc.dangerLevel}%` }}
                          />
                        </div>
                      </div>

                      {/* GIF Asset preview if present */}
                      {doc.videoGlitchAsset?.dataUri && (
                        <div className="relative rounded overflow-hidden aspect-[4/2] border border-zinc-800">
                          <img
                            src={doc.videoGlitchAsset.dataUri}
                            alt="Glitch Loop"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-black/80 text-cyan-300">
                            {doc.videoGlitchAsset.filterMode}
                          </span>
                        </div>
                      )}

                      {/* Stage Action Triggers */}
                      <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* If in draft or agent_enrichment: Run Agent */}
                        {(stageKey === 'draft' || stageKey === 'agent_enrichment') && (
                          <button
                            onClick={(e) => handleRunAgent(doc._id, e)}
                            disabled={isAgentRunning}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono transition-colors"
                          >
                            {isAgentRunning ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin text-cyan-300" />
                                Agent Decrypting...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                Run Gemini Occult Agent
                              </>
                            )}
                          </button>
                        )}

                        {/* If in human_review: Sign-off Modal */}
                        {stageKey === 'human_review' && (
                          <button
                            onClick={() => setReviewModalDoc(doc)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono transition-colors"
                          >
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            Lead Review & Sign
                          </button>
                        )}

                        {/* If in approved: Publish to App SDK */}
                        {stageKey === 'approved' && (
                          <button
                            onClick={(e) => handlePublish(doc._id, e)}
                            disabled={isPublishing}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-mono transition-colors"
                          >
                            <Radio className="w-3 h-3 text-red-400" />
                            {isPublishing ? 'Publishing...' : 'Deploy to Live CDN'}
                          </button>
                        )}

                        {/* Fast footer links: Audit history & Webhook */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                          <button
                            onClick={() => setSelectedAuditDoc(doc)}
                            className="hover:text-zinc-300 flex items-center gap-1"
                          >
                            <History className="w-3 h-3" />
                            Audit ({doc.workflow.history.length})
                          </button>

                          <button
                            onClick={() => setWebhookModalDoc(doc)}
                            className="hover:text-cyan-400 flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Webhook ({doc.workflow.webhookLogs?.length || 0})
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageDocs.length === 0 && (
                  <div className="h-28 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-[11px] font-mono text-zinc-500">
                    Queue Clear
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Human Review Modal */}
      {reviewModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Lead Chronicler Editorial Review & Seal
              </h3>
              <button
                onClick={() => setReviewModalDoc(null)}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 font-mono bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[10px]">DOCUMENT TO REVIEW:</span>
                <span className="text-zinc-200 font-semibold">{reviewModalDoc.title}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">AI AGENT ENRICHMENT REPORT:</span>
                <p className="text-cyan-300 text-[11px] leading-relaxed mt-1">
                  {reviewModalDoc.decryptedCipher || 'No cipher data generated.'}
                </p>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">SUGGESTED CONTAINMENT:</span>
                <p className="text-zinc-300 text-[11px] leading-relaxed mt-1">
                  {reviewModalDoc.containmentProtocol || 'Default standard dampening.'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono mb-1">Archivist Signatory Name:</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono mb-1">Sign-Off Notes / Audit Remarks:</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setReviewModalDoc(null)}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-mono text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHumanSignOff}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-lg shadow-emerald-900/30"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                Affix Cryptographic Seal & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Dispatch Tester Modal */}
      {webhookModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Dispatch External Webhook / API Relay
              </h3>
              <button
                onClick={() => {
                  setWebhookModalDoc(null);
                  setLastWebhookResult(null);
                }}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-400">
              Kick off external API calls whenever documents transition or need external sync.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono mb-1">Target Endpoint URL:</label>
                <input
                  type="text"
                  value={customWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook-endpoint.com/api"
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-400">
                <div className="text-zinc-500 mb-1">PAYLOAD PREVIEW:</div>
                <pre className="overflow-x-auto text-cyan-300">
{JSON.stringify({
  event: 'workflow.manual_inspection_event',
  documentId: webhookModalDoc._id,
  title: webhookModalDoc.title,
  hazardClass: webhookModalDoc.hazardClass,
  stage: webhookModalDoc.workflow.currentStage,
}, null, 2)}
                </pre>
              </div>

              {lastWebhookResult && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 font-mono text-[11px] text-emerald-300">
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Webhook Dispatched Successfully!
                  </div>
                  <div>Status: {lastWebhookResult.statusCode}</div>
                  <div>Duration: {lastWebhookResult.durationMs}ms</div>
                  <div>Response: {lastWebhookResult.responsePreview}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setWebhookModalDoc(null);
                  setLastWebhookResult(null);
                }}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-mono text-xs"
              >
                Close
              </button>
              <button
                onClick={handleFireWebhook}
                disabled={isFiringWebhook}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/30"
              >
                {isFiringWebhook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Fire HTTP POST Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Drawer */}
      {selectedAuditDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  Audit Trail: {selectedAuditDoc.title}
                </h3>
                <span className="text-[11px] font-mono text-zinc-500">{selectedAuditDoc._id}</span>
              </div>
              <button
                onClick={() => setSelectedAuditDoc(null)}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {/* Timeline */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1 font-mono text-xs">
              {selectedAuditDoc.workflow.history.map((record, idx) => (
                <div key={record.id || idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                      {record.actor.type === 'agent' ? <Bot className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {record.actor.name}
                    </span>
                    <span className="text-zinc-500">{new Date(record.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px]">
                    <span className="text-amber-400">{record.fromStage}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span className="text-emerald-400">{record.toStage}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed pt-1">
                    {record.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedAuditDoc(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-mono hover:bg-zinc-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
