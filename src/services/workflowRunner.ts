/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Autonomous Agent & Workflows Execution Engine
 * Coordinates agent enrichment, external webhook triggers, and human transitions.
 */

import { sanityLake } from './sanityClient';
import { AnomalyDocument, WebhookLog } from '../types/sanity';

export interface AgentExecutionResult {
  success: boolean;
  document: AnomalyDocument;
  source: string;
  webhookStatus?: any;
  enrichmentSummary: {
    hazardClass: string;
    anomalyScore: number;
    quantumResonanceMhz: number;
    detectedEntities: string[];
    containmentProtocol: string;
    decryptedCipher: string;
    agentNotes: string;
  };
}

export async function runAgentEnrichmentWorkflow(
  documentId: string,
  webhookTargetUrl?: string
): Promise<AgentExecutionResult> {
  const doc = sanityLake.getDocumentById(documentId);
  if (!doc) throw new Error(`Document ${documentId} not found.`);

  // 1. Call Agent Enrichment API (Gemini with fallback)
  let enrichmentData: any;
  let source = 'autonomous-neural-engine';

  try {
    const res = await fetch('/api/workflows/agent-enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: doc.title,
        rawTranscript: doc.rawTranscript,
        classification: doc.hazardClass,
        currentStage: doc.workflow.currentStage,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.enrichment) {
        enrichmentData = data.enrichment;
        source = data.source || 'gemini-3.8-flash';
      }
    }
  } catch (apiErr) {
    console.warn('API call failed, falling back to local occult synthesizer:', apiErr);
  }

  if (!enrichmentData) {
    const classes = ['Euclid', 'Keter', 'Reality-Bending', 'Safe'] as const;
    const chosenClass = classes[Math.floor(Math.random() * classes.length)];
    const freq = (Math.random() * 600 + 40).toFixed(2);
    enrichmentData = {
      hazardClass: chosenClass,
      anomalyScore: Math.floor(Math.random() * 40) + 60,
      containmentProtocol: `Deploy Class-IV harmonic dampeners at ${doc.discoveredLocation}. Maintain resonance below 0.5 flux units.`,
      decryptedCipher: `Harmonic signature locked at ${freq} MHz. Audio phase inversion confirms chronal displacement pattern.`,
      detectedEntities: ['Quantum Phase Rift', 'Temporal Echo', 'Sub-etheric Carrier Wave'],
      quantumResonanceMhz: parseFloat(freq),
      agentNotes: 'Agent-Gemini-Theta: Occult telemetry decrypted. Memetic hazard containment confirmed. Auto-forwarding to Human Lead Chronicler.',
    };
  }

  // 2. Dispatch External Webhook (if provided or default relay)
  const webhookUrl = webhookTargetUrl || 'https://occult-relay.chronosyntax.internal/v1/agent-enrichment-hook';
  const startWebhookTime = performance.now();
  let webhookLogItem: WebhookLog | null = null;

  try {
    const whRes = await fetch('/api/workflows/dispatch-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl,
        event: 'agent.enrichment_completed',
        documentId: doc._id,
        payload: {
          hazardClass: enrichmentData.hazardClass,
          dangerScore: enrichmentData.anomalyScore,
          quantumResonanceMhz: enrichmentData.quantumResonanceMhz,
          entities: enrichmentData.detectedEntities,
        },
      }),
    });

    const whData = await whRes.json();
    const duration = Math.round(performance.now() - startWebhookTime);

    webhookLogItem = {
      id: 'wh_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      url: webhookUrl,
      event: 'agent.enrichment_completed',
      statusCode: whData.statusCode || 200,
      durationMs: duration,
      payloadSummary: `Hazard: ${enrichmentData.hazardClass}, Score: ${enrichmentData.anomalyScore}`,
      responsePreview: JSON.stringify(whData.response || { status: 'acknowledged' }),
    };
  } catch (whErr) {
    console.warn('Webhook dispatch failed:', whErr);
  }

  // 3. Mutate Document and Transition Workflow State to Human Review
  const updatedDoc = await sanityLake.transitionWorkflowStage(
    documentId,
    'human_review',
    { type: 'agent', name: 'Agent-Gemini-Theta' },
    enrichmentData.agentNotes || 'Agent completed automated telemetry decryption and security evaluation.',
    {
      hazardClass: enrichmentData.hazardClass,
      dangerLevel: enrichmentData.anomalyScore,
      quantumFrequencyMhz: enrichmentData.quantumResonanceMhz || doc.quantumFrequencyMhz,
      containmentProtocol: enrichmentData.containmentProtocol,
      decryptedCipher: enrichmentData.decryptedCipher,
      detectedEntities: enrichmentData.detectedEntities,
    }
  );

  // Append webhook log to document workflow if available
  if (webhookLogItem) {
    const currentLogs = updatedDoc.workflow.webhookLogs || [];
    await sanityLake.patch(documentId).set({
      'workflow.webhookLogs': [webhookLogItem, ...currentLogs],
    }).commit({
      actor: 'Agent-Gemini-Theta',
      description: 'Logged external webhook dispatch receipt',
    });
  }

  return {
    success: true,
    document: sanityLake.getDocumentById(documentId) || updatedDoc,
    source,
    webhookStatus: webhookLogItem,
    enrichmentSummary: enrichmentData,
  };
}

export async function dispatchManualWebhook(
  documentId: string,
  webhookUrl: string,
  customEvent: string = 'manual.telemetry_ping'
): Promise<WebhookLog> {
  const doc = sanityLake.getDocumentById(documentId);
  if (!doc) throw new Error(`Document ${documentId} not found`);

  const startTime = performance.now();
  const res = await fetch('/api/workflows/dispatch-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl,
      event: customEvent,
      documentId: doc._id,
      payload: {
        title: doc.title,
        hazardClass: doc.hazardClass,
        stage: doc.workflow.currentStage,
        integrity: doc.containmentIntegrity,
      },
    }),
  });

  const data = await res.json();
  const duration = Math.round(performance.now() - startTime);

  const logItem: WebhookLog = {
    id: 'wh_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    url: webhookUrl,
    event: customEvent,
    statusCode: data.statusCode || 200,
    durationMs: duration,
    payloadSummary: `Manual dispatch for [${doc.title}] (${doc.hazardClass})`,
    responsePreview: JSON.stringify(data.response || { status: 'acknowledged' }),
  };

  const currentLogs = doc.workflow.webhookLogs || [];
  await sanityLake.patch(documentId).set({
    'workflow.webhookLogs': [logItem, ...currentLogs],
  }).commit({
    actor: 'Lead Chronicler',
    description: `Fired webhook to ${webhookUrl}`,
  });

  return logItem;
}
