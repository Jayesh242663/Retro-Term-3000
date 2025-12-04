// Retro computer sound effects using Web Audio API
let audioContext = null;
let ambientNoiseNodes = null;
let isAmbientPlaying = false;
let isSoundMuted = false; // Global mute state

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Check if sounds are muted
export const isMuted = () => isSoundMuted;

// Mute all sounds
export const muteAllSounds = () => {
  isSoundMuted = true;
  stopAmbientNoise();
};

// Unmute all sounds
export const unmuteAllSounds = () => {
  isSoundMuted = false;
  startAmbientNoise();
};

// Toggle all sounds
export const toggleAllSounds = () => {
  if (isSoundMuted) {
    unmuteAllSounds();
    return true; // sounds are now ON
  } else {
    muteAllSounds();
    return false; // sounds are now OFF
  }
};

// Resume audio context on user interaction (required by browsers)
export const initAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  // Start ambient noise when audio is initialized
  if (!isAmbientPlaying) {
    startAmbientNoise();
  }
};

// Background ambient CRT/computer hum noise
export const startAmbientNoise = () => {
  if (isAmbientPlaying || isSoundMuted) return;
  
  try {
    const ctx = getAudioContext();
    
    // Master gain for all ambient sounds
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.03, ctx.currentTime); // Very quiet
    masterGain.connect(ctx.destination);
    
    // 1. 60Hz mains hum (electrical hum from power supply)
    const hum60 = ctx.createOscillator();
    const hum60Gain = ctx.createGain();
    hum60.type = 'sine';
    hum60.frequency.setValueAtTime(60, ctx.currentTime);
    hum60Gain.gain.setValueAtTime(0.4, ctx.currentTime);
    hum60.connect(hum60Gain);
    hum60Gain.connect(masterGain);
    hum60.start();
    
    // 2. 120Hz harmonic (second harmonic of mains hum)
    const hum120 = ctx.createOscillator();
    const hum120Gain = ctx.createGain();
    hum120.type = 'sine';
    hum120.frequency.setValueAtTime(120, ctx.currentTime);
    hum120Gain.gain.setValueAtTime(0.2, ctx.currentTime);
    hum120.connect(hum120Gain);
    hum120Gain.connect(masterGain);
    hum120.start();
    
    // 3. High-pitched CRT whine (15.7kHz - horizontal scan frequency)
    const crtWhine = ctx.createOscillator();
    const crtWhineGain = ctx.createGain();
    const crtWhineFilter = ctx.createBiquadFilter();
    crtWhine.type = 'sine';
    crtWhine.frequency.setValueAtTime(15700, ctx.currentTime);
    // Add slight wobble to the whine
    const wobble = ctx.createOscillator();
    const wobbleGain = ctx.createGain();
    wobble.frequency.setValueAtTime(0.5, ctx.currentTime);
    wobbleGain.gain.setValueAtTime(50, ctx.currentTime);
    wobble.connect(wobbleGain);
    wobbleGain.connect(crtWhine.frequency);
    wobble.start();
    
    crtWhineFilter.type = 'bandpass';
    crtWhineFilter.frequency.setValueAtTime(15700, ctx.currentTime);
    crtWhineFilter.Q.setValueAtTime(10, ctx.currentTime);
    crtWhineGain.gain.setValueAtTime(0.15, ctx.currentTime);
    crtWhine.connect(crtWhineFilter);
    crtWhineFilter.connect(crtWhineGain);
    crtWhineGain.connect(masterGain);
    crtWhine.start();
    
    // 4. Low rumble (fan/drive noise simulation)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    
    // Store references to stop later
    ambientNoiseNodes = {
      masterGain,
      oscillators: [hum60, hum120, crtWhine, wobble],
      bufferSources: [noise]
    };
    
    isAmbientPlaying = true;
  } catch (e) {
    console.log('Ambient audio not available:', e);
  }
};

// Stop ambient noise
export const stopAmbientNoise = () => {
  if (!isAmbientPlaying || !ambientNoiseNodes) return;
  
  try {
    const ctx = getAudioContext();
    
    // Fade out
    ambientNoiseNodes.masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    // Stop all oscillators and sources after fade
    setTimeout(() => {
      ambientNoiseNodes.oscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      ambientNoiseNodes.bufferSources.forEach(src => {
        try { src.stop(); } catch (e) {}
      });
      ambientNoiseNodes = null;
      isAmbientPlaying = false;
    }, 600);
  } catch (e) {
    console.log('Error stopping ambient noise:', e);
  }
};

// Toggle ambient noise
export const toggleAmbientNoise = () => {
  if (isAmbientPlaying) {
    stopAmbientNoise();
    return false;
  } else {
    startAmbientNoise();
    return true;
  }
};

// Check if ambient is playing
export const isAmbientNoisePlaying = () => isAmbientPlaying;

// Typing/keystroke sound - mechanical keyboard click
export const playKeySound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Create noise for the click
    const bufferSize = ctx.sampleRate * 0.02; // 20ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise burst
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Filter to shape the click
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.02);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Command enter/submit sound - realistic relay click
export const playEnterSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Relay/switch click sound - two parts: initial click + release
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Initial sharp click
    for (let i = 0; i < bufferSize * 0.1; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.02));
    }
    // Secondary softer click (mechanical bounce)
    const secondClickStart = Math.floor(bufferSize * 0.15);
    for (let i = 0; i < bufferSize * 0.05; i++) {
      data[secondClickStart + i] += (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (bufferSize * 0.01));
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Shape it to sound like a heavy switch
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Error sound - realistic terminal error buzz/static
export const playErrorSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Create harsh static burst
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Modulated noise for that buzzing quality
      const envelope = Math.exp(-i / (bufferSize * 0.5));
      const modulation = Math.sin(i / (ctx.sampleRate / 120)) * 0.5 + 0.5; // 120Hz modulation
      data[i] = (Math.random() * 2 - 1) * envelope * modulation;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Boot up sound - realistic HDD spin-up and seek sounds
export const playBootSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // HDD spin-up whine
    const spinUpDuration = 0.8;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + spinUpDuration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    
    oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + spinUpDuration * 0.5);
    oscGain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + spinUpDuration);
    
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + spinUpDuration);
    
  } catch (e) {
    console.log('Audio not available');
  }
};

// Boot complete sound - realistic POST beep (single tone like old BIOSes)
export const playBootCompleteSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Classic single POST beep - square wave around 1kHz
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    
    // Add slight filter to soften harshness
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.log('Audio not available');
  }
};

// CRT power on sound - realistic degauss/power surge
export const playCRTOnSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Create the "thunk" of CRT powering on
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Low frequency thump
      const thump = Math.sin(2 * Math.PI * 50 * t) * Math.exp(-t * 8);
      // High frequency crackle
      const crackle = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.3;
      // Electrical hum that builds
      const hum = Math.sin(2 * Math.PI * 60 * t) * (1 - Math.exp(-t * 5)) * Math.exp(-t * 2) * 0.2;
      
      data[i] = thump + crackle + hum;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    
    noiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Beep for loading progress - realistic HDD seek/click
export const playProgressBeep = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // HDD head seek click
    const bufferSize = ctx.sampleRate * 0.015;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.015);
  } catch (e) {
    console.log('Audio not available');
  }
};

// CRT power off sound - realistic discharge/collapse (always plays, even when muted)
export const playCRTOffSound = () => {
  // Note: This sound always plays regardless of mute state for power off feedback
  try {
    const ctx = getAudioContext();
    
    // Create the "winding down" discharge sound of CRT
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Descending whine (degauss coil)
      const whine = Math.sin(2 * Math.PI * (8000 - 7500 * t) * t) * Math.exp(-t * 3) * 0.15;
      // Low thump as power dies
      const thump = Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 6) * 0.4;
      // Static crackle
      const crackle = (Math.random() * 2 - 1) * Math.exp(-t * 4) * 0.2;
      // Final "ping" as the screen collapses to a line
      const ping = t > 0.2 ? Math.sin(2 * Math.PI * 200 * t) * Math.exp(-(t - 0.2) * 10) * 0.3 : 0;
      
      data[i] = whine + thump + crackle + ping;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
    
    noiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Theme switch sound - realistic toggle switch click
export const playThemeSwitchSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Physical toggle switch - click on, click off feel
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Sharp initial contact
    for (let i = 0; i < bufferSize * 0.3; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.05));
    }
    // Mechanical settle
    const settleStart = Math.floor(bufferSize * 0.4);
    for (let i = 0; i < bufferSize * 0.2; i++) {
      data[settleStart + i] = (Math.random() * 2 - 1) * 0.4 * Math.exp(-i / (bufferSize * 0.03));
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Click sound - for UI button interactions
export const playClickSound = () => {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    
    // Short, subtle click for UI buttons
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Quick click
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.03);
  } catch (e) {
    console.log('Audio not available');
  }
};
