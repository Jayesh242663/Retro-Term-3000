// Pure YouTube Music Search & Discovery Engine for Retro Cassette Deck

// Curated Retro & Nostalgia YouTube Video Stations
export const PRESET_RADIO_STATIONS = [
  {
    station: '88.5 FM',
    name: '8-Bit Arcade Classics',
    track: {
      id: 'yt-wDgQdr8ZkTw',
      videoId: 'wDgQdr8ZkTw',
      title: 'Megalovania (Chiptune OST)',
      artist: 'Toby Fox',
      genre: 'Arcade / Chiptune',
      duration: 156,
      isYouTube: true,
      artwork: 'https://i.ytimg.com/vi/wDgQdr8ZkTw/hqdefault.jpg',
      source: 'Cassette Tape',
    }
  },
  {
    station: '94.2 FM',
    name: 'Lo-Fi Chill & Study Beats',
    track: {
      id: 'yt-jfKfPfyJRdk',
      videoId: 'jfKfPfyJRdk',
      title: 'lofi hip hop radio - beats to relax/study to',
      artist: 'Lofi Girl',
      genre: 'Lo-Fi Chill',
      duration: 3600,
      isYouTube: true,
      artwork: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      source: 'Cassette Tape',
    }
  },
  {
    station: '98.6 FM',
    name: 'Synthwave & Cyberpunk',
    track: {
      id: 'yt-8GW6sLrK40k',
      videoId: '8GW6sLrK40k',
      title: 'Resonance - HOME',
      artist: 'HOME / Synthwave',
      genre: 'Synthwave 1984',
      duration: 212,
      isYouTube: true,
      artwork: 'https://i.ytimg.com/vi/8GW6sLrK40k/hqdefault.jpg',
      source: 'Cassette Tape',
    }
  },
  {
    station: '103.4 FM',
    name: 'Nintendo Retro Nostalgia',
    track: {
      id: 'yt-MNM8p17G2YQ',
      videoId: 'MNM8p17G2YQ',
      title: 'Super Mario Bros. Theme (Original NES)',
      artist: 'Koji Kondo / Nintendo',
      genre: 'NES Classic',
      duration: 180,
      isYouTube: true,
      artwork: 'https://i.ytimg.com/vi/MNM8p17G2YQ/hqdefault.jpg',
      source: 'Cassette Tape',
    }
  },
  {
    station: '107.9 FM',
    name: 'Legend of Zelda Chill',
    track: {
      id: 'yt-cAVn710rI2g',
      videoId: 'cAVn710rI2g',
      title: "Zelda's Lullaby (Ocarina of Time)",
      artist: 'Koji Kondo / Zelda OST',
      genre: 'Game OST',
      duration: 198,
      isYouTube: true,
      artwork: 'https://i.ytimg.com/vi/cAVn710rI2g/hqdefault.jpg',
      source: 'Cassette Tape',
    }
  }
];

// Format seconds into mm:ss
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Extract YouTube video ID from various YouTube URL formats or raw 11-character IDs
export const extractYouTubeVideoId = (input) => {
  if (!input) return null;
  const str = input.trim();

  // Direct video ID (11 chars like dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Standard YouTube URLs (watch, share, embed, shorts)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = str.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

// Fetch YouTube video metadata via oEmbed
export const fetchYouTubeMetadata = async (videoId) => {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: `yt-${videoId}`,
        videoId: videoId,
        title: data.title || `Audio Track [${videoId}]`,
        artist: data.author_name || 'Artist',
        genre: 'Cassette Tape',
        duration: 210,
        isYouTube: true,
        artwork: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        source: 'Cassette Tape',
      };
    }
  } catch (e) {}

  return {
    id: `yt-${videoId}`,
    videoId: videoId,
    title: `Audio Track (${videoId})`,
    artist: 'Artist',
    genre: 'Cassette Tape',
    duration: 210,
    isYouTube: true,
    artwork: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    source: 'Cassette Tape',
  };
};

// Search YouTube by Keywords/Phrases (Filtered for Lyrical Videos)
export const searchYouTubeTracks = async (query) => {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.trim();

  // 1. Direct YouTube link or ID
  const directYtId = extractYouTubeVideoId(cleanQuery);
  if (directYtId) {
    const ytTrack = await fetchYouTubeMetadata(directYtId);
    return [ytTrack];
  }

  // 2. Check preset radio library for matching keywords
  const lowerQuery = cleanQuery.toLowerCase();
  const presetMatches = PRESET_RADIO_STATIONS
    .filter(s => s.track.title.toLowerCase().includes(lowerQuery) || s.track.artist.toLowerCase().includes(lowerQuery) || s.track.genre.toLowerCase().includes(lowerQuery))
    .map(s => s.track);

  // 3. Query YouTube search endpoint with Lyrical Filter
  const lyricSearchQuery = lowerQuery.includes('lyric') ? cleanQuery : `${cleanQuery} lyrics`;
  let ytResults = [];

  // A. Try API endpoint (uses Vercel serverless API if hosted on GitHub Pages)
  try {
    const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
    const apiEndpoint = isGitHubPages
      ? `https://retro-term-3000.vercel.app/api/yt-search?q=${encodeURIComponent(lyricSearchQuery)}`
      : `/api/yt-search?q=${encodeURIComponent(lyricSearchQuery)}`;

    const res = await fetch(apiEndpoint, {
      signal: AbortSignal.timeout(4500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        ytResults = data;
      }
    }
  } catch (e) {}

  // B. Fallback to client-side CORS proxy if needed
  if (ytResults.length === 0) {
    try {
      const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(lyricSearchQuery)}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
        if (match) {
          const data = JSON.parse(match[1]);
          const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
          for (const item of contents) {
            const v = item.videoRenderer;
            if (v && v.videoId) {
              const lengthText = v.lengthText?.simpleText || '3:30';
              const parts = lengthText.split(':').map(Number);
              const durationSec = parts.length === 2 ? parts[0] * 60 + parts[1] : (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 210);
              ytResults.push({
                id: `yt-${v.videoId}`,
                videoId: v.videoId,
                title: v.title?.runs?.[0]?.text || 'Audio Track',
                artist: v.ownerText?.runs?.[0]?.text || 'Artist',
                genre: 'Cassette Tape',
                duration: durationSec,
                isYouTube: true,
                artwork: v.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                source: 'Cassette Tape',
              });
            }
          }
        }
      }
    } catch (e) {}
  }

  // Merge and deduplicate
  const combined = [...presetMatches, ...ytResults];
  const seen = new Set();
  const unique = [];

  for (const track of combined) {
    if (track.videoId && !seen.has(track.videoId)) {
      seen.add(track.videoId);
      unique.push(track);
    }
  }

  if (unique.length > 0) {
    return unique.slice(0, 10);
  }

  return PRESET_RADIO_STATIONS.map(s => s.track);
};

export const searchTracks = searchYouTubeTracks;
