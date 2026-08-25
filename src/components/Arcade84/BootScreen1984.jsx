import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playArcadeSound } from './arcadeAudio';

/**
 * BootScreen1984 faithfully recreates the iconic 1984 CRT boot screens
 * (PlayStation 84 / Cyber Dystopia BIOS) as shown in the reference imagery.
 */
const BootScreen1984 = ({
  variant = 'playstation', // 'playstation' | 'google84' | 'windows84' | 'twitter84' | 'netflix84' | 'game'
  title = 'PlayStation',
  subtitle = '日本製1984年',
  statusText = 'Processing payment...',
  duration = 1800,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(statusText);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setProgress(100);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, []);

  const [lines, setLines] = useState([
    '> INSERT COIN TO CONTINUE',
    '> Select Coin: BTC, [ETH], SOL, ADA, DOGE',
    '> ETH Selected',
  ]);

  useEffect(() => {
    completedRef.current = false;
    playArcadeSound('boot');
    playArcadeSound('coin');

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 22) {
        setCurrentStatus('Processing payment...');
      } else if (pct >= 22 && pct < 45) {
        setCurrentStatus(variant === 'game' ? 'Verifying 8-bit Cartridge ROM...' : 'Verifying 8-bit BIOS Firmware...');
      } else if (pct >= 45 && pct < 70) {
        setCurrentStatus(variant === 'game' ? 'Loading ROM to RAM (64KB)...' : 'Decrypting Memory Matrix (64KB RAM)...');
      } else if (pct >= 70 && pct < 90) {
        setCurrentStatus(variant === 'game' ? 'Mounting Virtual Disk A:...' : 'Establishing Secure Subspace Link...');
      } else {
        setCurrentStatus('Boot sequence finalized. Launching...');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        finish();
      }
    }, 30);

    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        clearInterval(interval);
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [duration, variant, finish]);

  return (
    <div className="boot-1984-container">
      {/* CRT Shadow Mask Grain & Phosphor Scanlines */}
      <div className="boot-1984-crt-glow" />

      {/* CENTER SECTION: Glowing Phosphor Orange/Amber CRT Chamber */}
      <div className="boot-1984-center">
        <div className="ps-logo-ambient-sphere" />
        
        <div className="ps-sliced-logo-wrapper">
          <svg className="ps-sliced-svg" viewBox="0 0 280 240" width="230" height="195">
            <defs>
              <filter id="crt-glow-ps" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* HORIZONTAL FLAT 'S' BASE (Perspective Scanlines) */}
            <g filter="url(#crt-glow-ps)">
              <rect x="92" y="112" width="26" height="3.2" fill="#00e5ff" />
              <rect x="80" y="118" width="46" height="3.2" fill="#00e5ff" />
              <rect x="68" y="124" width="62" height="3.2" fill="#00e5ff" />
              <rect x="62" y="130" width="58" height="3.2" fill="#00e5ff" />
              <rect x="58" y="136" width="52" height="3.2" fill="#00e5ff" />
            </g>

            <g filter="url(#crt-glow-ps)">
              <rect x="54" y="142" width="60" height="3.2" fill="#ffea00" />
              <rect x="48" y="148" width="70" height="3.2" fill="#ffea00" />
              <rect x="48" y="154" width="76" height="3.2" fill="#ffea00" />
              <rect x="54" y="160" width="72" height="3.2" fill="#ffea00" />
              <rect x="68" y="166" width="54" height="3.2" fill="#ffea00" />
              <rect x="76" y="172" width="42" height="3.2" fill="#ffea00" />
            </g>

            <g filter="url(#crt-glow-ps)">
              <rect x="136" y="122" width="52" height="3.2" fill="#0066ff" />
              <rect x="138" y="128" width="64" height="3.2" fill="#0066ff" />
              <rect x="140" y="134" width="72" height="3.2" fill="#0066ff" />
              <rect x="150" y="140" width="64" height="3.2" fill="#0066ff" />
              <rect x="162" y="146" width="52" height="3.2" fill="#0066ff" />
            </g>

            <g filter="url(#crt-glow-ps)">
              <rect x="134" y="152" width="58" height="3.2" fill="#00e676" />
              <rect x="136" y="158" width="66" height="3.2" fill="#00e676" />
              <rect x="146" y="164" width="56" height="3.2" fill="#00e676" />
              <rect x="156" y="170" width="44" height="3.2" fill="#00e676" />
              <rect x="166" y="176" width="30" height="3.2" fill="#00e676" />
            </g>

            <rect x="136" y="172" width="18" height="3.2" fill="#00e676" />
            <rect x="132" y="178" width="16" height="3.2" fill="#ffea00" />
            <rect x="130" y="184" width="14" height="3.2" fill="#ffea00" />

            {/* VERTICAL UPRIGHT 'P' (Segmented Red Raster Lines) */}
            <g filter="url(#crt-glow-ps)">
              <rect x="108" y="44" width="6" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="50" width="22" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="56" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="62" width="36" height="3.2" fill="#ff2a2a" />
              
              <rect x="108" y="68" width="52" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="74" width="58" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="80" width="62" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="86" width="66" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="92" width="68" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="98" width="68" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="104" width="66" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="110" width="62" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="116" width="58" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="122" width="52" height="3.2" fill="#ff2a2a" />

              {/* Inner Cutout */}
              <rect x="136" y="68" width="16" height="3.2" fill="#180400" />
              <rect x="136" y="74" width="20" height="3.2" fill="#180400" />
              <rect x="136" y="80" width="24" height="3.2" fill="#180400" />
              <rect x="136" y="86" width="24" height="3.2" fill="#180400" />
              <rect x="136" y="92" width="24" height="3.2" fill="#180400" />
              <rect x="136" y="98" width="24" height="3.2" fill="#180400" />
              <rect x="136" y="104" width="22" height="3.2" fill="#180400" />
              <rect x="136" y="110" width="18" height="3.2" fill="#180400" />
              <rect x="136" y="116" width="12" height="3.2" fill="#180400" />

              {/* Lower Stem */}
              <rect x="108" y="128" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="134" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="140" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="146" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="152" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="158" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="164" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="170" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="176" width="28" height="3.2" fill="#ff2a2a" />
              <rect x="108" y="182" width="22" height="3.2" fill="#ff2a2a" />
              <rect x="120" y="188" width="10" height="3.2" fill="#ff2a2a" />
            </g>
          </svg>
        </div>

        {/* Title and Japanese Kanji */}
        <div className="ps84-brand-container">
          <div className="ps84-main-row">
            <span className="ps84-playstation-title">{title}</span>
            <span className="ps84-year-badge">84</span>
          </div>
        </div>

        {/* Kanji Subtitle in lower right corner of radiant chamber */}
        <div className="ps84-chamber-kanji">{subtitle || 'アメリカ製1984'}</div>
      </div>

      {/* BOTTOM SECTION: Processing Payment, Segmented Bar & WK Square Badge */}
      <div className="boot-1984-footer">
        <div className="boot-1984-status">{currentStatus}</div>
        
        <div className="boot-1984-progress-frame">
          <div
            className="boot-1984-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="boot-1984-corner-brand">
          <div className="wk-badge-square">
            <span className="wk-text">W<span className="wk-k">K</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootScreen1984;
