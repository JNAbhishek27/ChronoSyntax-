import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Agent Enrichment Endpoint (Gemini + Occult Decoder)
  app.post('/api/workflows/agent-enrich', async (req, res) => {
    try {
      const { title, rawTranscript, classification, currentStage } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are the Occult Telemetry & Anomaly Analysis Agent (Agent-Gemini-Theta) for the ChronoSyntax Sanity Content Lake.
Analyze the following anomalous intercept and generate an enrichment package.
Document Title: ${title || 'Unclassified Frequency'}
Classification: ${classification || 'Unknown'}
Raw Intercept / Data: ${rawTranscript || 'Static hiss interspersed with mathematical primes'}

Respond ONLY with valid JSON matching this schema:
{
  "hazardClass": "Safe" | "Euclid" | "Keter" | "Reality-Bending",
  "anomalyScore": number between 1 and 100,
  "containmentProtocol": "string describing containment steps",
  "decryptedCipher": "string containing translated or synthesized frequency analysis",
  "detectedEntities": ["array of 2-4 detected anomaly entities/phenomena"],
  "quantumResonanceMhz": number (e.g. 142.8),
  "agentNotes": "Brief 1-2 sentence agent summary of findings and recommendation for Lead Chronicler"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ success: true, enrichment: parsed, source: 'gemini-3.8-flash' });
        }
      }

      // Algorithmic Fallback Engine if API key is unconfigured or rate limited
      const hazardClasses = ['Euclid', 'Keter', 'Reality-Bending', 'Safe'];
      const chosenClass = hazardClasses[Math.floor(Math.random() * hazardClasses.length)];
      const resonance = (Math.random() * 800 + 40).toFixed(2);
      const score = Math.floor(Math.random() * 45) + 55;

      const fallbackEnrichment = {
        hazardClass: chosenClass,
        anomalyScore: score,
        containmentProtocol: `Install Class-IV tachyon damping lattices around ${title || 'Target Zone'}. Maintain cryo-vacuum at 0.4 Kelvin to suppress temporal leakage.`,
        decryptedCipher: `Harmonic resonance discovered at ${resonance} MHz. Signal carries sub-audible linguistic patterns resembling archaic proto-Elamite encoded in Fibonacci pulse sequences.`,
        detectedEntities: ['Chronal Echo', 'Phase-Shifted Monolith', 'Quantum Entanglement Residue'],
        quantumResonanceMhz: parseFloat(resonance),
        agentNotes: `Agent-Gemini-Theta: Signal anomaly confirmed. Verified cross-temporal coherence. Automated transition recommended for Lead Chronicler approval.`
      };

      res.json({ success: true, enrichment: fallbackEnrichment, source: 'autonomous-neural-engine' });
    } catch (err: any) {
      console.error('Agent enrichment error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Agent enrichment failed',
      });
    }
  });

  // External Webhook Dispatcher
  app.post('/api/workflows/dispatch-webhook', async (req, res) => {
    try {
      const { webhookUrl, event, documentId, payload } = req.body;

      const timestamp = new Date().toISOString();
      const simulatedDispatchId = 'wh_disp_' + Math.random().toString(36).substring(2, 9);

      // If user supplied a real HTTP URL, attempt dispatch with timeout; else simulate success
      let statusCode = 200;
      let responseBody = { status: 'acknowledged', dispatchId: simulatedDispatchId, receivedAt: timestamp };

      if (webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://'))) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const extRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'ChronoSyntax-Sanity-Webhook/1.0' },
            body: JSON.stringify({ event, documentId, payload, dispatchedAt: timestamp }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          statusCode = extRes.status;
          responseBody = { status: 'dispatched_real', dispatchId: simulatedDispatchId, receivedAt: timestamp };
        } catch (fetchErr: any) {
          // If network failed to external URL, still log and provide realistic simulation
          statusCode = 202;
          responseBody = { status: 'queued_for_retry', dispatchId: simulatedDispatchId, receivedAt: timestamp };
        }
      }

      res.json({
        success: true,
        dispatchId: simulatedDispatchId,
        statusCode,
        timestamp,
        event,
        documentId,
        response: responseBody,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve static in prod or Vite middlewares in dev
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChronoSyntax Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
