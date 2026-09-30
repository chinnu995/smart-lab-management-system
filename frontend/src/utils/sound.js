// Web Audio API Synthesizer Sound Engine for Kahoot Quiz Arena
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(mute) {
    this.muted = !!mute;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // AudioContext play prevented or unsupported
    }
  }

  // 1. Join Room Pop Sound
  playJoin() {
    this.playTone(523.25, 'sine', 0.12, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.2), 80); // E5
  }

  // 2. Timer Countdown Tick (woodblock effect)
  playTick() {
    this.playTone(880, 'triangle', 0.05, 0.1); // A5
  }

  // 3. Correct Answer Chime (Ascending triad)
  playCorrect() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.25), idx * 90);
    });
  }

  // 4. Incorrect Answer Buzz
  playWrong() {
    if (this.muted) return;
    this.playTone(220, 'sawtooth', 0.3, 0.2); // A3
    setTimeout(() => this.playTone(196, 'sawtooth', 0.35, 0.2), 100); // G3
  }

  // 5. Fanfare / Victory Sound
  playFanfare() {
    if (this.muted) return;
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.5, d: 0.4 }
    ];
    melody.forEach((note, idx) => {
      setTimeout(() => this.playTone(note.f, 'triangle', note.d, 0.3), idx * 120);
    });
  }
}

export const sounds = new SoundEngine();
