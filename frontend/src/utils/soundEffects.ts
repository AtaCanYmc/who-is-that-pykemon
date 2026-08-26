/**
 * Web Audio API Retro Sound Effects & Haptics Engine.
 * Generates zero-latency chiptune audio and mobile haptics without external MP3 dependencies.
 */

class SoundEffectsEngine {
  private audioCtx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Haptic vibration for mobile devices (Thumb Zone feedback).
   */
  public triggerHaptic(duration: number | number[] = 25) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(duration as any);
      } catch {
        // Ignore devices where vibration permission is restricted
      }
    }
  }

  /**
   * Classic retro Game Boy menu select click (Bip).
   */
  public playClickSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.05); // A6

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
      this.triggerHaptic(15);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Pokéball wobble / catch attempt sound effect.
   */
  public playWobbleSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(260, this.audioCtx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.18);
      this.triggerHaptic(20);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Retro Victory & Level-Up Fanfare when video is rendered!
   */
  public playSuccessFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      // Notes: C5 -> E5 -> G5 -> C6 (Pokemon victory arpeggio)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, index) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.18, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.25);
      });

      this.triggerHaptic([40, 60, 80, 150]);
    } catch (e) {
      console.warn('Fanfare playback error:', e);
    }
  }
}

export const soundEffects = new SoundEffectsEngine();
