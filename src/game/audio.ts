export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private noiseGain: GainNode | null = null;
  private weatherGain: GainNode | null = null;
  private weatherSrc: AudioBufferSourceNode | null = null;
  private weatherFilter: BiquadFilterNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;
  private unlocked = false;

  unlock() {
    if (this.unlocked && this.ctx?.state === "running") return;
    this.ensure();
    void this.ctx?.resume();
    this.unlocked = true;
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  setMuted(v: boolean) {
    this.muted = v;
    this.ensure();
    this.master?.gain.setTargetAtTime(v ? 0 : 1, this.now(), 0.04);
  }

  setEngine(speed01: number, on: boolean) {
    this.ensure();
    if (!this.engineGain || !this.engineOsc || !this.engineOsc2 || !this.noiseGain) return;
    const t = this.now();
    if (!on) {
      this.engineGain.gain.setTargetAtTime(0, t, 0.08);
      this.noiseGain.gain.setTargetAtTime(0, t, 0.08);
      return;
    }
    const f = 42 + speed01 * 88;
    this.engineOsc.frequency.setTargetAtTime(f, t, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(f * 2.02, t, 0.05);
    this.engineGain.gain.setTargetAtTime(0.05 + speed01 * 0.07, t, 0.08);
    this.noiseGain.gain.setTargetAtTime(0.018 + speed01 * 0.03, t, 0.08);
  }

  setWeather(kind: "sun" | "rain" | "snow" | "hail" | "off") {
    this.ensure();
    if (!this.weatherGain || !this.weatherFilter || !this.ctx) return;
    const t = this.now();
    if (kind === "off" || kind === "sun") {
      this.weatherGain.gain.setTargetAtTime(0, t, 0.3);
      return;
    }
    if (kind === "rain") {
      this.weatherFilter.frequency.setTargetAtTime(1800, t, 0.2);
      this.weatherFilter.Q.setTargetAtTime(0.4, t, 0.2);
      this.weatherGain.gain.setTargetAtTime(0.045, t, 0.25);
    } else if (kind === "snow") {
      this.weatherFilter.frequency.setTargetAtTime(900, t, 0.2);
      this.weatherFilter.Q.setTargetAtTime(0.2, t, 0.2);
      this.weatherGain.gain.setTargetAtTime(0.03, t, 0.25);
    } else {
      this.weatherFilter.frequency.setTargetAtTime(3200, t, 0.2);
      this.weatherFilter.Q.setTargetAtTime(0.7, t, 0.2);
      this.weatherGain.gain.setTargetAtTime(0.055, t, 0.25);
    }
  }

  whoosh() {
    this.blip(180, 90, 0.09, 0.07, "highpass");
  }

  jump() {
    this.blip(420, 140, 0.14, 0.08, "sine");
  }

  land() {
    this.noiseBurst(0.08, 0.05, 240);
  }

  coin() {
    this.ping(880, 0.07);
    this.ping(1320, 0.06, 0.04);
  }

  bonus() {
    this.ping(520, 0.1);
    this.ping(780, 0.1, 0.05);
    this.ping(1040, 0.12, 0.1);
  }

  crash() {
    this.noiseBurst(0.28, 0.22, 140);
    this.blip(110, 40, 0.22, 0.16, "sawtooth");
  }

  dispose() {
    try {
      this.engineOsc?.stop();
      this.engineOsc2?.stop();
      this.weatherSrc?.stop();
    } catch {
      /* noop */
    }
    void this.ctx?.close();
    this.ctx = null;
  }

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx({ latencyHint: "interactive" });
    this.master = this.ctx.createGain();
    this.sfx = this.ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.master.gain.value = this.muted ? 0 : 1;

    this.noiseBuf = this.makeNoise(1);

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.value = 50;
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = "square";
    this.engineOsc2.frequency.value = 100;
    const engFilter = this.ctx.createBiquadFilter();
    engFilter.type = "lowpass";
    engFilter.frequency.value = 420;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineOsc.connect(engFilter);
    this.engineOsc2.connect(engFilter);
    engFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    const nsrc = this.ctx.createBufferSource();
    nsrc.buffer = this.noiseBuf;
    nsrc.loop = true;
    const nfilter = this.ctx.createBiquadFilter();
    nfilter.type = "lowpass";
    nfilter.frequency.value = 500;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0;
    nsrc.connect(nfilter);
    nfilter.connect(this.noiseGain);
    this.noiseGain.connect(this.master);

    this.weatherFilter = this.ctx.createBiquadFilter();
    this.weatherFilter.type = "bandpass";
    this.weatherFilter.frequency.value = 1600;
    this.weatherGain = this.ctx.createGain();
    this.weatherGain.gain.value = 0;
    this.weatherSrc = this.ctx.createBufferSource();
    this.weatherSrc.buffer = this.noiseBuf;
    this.weatherSrc.loop = true;
    this.weatherSrc.connect(this.weatherFilter);
    this.weatherFilter.connect(this.weatherGain);
    this.weatherGain.connect(this.master);

    this.engineOsc.start();
    this.engineOsc2.start();
    nsrc.start();
    this.weatherSrc.start();
  }

  private now() {
    return this.ctx?.currentTime ?? 0;
  }

  private makeNoise(seconds: number) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private ping(freq: number, dur: number, delay = 0) {
    this.ensure();
    if (!this.ctx || !this.sfx) return;
    const t = this.now() + delay;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  private blip(
    from: number,
    to: number,
    dur: number,
    vol: number,
    type: OscillatorType | "highpass",
  ) {
    this.ensure();
    if (!this.ctx || !this.sfx) return;
    const t = this.now();
    if (type === "highpass") {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = this.ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = from;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfx);
      src.start(t);
      src.stop(t + dur);
      src.onended = () => {
        src.disconnect();
        f.disconnect();
        g.disconnect();
      };
      return;
    }
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  private noiseBurst(dur: number, vol: number, cutoff: number) {
    this.ensure();
    if (!this.ctx || !this.sfx || !this.noiseBuf) return;
    const t = this.now();
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(cutoff * 3, t);
    f.frequency.exponentialRampToValueAtTime(cutoff, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + dur);
    src.onended = () => {
      src.disconnect();
      f.disconnect();
      g.disconnect();
    };
  }
}
