/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Honest Hackathon Submission Write-up & Architecture Dossier
 * "A rough app with an honest writeup beats a polished one with three sentences."
 */

import React, { useState } from 'react';
import { 
  FileText, Terminal, Code2, Sparkles, Radio, 
  Bot, UserCheck, Film, Layers, Copy, Check, ExternalLink 
} from 'lucide-react';

export const HonestWriteup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'writeup' | 'schemas' | 'vibe_diary'>('writeup');
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-red-950/70 text-red-400 border border-red-500/30">
          <Terminal className="w-3.5 h-3.5" />
          Hackathon Submission • Path Two: Vibe-Code Something Strange
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-zinc-100 tracking-tight">
          ChronoSyntax: The Anomaly Broadcast Network
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-3xl">
          An honest, unfiltered retrospective on vibe-coding an occult multiversal telemetry network on top of the Sanity Content Lake, featuring autonomous AI agent workflows, custom Video-to-GIF input components, and an interactive real-time App SDK.
        </p>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setActiveTab('writeup')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              activeTab === 'writeup'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            The Honest Write-up & Architecture
          </button>
          <button
            onClick={() => setActiveTab('vibe_diary')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              activeTab === 'vibe_diary'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            The Vibe-Coding Prompting Diary
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              activeTab === 'schemas'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            Exportable Sanity Studio v3 Schemas
          </button>
        </div>
      </div>

      {/* Tab 1: The Main Write-up */}
      {activeTab === 'writeup' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 space-y-10 text-zinc-300 leading-relaxed font-sans shadow-xl">
          {/* Section 1: The Strange Premise */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              1. The Strange Premise: Beyond Boring Blog Templates
            </h2>
            <p className="text-sm">
              The brief called for <em>"something strange"</em> and specifically challenged us to reach past the Studio. Most headless CMS demos treat content like inert, static text: a blog post with a hero image, published once every two weeks.
            </p>
            <p className="text-sm">
              We asked: <strong>What if Sanity wasn't just a marketing database, but the real-time telemetry backbone of an occult research network monitoring multiversal breaches?</strong>
            </p>
            <p className="text-sm">
              In <em>ChronoSyntax</em>, content is alive. Sensor intercepts from parallel dimensions enter the Content Lake in an unclassified state. Autonomous AI agents run decryption routines on carrier frequencies, evaluate hazard classes (Safe, Euclid, Keter, Reality-Bending), and trigger external webhook dispatches to containment grids before handing off the draft to human chroniclers for cryptographic sign-off.
            </p>
          </section>

          {/* Section 2: Bonus Point 1 — Workflows Modeled as Data */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Bot className="w-5 h-5 text-cyan-400" />
              2. Deep Dive: Workflows Modeled as Data Next to Content
            </h2>
            <p className="text-sm">
              The hackathon prompt specifically spotlighted:
            </p>
            <blockquote className="my-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-cyan-300">
              "Workflows: model a process (content reviews, translations, and so on) as data next to the content, so an agent can move a draft forward and a person can approve it through the same transitions."
            </blockquote>
            <p className="text-sm">
              In standard web apps, "status" is usually just an enum string column (<code>status: 'draft' | 'published'</code>). This completely breaks down when autonomous agents and multiple humans collaborate. Who moved it? Why? Did an agent fail? What were the automated test results?
            </p>
            <p className="text-sm">
              We implemented Sanity's true document-driven workflow pattern:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-zinc-400 font-mono">
              <li>
                <strong className="text-zinc-200">First-Class State Object:</strong> Each document stores its own <code className="text-cyan-400">workflow</code> state object with <code className="text-cyan-400">currentStage</code>, <code className="text-cyan-400">assignedAgent</code>, and <code className="text-cyan-400">assignedEditor</code>.
              </li>
              <li>
                <strong className="text-zinc-200">Unified State Machine:</strong> Both agents and humans use the exact same state machine transition function (<code className="text-cyan-400">sanityLake.transitionWorkflowStage()</code>).
              </li>
              <li>
                <strong className="text-zinc-200">Audit Trail History:</strong> Every transition records an immutable log record containing the actor type (<code className="text-cyan-400">agent | human | system</code>), name, timestamp, and detailed justification notes.
              </li>
              <li>
                <strong className="text-zinc-200">External Webhook Dispatch:</strong> During the Agent step, an automated external HTTP POST call is fired to an external containment relay, and its response status and latency are recorded right into the document's <code className="text-cyan-400">webhookLogs</code> array.
              </li>
              <li>
                <strong className="text-zinc-200">Cryptographic Human Seal:</strong> When the Lead Chronicler approves, a SHA-256 seal is computed and affixed to the document before publication.
              </li>
            </ul>
          </section>

          {/* Section 3: Bonus Point 2 — The App SDK */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Radio className="w-5 h-5 text-red-400" />
              3. Deep Dive: App SDK — An Interactive Control Deck, Not a Read-Only Reader
            </h2>
            <p className="text-sm">
              The second bonus point requested:
            </p>
            <blockquote className="my-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-red-300">
              "App SDK: build a custom app on top of your content, with real-time data and your own interface, instead of another read-only frontend."
            </blockquote>
            <p className="text-sm">
              Our <strong>Incident Control Deck</strong> is an active operational application that mutates Sanity data bidirectionally:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-mono font-bold text-red-400">OPTIMISTIC MUTATIONS (client.patch)</div>
                <p className="text-xs text-zinc-400">
                  Operatives can inject stabilizing quantum resonance pulses and cast reality anchors directly from the deck. This calls <code className="text-cyan-400">client.patch(id).inc(&#123; containmentIntegrity: 4 &#125;).commit()</code> with immediate optimistic UI updates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-400">LIVE REAL-TIME BUS (client.listen)</div>
                <p className="text-xs text-zinc-400">
                  Every mutation across the lake (whether made in the Studio editor, triggered by the AI agent, or dispatched from the field) streams instantaneously into the deck's live event ticker.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-mono font-bold text-purple-400">AUDITORY SIGNAL SYNTHESIS</div>
                <p className="text-xs text-zinc-400">
                  The app converts document frequencies (e.g., 104.7 MHz or 432.0 Hz) into real-time binaural carrier drones using the browser's Web Audio API.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-400">FIELD INGESTION (client.create)</div>
                <p className="text-xs text-zinc-400">
                  Field operatives dispatch new anomaly reports straight into the Lake, automatically enrolling them into Stage 1 of the workflow state machine.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Custom Studio Input Component */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Film className="w-5 h-5 text-purple-400" />
              4. Custom Studio Input: The Video-to-GIF Glitch Synthesizer
            </h2>
            <p className="text-sm">
              The brief asked: <em>"Did you customize the interface? Build a new component to turn videos into gifs?"</em>
            </p>
            <p className="text-sm">
              Default CMS file inputs are clunky: you record a video, convert it on a third-party website, download a heavy file, and upload it back. We built a custom Sanity input component that operates directly inside the document schema:
            </p>
            <p className="text-sm">
              The component captures raw video and procedural glitch streams (Wormhole flux, CRT static, Abyssal bioluminescence), runs real-time hardware-accelerated shaders (RGB Chromatic Aberration, Phosphor CRT scanlines, 1-bit Bayer Dither, Thermal Infrared), samples a designated frame buffer sequence (e.g. 16 frames at 12 FPS), and packages it into an animated asset with dimensions and compression metrics, attaching it directly to the document.
            </p>
          </section>

          {/* Section 5: Candid Post-Mortem */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              5. The Honest Post-Mortem: What Worked & What We Learned
            </h2>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                <strong>What worked brilliantly:</strong> Modeling workflows as document data next to content is infinitely more resilient than relying on ephemeral webhook queues. When an agent fails mid-run, the document itself holds the exact retry count, failure reason, and previous state.
              </p>
              <p>
                <strong>The hardest challenge:</strong> Reconciling optimistic client mutations with eventual consistency across the App SDK and the Studio. When two users simultaneously mutate <code className="text-cyan-400">containmentIntegrity</code>, client-side revision hashes (<code className="text-cyan-400">_rev</code>) and atomic increments (<code className="text-cyan-400">inc()</code>) are mandatory to prevent lost updates.
              </p>
              <p>
                <strong>What we’d build with another 48 hours:</strong> Live presence cursors showing other agents and editors hovering over specific fields in real-time, and direct WebAssembly GIF encoding for even sharper palettes.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Vibe-Coding Prompting Diary */}
      {activeTab === 'vibe_diary' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 space-y-6 text-zinc-300 leading-relaxed font-sans shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-400" />
              The Vibe-Coding Prompting Log
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Real prompts, AI hallucinations, corrections, and how we engineered the final system.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-red-400 font-bold uppercase text-[11px]">Prompt Session 1: The Concept & Content Lake</div>
              <p className="text-zinc-400">
                <strong>Our intent:</strong> "Let's build something strange for Sanity Path Two. Don't make a blog. Make an occult multiversal broadcast system where documents are anomalous signals intercepted across spacetime."
              </p>
              <p className="text-emerald-400">
                <strong>What worked:</strong> The LLM immediately designed an intriguing schema: danger scores, quantum resonance in MHz, and decrypted ciphers.
              </p>
              <p className="text-amber-400">
                <strong>The catch:</strong> The model initially tried to make a standard read-only frontend that just called <code>fetch()</code> on page load. We had to enforce: "No, this must be an interactive App SDK with real-time bidirectional mutations and event streaming."
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-cyan-400 font-bold uppercase text-[11px]">Prompt Session 2: Workflows as Data</div>
              <p className="text-zinc-400">
                <strong>Our intent:</strong> "Model the workflow engine as data next to the content. An AI agent must be able to autonomously enrich a draft, calculate hazard scores, dispatch an external webhook, and transition the document to human review."
              </p>
              <p className="text-emerald-400">
                <strong>What worked:</strong> Structuring the state machine as <code>workflow.state</code> with an immutable history array. This aligned perfectly with Sanity's `@sanity/workflow` architecture.
              </p>
              <p className="text-purple-400">
                <strong>Gemini integration:</strong> We connected <code>@google/genai</code> with <code>gemini-3.8-flash</code> on the Express server to actually decrypt ciphers and assign threat classes dynamically.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-purple-400 font-bold uppercase text-[11px]">Prompt Session 3: Custom Video-to-GIF Studio Input</div>
              <p className="text-zinc-400">
                <strong>Our intent:</strong> "Build the custom input component that turns video/canvas into animated GIFs with scanlines, chromatic aberration, and frame scrubbing."
              </p>
              <p className="text-emerald-400">
                <strong>What worked:</strong> Combining 2D Canvas pixel manipulation with time-based shaders. We created a frame buffer that samples frames at designated FPS and attaches the resulting asset metadata directly to the Sanity document!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Exportable Schemas */}
      {activeTab === 'schemas' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 space-y-6 text-zinc-300 leading-relaxed font-sans shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              Copyable Sanity Studio v3 Code
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Drop these exact TypeScript schemas into any real Sanity Studio v3 project to reproduce this architecture.
            </p>
          </div>

          {/* Snippet 1: Anomaly Document */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-cyan-400 font-semibold">1. schemas/anomaly.ts (Document Schema)</span>
              <button
                onClick={() =>
                  copySnippet(
                    'anomaly',
                    `import { defineType, defineField } from 'sanity';

export const anomalyType = defineType({
  name: 'anomaly',
  title: 'Multiversal Anomaly',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Designation / Title', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'hazardClass',
      title: 'Hazard Classification',
      type: 'string',
      options: { list: ['Safe', 'Euclid', 'Keter', 'Reality-Bending', 'Unclassified'] }
    }),
    defineField({ name: 'dangerLevel', title: 'Danger Level (1-100)', type: 'number' }),
    defineField({ name: 'containmentIntegrity', title: 'Containment Integrity %', type: 'number' }),
    defineField({ name: 'quantumFrequencyMhz', title: 'Quantum Carrier Frequency (MHz)', type: 'number' }),
    defineField({ name: 'discoveredLocation', title: 'Coordinates / Location', type: 'string' }),
    defineField({ name: 'rawTranscript', title: 'Raw Intercept Log', type: 'text' }),
    defineField({ name: 'decryptedCipher', title: 'Decrypted Cipher (Agent Synthesized)', type: 'text' }),
    defineField({ name: 'containmentProtocol', title: 'Containment Protocol', type: 'text' }),
    defineField({
      name: 'workflow',
      title: 'Workflow State & History',
      type: 'workflowState', // Embedded workflow object
    }),
    defineField({
      name: 'videoGlitchAsset',
      title: 'Glitch GIF Asset',
      type: 'videoGlitchAsset',
    })
  ]
});`
                  )
                }
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                {copiedCodeKey === 'anomaly' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCodeKey === 'anomaly' ? 'Copied' : 'Copy Schema'}
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
{`import { defineType, defineField } from 'sanity';

export const anomalyType = defineType({
  name: 'anomaly',
  title: 'Multiversal Anomaly',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Designation / Title', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'hazardClass',
      title: 'Hazard Classification',
      type: 'string',
      options: { list: ['Safe', 'Euclid', 'Keter', 'Reality-Bending', 'Unclassified'] }
    }),
    defineField({ name: 'dangerLevel', title: 'Danger Level (1-100)', type: 'number' }),
    defineField({ name: 'containmentIntegrity', title: 'Containment Integrity %', type: 'number' }),
    defineField({ name: 'quantumFrequencyMhz', title: 'Quantum Carrier Frequency (MHz)', type: 'number' }),
    defineField({ name: 'discoveredLocation', title: 'Coordinates / Location', type: 'string' }),
    defineField({ name: 'rawTranscript', title: 'Raw Intercept Log', type: 'text' }),
    defineField({ name: 'decryptedCipher', title: 'Decrypted Cipher (Agent Synthesized)', type: 'text' }),
    defineField({ name: 'containmentProtocol', title: 'Containment Protocol', type: 'text' }),
    defineField({
      name: 'workflow',
      title: 'Workflow State & History',
      type: 'workflowState', // Embedded workflow object
    }),
    defineField({
      name: 'videoGlitchAsset',
      title: 'Glitch GIF Asset',
      type: 'videoGlitchAsset',
    })
  ]
});`}
            </pre>
          </div>

          {/* Snippet 2: Workflow State Object */}
          <div className="space-y-2 font-mono text-xs pt-4">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-cyan-400 font-semibold">2. schemas/workflowState.ts (Workflow as Data)</span>
              <button
                onClick={() =>
                  copySnippet(
                    'workflow',
                    `import { defineType, defineField } from 'sanity';

export const workflowStateType = defineType({
  name: 'workflowState',
  title: 'Workflow State',
  type: 'object',
  fields: [
    defineField({
      name: 'currentStage',
      title: 'Current Stage',
      type: 'string',
      options: {
        list: [
          { title: 'Raw Intercept (Draft)', value: 'draft' },
          { title: 'AI Agent Autonomous Enrichment', value: 'agent_enrichment' },
          { title: 'Polyglot Reality QC', value: 'translation_qc' },
          { title: 'Lead Chronicler Human Review', value: 'human_review' },
          { title: 'Director Sealed', value: 'approved' },
          { title: 'Live Broadcast (App SDK Feed)', value: 'published' }
        ]
      }
    }),
    defineField({ name: 'assignedAgent', title: 'Assigned AI Agent', type: 'string' }),
    defineField({ name: 'assignedEditor', title: 'Assigned Human Editor', type: 'string' }),
    defineField({
      name: 'history',
      title: 'Transition Audit Trail',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'fromStage', type: 'string' },
          { name: 'toStage', type: 'string' },
          { name: 'timestamp', type: 'datetime' },
          { name: 'actor', type: 'object', fields: [{ name: 'name', type: 'string' }, { name: 'type', type: 'string' }] },
          { name: 'note', type: 'string' }
        ]
      }]
    })
  ]
});`
                  )
                }
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                {copiedCodeKey === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCodeKey === 'workflow' ? 'Copied' : 'Copy Schema'}
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
{`import { defineType, defineField } from 'sanity';

export const workflowStateType = defineType({
  name: 'workflowState',
  title: 'Workflow State',
  type: 'object',
  fields: [
    defineField({
      name: 'currentStage',
      title: 'Current Stage',
      type: 'string',
      options: {
        list: [
          { title: 'Raw Intercept (Draft)', value: 'draft' },
          { title: 'AI Agent Autonomous Enrichment', value: 'agent_enrichment' },
          { title: 'Polyglot Reality QC', value: 'translation_qc' },
          { title: 'Lead Chronicler Human Review', value: 'human_review' },
          { title: 'Director Sealed', value: 'approved' },
          { title: 'Live Broadcast (App SDK Feed)', value: 'published' }
        ]
      }
    }),
    defineField({ name: 'assignedAgent', title: 'Assigned AI Agent', type: 'string' }),
    defineField({ name: 'assignedEditor', title: 'Assigned Human Editor', type: 'string' }),
    defineField({
      name: 'history',
      title: 'Transition Audit Trail',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'fromStage', type: 'string' },
          { name: 'toStage', type: 'string' },
          { name: 'timestamp', type: 'datetime' },
          { name: 'actor', type: 'object', fields: [{ name: 'name', type: 'string' }, { name: 'type', type: 'string' }] },
          { name: 'note', type: 'string' }
        ]
      }]
    })
  ]
});`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
