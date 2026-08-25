// Headless YouTube Audio Player Bridge using YouTube IFrame API
let ytPlayer = null;
let isYtReady = false;
let ytStatePollInterval = null;
let currentVideoId = null;
let ytVolume = 0.5;
let isYtLooping = false;

// Callbacks registered from chiptuneSynth / MusicPlayer
let onTimeUpdateCb = null;
let onEndedCb = null;
let onStateChangeCb = null;

// Initialize YouTube IFrame API script
export const initYouTubeAPI = () => {
  if (window.YT && window.YT.Player) {
    createHiddenPlayer();
    return;
  }

  if (document.getElementById('yt-iframe-script')) return;

  const tag = document.createElement('script');
  tag.id = 'yt-iframe-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    createHiddenPlayer();
  };
};

const createHiddenPlayer = () => {
  if (ytPlayer) return;

  let container = document.getElementById('yt-audio-player-host');
  if (!container) {
    container = document.createElement('div');
    container.id = 'yt-audio-player-host';
    container.style.position = 'fixed';
    container.style.bottom = '-9999px';
    container.style.right = '-9999px';
    container.style.width = '200px';
    container.style.height = '200px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    document.body.appendChild(container);
  }

  try {
    ytPlayer = new window.YT.Player('yt-audio-player-host', {
      height: '200',
      width: '200',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          isYtReady = true;
          event.target.setVolume(Math.round(ytVolume * 100));
        },
        onStateChange: (event) => {
          // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
          if (event.data === 0) { // ENDED
            if (isYtLooping && ytPlayer) {
              ytPlayer.seekTo(0, true);
              ytPlayer.playVideo();
            } else if (onEndedCb) {
              onEndedCb();
            }
          }
          if (onStateChangeCb) {
            onStateChangeCb(event.data);
          }
        },
        onError: (e) => {
          console.warn('YouTube Player error:', e);
        },
      },
    });
  } catch (err) {
    console.error('Failed to instantiate YouTube player:', err);
  }
};

// Play a YouTube Video by ID
export const playYouTubeVideo = (videoId, callbacks = {}) => {
  initYouTubeAPI();
  currentVideoId = videoId;
  if (callbacks.onTimeUpdate) onTimeUpdateCb = callbacks.onTimeUpdate;
  if (callbacks.onEnded) onEndedCb = callbacks.onEnded;
  if (callbacks.onStateChange) onStateChangeCb = callbacks.onStateChange;

  const startPlaying = () => {
    if (!ytPlayer || !ytPlayer.loadVideoById) {
      setTimeout(startPlaying, 100);
      return;
    }
    try {
      ytPlayer.loadVideoById({
        videoId: videoId,
        suggestedQuality: 'small',
      });
      ytPlayer.setVolume(Math.round(ytVolume * 100));
      ytPlayer.playVideo();
      startProgressPolling();
    } catch (e) {
      console.error('Error playing YouTube video:', e);
    }
  };

  startPlaying();
};

export const pauseYouTubeVideo = () => {
  if (ytPlayer && ytPlayer.pauseVideo) {
    try {
      ytPlayer.pauseVideo();
    } catch (e) {}
  }
  stopProgressPolling();
};

export const resumeYouTubeVideo = () => {
  if (ytPlayer && ytPlayer.playVideo) {
    try {
      ytPlayer.playVideo();
      startProgressPolling();
    } catch (e) {}
  }
};

export const stopYouTubeVideo = () => {
  if (ytPlayer && ytPlayer.stopVideo) {
    try {
      ytPlayer.stopVideo();
    } catch (e) {}
  }
  stopProgressPolling();
};

export const seekYouTubeVideo = (ratio) => {
  if (ytPlayer && ytPlayer.getDuration && ytPlayer.seekTo) {
    try {
      const dur = ytPlayer.getDuration() || 180;
      const targetSec = dur * Math.max(0, Math.min(1, ratio));
      ytPlayer.seekTo(targetSec, true);
      if (onTimeUpdateCb) {
        onTimeUpdateCb(targetSec, dur);
      }
    } catch (e) {}
  }
};

export const setYouTubeVolume = (vol) => {
  ytVolume = Math.max(0, Math.min(1, vol));
  if (ytPlayer && ytPlayer.setVolume) {
    try {
      ytPlayer.setVolume(Math.round(ytVolume * 100));
    } catch (e) {}
  }
};

export const setYouTubeLoop = (looping) => {
  isYtLooping = Boolean(looping);
};

const startProgressPolling = () => {
  stopProgressPolling();
  ytStatePollInterval = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime || !ytPlayer.getDuration) return;
    try {
      const curTime = ytPlayer.getCurrentTime() || 0;
      const dur = ytPlayer.getDuration() || 180;
      if (onTimeUpdateCb) {
        onTimeUpdateCb(curTime, dur);
      }
    } catch (e) {}
  }, 100);
};

const stopProgressPolling = () => {
  if (ytStatePollInterval) {
    clearInterval(ytStatePollInterval);
    ytStatePollInterval = null;
  }
};
