import confetti from 'canvas-confetti';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play synthetic procedural sounds for soundboard
  playBuiltinSound(type: string, volume: number = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
      gainNode.connect(ctx.destination);

      switch (type) {
        case 'airhorn': {
          // Classic MLG style airhorn burst
          const freqs = [311.13, 370.0, 466.16];
          const bursts = [0, 0.12, 0.24, 0.42];
          bursts.forEach(startTime => {
            freqs.forEach(f => {
              const osc = ctx.createOscillator();
              const bGain = ctx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(f, now + startTime);
              osc.frequency.exponentialRampToValueAtTime(f * 1.03, now + startTime + 0.08);

              bGain.gain.setValueAtTime(0.25 * volume, now + startTime);
              bGain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.1);

              osc.connect(bGain);
              bGain.connect(gainNode);
              osc.start(now + startTime);
              osc.stop(now + startTime + 0.11);
            });
          });
          break;
        }

        case 'bruh': {
          // Low resonant formant "bruh"
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const bGain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(65, now + 0.45);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(700, now);
          filter.frequency.exponentialRampToValueAtTime(250, now + 0.45);
          filter.Q.value = 4;

          bGain.gain.setValueAtTime(0.6 * volume, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          osc.connect(filter);
          filter.connect(bGain);
          bGain.connect(gainNode);

          osc.start(now);
          osc.stop(now + 0.55);
          break;
        }

        case 'quack': {
          // Duck quack sound
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const bGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.linearRampToValueAtTime(520, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.35);

          filter.type = 'bandpass';
          filter.frequency.value = 900;
          filter.Q.value = 6;

          bGain.gain.setValueAtTime(0.5 * volume, now);
          bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

          osc.connect(filter);
          filter.connect(bGain);
          bGain.connect(gainNode);

          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'gg_applause': {
          // Synth crowd clap / noise burst
          for (let i = 0; i < 16; i++) {
            const timeOffset = Math.random() * 0.7;
            const bufferSize = ctx.sampleRate * 0.06;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
              data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 1200 + Math.random() * 800;
            noiseFilter.Q.value = 2;

            const nGain = ctx.createGain();
            nGain.gain.value = (0.2 + Math.random() * 0.3) * volume;

            noise.connect(noiseFilter);
            noiseFilter.connect(nGain);
            nGain.connect(gainNode);
            noise.start(now + timeOffset);
          }
          break;
        }

        case 'level_up': {
          // 8-bit victorious arpeggio
          const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;

            const t = now + idx * 0.06;
            noteGain.gain.setValueAtTime(0.2 * volume, t);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(noteGain);
            noteGain.connect(gainNode);
            osc.start(t);
            osc.stop(t + 0.28);
          });
          break;
        }

        case 'ta-da': {
          // Fanfare
          const chord = [392.0, 493.88, 587.33, 783.99];
          chord.forEach(f => {
            const osc = ctx.createOscillator();
            const cGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = f;

            cGain.gain.setValueAtTime(0.25 * volume, now);
            cGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(cGain);
            cGain.connect(gainNode);
            osc.start(now);
            osc.stop(now + 1.25);
          });
          break;
        }

        case 'drum_roll': {
          // Snare roll into crash
          const count = 18;
          for (let i = 0; i < count; i++) {
            const t = now + i * 0.045;
            const osc = ctx.createOscillator();
            const snGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);
            snGain.gain.setValueAtTime((0.15 + (i / count) * 0.3) * volume, t);
            snGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

            osc.connect(snGain);
            snGain.connect(gainNode);
            osc.start(t);
            osc.stop(t + 0.05);
          }
          break;
        }

        case 'oof': {
          // Roblox style "oof"
          const osc = ctx.createOscillator();
          const oGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

          oGain.gain.setValueAtTime(0.5 * volume, now);
          oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(oGain);
          oGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        case 'laser': {
          // Laser pew pew
          const osc = ctx.createOscillator();
          const lGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

          lGain.gain.setValueAtTime(0.35 * volume, now);
          lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(lGain);
          lGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        }

        case 'kick': {
          // Thud / kick disconnect sound
          const osc = ctx.createOscillator();
          const kGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

          kGain.gain.setValueAtTime(0.5 * volume, now);
          kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          osc.connect(kGain);
          kGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'mute_on': {
          // Double low blip for mute
          [350, 260].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const mGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            mGain.gain.setValueAtTime(0.25 * volume, now + idx * 0.08);
            mGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.07);
            osc.connect(mGain);
            mGain.connect(gainNode);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.08);
          });
          break;
        }

        case 'mute_off': {
          // Double rising blip for unmute
          [260, 390].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const mGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            mGain.gain.setValueAtTime(0.25 * volume, now + idx * 0.08);
            mGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.07);
            osc.connect(mGain);
            mGain.connect(gainNode);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.08);
          });
          break;
        }

        default: {
          // Generic ding
          const osc = ctx.createOscillator();
          const dGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now);
          dGain.gain.setValueAtTime(0.3 * volume, now);
          dGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(dGain);
          dGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.55);
        }
      }
    } catch (e) {
      console.warn('Audio playback not permitted yet or failed:', e);
    }
  }

  // Play custom audio file or url
  playCustomAudio(url: string, volume: number = 0.8) {
    try {
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(e => console.warn('Custom audio playback failed:', e));
    } catch (err) {
      console.warn('Audio element error:', err);
    }
  }

  // Trigger celebration visual effects
  triggerConfetti() {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f472b6'],
      });
    } catch {
      // Ignore if DOM canvas not available
    }
  }

  // Monitor live microphone for voice activity
  async startVoiceMonitoring(onSpeakingChange: (isSpeaking: boolean, level: number) => void): Promise<boolean> {
    try {
      if (this.micStream) {
        this.stopVoiceMonitoring();
      }
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = this.getContext();
      const source = ctx.createMediaStreamSource(this.micStream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingDebounce = false;
      let silentCounter = 0;

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = avg / 128; // 0 to ~1

        // Voice threshold
        if (avg > 18) {
          silentCounter = 0;
          if (!speakingDebounce) {
            speakingDebounce = true;
            onSpeakingChange(true, normalized);
          }
        } else {
          silentCounter++;
          if (silentCounter > 8 && speakingDebounce) {
            speakingDebounce = false;
            onSpeakingChange(false, 0);
          }
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or device not found:', err);
      return false;
    }
  }

  stopVoiceMonitoring() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
  }
}

export const soundEngine = new SoundEngine();
