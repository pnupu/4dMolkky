// All sound is synthesised with Web Audio: wooden knocks, thuds on sand, a lakeside
// morning in the background, and a few interface tones. No audio files.

export class Sound {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private lastKnock = 0;
  private birdTimer = 0;
  muted = false;

  /** Browsers allow sound only after a user gesture: call this from one. */
  unlock(): void {
    if (this.context) {
      if (this.context.state === "suspended") void this.context.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const context = new Ctor();
    this.context = context;
    this.master = context.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.ratio.value = 8;
    this.master.connect(limiter).connect(context.destination);
    const length = context.sampleRate * 2;
    this.noise = context.createBuffer(1, length, context.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    this.startAmbience();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(muted ? 0 : 0.8, this.context.currentTime, 0.05);
  }

  private burst(
    duration: number,
    type: BiquadFilterType,
    frequency: number,
    q: number,
    gain: number,
    when = 0,
  ): void {
    if (!this.context || !this.master || !this.noise) return;
    const t = this.context.currentTime + when;
    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    source.loopStart = Math.random();
    const filter = this.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const amp = this.context.createGain();
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(amp).connect(this.master);
    source.start(t, Math.random() * 1.5);
    source.stop(t + duration + 0.02);
  }

  private tone(
    frequency: number,
    duration: number,
    gain: number,
    when = 0,
    type: OscillatorType = "sine",
    glide = 1,
  ): void {
    if (!this.context || !this.master) return;
    const t = this.context.currentTime + when;
    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    if (glide !== 1) osc.frequency.exponentialRampToValueAtTime(frequency * glide, t + duration);
    const amp = this.context.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  /** Wood on wood. `strength` is the impulse in N s. */
  knock(strength: number): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    if (now - this.lastKnock < 0.012) return;
    this.lastKnock = now;
    const level = Math.min(1, strength / 1.2) ** 0.6;
    const pitch = 0.85 + Math.random() * 0.4;
    // A dry click, then two short wooden resonances.
    this.burst(0.03, "bandpass", 2600 * pitch, 1.2, 0.5 * level);
    this.tone(780 * pitch, 0.07, 0.34 * level, 0, "sine", 0.92);
    this.tone(1830 * pitch, 0.04, 0.16 * level, 0, "sine", 0.95);
    this.tone(310 * pitch, 0.09, 0.14 * level, 0, "triangle", 0.9);
  }

  /** Wood on sand. */
  thud(strength: number): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    if (now - this.lastKnock < 0.02) return;
    this.lastKnock = now;
    const level = Math.min(1, strength / 1.5) ** 0.6;
    this.burst(0.09, "lowpass", 420, 0.7, 0.55 * level);
    this.tone(95, 0.12, 0.4 * level, 0, "sine", 0.6);
    this.burst(0.05, "bandpass", 3200, 0.8, 0.07 * level);
  }

  whoosh(power: number): void {
    this.burst(0.28, "bandpass", 500 + 900 * power, 0.9, 0.12 + 0.16 * power);
  }

  tick(): void {
    this.tone(1200, 0.03, 0.05);
  }

  score(points: number): void {
    const base = 523.25;
    const notes = points >= 10 ? [0, 4, 7, 12] : points > 1 ? [0, 4, 7] : [0, 7];
    notes.forEach((n, i) => {
      this.tone(base * 2 ** (n / 12), 0.5, 0.11, i * 0.09, "triangle");
    });
  }

  miss(): void {
    this.tone(220, 0.35, 0.1, 0, "triangle", 0.7);
  }

  win(): void {
    [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => {
      this.tone(392 * 2 ** (n / 12), 0.9, 0.1, i * 0.11, "triangle");
    });
  }

  /** A soft shimmer when the slice turns. `rate` is the turning speed, 0 to 1. */
  turn(rate: number): void {
    if (Math.random() > 0.25) return;
    this.tone(1400 + 900 * Math.random(), 0.05, 0.012 * Math.min(1, rate));
  }

  private startAmbience(): void {
    if (!this.context || !this.master || !this.noise) return;
    const context = this.context;
    // Water lapping and a light wind: two filtered noise beds with slow swells.
    const bed = (frequency: number, q: number, gain: number, period: number): void => {
      const source = context.createBufferSource();
      source.buffer = this.noise;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = q;
      const amp = context.createGain();
      amp.gain.value = gain;
      const lfo = context.createOscillator();
      lfo.frequency.value = 1 / period;
      const depth = context.createGain();
      depth.gain.value = gain * 0.6;
      lfo.connect(depth).connect(amp.gain);
      source.connect(filter).connect(amp).connect(this.master!);
      source.start();
      lfo.start();
    };
    bed(380, 0.6, 0.035, 5.3);
    bed(1500, 0.5, 0.012, 8.1);
    const bird = (): void => {
      if (!this.muted && document.visibilityState === "visible") {
        const base = 2400 + Math.random() * 1800;
        const notes = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < notes; i++) {
          this.tone(
            base * (1 + 0.12 * Math.random()),
            0.09,
            0.018,
            i * 0.13,
            "sine",
            0.8 + Math.random() * 0.5,
          );
        }
      }
      this.birdTimer = window.setTimeout(bird, 2500 + Math.random() * 6000);
    };
    this.birdTimer = window.setTimeout(bird, 1500);
  }

  dispose(): void {
    window.clearTimeout(this.birdTimer);
    void this.context?.close();
  }
}
