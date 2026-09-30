/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sanity Content Lake Client & App SDK Implementation
 * Provides GROQ parsing, live event streaming, optimistic mutations,
 * and optional proxy to real Sanity Cloud projects.
 */

import { AnomalyDocument, RealtimeMutationEvent, WorkflowStageId } from '../types/sanity';
import { INITIAL_ANOMALIES } from '../data/initialData';

export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
  useCdn: boolean;
}

export type ListenerCallback = (event: RealtimeMutationEvent) => void;

class SanityClientLake {
  private documents: AnomalyDocument[] = [];
  private listeners: Set<ListenerCallback> = new Set();
  private mutationHistory: RealtimeMutationEvent[] = [];
  private config: SanityConfig = {
    projectId: 'chronosyntax-lake-vibe',
    dataset: 'production',
    apiVersion: '2026-03-30',
    useCdn: false,
  };

  constructor() {
    // Load from localStorage or initial seed
    const saved = typeof window !== 'undefined' ? localStorage.getItem('chronosyntax_lake_docs') : null;
    if (saved) {
      try {
        this.documents = JSON.parse(saved);
      } catch (e) {
        this.documents = [...INITIAL_ANOMALIES];
      }
    } else {
      this.documents = [...INITIAL_ANOMALIES];
    }
  }

  public getConfig(): SanityConfig {
    return { ...this.config };
  }

  public setConfig(newConfig: Partial<SanityConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getDocuments(): AnomalyDocument[] {
    return [...this.documents];
  }

  public getDocumentById(id: string): AnomalyDocument | undefined {
    return this.documents.find((d) => d._id === id);
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chronosyntax_lake_docs', JSON.stringify(this.documents));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }
  }

  private emitMutation(event: Omit<RealtimeMutationEvent, 'id' | 'timestamp'>) {
    const fullEvent: RealtimeMutationEvent = {
      ...event,
      id: 'mut_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    this.mutationHistory.unshift(fullEvent);
    if (this.mutationHistory.length > 50) this.mutationHistory.pop();

    this.listeners.forEach((callback) => {
      try {
        callback(fullEvent);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  public subscribe(callback: ListenerCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getMutationHistory(): RealtimeMutationEvent[] {
    return [...this.mutationHistory];
  }

  /**
   * GROQ Query Parser and Executor
   * Supports standard GROQ idioms:
   * *[_type == "anomaly"]
   * *[_type == "anomaly" && hazardClass == "Keter"]
   * *[_type == "anomaly" && workflow.currentStage == "published"]
   * order(dangerLevel desc)
   * [0...5]
   * count(*[_type == "anomaly"])
   * Projections: { title, dangerLevel, "stage": workflow.currentStage }
   */
  public async fetch(query: string, params: Record<string, any> = {}): Promise<any> {
    const startTime = performance.now();
    const trimmed = query.trim();

    // Check if count(*)
    if (trimmed.startsWith('count(')) {
      const inner = trimmed.slice(6, -1).trim();
      const docs = this.filterDocuments(inner, params);
      return docs.length;
    }

    let docs = this.filterDocuments(trimmed, params);

    // Check for order clause: | order(fieldName asc/desc)
    const orderMatch = trimmed.match(/\|\s*order\(([\w.]+)\s*(asc|desc)?\)/i);
    if (orderMatch) {
      const field = orderMatch[1];
      const direction = (orderMatch[2] || 'asc').toLowerCase();
      docs = [...docs].sort((a: any, b: any) => {
        const valA = this.getNestedValue(a, field);
        const valB = this.getNestedValue(b, field);
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        const comp = valA > valB ? 1 : -1;
        return direction === 'desc' ? -comp : comp;
      });
    }

    // Check for slice clause: [start...end] or [index]
    const sliceMatch = trimmed.match(/\[(\d+)\.\.\.(\d+)\]/);
    if (sliceMatch) {
      const start = parseInt(sliceMatch[1], 10);
      const end = parseInt(sliceMatch[2], 10);
      docs = docs.slice(start, end);
    } else {
      const singleIndexMatch = trimmed.match(/\[(\d+)\]$/);
      if (singleIndexMatch) {
        const idx = parseInt(singleIndexMatch[1], 10);
        const single = docs[idx] || null;
        return single;
      }
    }

    // Check for projection: { field1, "alias": field2, ... }
    const projMatch = trimmed.match(/\{([\s\S]+)\}$/);
    if (projMatch) {
      const projectionBody = projMatch[1];
      docs = docs.map((doc) => this.applyProjection(doc, projectionBody));
    }

    return docs;
  }

  private filterDocuments(query: string, params: Record<string, any>): any[] {
    let result = [...this.documents];

    if (query.includes('_type == "anomaly"') || query.startsWith('*')) {
      // Extract filter conditions inside [...]
      const filterMatch = query.match(/\*\[([\s\S]*?)\]/);
      if (filterMatch) {
        const conditionsStr = filterMatch[1];
        const conditions = conditionsStr.split('&&').map((c) => c.trim());

        result = result.filter((doc) => {
          return conditions.every((cond) => {
            if (cond.includes('_type == "anomaly"')) return doc._type === 'anomaly';

            // Check field == "value"
            const eqMatch = cond.match(/([\w.]+)\s*==\s*"([^"]+)"/);
            if (eqMatch) {
              const field = eqMatch[1];
              const val = eqMatch[2];
              return this.getNestedValue(doc, field) === val;
            }

            // Check field == $param
            const paramMatch = cond.match(/([\w.]+)\s*==\s*\$([\w]+)/);
            if (paramMatch) {
              const field = paramMatch[1];
              const paramKey = paramMatch[2];
              return this.getNestedValue(doc, field) === params[paramKey];
            }

            // Check field >= number or > number
            const numMatch = cond.match(/([\w.]+)\s*(>=|>|<=|<)\s*(\d+(\.\d+)?)/);
            if (numMatch) {
              const field = numMatch[1];
              const op = numMatch[2];
              const numVal = parseFloat(numMatch[3]);
              const docVal = this.getNestedValue(doc, field);
              if (typeof docVal !== 'number') return false;
              if (op === '>') return docVal > numVal;
              if (op === '>=') return docVal >= numVal;
              if (op === '<') return docVal < numVal;
              if (op === '<=') return docVal <= numVal;
            }

            // Check defined(field)
            const defMatch = cond.match(/defined\(([\w.]+)\)/);
            if (defMatch) {
              const field = defMatch[1];
              const val = this.getNestedValue(doc, field);
              return val !== undefined && val !== null;
            }

            return true;
          });
        });
      }
    }

    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[part];
    }
    return curr;
  }

  private applyProjection(doc: any, projectionBody: string): Record<string, any> {
    const projected: Record<string, any> = {};
    const lines = projectionBody.split(',').map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (line.includes(':')) {
        const [aliasPart, pathPart] = line.split(':').map((s) => s.trim().replace(/^"|"$/g, ''));
        projected[aliasPart] = this.getNestedValue(doc, pathPart);
      } else {
        const cleanField = line.replace(/^"|"$/g, '');
        projected[cleanField] = this.getNestedValue(doc, cleanField);
      }
    }
    return projected;
  }

  /**
   * Transactional Patch Builder (Sanity Client API pattern)
   * client.patch(id).set({ ... }).inc({ ... }).commit()
   */
  public patch(id: string) {
    const ops: {
      setOps?: Record<string, any>;
      incOps?: Record<string, number>;
      appendOps?: { field: string; items: any[] };
    } = {};

    const builder = {
      set: (data: Record<string, any>) => {
        ops.setOps = { ...ops.setOps, ...data };
        return builder;
      },
      inc: (data: Record<string, number>) => {
        ops.incOps = { ...ops.incOps, ...data };
        return builder;
      },
      append: (field: string, items: any[]) => {
        ops.appendOps = { field, items };
        return builder;
      },
      commit: async (options: { actor?: string; description?: string } = {}) => {
        const index = this.documents.findIndex((d) => d._id === id);
        if (index === -1) {
          throw new Error(`Document with ID "${id}" not found in Content Lake.`);
        }

        const doc = { ...this.documents[index] };

        if (ops.setOps) {
          Object.entries(ops.setOps).forEach(([key, val]) => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              (doc as any)[parent] = {
                ...((doc as any)[parent] || {}),
                [child]: val,
              };
            } else {
              (doc as any)[key] = val;
            }
          });
        }

        if (ops.incOps) {
          Object.entries(ops.incOps).forEach(([key, delta]) => {
            const current = (doc as any)[key] ?? 0;
            (doc as any)[key] = current + delta;
          });
        }

        if (ops.appendOps) {
          const { field, items } = ops.appendOps;
          const currentArr = Array.isArray((doc as any)[field]) ? (doc as any)[field] : [];
          (doc as any)[field] = [...currentArr, ...items];
        }

        doc._updatedAt = new Date().toISOString();
        doc._rev = 'rev_' + Math.random().toString(36).substring(2, 10);

        this.documents[index] = doc;
        this.persist();

        this.emitMutation({
          documentId: id,
          mutationType: 'patch',
          description: options.description || `Patched ${id}`,
          patchDetails: ops,
          actor: options.actor || 'Sanity Client SDK',
        });

        return doc;
      },
    };

    return builder;
  }

  /**
   * Transition Document Workflow Stage (The core Workflows-as-Data primitive)
   */
  public async transitionWorkflowStage(
    documentId: string,
    toStage: WorkflowStageId,
    actor: { type: 'agent' | 'human' | 'system'; name: string },
    note: string,
    extraUpdates: Partial<AnomalyDocument> = {}
  ): Promise<AnomalyDocument> {
    const doc = this.getDocumentById(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found.`);

    const fromStage = doc.workflow.currentStage;
    const transitionRecord = {
      id: 'trans_' + Math.random().toString(36).substring(2, 9),
      fromStage,
      toStage,
      timestamp: new Date().toISOString(),
      actor,
      note,
    };

    const updatedWorkflow = {
      ...doc.workflow,
      currentStage: toStage,
      history: [transitionRecord, ...doc.workflow.history],
    };

    if (toStage === 'approved' || toStage === 'published') {
      updatedWorkflow.humanSignOff = {
        approvedBy: actor.name,
        approvedAt: new Date().toISOString(),
        signatureHash: 'sig_sha256_' + Math.random().toString(36).substring(2, 12),
        notes: note,
      };
    }

    const updatedDoc: AnomalyDocument = {
      ...doc,
      ...extraUpdates,
      workflow: updatedWorkflow,
      _updatedAt: new Date().toISOString(),
      _rev: 'rev_' + Math.random().toString(36).substring(2, 10),
    };

    const index = this.documents.findIndex((d) => d._id === documentId);
    this.documents[index] = updatedDoc;
    this.persist();

    this.emitMutation({
      documentId,
      mutationType: toStage === 'published' ? 'publish' : 'transition',
      description: `Workflow Transition: ${fromStage} -> ${toStage}`,
      actor: `${actor.type.toUpperCase()}: ${actor.name}`,
    });

    return updatedDoc;
  }

  /**
   * Create New Document into Content Lake
   */
  public async create(newDocData: Partial<AnomalyDocument>): Promise<AnomalyDocument> {
    const id = newDocData._id || 'anomaly-' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    const fullDoc: AnomalyDocument = {
      _id: id,
      _type: 'anomaly',
      _createdAt: now,
      _updatedAt: now,
      _rev: 'rev_' + Math.random().toString(36).substring(2, 10),
      title: newDocData.title || 'Untitled Anomaly Intercept',
      slug: newDocData.slug || { _type: 'slug', current: 'anomaly-' + Date.now() },
      hazardClass: newDocData.hazardClass || 'Unclassified',
      dangerLevel: newDocData.dangerLevel || 45,
      containmentIntegrity: newDocData.containmentIntegrity || 80,
      quantumFrequencyMhz: newDocData.quantumFrequencyMhz || 142.0,
      originDimension: newDocData.originDimension || 'Dimension-Theta',
      discoveredLocation: newDocData.discoveredLocation || 'Unknown Coordinates',
      rawTranscript: newDocData.rawTranscript || 'Static carrier signal detected.',
      decryptedCipher: newDocData.decryptedCipher,
      containmentProtocol: newDocData.containmentProtocol,
      detectedEntities: newDocData.detectedEntities || ['Unknown Anomaly'],
      videoGlitchAsset: newDocData.videoGlitchAsset,
      sounddroneFrequency: newDocData.sounddroneFrequency || 142.0,
      audioModulation: newDocData.audioModulation || 'sine',
      fieldReportsCount: 1,
      realityAnchors: 5,
      workflow: {
        _id: 'workflow.' + id,
        _type: 'workflow.state',
        documentId: id,
        currentStage: 'draft',
        assignedAgent: 'Agent-Gemini-Theta',
        automatedChecksPassed: false,
        webhookLogs: [],
        history: [
          {
            id: 'init_' + Math.random().toString(36).substring(2, 8),
            fromStage: 'draft',
            toStage: 'draft',
            timestamp: now,
            actor: { type: 'human', name: 'Field Operator Intercept' },
            note: 'Initial raw telemetry ingestion via App SDK field report.',
          },
        ],
      },
    };

    this.documents.unshift(fullDoc);
    this.persist();

    this.emitMutation({
      documentId: id,
      mutationType: 'create',
      description: `Created anomaly document "${fullDoc.title}"`,
      actor: 'App SDK Field Reporter',
    });

    return fullDoc;
  }

  /**
   * Reset to initial dataset
   */
  public resetToInitial() {
    this.documents = JSON.parse(JSON.stringify(INITIAL_ANOMALIES));
    this.persist();
    this.emitMutation({
      documentId: 'all',
      mutationType: 'patch',
      description: 'Reset Content Lake to factory test anomalies',
      actor: 'System Admin',
    });
  }
}

export const sanityLake = new SanityClientLake();
