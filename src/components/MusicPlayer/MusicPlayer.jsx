import React, { useState, useEffect, useRef } from 'react';
import {
  TRACKS,
  playTrack,
  playStreamTrack,
  pauseTrack,
  stopTrack,
  nextTrack,
  prevTrack,
  setVolume,
  toggleLoop,
  getAudioAnalyser,
  subscribePlayback,
  playMechanicalSound,
  loadLocalAudioFile,
  seekTrack,
} from './chiptuneSynth';
import {
  searchTracks,
  formatTime,
} from './musicSearch';
import RetroIcon from '../RetroIcon';
import './MusicPlayer.css';

const MusicPlayer = ({ isOpen, onClose, isMinimized: controlledMinimized, onMinimizedChange }) => {
  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    currentTrackIndex: 0,
    track: TRACKS[0],
    currentStep: 0,
    currentTime: 0,
    duration: 32,
    progressPercent: 0,
    volume: 0.5,
    isLooping: true,
    isShuffled: false,
    isStream: false,
  });

  const [internalMinimized, setInternalMinimized] = useState(false);
  const isMinimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;

  const handleSetMinimized = (val) => {
    setInternalMinimized(val);
    if (onMinimizedChange) onMinimizedChange(val);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const scrubberRef = useRef(null);
  const prevTrackTitleRef = useRef('');
  const miniWidgetRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const [miniPos, setMiniPos] = useState(null); // { x, y }

  // Drag Handlers for Minimized Floating Cassette Widget
  const startDrag = (clientX, clientY) => {
    isDraggingRef.current = true;
    const widget = miniWidgetRef.current;
    const rect = widget
      ? widget.getBoundingClientRect()
      : { left: window.innerWidth - 260, top: window.innerHeight - 150 };

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: miniPos ? miniPos.x : rect.left,
      posY: miniPos ? miniPos.y : rect.top,
    };

    const handleMove = (currX, currY) => {
      if (!isDraggingRef.current) return;
      const dx = currX - dragStartRef.current.mouseX;
      const dy = currY - dragStartRef.current.mouseY;
      const widgetWidth = widget ? widget.offsetWidth : 240;
      const widgetHeight = widget ? widget.offsetHeight : 130;

      const newX = Math.max(8, Math.min(window.innerWidth - widgetWidth - 8, dragStartRef.current.posX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - widgetHeight - 8, dragStartRef.current.posY + dy));

      setMiniPos({ x: newX, y: newY });
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const handleMiniMouseDown = (e) => {
    // If clicking on buttons or mini mechanical keys, let the button click through
    if (e.target.closest('button') || e.target.closest('.mini-key') || e.target.tagName === 'BUTTON') {
      return;
    }
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const handleMiniTouchStart = (e) => {
    if (e.target.closest('button') || e.target.closest('.mini-key') || e.target.tagName === 'BUTTON') {
      return;
    }
    if (e.touches && e.touches[0]) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Subscribe to playback state updates
  useEffect(() => {
    const unsubscribe = subscribePlayback((state) => {
      setPlaybackState({ ...state });
      if (state.track && prevTrackTitleRef.current && state.track.title !== prevTrackTitleRef.current) {
        prevTrackTitleRef.current = state.track.title;
        setIsEjecting(true);
        setTimeout(() => {
          setIsEjecting(false);
          setIsInserting(true);
          setTimeout(() => setIsInserting(false), 850);
        }, 600);
      } else if (state.track && !prevTrackTitleRef.current) {
        prevTrackTitleRef.current = state.track.title;
      }
    });
    return () => unsubscribe();
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        playMechanicalSound('click');
        if (playbackState.isPlaying) {
          pauseTrack();
        } else {
          playTrack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, playbackState.isPlaying, onClose]);

  // Handle Search Submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Play searched stream
  const handlePlaySearchResult = (track) => {
    playStreamTrack(track, searchResults);
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadLocalAudioFile(file);
    }
  };

  // Handle click on scrubber
  const handleScrubberClick = (e) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTrack(ratio);
  };

  // Dynamic Tape Reel Thickness Transfer Physics
  const progressRatio = Math.max(0, Math.min(1, playbackState.progressPercent / 100));
  const leftSpoolDiameter = Math.round(62 - 24 * progressRatio);
  const rightSpoolDiameter = Math.round(38 + 24 * progressRatio);
  const miniLeftSpool = Math.round(32 - 12 * progressRatio);
  const miniRightSpool = Math.round(20 + 12 * progressRatio);

  // If not open and not minimized and not playing, nothing to render
  if (!isOpen && !isMinimized && !playbackState.isPlaying) return null;

  // Floating Mini-Cassette Widget (when explicitly minimized or when closed during active playback)
  if (isMinimized || (!isOpen && playbackState.isPlaying)) {
    return (
      <div
        ref={miniWidgetRef}
        className={`mini-cassette-widget ${isEjecting ? 'ejecting-slide' : isInserting ? 'inserting-slide' : ''}`}
        style={miniPos ? { left: `${miniPos.x}px`, top: `${miniPos.y}px`, right: 'auto', bottom: 'auto' } : {}}
        onMouseDown={handleMiniMouseDown}
        onTouchStart={handleMiniTouchStart}
        title="Drag anywhere to move mini cassette"
      >
        {/* 4 Tiny Corner Screws */}
        <div className="mini-screw mini-screw-tl">+</div>
        <div className="mini-screw mini-screw-tr">+</div>
        <div className="mini-screw mini-screw-bl">+</div>
        <div className="mini-screw mini-screw-br">+</div>

        {/* Mini Label */}
        <div className="mini-label">
          <div className="mini-label-stripe" />
          <span className="mini-title-marquee">♪ {playbackState.track.title.toUpperCase()}</span>
          <span className="mini-side">SIDE A</span>
        </div>

        {/* Mini Smoked Acrylic Window with Dual Rotating Spools */}
        <div className="mini-window">
          {/* Left Mini Spool */}
          <div className="mini-spool-assembly">
            <div
              className="mini-tape-roll"
              style={{ width: `${miniLeftSpool}px`, height: `${miniLeftSpool}px` }}
            >
              <div className={`mini-hub ${playbackState.isPlaying ? 'spinning' : ''}`}>
                <div className="mini-teeth" />
              </div>
            </div>
          </div>

          <span className="mini-center-ticks">100 50 0</span>

          {/* Right Mini Spool */}
          <div className="mini-spool-assembly">
            <div
              className="mini-tape-roll"
              style={{ width: `${miniRightSpool}px`, height: `${miniRightSpool}px` }}
            >
              <div className={`mini-hub ${playbackState.isPlaying ? 'spinning' : ''}`}>
                <div className="mini-teeth" />
              </div>
            </div>
          </div>
        </div>

        {/* Mini Mechanical Keys & Controls */}
        <div className="mini-controls">
          <button
            className={`mini-key ${playbackState.isPlaying ? 'depressed' : ''}`}
            onClick={() => {
              playMechanicalSound('click');
              playbackState.isPlaying ? pauseTrack() : playTrack();
            }}
            title={playbackState.isPlaying ? 'Pause' : 'Play'}
          >
            {playbackState.isPlaying ? '❚❚' : '⯈'}
          </button>
          <button
            className="mini-key"
            onClick={() => {
              playMechanicalSound('click');
              nextTrack();
            }}
            title="Next Track"
          >
            ►►
          </button>
          <button
            className="mini-key"
            onClick={() => {
              playMechanicalSound('click');
              handleSetMinimized(false);
            }}
            title="Expand Full Deck"
          >
            <RetroIcon name="deck" size="12px" /> DECK
          </button>
          <button
            className="mini-key"
            onClick={() => {
              playMechanicalSound('eject');
              stopTrack();
              handleSetMinimized(false);
              onClose();
            }}
            title="Stop & Eject"
          >
            ■ EJECT
          </button>
        </div>

        {/* Mini Bottom Progress Line */}
        <div className="mini-progress-line">
          <div
            className="mini-progress-fill"
            style={{ width: `${Math.min(100, playbackState.progressPercent)}%` }}
          />
        </div>
      </div>
    );
  }

  const { track, isPlaying, progressPercent, volume, isLooping } = playbackState;

  // Auto-open drawer when search is triggered
  const handleSearchSubmitWithDrawer = (e) => {
    setIsDrawerOpen(true);
    handleSearchSubmit(e);
  };

  return (
    <div className="music-player-overlay">
      <div className="cassette-deck-window">
        {/* Header */}
        <div className="deck-header">
          <div className="deck-title">
            <RetroIcon name="music" size="15px" /> VINTAGE CASSETTE DECK 3000
          </div>
          <div className="deck-header-actions">
            <button
              className="deck-icon-btn"
              onClick={() => handleSetMinimized(true)}
              title="Minimize to floating widget"
            >
              [ _ ]
            </button>
            <button 
              className="deck-icon-btn deck-close-btn" 
              onClick={onClose}
              title="Close Music Player [ESC]"
            >
              [ ✕ ]
            </button>
          </div>
        </div>

        {/* Deck Body */}
        <div className="deck-body">
          {/* ==========================================================================
              AUTHENTIC CASSETTE TAPE SHELL
              ========================================================================== */}
          <div className={`cassette-shell ${isEjecting ? 'ejecting-slide' : isInserting ? 'inserting-slide' : ''}`}>
            {/* 4 Corner Screws */}
            <div className="screw screw-tl">+</div>
            <div className="screw screw-tr">+</div>
            <div className="screw screw-bl">+</div>
            <div className="screw screw-br">+</div>

            {/* Top Tape Badges */}
            <div className="cassette-top-badges">
              <span>TYPE I • NORMAL BIAS (120µs EQ)</span>
              <span>COMPACT CASSETTE</span>
              <span>DOLBY B-C NR</span>
            </div>

            {/* Authentic Paper Label with Racing Stripes */}
            <div className="cassette-label-realistic">
              <div className="label-stripes" />
              <div className="label-title-row">
                <span className="label-track-name">{track.title.toUpperCase()}</span>
                <span className="label-side-badge">SIDE A</span>
              </div>
              <span className="label-artist-name">
                {track.artist} • {track.genre}
              </span>
            </div>

            {/* Smoked Acrylic Window with Rotating Spools and Tape Transfer Physics */}
            <div className="cassette-acrylic-window">
              {/* Left Supply Spool */}
              <div className="spool-assembly">
                <div
                  className="magnetic-tape-roll"
                  style={{
                    width: `${leftSpoolDiameter}px`,
                    height: `${leftSpoolDiameter}px`,
                  }}
                >
                  <div className={`spool-hub ${isPlaying ? 'spinning' : ''}`}>
                    <div className="spool-teeth" />
                  </div>
                </div>
              </div>

              {/* Center Index Calibration Scale */}
              <div className="tape-center-index">
                <span>100 50 0</span>
                <div className="index-ticks" />
                <span>INDEX</span>
              </div>

              {/* Right Take-Up Spool */}
              <div className="spool-assembly">
                <div
                  className="magnetic-tape-roll"
                  style={{
                    width: `${rightSpoolDiameter}px`,
                    height: `${rightSpoolDiameter}px`,
                  }}
                >
                  <div className={`spool-hub ${isPlaying ? 'spinning' : ''}`}>
                    <div className="spool-teeth" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tape Guide & Magnetic Head Bridge */}
            <div className="cassette-bottom-bridge">
              <div className="tape-guide-pin" />
              <div className="tape-magnetic-head" />
              <div className="tape-guide-pin" />
            </div>
          </div>

          {/* ==========================================================================
              AUTHENTIC MECHANICAL CASSETTE BUTTON KEYS (Matching Cassette Housing)
              ========================================================================== */}
          <div className="cassette-keys-chassis">
            <div className="mechanical-transport-keys">
              <button
                className="cassette-key"
                onClick={() => {
                  playMechanicalSound('click');
                  prevTrack();
                }}
                title="Rewind / Previous"
              >
                <span className="key-symbol">◄◄</span>
                <span className="key-label">REW</span>
              </button>

              <button
                className={`cassette-key ${isPlaying ? 'depressed' : ''}`}
                onClick={() => {
                  playMechanicalSound('click');
                  playTrack();
                }}
                title="Play"
              >
                <span className="key-symbol">⯈</span>
                <span className="key-label">PLAY</span>
              </button>

              <button
                className={`cassette-key ${!isPlaying ? 'depressed' : ''}`}
                onClick={() => {
                  playMechanicalSound('click');
                  pauseTrack();
                }}
                title="Pause"
              >
                <span className="key-symbol">❚❚</span>
                <span className="key-label">PAUSE</span>
              </button>

              <button
                className="cassette-key"
                onClick={() => {
                  playMechanicalSound('eject');
                  stopTrack();
                }}
                title="Stop / Eject"
              >
                <span className="key-symbol">■</span>
                <span className="key-label">STOP</span>
              </button>

              <button
                className="cassette-key"
                onClick={() => {
                  playMechanicalSound('click');
                  nextTrack();
                }}
                title="Fast Forward / Next"
              >
                <span className="key-symbol">►►</span>
                <span className="key-label">F.FWD</span>
              </button>

              <button
                className={`cassette-key ${isLooping ? 'depressed' : ''}`}
                onClick={() => {
                  playMechanicalSound('click');
                  toggleLoop();
                }}
                title="Auto-Reverse Loop"
              >
                <span className="key-symbol">⟲</span>
                <span className="key-label">{isLooping ? 'LOOP' : 'ONCE'}</span>
              </button>
            </div>
          </div>

          {/* Track Progress Scrubber & Player Length Indicator */}
          <div className="track-scrubber">
            <span className="time-stamp">
              {formatTime(playbackState.currentTime || Math.floor(playbackState.currentStep / 2))}
            </span>
            <div
              className="progress-track"
              ref={scrubberRef}
              onClick={handleScrubberClick}
              title="Click to seek"
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
            <span className="time-stamp">
              {formatTime(playbackState.duration || track.duration)}
            </span>
          </div>

          {/* Collapsible Drawer Toggle Button */}
          <button
            type="button"
            className="deck-drawer-toggle"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            title="Toggle Search & Audio Drawer"
          >
            <span>{isDrawerOpen ? '▲ COLLAPSE SEARCH & DRAWER' : '▼ SEARCH LYRICS & AUDIO CONTROLS'}</span>
            <span className="drawer-indicator">{isDrawerOpen ? '[-]' : '[+]'}</span>
          </button>

          {/* Collapsible Drawer Area */}
          {isDrawerOpen && (
            <div className="deck-drawer-content">
              {/* Terminal Typography Search Bar (Lyrical Tracks) */}
              <div className="deck-search-section">
                <form className="deck-search-bar" onSubmit={handleSearchSubmitWithDrawer}>
                  <input
                    type="text"
                    className="deck-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <button type="submit" className="deck-search-btn" disabled={isSearching} title="Search Lyrical Tracks">
                    {isSearching ? '...' : <RetroIcon name="search" size="14px" />}
                  </button>
                </form>

                {/* Live Search Results */}
                {hasSearched && (
                  <div className="deck-search-results">
                    {searchResults.length === 0 ? (
                      <span className="deck-no-results">
                        No tracks found for "{searchQuery}".
                      </span>
                    ) : (
                      searchResults.map((item) => (
                        <div key={item.id} className="search-result-item">
                          <div className="result-info">
                            <span className="result-title">
                              {item.title}
                            </span>
                            <span className="result-artist">
                              {item.artist} • {formatTime(item.duration)}
                            </span>
                          </div>
                          <div className="result-actions">
                            <button
                              className="result-play-btn"
                              onClick={() => handlePlaySearchResult(item)}
                              title="Load and Play on Tape"
                            >
                              <RetroIcon name="tape" size="15px" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Volume Row */}
              <div className="deck-bottom-row">
                <div className="volume-wrapper">
                  <span>VOLUME:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="crt-range"
                  />
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                  PRESS [SPACE] TO PLAY/PAUSE
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
