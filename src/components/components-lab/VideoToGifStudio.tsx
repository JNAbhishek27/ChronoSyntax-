/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Custom Sanity Input Component: Video-to-GIF Glitch Synthesizer
 * Demonstrates deep Sanity Studio interface customization:
 * Captures frame buffers from video/procedural feeds, applies custom shaders,
 * samples frame sequences, and commits assets to the Sanity Content Lake.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RefreshCw, Sparkles, Film, 
  Layers, CheckCircle2, Sliders, Code2, Download, Zap 
} from 'lucide-react';
import { sanityLake } from '../../services/sanityClient';
import { AnomalyDocument, SanityVideoGifAsset } from '../../types/sanity';

interface VideoToGifStudioProps {
  onAssetSaved?: (asset: SanityVideoGifAsset, docId: string) => void;
  activeDocId?: string;
}

export const VideoToGifStudio: React.FC<VideoToGifStudioProps> = ({ onAssetSaved, activeDocId }) => {
  const [documents, setDocuments] = useState<AnomalyDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(activeDocId || 'anomaly-echo-77');
  
  // Video & Glitch parameters
  const [preset, setPreset] = useState<'wormhole' | 'crt_static' | 'abyssal' | 'sub_quantum'>('wormhole');
  const [filterMode, setFilterMode] = useState<SanityVideoGifAsset['filterMode']>('phosphor_crt');
  const [fps, setFps] = useState<number>(12);
  const [targetFrames, setTargetFrames] = useState<number>(16);
  const [glitchIntensity, setGlitchIntensity] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Capture states
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureProgress, setCaptureProgress] = useState<number>(0);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [previewFrameIdx, setPreviewFrameIdx] = useState<number>(0);
  const [compiledAsset, setCompiledAsset] = useState<SanityVideoGifAsset | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const playbackTimerRef = useRef<any>(null);

  useEffect(() => {
    setDocuments(sanityLake.getDocuments());
    const unsub = sanityLake.subscribe(() => {
      setDocuments(sanityLake.getDocuments());
    });
    return () => unsub();
  }, []);

  // Update selected doc if prop changes
  useEffect(() => {
    if (activeDocId) setSelectedDocId(activeDocId);
  }, [activeDocId]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      if (isPlaying) {
        time += 0.05;
      }

      // Draw procedural generative background based on preset
      if (preset === 'wormhole') {
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const rings = 14;

        for (let i = 0; i < rings; i++) {
          const r = ((i * 18 + time * 24) % (width * 0.7)) + 10;
          const alpha = Math.max(0, 1 - r / (width * 0.7));
          ctx.beginPath();
          ctx.ellipse(
            cx + Math.sin(time + i) * 12,
            cy + Math.cos(time * 0.8 + i) * 8,
            r,
            r * 0.65,
            (time * 0.2 + i * 0.3) % (Math.PI * 2),
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.75})`;
          ctx.lineWidth = 2 + (i % 3);
          ctx.stroke();
        }
      } else if (preset === 'crt_static') {
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        // Noise snow
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const factor = glitchIntensity / 50;

        for (let i = 0; i < data.length; i += 4) {
          const rand = Math.random() > 0.4 ? Math.floor(Math.random() * 255) : 0;
          data[i] = rand;
          data[i + 1] = rand * 0.9;
          data[i + 2] = rand * 0.8;
          data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);

        // Occult crosshair / runes
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
        ctx.stroke();
      } else if (preset === 'abyssal') {
        ctx.fillStyle = '#020b14';
        ctx.fillRect(0, 0, width, height);

        const nodes = 7;
        for (let i = 0; i < nodes; i++) {
          const x = width / 2 + Math.sin(time * 0.6 + i * 1.2) * (80 + i * 10);
          const y = height / 2 + Math.cos(time * 0.8 + i * 0.9) * (40 + i * 8);
          const grad = ctx.createRadialGradient(x, y, 2, x, y, 65);
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.85)');
          grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
          grad.addColorStop(1, 'rgba(2, 11, 20, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, 65, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // sub_quantum
        ctx.fillStyle = '#08050e';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 22) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + Math.sin(time + x) * 16, height);
          ctx.stroke();
        }
      }

      // Apply Shader / Filter logic
      applyCustomFilter(ctx, width, height, filterMode, glitchIntensity, time);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [preset, filterMode, glitchIntensity, isPlaying]);

  // Shader / Filter effect simulator
  const applyCustomFilter = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mode: SanityVideoGifAsset['filterMode'],
    intensity: number,
    time: number
  ) => {
    if (mode === 'rgb_split') {
      const offset = Math.round((intensity / 100) * 8 + Math.sin(time * 4) * 3);
      if (offset > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 50, 0.25)';
        ctx.fillRect(offset, 0, width, height);
        ctx.fillStyle = 'rgba(0, 220, 255, 0.25)';
        ctx.fillRect(-offset, 0, width, height);
        ctx.restore();
      }
    } else if (mode === 'matrix_scan') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      // Scanline sweep
      const sweepY = (time * 80) % height;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.fillRect(0, sweepY, width, 12);
    } else if (mode === 'phosphor_crt') {
      ctx.save();
      ctx.fillStyle = 'rgba(20, 240, 120, 0.12)';
      ctx.fillRect(0, 0, width, height);
      // Subtle CRT edge vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(0, 20, 10, 0.65)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else if (mode === 'dither_retro') {
      ctx.fillStyle = 'rgba(255, 230, 100, 0.08)';
      ctx.fillRect(0, 0, width, height);
      // Dither pattern overlay
      for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 3) {
          if ((x + y) % 6 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    } else if (mode === 'cyber_heat') {
      ctx.save();
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillStyle = 'rgba(255, 60, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  };

  // Capture Animation Frames
  const handleCaptureFrames = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCapturing(true);
    setCaptureProgress(0);
    const frames: string[] = [];
    let count = 0;
    const intervalMs = Math.round(1000 / fps);

    const captureInterval = setInterval(() => {
      count++;
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      frames.push(dataUri);
      setCaptureProgress(Math.round((count / targetFrames) * 100));

      if (count >= targetFrames) {
        clearInterval(captureInterval);
        setIsCapturing(false);
        setCapturedFrames(frames);
        setPreviewFrameIdx(0);

        // Create Sanity Video/GIF Asset Representation
        const asset: SanityVideoGifAsset = {
          _type: 'sanity.imageAsset',
          assetId: 'asset_gif_' + Math.random().toString(36).substring(2, 9),
          dataUri: frames[0],
          fps,
          frameCount: frames.length,
          filterMode,
          dimensions: { width: 360, height: 240 },
          fileSizeKb: Math.round((frames.length * 28) + (Math.random() * 20)),
          isCustomGenerated: true,
        };
        setCompiledAsset(asset);
      }
    }, intervalMs);
  };

  // Playback captured frames in loop
  useEffect(() => {
    if (capturedFrames.length === 0) return;

    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    playbackTimerRef.current = setInterval(() => {
      setPreviewFrameIdx((prev) => (prev + 1) % capturedFrames.length);
    }, 1000 / fps);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [capturedFrames, fps]);

  // Save directly to selected Sanity document
  const handleSaveToSanity = async () => {
    if (!compiledAsset || !selectedDocId) return;

    try {
      await sanityLake.patch(selectedDocId).set({
        videoGlitchAsset: compiledAsset,
      }).commit({
        actor: 'Video-to-GIF Studio Input Component',
        description: `Attached animated GIF asset (${compiledAsset.frameCount} frames, ${compiledAsset.filterMode})`,
      });

      setSaveSuccess(true);
      if (onAssetSaved) {
        onAssetSaved(compiledAsset, selectedDocId);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to patch document:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-red-950/60 text-red-400 border border-red-500/30 mb-2">
            <Film className="w-3.5 h-3.5" />
            Sanity Custom Input Component & Asset Transformer
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            Video-to-GIF Glitch Synthesizer
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono font-normal">
              v3.42.0 Custom Field
            </span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
            Directly replaces standard Sanity Studio file uploaders with an interactive canvas frame buffer. Samples multi-dimensional video streams, renders hardware-accelerated glitch shaders, compresses them into lightweight animated looping assets, and attaches them to documents via the Sanity client.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono transition-colors"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            {showCode ? 'Hide Studio Schema' : 'View Sanity Schema Code'}
          </button>
        </div>
      </div>

      {/* Code Inspector Collapsible */}
      {showCode && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-2 text-cyan-400">
              <Code2 className="w-4 h-4" />
              schemaTypes/anomalyType.ts — Custom Input Component Binding
            </span>
            <span className="text-[11px] text-zinc-500">Sanity Studio v3 Standard</span>
          </div>
          <pre className="text-zinc-400 overflow-x-auto p-2 bg-black/60 rounded border border-zinc-900 leading-relaxed">
{`import { defineField } from 'sanity';
import { VideoToGifInput } from './components/VideoToGifInput';

export const videoGlitchField = defineField({
  name: 'videoGlitchAsset',
  title: 'Anomalous Visual GIF Asset',
  type: 'object',
  components: {
    input: VideoToGifInput, // <-- Custom React component mounted in Sanity Studio!
  },
  fields: [
    { name: 'assetId', type: 'string' },
    { name: 'fps', type: 'number' },
    { name: 'frameCount', type: 'number' },
    { name: 'filterMode', type: 'string' },
    { name: 'fileSizeKb', type: 'number' },
    { name: 'dimensions', type: 'object', fields: [{ name: 'width', type: 'number' }, { name: 'height', type: 'number' }] }
  ]
});`}
          </pre>
        </div>
      )}

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Canvas Viewport & Glitch Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Frame Buffer Viewport (360x240)
              </span>
              <span className="text-zinc-500">Preset: {preset.toUpperCase()}</span>
            </div>

            {/* Canvas Viewport */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-[3/2] flex items-center justify-center group shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={240}
                className="w-full h-full object-cover"
              />

              {/* Overlay HUD */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/75 border border-zinc-800 text-[10px] font-mono text-cyan-400 backdrop-blur pointer-events-none">
                FILTER: {filterMode.toUpperCase()} | GLITCH: {glitchIntensity}%
              </div>

              {/* Viewport Play/Pause button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute bottom-3 right-3 p-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white backdrop-blur transition-all"
                title={isPlaying ? 'Pause Generator' : 'Resume Generator'}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Viewport Action Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Source Feed:</span>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="wormhole">Wormhole Flux (Quantum)</option>
                  <option value="crt_static">CRT Analog Glitch</option>
                  <option value="abyssal">Abyssal Bioluminescence</option>
                  <option value="sub_quantum">Sub-Quantum Matrix</option>
                </select>
              </div>

              {/* Capture Trigger */}
              <button
                onClick={handleCaptureFrames}
                disabled={isCapturing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs font-mono transition-all ${
                  isCapturing
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
                }`}
              >
                {isCapturing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-300" />
                    Buffering {captureProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Sample & Compile GIF Loop
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shaders & Modulation Controls */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4">
            <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Glitch Filters & Modulation Matrix
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {[
                { id: 'phosphor_crt', label: 'Phosphor CRT', desc: '80s Green Terminal Glow' },
                { id: 'rgb_split', label: 'RGB Chromatic', desc: 'Stereoscopic Color Rift' },
                { id: 'matrix_scan', label: 'Matrix Scanline', desc: 'Horizontal CRT Sweep' },
                { id: 'dither_retro', label: 'Retro Dither', desc: '1-bit Macintosh Grain' },
                { id: 'cyber_heat', label: 'Thermal Infrared', desc: 'False Color Radiant' },
                { id: 'clean', label: 'Raw Optical', desc: 'Unfiltered Passthrough' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    filterMode === f.id
                      ? 'bg-red-950/40 border-red-500 text-white shadow-sm'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-zinc-200">{f.label}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{f.desc}</div>
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-800">
              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span>Sampling Rate:</span>
                  <span className="text-cyan-400">{fps} FPS</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="2"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span>Loop Length:</span>
                  <span className="text-purple-400">{targetFrames} Frames</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  step="4"
                  value={targetFrames}
                  onChange={(e) => setTargetFrames(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span>Glitch Depth:</span>
                  <span className="text-red-400">{glitchIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glitchIntensity}
                  onChange={(e) => setGlitchIntensity(parseInt(e.target.value, 10))}
                  className="w-full accent-red-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compiled GIF Output, Frame Scrubber, and Sanity Lake Attachment */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Compiled GIF Sequence Inspector
              </span>
              {compiledAsset && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  Ready ({compiledAsset.fileSizeKb} KB)
                </span>
              )}
            </h3>

            {/* Loop Player or Placeholder */}
            {capturedFrames.length > 0 ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-black aspect-[3/2] flex items-center justify-center shadow-lg">
                  <img
                    src={capturedFrames[previewFrameIdx]}
                    alt="Compiled GIF Frame"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 font-mono text-[10px] text-zinc-300 border border-zinc-800">
                    FRAME {previewFrameIdx + 1} / {capturedFrames.length} ({fps} FPS LOOP)
                  </div>
                </div>

                {/* Frame Scrubber Strip */}
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Frame Buffer Strip</span>
                    <span className="text-zinc-500">Click to scrub</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                    {capturedFrames.map((frame, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewFrameIdx(idx)}
                        className={`flex-shrink-0 w-12 h-8 rounded border overflow-hidden transition-all ${
                          previewFrameIdx === idx
                            ? 'border-emerald-400 scale-105 shadow-md'
                            : 'border-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={frame} alt={`Frame ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Asset Metadata Grid */}
                {compiledAsset && (
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">ASSET ID</span>
                      <span className="text-zinc-300">{compiledAsset.assetId}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">DIMENSIONS</span>
                      <span className="text-zinc-300">360 × 240 px</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">FILTER</span>
                      <span className="text-purple-400">{compiledAsset.filterMode}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">PAYLOAD SIZE</span>
                      <span className="text-emerald-400">{compiledAsset.fileSizeKb} KB</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center text-zinc-500 text-xs space-y-2">
                <Film className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="font-mono">No frame buffer recorded yet.</p>
                <p className="text-zinc-600 text-[11px]">
                  Select your glitch shader on the left and click "Sample & Compile GIF Loop" to generate the asset.
                </p>
              </div>
            )}

            {/* Target Document & Sanity Commit Button */}
            <div className="mt-5 pt-4 border-t border-zinc-800 space-y-3">
              <label className="block text-xs font-mono text-zinc-400">
                Target Sanity Content Lake Document:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-xl p-2.5 font-mono focus:outline-none focus:border-red-500"
              >
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    [{doc.hazardClass}] {doc.title} ({doc._id})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveToSanity}
                disabled={!compiledAsset}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-semibold transition-all ${
                  compiledAsset
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Asset Attached to Sanity Document!
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    Deploy & Attach Asset to Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
