import React, { useState, useEffect } from 'react';
import { ASCII_MAP_CREDIT } from './telemetryData';
import AsciiGlobe from '../AsciiiGlobe/AsciiGlobe';
import './CyberMap.css';

// Format real-time UTC timestamp matching reference image: "Fri Jun  8 14:23:28 2026 UTC"
const formatUtcTimestamp = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getUTCDay()];
  const monthName = months[date.getUTCMonth()];
  const dayNum = String(date.getUTCDate()).padStart(2, ' ');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${dayName} ${monthName} ${dayNum} ${hours}:${minutes}:${seconds} ${year} UTC`;
};

const CyberMapModal = ({ isOpen, initialMode = 'ascii', onClose }) => {
  const [viewMode, setViewMode] = useState(initialMode === 'globe' ? 'globe' : 'ascii');
  const [currentTimeStr, setCurrentTimeStr] = useState(formatUtcTimestamp(new Date()));
  const [isStreaming, setIsStreaming] = useState(true);
  const [recentEvents, setRecentEvents] = useState([
    { name: 'Trojan.Generic.6176504', location: 'FR Le Perreux', type: 'threat' },
    { name: 'Gen:Variant.Graftor.27080', location: 'SE Stockholm', type: 'threat' },
    { name: 'Worm:W32/Downaduprun.A', location: 'IT', type: 'threat' },
    { name: 'Gen:Trojan.Heur.PT.Mu0@bqC5qQc', location: 'DE', type: 'threat' },
    { name: 'Gen:Application.Heur.cmKfb04FRnmO', location: 'AT Vienna', type: 'threat' },
  ]);

  // Live digital clock timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentTimeStr(formatUtcTimestamp(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Live threat event streamer
  useEffect(() => {
    if (!isOpen || !isStreaming) return;
    const pool = [
      { name: 'Trojan.Generic.6176504', location: 'FR Le Perreux', type: 'threat' },
      { name: 'Gen:Variant.Graftor.27080', location: 'SE Stockholm', type: 'threat' },
      { name: 'Worm:W32/Downaduprun.A', location: 'IT Milan', type: 'threat' },
      { name: 'Gen:Trojan.Heur.PT.Mu0@bqC5qQc', location: 'DE Frankfurt', type: 'threat' },
      { name: 'Gen:Application.Heur.cmKfb04FRnmO', location: 'AT Vienna', type: 'threat' },
      { name: 'Exploit.Payload.Heur.88', location: 'US San Francisco', type: 'threat' },
      { name: 'SSH.BruteForce.Block.IP', location: 'IN Mumbai Core', type: 'threat' },
      { name: 'Backdoor:W32/ShadowRelay', location: 'JP Tokyo Node', type: 'threat' },
      { name: 'Packet.Flood.DDoS.Mitigated', location: 'SG Singapore Hub', type: 'threat' },
      { name: 'Rootkit.Detect.Scan.Clear', location: 'AU Sydney Relay', type: 'threat' },
    ];

    const interval = setInterval(() => {
      const randomEvent = pool[Math.floor(Math.random() * pool.length)];
      setRecentEvents(prev => [randomEvent, ...prev.slice(0, 4)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isStreaming]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setViewMode(m => (m === 'ascii' ? 'globe' : 'ascii'));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsStreaming(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cyber-map-overlay">
      <div className="cyber-map-window">
        {/* Top Header - Exact match to reference image */}
        <div className="hud-header">
          <div className="hud-title-ref">
            Virus World Map '99
          </div>
          <div className="hud-time-ref">
            {currentTimeStr}
          </div>
        </div>

        {/* View Mode & Stream controls */}
        <div className="hud-subnav">
          <div className="hud-tabs">
            <button
              className={`hud-tab-btn ${viewMode === 'ascii' ? 'active' : ''}`}
              onClick={() => setViewMode('ascii')}
            >
              ASCII MAP '99
            </button>
            <button
              className={`hud-tab-btn ${viewMode === 'globe' ? 'active' : ''}`}
              onClick={() => setViewMode('globe')}
            >
              3D GLOBE
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>
              FEED: {isStreaming ? '● STREAMING' : '❚❚ PAUSED'}
            </span>
            <button className="hud-btn-close" onClick={onClose} title="Exit [ESC]">
              [ESC] EXIT
            </button>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="hud-main-viewport">
          {viewMode === 'ascii' ? (
            /* Authentic ASCII World Map '99 - Pixel-perfect match to reference */
            <div className="ascii-map-container">
              <pre className="ascii-map-display">
{`                                         17
               . _..::__:  ,-"-"._       |7       ,     _,.__             
       _.___ _ _<_>\`!(._\`.\`-.    /   `}<span className="ascii-alert-pink">[*/*]</span>{` _._     \`_ ,_/  '  '-._.---.-.__
     .{     " " \`-==,',._\\{  \\  / {)     / _ ">_,-' \`                `}<span className="ascii-alert-cyan">mt-2_</span>{`
      \\_.:--.       \`._ )\`^-. "'      , `}<span className="ascii-alert-red">[_/(</span>{`                       __,/-' 
     '"'     \\         "    _L       `}<span className="ascii-alert-blue">oD</span>{`_,--' `}<span className="ascii-alert-red">*</span>{`              )     /. (|   
              |           ,'         `}<span className="ascii-alert-red">_*_**</span>{`_\\\\._`}<span className="ascii-alert-gold">&lt;&gt; 6</span>{`             _,' /  '   
              \`.         /          [_/_'\` \`"(                &lt;'}  )      
               \\\\    .-. )          /   \`-'"..' \`:._          _)  '       
        \`        \\  (  \`(          /         \`:\\  > \\  ,-^.  /' '         
                  \`._,   ""        |           \\\`'   \\|   ?_)  {\\         
                     \`=.---.       \`._._       ,'     "\`  |' ,- '.        
                       |    \`-._        |     /          \`:\`&lt;_{|h--._      
                       (        >       .     | ,          \`=.__.\`-'\\     
                        \`.     /        |     |{|              ,-.,\\     .
                         |   ,'          \\   / \`'            ,"     \\     
                         |  /             |_'                |  __  /     
                         | |                                 '-'  \`-'   \\.
                         |/                                        "    / 
                         \\.                                            '  
                                                                          
                          ,/           ______._.--._ _..---.---------._   
         ,-----\"-..?----_/ )      _,-'"             "                  (  `}
              </pre>
            </div>
          ) : (
            /* 3D ASCII Globe */
            <div className="globe-view-box">
              <AsciiGlobe width={54} height={42} />
            </div>
          )}
        </div>

        {/* Live Threat Feed Log - Exact match to reference */}
        <div className="threat-feed-container">
          {recentEvents.map((evt, idx) => (
            <div key={idx} className="threat-log-item">
              <span className="log-star">*</span>
              <span className="log-name">{evt.name}</span>
              <span className="log-slash">/</span>
              <span className="log-loc">{evt.location}</span>
            </div>
          ))}
        </div>

        {/* Attribution Line */}
        <div className="map-attribution-line">
          {ASCII_MAP_CREDIT}
        </div>
      </div>
    </div>
  );
};

export default CyberMapModal;
