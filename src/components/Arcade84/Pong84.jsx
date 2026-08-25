import React, { useState, useEffect, useRef } from 'react';
import { playArcadeSound } from './arcadeAudio';

const Pong84 = ({ onExit }) => {
  const canvasRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [rally, setRally] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const pongStateRef = useRef({
    playerY: 140,
    cpuY: 140,
    paddleHeight: 60,
    paddleWidth: 10,
    ballX: 200,
    ballY: 180,
    ballSpeedX: 4,
    ballSpeedY: 2.5,
    ballSize: 8,
    keys: {},
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      pongStateRef.current.keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
      } else if (e.key === 'Escape') {
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e) => {
      pongStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExit]);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resetBall = (direction) => {
      const state = pongStateRef.current;
      state.ballX = canvas.width / 2;
      state.ballY = canvas.height / 2;
      state.ballSpeedX = (direction === 'player' ? 4 : -4);
      state.ballSpeedY = (Math.random() * 4 - 2);
      setRally(0);
    };

    const loop = () => {
      if (!isGameOver && !isPaused) {
        const state = pongStateRef.current;

        // Player paddle movement
        if (state.keys['ArrowUp'] || state.keys['w'] || state.keys['W']) {
          state.playerY = Math.max(10, state.playerY - 5.5);
        }
        if (state.keys['ArrowDown'] || state.keys['s'] || state.keys['S']) {
          state.playerY = Math.min(canvas.height - state.paddleHeight - 10, state.playerY + 5.5);
        }

        // CPU AI paddle movement (smooth tracking with slight imperfection)
        const cpuCenter = state.cpuY + state.paddleHeight / 2;
        if (cpuCenter < state.ballY - 15) {
          state.cpuY = Math.min(canvas.height - state.paddleHeight - 10, state.cpuY + 3.8);
        } else if (cpuCenter > state.ballY + 15) {
          state.cpuY = Math.max(10, state.cpuY - 3.8);
        }

        // Ball movement
        state.ballX += state.ballSpeedX;
        state.ballY += state.ballSpeedY;

        // Top and Bottom wall bounce
        if (state.ballY <= 5 || state.ballY >= canvas.height - state.ballSize - 5) {
          state.ballSpeedY *= -1;
          playArcadeSound('paddle');
        }

        // Player paddle bounce (Left side: x = 20)
        if (
          state.ballX <= 20 + state.paddleWidth &&
          state.ballX >= 15 &&
          state.ballY + state.ballSize >= state.playerY &&
          state.ballY <= state.playerY + state.paddleHeight
        ) {
          state.ballSpeedX = Math.abs(state.ballSpeedX) + 0.25;
          const hitPos = (state.ballY - (state.playerY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
          state.ballSpeedY = hitPos * 5;
          setRally(r => r + 1);
          playArcadeSound('paddle');
        }

        // CPU paddle bounce (Right side: x = canvas.width - 30)
        if (
          state.ballX + state.ballSize >= canvas.width - 30 &&
          state.ballX <= canvas.width - 25 &&
          state.ballY + state.ballSize >= state.cpuY &&
          state.ballY <= state.cpuY + state.paddleHeight
        ) {
          state.ballSpeedX = -Math.abs(state.ballSpeedX) - 0.25;
          const hitPos = (state.ballY - (state.cpuY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
          state.ballSpeedY = hitPos * 5;
          setRally(r => r + 1);
          playArcadeSound('paddle');
        }

        // Scoring: Player point
        if (state.ballX > canvas.width) {
          playArcadeSound('score');
          setPlayerScore(p => {
            const next = p + 1;
            if (next >= 7) {
              setIsGameOver(true);
              setWinner('PLAYER');
              playArcadeSound('start');
            } else {
              resetBall('player');
            }
            return next;
          });
        }

        // Scoring: CPU point
        if (state.ballX < 0) {
          playArcadeSound('gameover');
          setCpuScore(c => {
            const next = c + 1;
            if (next >= 7) {
              setIsGameOver(true);
              setWinner('CPU CYBER MATRIX');
            } else {
              resetBall('cpu');
            }
            return next;
          });
        }
      }

      // Read active CRT theme CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const crtText = computedStyle.getPropertyValue('--crt-text').trim() || '#00ff66';
      const crtDim = computedStyle.getPropertyValue('--crt-text-dim').trim() || '#009933';
      const crtBg = computedStyle.getPropertyValue('--crt-bg').trim() || '#0a0a0a';
      const crtGlow = computedStyle.getPropertyValue('--crt-glow').trim() || 'rgba(0, 255, 102, 0.5)';

      // Draw Scene
      ctx.fillStyle = crtBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center dashed net
      ctx.strokeStyle = crtDim;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      const state = pongStateRef.current;

      // Draw Player Paddle (Active CRT Text Color)
      ctx.fillStyle = crtText;
      ctx.shadowColor = crtGlow;
      ctx.shadowBlur = 8;
      ctx.fillRect(20, state.playerY, state.paddleWidth, state.paddleHeight);

      // Draw CPU Paddle (Active CRT Dim Color)
      ctx.fillStyle = crtDim;
      ctx.shadowColor = crtGlow;
      ctx.shadowBlur = 8;
      ctx.fillRect(canvas.width - 30, state.cpuY, state.paddleWidth, state.paddleHeight);

      // Draw Ball (Active CRT Text Color with Glow)
      ctx.fillStyle = crtText;
      ctx.shadowColor = crtGlow;
      ctx.shadowBlur = 10;
      ctx.fillRect(state.ballX, state.ballY, state.ballSize, state.ballSize);

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isPaused]);

  const restartGame = () => {
    playArcadeSound('start');
    pongStateRef.current = {
      playerY: 140,
      cpuY: 140,
      paddleHeight: 60,
      paddleWidth: 10,
      ballX: 200,
      ballY: 180,
      ballSpeedX: 4,
      ballSpeedY: 2.5,
      ballSize: 8,
      keys: {},
    };
    setPlayerScore(0);
    setCpuScore(0);
    setRally(0);
    setIsGameOver(false);
    setWinner('');
  };

  return (
    <div className="game-cabinet-view">
      <div className="game-header-bar">
        <span className="game-title-badge">🏓 PONG 84 CYBER BATTLE</span>
        <div className="game-stats-row">
          <span>YOU: <b className="stat-highlight" style={{ color: '#00f2ff' }}>{playerScore}</b></span>
          <span>CPU: <b style={{ color: '#ff3b30' }}>{cpuScore}</b></span>
          <span>RALLY: <b>{rally}</b></span>
          <span>TARGET: <b>7 PTS</b></span>
        </div>
        <div className="game-header-actions">
          <button className="arcade-btn-sm" onClick={() => setIsPaused(p => !p)}>
            {isPaused ? '▶ RESUME' : '❚❚ PAUSE'}
          </button>
          <button className="arcade-btn-sm" onClick={onExit}>
            [ESC] EXIT
          </button>
        </div>
      </div>

      <div className="pong-canvas-wrapper">
        <canvas ref={canvasRef} width={420} height={360} className="arcade-pixel-canvas" />

        {isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-gameover-box">
              <h2 className="gameover-title">MATCH CONCLUDED</h2>
              <p>VICTOR: <b style={{ color: winner === 'PLAYER' ? '#00f2ff' : '#ff3b30' }}>{winner}</b></p>
              <div className="gameover-actions">
                <button className="arcade-btn-primary" onClick={restartGame}>
                  ▶ REMATCH
                </button>
                <button className="arcade-btn-secondary" onClick={onExit}>
                  🗖 RETURN TO ARCADE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Touch Controls */}
      <div className="arcade-controls-row">
        <button
          className="arcade-btn-large"
          onMouseDown={() => { pongStateRef.current.keys['ArrowUp'] = true; }}
          onMouseUp={() => { pongStateRef.current.keys['ArrowUp'] = false; }}
          onTouchStart={() => { pongStateRef.current.keys['ArrowUp'] = true; }}
          onTouchEnd={() => { pongStateRef.current.keys['ArrowUp'] = false; }}
        >
          ▲ UP
        </button>
        <button
          className="arcade-btn-large"
          onMouseDown={() => { pongStateRef.current.keys['ArrowDown'] = true; }}
          onMouseUp={() => { pongStateRef.current.keys['ArrowDown'] = false; }}
          onTouchStart={() => { pongStateRef.current.keys['ArrowDown'] = true; }}
          onTouchEnd={() => { pongStateRef.current.keys['ArrowDown'] = false; }}
        >
          ▼ DOWN
        </button>
      </div>
    </div>
  );
};

export default Pong84;
