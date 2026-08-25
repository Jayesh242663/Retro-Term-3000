// Procedural 8-Bit Multi-Channel Chiptune Synthesizer using Web Audio API
let audioCtx = null;
let masterGain = null;
let analyser = null;
let isPlaying = false;
let currentTrackIndex = 0;
let currentStep = 0;
let playbackTimer = null;
let currentVolume = 0.5;
let isLooping = true;
let isShuffled = false;
let listeners = new Set();

// Note frequency map (Equal Temperament)
const NOTES = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23,
  'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46,
  'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'A#5': 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.00,
  _: 0, // Rest
};

// 6 Authentic 8-Bit Chiptune Tracks
export const TRACKS = [
  {
    id: 1,
    title: 'Cyberpunk 1984',
    artist: 'Jayesh Channe',
    genre: 'Synthwave / Chiptune',
    bpm: 136,
    duration: 32,
    lead: [
      'E5', 'E5', 'B4', 'C5', 'D5', 'E5', 'D5', 'C5',
      'B4', 'B4', 'C5', 'D5', 'E5', 'C5', 'A4', 'A4',
      'D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'C5', 'E5',
      'D5', 'C5', 'B4', 'B4', 'C5', 'D5', 'E5', 'A4'
    ],
    arp: [
      'A3', 'C4', 'E4', 'A4', 'E3', 'G#3', 'B3', 'E4',
      'A3', 'C4', 'E4', 'A4', 'D3', 'F3', 'A3', 'D4',
      'F3', 'A3', 'C4', 'F4', 'C3', 'E3', 'G3', 'C4',
      'E3', 'G#3', 'B3', 'E4', 'A3', 'C4', 'E4', 'A4'
    ],
    bass: [
      'A2', 'A2', 'A2', 'A2', 'E2', 'E2', 'E2', 'E2',
      'A2', 'A2', 'A2', 'A2', 'D2', 'D2', 'D2', 'D2',
      'F2', 'F2', 'F2', 'F2', 'C2', 'C2', 'C2', 'C2',
      'E2', 'E2', 'E2', 'E2', 'A2', 'A2', 'A2', 'A2'
    ],
    drums: [
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'K', 'S', 'O',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S'
    ]
  },
  {
    id: 2,
    title: 'Phosphor Dreams',
    artist: 'Jayesh Channe',
    genre: 'Lo-Fi Ambient Chiptune',
    bpm: 96,
    duration: 32,
    lead: [
      'C5', '_', 'E5', 'G5', 'A5', '_', 'G5', 'E5',
      'D5', '_', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5',
      'C5', '_', 'E5', 'A5', 'B5', '_', 'A5', 'G5',
      'F5', 'G5', 'A5', 'E5', 'D5', '_', 'C5', '_'
    ],
    arp: [
      'C4', 'E4', 'G4', 'B4', 'F3', 'A3', 'C4', 'E4',
      'D3', 'F3', 'A3', 'C4', 'G3', 'B3', 'D4', 'F4',
      'A3', 'C4', 'E4', 'G4', 'E3', 'G3', 'B3', 'D4',
      'F3', 'A3', 'C4', 'E4', 'C4', 'E4', 'G4', 'C5'
    ],
    bass: [
      'C2', 'C2', 'F2', 'F2', 'D2', 'D2', 'G2', 'G2',
      'A2', 'A2', 'E2', 'E2', 'F2', 'F2', 'C2', 'C2',
      'C2', 'C2', 'F2', 'F2', 'D2', 'D2', 'G2', 'G2',
      'A2', 'A2', 'E2', 'E2', 'F2', 'G2', 'C2', 'C2'
    ],
    drums: [
      'K', '_', 'S', 'H', 'K', '_', 'S', '_',
      'K', 'H', 'S', '_', 'K', 'K', 'S', 'H',
      'K', '_', 'S', 'H', 'K', '_', 'S', '_',
      'K', 'H', 'S', '_', 'K', '_', 'S', 'O'
    ]
  },
  {
    id: 3,
    title: 'Korobeiniki Arcade',
    artist: 'Russian Folk / 8-Bit',
    genre: 'Classic Arcade',
    bpm: 144,
    duration: 32,
    lead: [
      'E5', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'A4',
      'C5', 'E5', 'D5', 'C5', 'B4', 'C5', 'D5', 'E5',
      'C5', 'A4', 'A4', '_', 'D5', 'F5', 'A5', 'G5',
      'F5', 'E5', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4'
    ],
    arp: [
      'E4', 'G#4', 'B4', 'E5', 'A3', 'C4', 'E4', 'A4',
      'E3', 'G#3', 'B3', 'E4', 'A3', 'C4', 'E4', 'A4',
      'D3', 'F3', 'A3', 'D4', 'C3', 'E3', 'G3', 'C4',
      'E3', 'G#3', 'B3', 'E4', 'A3', 'C4', 'E4', 'A4'
    ],
    bass: [
      'E2', 'E2', 'A2', 'A2', 'E2', 'E2', 'A2', 'A2',
      'D2', 'D2', 'C2', 'C2', 'E2', 'E2', 'A2', 'A2',
      'E2', 'E2', 'A2', 'A2', 'E2', 'E2', 'A2', 'A2',
      'D2', 'D2', 'C2', 'C2', 'E2', 'E2', 'A2', 'A2'
    ],
    drums: [
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'K', 'S', 'O'
    ]
  },
  {
    id: 4,
    title: 'Midnight Terminal',
    artist: 'Jayesh Channe',
    genre: 'Dark Cyber Synth',
    bpm: 112,
    duration: 32,
    lead: [
      'D5', 'F5', 'A5', 'G5', 'F5', 'D5', 'C5', 'D5',
      'F5', 'A5', 'C6', 'A5', 'G5', 'F5', 'D5', '_',
      'D5', 'D5', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5',
      'C6', 'A5', 'G5', 'F5', 'D5', 'C5', 'D5', '_'
    ],
    arp: [
      'D3', 'F3', 'A3', 'D4', 'G3', 'A#3', 'D4', 'G4',
      'A#3', 'D4', 'F4', 'A#4', 'C4', 'E4', 'G4', 'C5',
      'D3', 'F3', 'A3', 'D4', 'F3', 'A3', 'C4', 'F4',
      'G3', 'A#3', 'D4', 'G4', 'A3', 'C#4', 'E4', 'A4'
    ],
    bass: [
      'D2', 'D2', 'G2', 'G2', 'A#2', 'A#2', 'C2', 'C2',
      'D2', 'D2', 'F2', 'F2', 'G2', 'G2', 'A2', 'A2',
      'D2', 'D2', 'G2', 'G2', 'A#2', 'A#2', 'C2', 'C2',
      'D2', 'D2', 'F2', 'F2', 'G2', 'G2', 'D2', 'D2'
    ],
    drums: [
      'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', '_', 'S', 'O',
      'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'S', 'K', 'O'
    ]
  },
  {
    id: 5,
    title: 'Space Odyssey 8-Bit',
    artist: 'Jayesh Channe',
    genre: 'Retro Sci-Fi Theme',
    bpm: 120,
    duration: 32,
    lead: [
      'G4', 'C5', 'G5', '_', 'F5', 'E5', 'D5', 'C5',
      'D5', 'G5', 'B5', '_', 'A5', 'G5', 'F5', 'E5',
      'E5', 'A5', 'C6', '_', 'B5', 'A5', 'G5', 'F5',
      'G5', 'C6', 'E6', 'D6', 'C6', 'B5', 'C6', '_'
    ],
    arp: [
      'C3', 'G3', 'C4', 'E4', 'G3', 'D4', 'G4', 'B4',
      'A3', 'E4', 'A4', 'C5', 'F3', 'C4', 'F4', 'A4',
      'C3', 'G3', 'C4', 'E4', 'G3', 'D4', 'G4', 'B4',
      'F3', 'C4', 'F4', 'A4', 'G3', 'D4', 'G4', 'B4'
    ],
    bass: [
      'C2', 'C2', 'G2', 'G2', 'A2', 'A2', 'F2', 'F2',
      'C2', 'C2', 'G2', 'G2', 'F2', 'F2', 'G2', 'G2',
      'C2', 'C2', 'G2', 'G2', 'A2', 'A2', 'F2', 'F2',
      'C2', 'C2', 'F2', 'F2', 'G2', 'G2', 'C2', 'C2'
    ],
    drums: [
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'K', 'S', 'H', 'K', 'S', 'O', 'O'
    ]
  },
  {
    id: 6,
    title: 'Nokia 3310 Nostalgia',
    artist: 'Retro Monophonic',
    genre: 'Vintage Ringtone Groove',
    bpm: 128,
    duration: 32,
    lead: [
      'E5', 'D5', 'F#4', 'G#4', 'C#5', 'B4', 'D4', 'E4',
      'B4', 'A4', 'C#4', 'E4', 'A4', '_', '_', '_',
      'E5', 'D5', 'F#4', 'G#4', 'C#5', 'B4', 'D4', 'E4',
      'B4', 'A4', 'C#4', 'E4', 'A4', 'C5', 'E5', 'A5'
    ],
    arp: [
      'A3', 'C#4', 'E4', 'A4', 'D3', 'F#3', 'A3', 'D4',
      'E3', 'G#3', 'B3', 'E4', 'A3', 'C#4', 'E4', 'A4',
      'A3', 'C#4', 'E4', 'A4', 'D3', 'F#3', 'A3', 'D4',
      'E3', 'G#3', 'B3', 'E4', 'A3', 'C#4', 'E4', 'A4'
    ],
    bass: [
      'A2', 'A2', 'D2', 'D2', 'E2', 'E2', 'A2', 'A2',
      'A2', 'A2', 'D2', 'D2', 'E2', 'E2', 'A2', 'A2',
      'A2', 'A2', 'D2', 'D2', 'E2', 'E2', 'A2', 'A2',
      'A2', 'A2', 'D2', 'D2', 'E2', 'E2', 'A2', 'A2'
    ],
    drums: [
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'O',
      'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
      'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S'
    ]
  }
];

// Initialize Audio Context & Analyser
const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // 32 frequency bins for crisp VU meter

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);

    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play synthesized note with ADSR envelope
const playSynthNote = (freq, duration, type, volume, attack = 0.01, decay = 0.08) => {
  if (!freq || freq <= 0) return;
  try {
    const ctx = initAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// Play drum sound
const playDrum = (type) => {
  try {
    const ctx = initAudioContext();
    if (type === 'K') {
      // 8-Bit Kick: fast downward frequency sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'S') {
      // 8-Bit Snare: noise burst + mid body
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      noise.connect(gain);
      gain.connect(masterGain);
      noise.start();
    } else if (type === 'H' || type === 'O') {
      // Hi-Hat: short crisp noise burst
      const bufferSize = ctx.sampleRate * (type === 'O' ? 0.07 : 0.02);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'O' ? 0.07 : 0.02));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start();
    }
  } catch (e) {}
};

// Notify all subscribers
const notifyListeners = () => {
  const state = getPlaybackState();
  listeners.forEach(fn => fn(state));
};

// Main sequencer step loop
const executeStep = () => {
  if (!isPlaying) return;
  const track = TRACKS[currentTrackIndex];
  const stepTime = (60 / track.bpm) / 2; // 8th note duration

  // 1. Play Lead Voice (Square)
  const leadNote = track.lead[currentStep % track.lead.length];
  if (leadNote && NOTES[leadNote]) {
    playSynthNote(NOTES[leadNote], stepTime * 0.9, 'square', 0.16);
  }

  // 2. Play Arpeggio Voice (Sawtooth)
  const arpNote = track.arp[currentStep % track.arp.length];
  if (arpNote && NOTES[arpNote]) {
    playSynthNote(NOTES[arpNote], stepTime * 0.75, 'sawtooth', 0.09);
  }

  // 3. Play Bass Voice (Triangle)
  const bassNote = track.bass[currentStep % track.bass.length];
  if (bassNote && NOTES[bassNote]) {
    playSynthNote(NOTES[bassNote], stepTime * 0.95, 'triangle', 0.22);
  }

  // 4. Play Percussion
  const drumHit = track.drums[currentStep % track.drums.length];
  if (drumHit && drumHit !== '_') {
    playDrum(drumHit);
  }

  // Advance step
  currentStep++;
  if (currentStep >= track.lead.length) {
    if (isLooping) {
      currentStep = 0;
    } else {
      nextTrack();
      return;
    }
  }

  notifyListeners();
  playbackTimer = setTimeout(executeStep, stepTime * 1000);
};

let streamAudioEl = null;
let streamSourceNode = null;
let activeStreamTrack = null;
let streamCurrentTime = 0;
let streamDuration = 0;

// Setup Stream Audio Element
const initStreamAudio = () => {
  const ctx = initAudioContext();
  if (!streamAudioEl) {
    streamAudioEl = new Audio();
    streamAudioEl.crossOrigin = 'anonymous';

    try {
      streamSourceNode = ctx.createMediaElementSource(streamAudioEl);
      streamSourceNode.connect(analyser);
    } catch (e) {}

    streamAudioEl.addEventListener('timeupdate', () => {
      if (streamAudioEl) {
        streamCurrentTime = streamAudioEl.currentTime || 0;
        streamDuration = streamAudioEl.duration || (activeStreamTrack ? activeStreamTrack.duration : 180);
        notifyListeners();
      }
    });

    streamAudioEl.addEventListener('ended', () => {
      if (isLooping && streamAudioEl) {
        streamAudioEl.currentTime = 0;
        streamAudioEl.play();
      } else {
        nextTrack();
      }
    });

    streamAudioEl.addEventListener('error', () => {
      console.warn('Audio stream error, falling back');
    });
  }
  if (streamAudioEl) {
    streamAudioEl.volume = currentVolume;
  }
  return streamAudioEl;
};

// Play mechanical cassette deck sound effects (subtle button click)
export const playMechanicalSound = (type = 'click') => {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3 * currentVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {}
};

// No-op for removed cassette sounds
export const playCassetteEjectSFX = () => {};
export const playCassetteInsertionSFX = () => {};

// Play authentic radio tuning white noise hiss
export const playRadioTuningHiss = (durationSec = 0.25) => {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18 * currentVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
};

import {
  playYouTubeVideo,
  pauseYouTubeVideo,
  resumeYouTubeVideo,
  stopYouTubeVideo,
  seekYouTubeVideo,
  setYouTubeVolume,
  setYouTubeLoop,
} from './youtubeAudio';

let streamPlaylist = [];
let streamPlaylistIndex = -1;

// Load and play a local audio file from user's disk
export const loadLocalAudioFile = (file) => {
  if (!file) return;
  const objectUrl = URL.createObjectURL(file);
  playStreamTrack({
    id: `local-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ''),
    artist: 'Local Audio File (Cassette Deck)',
    genre: 'Custom Master Tape',
    duration: 180,
    streamUrl: objectUrl,
    isLocal: true,
  });
};

// Seek audio track
export const seekTrack = (targetPercent) => {
  const percent = Math.max(0, Math.min(1, targetPercent));
  if (activeStreamTrack?.isYouTube) {
    seekYouTubeVideo(percent);
    streamCurrentTime = (streamDuration || 180) * percent;
    notifyListeners();
    return;
  }

  if (activeStreamTrack && streamAudioEl) {
    const dur = (streamAudioEl.duration && !isNaN(streamAudioEl.duration) && streamAudioEl.duration > 0)
      ? streamAudioEl.duration
      : (activeStreamTrack.duration || 180);
    try {
      streamAudioEl.currentTime = dur * percent;
      streamCurrentTime = streamAudioEl.currentTime;
    } catch (e) {}
    notifyListeners();
  } else {
    const track = TRACKS[currentTrackIndex];
    currentStep = Math.floor(track.lead.length * percent);
    notifyListeners();
  }
};

// Play a searched YouTube or custom stream track immediately
export const playStreamTrack = (trackObj, playlist = null) => {
  initAudioContext();

  if (playlist && Array.isArray(playlist)) {
    streamPlaylist = playlist;
    streamPlaylistIndex = playlist.findIndex(p => p.id === trackObj.id);
  }

  // Stop procedural synth
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  // If YouTube Video track
  if (trackObj.isYouTube || trackObj.videoId) {
    if (streamAudioEl && !streamAudioEl.paused) {
      streamAudioEl.pause();
    }

    activeStreamTrack = {
      id: trackObj.id || `yt-${trackObj.videoId}`,
      title: trackObj.title || 'YouTube Audio',
      artist: trackObj.artist || 'YouTube Music',
      genre: trackObj.genre || 'YouTube Stream',
      bpm: trackObj.bpm || 128,
      duration: trackObj.duration || 210,
      videoId: trackObj.videoId,
      isYouTube: true,
      isStream: true,
    };

    streamCurrentTime = 0;
    streamDuration = trackObj.duration || 210;
    isPlaying = true;

    playYouTubeVideo(trackObj.videoId, {
      onTimeUpdate: (curTime, dur) => {
        streamCurrentTime = curTime;
        if (dur && dur > 0) streamDuration = dur;
        notifyListeners();
      },
      onEnded: () => {
        if (!isLooping) {
          nextTrack();
        }
      },
    });

    notifyListeners();
    return;
  }

  // Standard Audio Stream (HTML5 Audio)
  stopYouTubeVideo();
  const el = initStreamAudio();

  activeStreamTrack = {
    id: trackObj.id || 'stream-1',
    title: trackObj.title || 'Streamed Audio',
    artist: trackObj.artist || 'Web Stream',
    genre: trackObj.genre || 'Streamed Track',
    bpm: trackObj.bpm || 128,
    duration: trackObj.duration || 180,
    streamUrl: trackObj.streamUrl,
    isStream: true,
  };

  el.src = trackObj.streamUrl;
  el.currentTime = 0;
  streamCurrentTime = 0;
  streamDuration = trackObj.duration || 180;
  isPlaying = true;

  el.play().catch(() => {});
  notifyListeners();
};

// Public Control APIs
export const playTrack = (index = null) => {
  initAudioContext();

  // 1. If resuming active YouTube track
  if (activeStreamTrack?.isYouTube && index === null) {
    isPlaying = true;
    resumeYouTubeVideo();
    notifyListeners();
    return;
  }

  // 2. If resuming active HTML5 stream track
  if (activeStreamTrack && streamAudioEl && index === null) {
    isPlaying = true;
    streamAudioEl.play().catch(() => {});
    notifyListeners();
    return;
  }

  // 3. Switching to procedural chiptune
  stopYouTubeVideo();
  if (streamAudioEl && !streamAudioEl.paused) {
    streamAudioEl.pause();
  }
  activeStreamTrack = null;

  if (index !== null && index >= 0 && index < TRACKS.length) {
    currentTrackIndex = index;
    currentStep = 0;
  }

  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  isPlaying = true;
  executeStep();
  notifyListeners();
};

export const pauseTrack = () => {
  isPlaying = false;
  if (activeStreamTrack?.isYouTube) {
    pauseYouTubeVideo();
  }
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  if (streamAudioEl && !streamAudioEl.paused) {
    streamAudioEl.pause();
  }
  notifyListeners();
};

export const stopTrack = () => {
  pauseTrack();
  currentStep = 0;
  streamCurrentTime = 0;
  if (activeStreamTrack?.isYouTube) {
    stopYouTubeVideo();
  }
  if (streamAudioEl) {
    try {
      streamAudioEl.currentTime = 0;
    } catch (e) {}
  }
  notifyListeners();
};

export const nextTrack = () => {
  // If active stream (YouTube or HTML5) and we have a playlist queue
  if (activeStreamTrack && streamPlaylist.length > 0 && streamPlaylistIndex >= 0) {
    const nextIdx = (streamPlaylistIndex + 1) % streamPlaylist.length;
    streamPlaylistIndex = nextIdx;
    playStreamTrack(streamPlaylist[nextIdx], streamPlaylist);
    return;
  }

  // YouTube without playlist: skip 15s
  if (activeStreamTrack?.isYouTube) {
    const cur = streamCurrentTime + 15;
    const dur = streamDuration || 210;
    seekTrack(Math.min(0.99, cur / dur));
    return;
  }

  // HTML5 audio stream: fast-forward 15s
  if (activeStreamTrack && streamAudioEl) {
    try {
      streamAudioEl.currentTime = Math.min(streamAudioEl.duration || 180, streamAudioEl.currentTime + 15);
      notifyListeners();
    } catch (e) {}
    return;
  }

  // Procedural track next
  if (isShuffled) {
    let nextIndex = Math.floor(Math.random() * TRACKS.length);
    if (nextIndex === currentTrackIndex && TRACKS.length > 1) {
      nextIndex = (nextIndex + 1) % TRACKS.length;
    }
    playTrack(nextIndex);
  } else {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    playTrack(nextIndex);
  }
};

export const prevTrack = () => {
  // If active stream and we have a playlist queue
  if (activeStreamTrack && streamPlaylist.length > 0 && streamPlaylistIndex >= 0) {
    if (streamCurrentTime > 3) {
      seekTrack(0);
      return;
    }
    const prevIdx = (streamPlaylistIndex - 1 + streamPlaylist.length) % streamPlaylist.length;
    streamPlaylistIndex = prevIdx;
    playStreamTrack(streamPlaylist[prevIdx], streamPlaylist);
    return;
  }

  // If YouTube: rewind 15s or back to 0
  if (activeStreamTrack?.isYouTube) {
    const cur = Math.max(0, streamCurrentTime - 15);
    const dur = streamDuration || 210;
    seekTrack(cur / dur);
    return;
  }

  // If HTML5 stream: rewind 15s
  if (activeStreamTrack && streamAudioEl) {
    try {
      streamAudioEl.currentTime = Math.max(0, streamAudioEl.currentTime - 15);
      notifyListeners();
    } catch (e) {}
    return;
  }

  // Procedural track prev
  const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
  playTrack(prevIndex);
};

export const setVolume = (val) => {
  currentVolume = Math.max(0, Math.min(1, val));
  setYouTubeVolume(currentVolume);
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
  }
  if (streamAudioEl) {
    streamAudioEl.volume = currentVolume;
  }
  notifyListeners();
};

export const toggleLoop = () => {
  isLooping = !isLooping;
  setYouTubeLoop(isLooping);
  if (streamAudioEl) {
    streamAudioEl.loop = isLooping;
  }
  notifyListeners();
  return isLooping;
};

export const toggleShuffle = () => {
  isShuffled = !isShuffled;
  notifyListeners();
  return isShuffled;
};

export const getPlaybackState = () => {
  if (activeStreamTrack) {
    const dur = streamDuration || activeStreamTrack.duration || 180;
    const progressPercent = dur > 0 ? (streamCurrentTime / dur) * 100 : 0;
    return {
      isPlaying,
      currentTrackIndex: -1,
      track: activeStreamTrack,
      currentStep: Math.floor(streamCurrentTime),
      currentTime: streamCurrentTime,
      duration: dur,
      progressPercent,
      volume: currentVolume,
      isLooping,
      isShuffled,
      isStream: true,
    };
  }

  const track = TRACKS[currentTrackIndex];
  const progressPercent = (currentStep / track.lead.length) * 100;
  return {
    isPlaying,
    currentTrackIndex,
    track,
    currentStep,
    currentTime: Math.floor(currentStep / 2),
    duration: track.duration,
    progressPercent,
    volume: currentVolume,
    isLooping,
    isShuffled,
    isStream: false,
  };
};

export const getAudioAnalyser = () => analyser;

export const subscribePlayback = (fn) => {
  listeners.add(fn);
  fn(getPlaybackState());
  return () => listeners.delete(fn);
};
