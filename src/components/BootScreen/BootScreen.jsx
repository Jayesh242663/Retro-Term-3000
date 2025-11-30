import { useState, useEffect, useRef } from 'react';
import { playProgressBeep, playBootCompleteSound } from '../../utils/sounds';
import './BootScreen.css';

const BootScreen = ({ onComplete, duration = 4000 }) => {
  const [bootLines, setBootLines] = useState([]);
  const [showCursor, setShowCursor] = useState(true);
  const [memoryCount, setMemoryCount] = useState(0);
  const [bootPhase, setBootPhase] = useState('bios');
  const [loadingDots, setLoadingDots] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);
  const bootStarted = useRef(false);
  const terminalRef = useRef(null);

  // Auto-scroll to bottom whenever boot lines change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [bootLines, memoryCount, bootPhase]);

  // Loading dots animation
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    return () => clearInterval(dotsInterval);
  }, []);

  // BIOS-style boot messages
  const biosMessages = [
    { text: 'RETRO-TERM 3000 BIOS v2.4.1', delay: 0, type: 'header' },
    { text: 'Copyright (C) 1987-1993 Retro Systems Inc.', delay: 100, type: 'copyright' },
    { text: '', delay: 200, type: 'blank' },
    { text: 'CPU: Intel 80486DX-33 @ 33MHz', delay: 300, type: 'info' },
    { text: 'FPU: Integrated', delay: 400, type: 'info' },
    { text: '', delay: 500, type: 'blank' },
    { text: 'Memory Test:', delay: 600, type: 'label' },
  ];

  const postMessages = [
    { text: '', delay: 0, type: 'blank' },
    { text: 'Primary Master: ST-225 20MB', delay: 100, type: 'info' },
    { text: 'Primary Slave:  None', delay: 200, type: 'info' },
    { text: 'Secondary Master: CDROM 2X', delay: 300, type: 'info' },
    { text: '', delay: 400, type: 'blank' },
    { text: 'Floppy Drive A: 1.44MB 3.5"', delay: 500, type: 'info' },
    { text: 'Floppy Drive B: None', delay: 600, type: 'info' },
    { text: '', delay: 700, type: 'blank' },
    { text: 'Detecting hardware', delay: 800, type: 'process-loading' },
    { text: 'VGA Adapter: RETRO-VGA 256K', delay: 1000, type: 'success' },
    { text: 'Sound Card: SB16 IRQ5 DMA1', delay: 1100, type: 'success' },
    { text: 'Network: NE2000 Compatible', delay: 1200, type: 'success' },
    { text: '', delay: 1300, type: 'blank' },
    { text: 'All hardware checks passed.', delay: 1400, type: 'success' },
    { text: '', delay: 1500, type: 'blank' },
    { text: 'Loading RETRO-OS', delay: 1600, type: 'process-loading' },
    { text: '', delay: 1800, type: 'blank' },
  ];

  const osBootMessages = [
    { text: 'RETRO-OS v3.1 LOADING...', delay: 50, type: 'border' },
    { text: '', delay: 200, type: 'blank' },
    { text: 'Mounted root filesystem', delay: 300, type: 'ok' },
    { text: 'Started system logger', delay: 450, type: 'ok' },
    { text: 'Reached target basic system', delay: 600, type: 'ok' },
    { text: 'Started D-Bus system bus', delay: 750, type: 'ok' },
    { text: 'Started network manager', delay: 900, type: 'ok' },
    { text: 'Reached target network', delay: 1050, type: 'ok' },
    { text: 'Started terminal service', delay: 1200, type: 'ok' },
    { text: '', delay: 1350, type: 'blank' },
    { text: 'System ready. Starting terminal', delay: 1500, type: 'final-loading' },
    { text: '', delay: 1700, type: 'blank' },
  ];

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    // Phase 1: BIOS messages
    biosMessages.forEach((msg, index) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
        if (msg.type === 'header') playProgressBeep();
      }, msg.delay);
    });

    // Phase 2: Memory count animation
    const memStartTime = 700;
    const memDuration = 800;
    const memTarget = 640;
    const memInterval = setInterval(() => {
      setMemoryCount(prev => {
        const next = prev + Math.floor(Math.random() * 50) + 30;
        if (next >= memTarget) {
          clearInterval(memInterval);
          return memTarget;
        }
        return next;
      });
    }, 50);

    setTimeout(() => {
      clearInterval(memInterval);
      setMemoryCount(640);
      playProgressBeep();
      
      // Add memory OK message
      setTimeout(() => {
        setBootLines(prev => [...prev, { text: '640K OK', delay: 0, type: 'memory-ok' }]);
      }, 100);
    }, memStartTime + memDuration);

    // Phase 3: POST messages
    const postStartTime = memStartTime + memDuration + 300;
    postMessages.forEach((msg, index) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
        if (msg.type === 'success') playProgressBeep();
      }, postStartTime + msg.delay);
    });

    // Phase 4: OS Boot
    const osStartTime = postStartTime + 2000;
    setTimeout(() => {
      setBootPhase('os');
      setBootLines([]); // Clear for OS boot
      setShowSpinner(true);
    }, osStartTime);

    osBootMessages.forEach((msg, index) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
        if (msg.type === 'ok') playProgressBeep();
      }, osStartTime + 100 + msg.delay);
    });

    // Complete boot
    const totalTime = osStartTime + 2000;
    setTimeout(() => {
      playBootCompleteSound();
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, totalTime);

    return () => {
      clearInterval(cursorInterval);
      clearInterval(memInterval);
    };
  }, [onComplete]);

  // Render loading text with animated dots
  const renderLine = (line, index) => {
    if (line.type === 'process-loading' || line.type === 'final-loading') {
      return (
        <div key={index} className={`boot-line boot-${line.type.replace('-loading', '')}`}>
          {line.text}<span className="loading-dots">{loadingDots}</span>
        </div>
      );
    }
    if (line.type === 'ok') {
      return (
        <div key={index} className="boot-line boot-ok">
          <span className="ok-bracket">[</span>
          <span className="ok-spinner">
            <span className="spinner-icon">✓</span>
          </span>
          <span className="ok-text"> OK </span>
          <span className="ok-bracket">]</span>
          <span className="ok-message"> {line.text}</span>
        </div>
      );
    }
    return (
      <div key={index} className={`boot-line boot-${line.type}`}>
        {line.text}
      </div>
    );
  };

  return (
    <div className="boot-screen">
      <div className="boot-container">
        <div className="boot-scanlines" />
        
        <div className="boot-terminal" ref={terminalRef}>
          {/* BIOS Phase */}
          {bootPhase === 'bios' && (
            <>
              {bootLines.map((line, index) => renderLine(line, index))}
              {memoryCount > 0 && memoryCount < 640 && (
                <div className="boot-line boot-memory">
                  {memoryCount}K <span className="memory-spinner">|</span>
                </div>
              )}
            </>
          )}

          {/* OS Boot Phase */}
          {bootPhase === 'os' && (
            <>
              {bootLines.map((line, index) => renderLine(line, index))}
            </>
          )}

          {/* Blinking cursor */}
          <span className={`boot-cursor ${showCursor ? 'visible' : ''}`}>█</span>
        </div>
      </div>
    </div>
  );
};

export default BootScreen;
