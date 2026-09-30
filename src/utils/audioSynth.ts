/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Web Audio API Occult Drone Synthesizer
 * Converts anomalous quantum frequencies into real-time binaural sound drones.
 */

class AnomalyAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private currentFrequency: number = 104.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playDrone(baseFrequencyMhz: number, type: 'sine' | 'sawtooth' | 'pulsed-noise' | 'sub-bass' = 'sine') {
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying) {
      this.stopDrone();
    }

    // Map MHz (e.g. 19 - 432) to audible range (55Hz - 440Hz)
    let audibleHz = Math.min(Math.max((baseFrequencyMhz % 380) + 60, 50), 500);
    if (type === 'sub-bass') {
      audibleHz = Math.min(Math.max(audibleHz * 0.45, 38), 90);
    }
    this.currentFrequency = audibleHz;

    const oscType: OscillatorType = type === 'pulsed-noise' ? 'sawtooth' : type === 'sub-bass' ? 'sine' : type;

    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.gainNode = this.ctx.createGain();
    this.filterNode = this.ctx.createBiquadFilter();

    this.osc1.type = oscType;
    this.osc1.frequency.setValueAtTime(audibleHz, this.ctx.currentTime);

    // Detuned second oscillator for eerie beat frequencies
    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(audibleHz * 1.503, this.ctx.currentTime);

    // Warm low-pass filter
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(650, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // Soft master gain
    this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.6);

    this.osc1.connect(this.filterNode);
    this.osc2.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.osc1.start();
    this.osc2.start();
    this.isPlaying = true;
  }

  public stopDrone() {
    if (!this.isPlaying || !this.ctx || !this.gainNode) return;

    try {
      this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        if (this.osc1) {
          this.osc1.stop();
          this.osc1.disconnect();
          this.osc1 = null;
        }
        if (this.osc2) {
          this.osc2.stop();
          this.osc2.disconnect();
          this.osc2 = null;
        }
        this.isPlaying = false;
      }, 350);
    } catch (e) {
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentFrequency(): number {
    return this.currentFrequency;
  }
}

export const audioSynth = new AnomalyAudioSynthesizer();
