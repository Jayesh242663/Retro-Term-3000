// 8-bit Chiptune Sound Generator & Tetris Theme Sequencer using Web Audio API
let audioCtx = null;
let musicInterval = null;
let isMusicPlaying = false;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a single 8-bit synthesized note
export const playTone = (freq, duration = 0.1, type = 'square', volume = 0.15) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silent fail if audio not allowed
  }
};

// Sound Effects
export const playMoveSFX = () => {
  playTone(220, 0.04, 'square', 0.08);
};

export const playRotateSFX = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch (e) {}
};

export const playDropSFX = () => {
  playTone(110, 0.08, 'sawtooth', 0.12);
};

export const playHardDropSFX = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
};

export const playHoldSFX = () => {
  playTone(400, 0.06, 'sine', 0.15);
};

export const playLineClearSFX = (lines = 1) => {
  const notes = lines === 4 
    ? [523.25, 659.25, 783.99, 1046.5, 1318.5] // Tetris 4-line fanfare
    : [440, 554.37, 659.25];

  notes.forEach((note, i) => {
    setTimeout(() => {
      playTone(note, 0.12, 'square', 0.15);
    }, i * 60);
  });
};

export const playLevelUpSFX = () => {
  const notes = [330, 392, 493.88, 587.33, 659.25, 783.99];
  notes.forEach((note, i) => {
    setTimeout(() => {
      playTone(note, 0.14, 'triangle', 0.18);
    }, i * 70);
  });
};

export const playGameOverSFX = () => {
  const notes = [440, 415.3, 392, 349.23, 311.13, 261.63];
  notes.forEach((note, i) => {
    setTimeout(() => {
      playTone(note, 0.22, 'sawtooth', 0.15);
    }, i * 110);
  });
};

// 8-bit Korobeiniki (Tetris A Theme) Melody Sequencer
const KOROBEINIKI = [
  { note: 659.25, dur: 0.4 }, // E5
  { note: 493.88, dur: 0.2 }, // B4
  { note: 523.25, dur: 0.2 }, // C5
  { note: 587.33, dur: 0.4 }, // D5
  { note: 523.25, dur: 0.2 }, // C5
  { note: 493.88, dur: 0.2 }, // B4
  { note: 440.00, dur: 0.4 }, // A4
  { note: 440.00, dur: 0.2 }, // A4
  { note: 523.25, dur: 0.2 }, // C5
  { note: 659.25, dur: 0.4 }, // E5
  { note: 587.33, dur: 0.2 }, // D5
  { note: 523.25, dur: 0.2 }, // C5
  { note: 493.88, dur: 0.6 }, // B4
  { note: 523.25, dur: 0.2 }, // C5
  { note: 587.33, dur: 0.4 }, // D5
  { note: 659.25, dur: 0.4 }, // E5
  { note: 523.25, dur: 0.4 }, // C5
  { note: 440.00, dur: 0.4 }, // A4
  { note: 440.00, dur: 0.4 }, // A4
  { note: 0,      dur: 0.2 }, // Rest
  { note: 587.33, dur: 0.4 }, // D5
  { note: 698.46, dur: 0.2 }, // F5
  { note: 880.00, dur: 0.4 }, // A5
  { note: 783.99, dur: 0.2 }, // G5
  { note: 698.46, dur: 0.2 }, // F5
  { note: 659.25, dur: 0.6 }, // E5
  { note: 523.25, dur: 0.2 }, // C5
  { note: 659.25, dur: 0.4 }, // E5
  { note: 587.33, dur: 0.2 }, // D5
  { note: 523.25, dur: 0.2 }, // C5
  { note: 493.88, dur: 0.4 }, // B4
  { note: 493.88, dur: 0.2 }, // B4
  { note: 523.25, dur: 0.2 }, // C5
  { note: 587.33, dur: 0.4 }, // D5
  { note: 659.25, dur: 0.4 }, // E5
  { note: 523.25, dur: 0.4 }, // C5
  { note: 440.00, dur: 0.4 }, // A4
  { note: 440.00, dur: 0.4 }, // A4
];

export const startTetrisMusic = () => {
  if (isMusicPlaying) return;
  isMusicPlaying = true;

  let currentStep = 0;
  const playNext = () => {
    if (!isMusicPlaying) return;
    const item = KOROBEINIKI[currentStep];
    if (item.note > 0) {
      playTone(item.note, item.dur * 0.9, 'square', 0.04);
    }
    const stepDuration = item.dur * 400; // Tempo scaling
    currentStep = (currentStep + 1) % KOROBEINIKI.length;
    musicInterval = setTimeout(playNext, stepDuration);
  };

  playNext();
};

export const stopTetrisMusic = () => {
  isMusicPlaying = false;
  if (musicInterval) {
    clearTimeout(musicInterval);
    musicInterval = null;
  }
};

export const toggleTetrisMusic = () => {
  if (isMusicPlaying) {
    stopTetrisMusic();
    return false;
  } else {
    startTetrisMusic();
    return true;
  }
};

export const isMusicActive = () => isMusicPlaying;
