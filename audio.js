// audio.js - Bộ tổng hợp âm thanh Thiền & Pháp khí bằng Web Audio API (Chuông đồng, Mõ gỗ, Khánh, Tràng hạt, Nhạc thiền)

class TempleAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicOn = true;
    this.bgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else if (this.musicOn) {
      this.startBGM();
    }
    return this.muted;
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn && !this.muted) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.musicOn;
  }

  // Tiếng Đại Hồng Chuông trầm hùng ngân vang
  playGreatBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const partials = [
      { freq: 130.81, amp: 0.45, decay: 4.8 },
      { freq: 261.63, amp: 0.30, decay: 3.9 },
      { freq: 311.13, amp: 0.22, decay: 3.2 },
      { freq: 523.25, amp: 0.14, decay: 2.5 },
      { freq: 783.99, amp: 0.08, decay: 1.8 }
    ];

    partials.forEach((p) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(p.freq, now);
      // Rung nhẹ tạo âm sắc chuông đồng
      osc.frequency.exponentialRampToValueAtTime(p.freq * 0.996, now + p.decay);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(p.amp, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });
  }

  // Tiếng Chuông Khánh (Singing Bowl) khi lạy Phật
  playBowlChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [528, 1056, 1584];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);
      const dur = 2.4 - idx * 0.5;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    });
  }

  // Tiếng Mõ Gỗ (Wooden Fish) cốc-cốc
  playWoodenFish() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Âm cốc trầm rỗng của gỗ
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(275, now + 0.09);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(520, now);
    filter.Q.setValueAtTime(5.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Tiếng lần hạt gỗ nhẹ nhàng
  playBeadClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Tiếng lắc ống xăm tre
  playFortuneShake() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(500 + Math.random() * 280, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }, i * 160);
    }
  }

  // Nhạc nền Thiền Đàn Tranh nhẹ nhàng
  startBGM() {
    if (this.muted || !this.musicOn) return;
    this.init();
    if (this.bgmTimer) return;

    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    let step = 0;
    const pattern = [0, 2, 4, 5, 4, 2, 1, 3, 4, 7, 5, 4];

    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.musicOn || !this.ctx || document.hidden) return;
      const now = this.ctx.currentTime;
      const freq = pentatonic[pattern[step % pattern.length]];
      step++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.7);
    }, 1800);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.templeAudio = new TempleAudio();

