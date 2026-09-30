# ChronoSyntax: The Anomaly Broadcast Network
### *Sanity App SDK & Autonomous Workflows Engine*

[![Sanity Content Lake](https://img.shields.io/badge/Sanity-Content%20Lake%20v3-F03E2F?style=flat-square&logo=sanity)](https://www.sanity.io/)
[![GROQ](https://img.shields.io/badge/Query%20Engine-GROQ-purple?style=flat-square)](https://www.sanity.io/docs/groq)
[![Gemini AI](https://img.shields.io/badge/Autonomous%20Agent-Gemini%203.8%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](LICENSE)

> Built for **Path Two: Vibe-Code Something Strange**
> *"Prompt your way to a working app. Any AI-native IDE, Next.js or Astro on the front, Sanity behind it. A rough app with an honest writeup beats a polished one with three sentences."*

---

## 🌌 1. The Strange Premise

Most headless CMS demos treat content like inert text: a blog post with a hero image, published once every fortnight. 

**ChronoSyntax** asks: *What if Sanity wasn't just a marketing database, but the real-time operational backbone of an occult research network monitoring multiversal breaches?*

In ChronoSyntax, anomalous signals intercepted across spacetime enter the Content Lake in an unclassified state. Autonomous AI agents run decryption routines on carrier frequencies, evaluate hazard classes (Safe, Euclid, Keter, Reality-Bending), and trigger automated external webhooks before handing off the draft to human chroniclers for cryptographic sign-off.

---

## ⚡ 2. Core Capabilities & Hackathon Bonus Points

### 🤖 Bonus Point 1: Workflows Modeled as Data (`workflow.state`)
Instead of hardcoded database status enums (`status: 'draft' | 'published'`), the entire editorial lifecycle is modeled as first-class data alongside documents:

```
[Raw Intercept (Draft)]
        │
        ▼ (Automated Transition)
[AI Agent Autonomous Enrichment] ──► Fired External Webhook Alert
        │                             (Logged to doc.workflow.webhookLogs)
        ▼ (Automated Transition)
[Polyglot & Reality Verification]
        │
        ▼ (Queue Assignment)
[Lead Chronicler Human Review] ──► Cryptographic SHA-256 Seal
        │
        ▼ (Director Approval)
[Director Sealed]
        │
        ▼ (Publish to Live Feed)
[Live Broadcast (App SDK Feed)]
```

- **Shared State Machine:** Both AI agents (`Agent-Gemini-Theta`) and human editors share the exact same state machine transition logic (`sanityLake.transitionWorkflowStage`).
- **External Webhooks:** The agent step fires real HTTP POST webhooks, recording latency and response codes directly into the document's immutable `webhookLogs` array.
- **Audit Trail History:** Every transition records who moved it (`agent | human | system`), the timestamp, and detailed justification notes.

---

### 📡 Bonus Point 2: The App SDK (Interactive Control Deck)
Rather than another read-only reader, ChronoSyntax features a live operational control deck with bidirectional mutations:

- **Optimistic Mutations (`client.patch`):** Operatives can inject stabilizing quantum resonance pulses and cast reality anchors directly from the deck.
- **Live Real-time Bus (`client.listen`):** Every mutation across the lake streams instantaneously into the deck's live event ticker.
- **Binaural Audio Synthesizer:** Converts document frequencies (e.g., 104.7 MHz or 432.0 Hz) into real-time binaural carrier drones using the browser's Web Audio API.
- **Field Report Dispatcher (`client.create`):** Field operatives dispatch new anomaly reports straight into the Lake, automatically enrolling them into Stage 1 of the workflow state machine.

---

### 🎞️ Custom Studio Input: Video-to-GIF Glitch Synthesizer
Replaces generic file uploaders with an interactive canvas frame buffer:
- Samples procedural glitch streams (Wormhole flux, CRT static, Abyssal bioluminescence) or user-uploaded video.
- Real-time hardware-accelerated shaders:
  - **Phosphor CRT:** 80s arcade green terminal glow & scanlines
  - **RGB Chromatic Aberration:** Stereoscopic color rift
  - **1-bit Bayer Dither:** Retro Macintosh grain
  - **Thermal Infrared:** False color radiant heat
- Samples frame sequences at target FPS (6–24 FPS), calculates compression metrics, and commits animated looping assets directly into the document schema.

---

### 🔍 Real-Time GROQ Query Studio
Includes an interactive GROQ query runner with:
- Sub-millisecond execution timing
- Custom projections (`*[_type == "anomaly"]{ title, hazardClass, "stage": workflow.currentStage }`)
- Sort ordering (`| order(dangerLevel desc)`)
- Aggregation expressions (`count(*[_type == "anomaly"])`)
- Formatted JSON inspector with one-click copy

---

## 🛠️ 3. Architecture & Project Structure

```
├── server.ts                             # Express backend + Vite dev middlewares + Gemini API
├── src/
│   ├── components/
│   │   ├── app-sdk/
│   │   │   └── IncidentControlDeck.tsx   # Interactive App SDK operational control deck
│   │   ├── components-lab/
│   │   │   └── VideoToGifStudio.tsx      # Custom Video-to-GIF glitch input component
│   │   ├── groq/
│   │   │   └── GroqPlayground.tsx        # Live GROQ query editor and JSON runner
│   │   ├── studio/
│   │   │   ├── DocumentEditor.tsx        # Sanity Studio Desk inspector & form editor
│   │   │   └── WorkflowBoard.tsx         # Visual Kanban state machine board
│   │   ├── writeup/
│   │   │   └── HonestWriteup.tsx         # Candid build retrospective & schemas
│   │   └── Navigation.tsx                # Studio navigation and Lake settings
│   ├── data/
│   │   └── initialData.ts                # Seed anomalies, workflows, and presets
│   ├── services/
│   │   ├── sanityClient.ts               # Sanity Content Lake, GROQ engine, mutations
│   │   └── workflowRunner.ts             # Agent enrichment and webhook runner
│   ├── types/
│   │   └── sanity.ts                     # TypeScript schemas for documents & workflows
│   ├── utils/
│   │   └── audioSynth.ts                 # Web Audio API carrier drone synthesizer
│   ├── App.tsx                           # Main application layout & view routing
│   └── main.tsx                          # React entry point
└── metadata.json                         # Project capabilities & permissions
```

---

## 🚀 4. Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/chronosyntax.git
cd chronosyntax

# 2. Install dependencies
npm install

# 3. Start development server (Full-stack Express + Vite)
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Environment Variables (Optional)
If you wish to enable live Gemini AI agent calls:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```
*(If unconfigured, the system automatically falls back to an internal occult neural engine so the app remains fully functional out of the box).*

---

## 📋 5. Exportable Sanity Studio v3 Schemas

To drop this architecture into your own Sanity Studio project, copy the schemas from the **"Honest Write-up & Schemas"** tab in the app:
- `schemas/anomaly.ts`: Document definition with danger scores, quantum carrier frequencies, and embedded workflow states.
- `schemas/workflowState.ts`: Object type modeling stage, assignee, and audit trail history.
- `components/VideoToGifInput.tsx`: React input component binding for `videoGlitchAsset`.

---

## 📜 License

Distributed under the Apache-2.0 License. Built for the Sanity Hackathon.
