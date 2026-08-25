import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Custom plugin to provide local YouTube search endpoint
const youtubeSearchPlugin = () => ({
  name: 'youtube-search-middleware',
  configureServer(server) {
    server.middlewares.use('/api/yt-search', async (req, res) => {
      try {
        const urlObj = new URL(req.url, 'http://localhost');
        const q = urlObj.searchParams.get('q');
        if (!q) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing query parameter q' }));
          return;
        }

        const lyricQuery = q.toLowerCase().includes('lyric') ? q : `${q} lyrics`;
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(lyricQuery)}`;
        const ytRes = await fetch(ytUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });

        const html = await ytRes.text();
        const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
        const results = [];

        if (match) {
          const data = JSON.parse(match[1]);
          const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
          for (const item of contents) {
            const v = item.videoRenderer;
            if (v && v.videoId) {
              const lengthText = v.lengthText?.simpleText || '3:30';
              const parts = lengthText.split(':').map(Number);
              const durationSec = parts.length === 2 ? parts[0] * 60 + parts[1] : (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 210);
              results.push({
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

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results.slice(0, 10)));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), youtubeSearchPlugin()],
  base: '/Retro-Term-3000'
})

