/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sanity Content Lake & Workflows Type Definitions
 * Models data as first-class citizens alongside content.
 */

export type WorkflowStageId = 
  | 'draft'
  | 'agent_enrichment'
  | 'translation_qc'
  | 'human_review'
  | 'approved'
  | 'published';

export interface WorkflowTransition {
  id: string;
  fromStage: WorkflowStageId;
  toStage: WorkflowStageId;
  timestamp: string;
  actor: {
    type: 'agent' | 'human' | 'system';
    name: string;
    avatar?: string;
  };
  note: string;
  actionTaken?: string;
  metadata?: Record<string, any>;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  url: string;
  event: string;
  statusCode: number;
  durationMs: number;
  payloadSummary: string;
  responsePreview: string;
}

export interface WorkflowState {
  _id: string;
  _type: 'workflow.state';
  documentId: string;
  currentStage: WorkflowStageId;
  assignedAgent?: string;
  assignedEditor?: string;
  locks?: string[];
  history: WorkflowTransition[];
  webhookLogs: WebhookLog[];
  automatedChecksPassed: boolean;
  humanSignOff?: {
    approvedBy: string;
    approvedAt: string;
    signatureHash: string;
    notes: string;
  };
}

export interface SanityVideoGifAsset {
  _type: 'sanity.imageAsset';
  assetId: string;
  url?: string;
  dataUri?: string;
  originalVideoUrl?: string;
  fps: number;
  frameCount: number;
  filterMode: 'clean' | 'rgb_split' | 'matrix_scan' | 'phosphor_crt' | 'dither_retro' | 'cyber_heat';
  dimensions: {
    width: number;
    height: number;
  };
  fileSizeKb: number;
  isCustomGenerated: boolean;
}

export interface AnomalyDocument {
  _id: string;
  _type: 'anomaly';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  hazardClass: 'Safe' | 'Euclid' | 'Keter' | 'Reality-Bending' | 'Unclassified';
  dangerLevel: number; // 1 - 100
  containmentIntegrity: number; // 0 - 100%
  quantumFrequencyMhz: number;
  originDimension: string;
  discoveredLocation: string;
  rawTranscript: string;
  decryptedCipher?: string;
  containmentProtocol?: string;
  detectedEntities?: string[];
  videoGlitchAsset?: SanityVideoGifAsset;
  sounddroneFrequency?: number;
  audioModulation?: 'sine' | 'sawtooth' | 'pulsed-noise' | 'sub-bass';
  fieldReportsCount: number;
  realityAnchors: number;
  workflow: WorkflowState;
}

export interface RealtimeMutationEvent {
  id: string;
  timestamp: string;
  documentId: string;
  mutationType: 'create' | 'patch' | 'transition' | 'publish' | 'webhook_dispatched';
  description: string;
  patchDetails?: Record<string, any>;
  actor: string;
}

export interface GroqQueryResult {
  query: string;
  ms: number;
  result: any;
  itemCount: number;
}
