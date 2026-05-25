/**
 * Retro 8-bit Sound Effects Synthesizer using Web Audio API
 */
const Sound = {
    ctx: null,
    enabled: true,

    init() {
        // AudioContext will be initialized on first user interaction to satisfy browser autoplay policies
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    // Helper to create oscillator and gain nodes
    createOscillator(type, freq, duration) {
        if (!this.enabled) return null;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        return { osc, gain, time: this.ctx.currentTime };
    },

    // Quick single code shoot beep (synth laser)
    playShoot() {
        const sound = this.createOscillator('square', 800, 0.15);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        // Frequency sweep down
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.12);
        // Gain ramp down
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.start(time);
        osc.stop(time + 0.15);
    },

    // Splash compiling laser (longer, sweeps down slowly)
    playLaserAoE() {
        const sound = this.createOscillator('sawtooth', 300, 0.4);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        osc.frequency.linearRampToValueAtTime(80, time + 0.35);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        osc.start(time);
        osc.stop(time + 0.4);
    },

    // Enemy hit sound (short distortion punch)
    playHit() {
        const sound = this.createOscillator('triangle', 180, 0.08);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.linearRampToValueAtTime(40, time + 0.08);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        
        osc.start(time);
        osc.stop(time + 0.08);
    },

    // Coin collection / budget earned (ch-ching double beep)
    playCoin() {
        const sound = this.createOscillator('sine', 987.77, 0.2); // B5
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        // Second beep shortly after (E6)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, time + 0.07); // E6
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        
        gain2.gain.setValueAtTime(0, time);
        gain2.gain.setValueAtTime(0.1, time + 0.07);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.22);
        
        osc.start(time);
        osc.stop(time + 0.2);
        osc2.start(time + 0.07);
        osc2.stop(time + 0.22);
    },

    // Building a tower (pop/click sound)
    playBuild() {
        const sound = this.createOscillator('sine', 150, 0.1);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        osc.frequency.exponentialRampToValueAtTime(600, time + 0.08);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        osc.start(time);
        osc.stop(time + 0.1);
    },

    // Upgrading a tower (upward slide)
    playUpgrade() {
        const sound = this.createOscillator('square', 300, 0.25);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        osc.frequency.linearRampToValueAtTime(1200, time + 0.25);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        
        osc.start(time);
        osc.stop(time + 0.25);
    },

    // Selling a tower (descending register sound)
    playSell() {
        const sound = this.createOscillator('sine', 600, 0.15);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        osc.frequency.linearRampToValueAtTime(200, time + 0.15);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.start(time);
        osc.stop(time + 0.15);
    },

    // Error beep (low buzz)
    playError() {
        const sound = this.createOscillator('sawtooth', 120, 0.18);
        if (!sound) return;
        
        const { osc, gain, time } = sound;
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        
        osc.start(time);
        osc.stop(time + 0.18);
    },

    // New wave starting (upward C-E-G-C major arpeggio)
    playWaveStart() {
        if (!this.enabled) return;
        this.init();
        const time = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time + index * 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.setValueAtTime(0.12, time + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, time + index * 0.1 + 0.15);
            
            osc.start(time + index * 0.1);
            osc.stop(time + index * 0.1 + 0.15);
        });
    },

    // WBS Wave clear melody (happy short tune)
    playWaveClear() {
        if (!this.enabled) return;
        this.init();
        const time = this.ctx.currentTime;
        // Notes: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + index * 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.setValueAtTime(0.1, time + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, time + index * 0.08 + 0.2);
            
            osc.start(time + index * 0.08);
            osc.stop(time + index * 0.08 + 0.2);
        });
    },

    // Game Over sad tune (descending notes + noise)
    playGameOver() {
        if (!this.enabled) return;
        this.init();
        const time = this.ctx.currentTime;
        const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time + index * 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.setValueAtTime(0.12, time + index * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, time + index * 0.2 + 0.35);
            
            osc.start(time + index * 0.2);
            osc.stop(time + index * 0.2 + 0.35);
        });
    },

    // Game Clear victory fan-fare
    playGameWin() {
        if (!this.enabled) return;
        this.init();
        const time = this.ctx.currentTime;
        
        // Upward energetic melody
        const notes = [
            { f: 523.25, d: 0.1 },  // C5
            { f: 587.33, d: 0.1 },  // D5
            { f: 659.25, d: 0.1 },  // E5
            { f: 783.99, d: 0.1 },  // G5
            { f: 880.00, d: 0.1 },  // A5
            { f: 1046.50, d: 0.4 }  // C6
        ];
        
        let accumulatedTime = 0;
        notes.forEach((note) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(note.f, time + accumulatedTime);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.setValueAtTime(0.08, time + accumulatedTime);
            gain.gain.exponentialRampToValueAtTime(0.005, time + accumulatedTime + note.d);
            
            osc.start(time + accumulatedTime);
            osc.stop(time + accumulatedTime + note.d);
            
            accumulatedTime += note.d * 0.8;
        });
    }
};
