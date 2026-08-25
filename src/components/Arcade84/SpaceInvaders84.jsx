import React, { useState, useEffect, useRef } from 'react';
import { playArcadeSound } from './arcadeAudio';

const SpaceInvaders84 = ({ onExit }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcade84_invaders_hi') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wave, setWave] = useState(1);

  const gameStateRef = useRef({
    playerX: 200,
    playerWidth: 26,
    playerSpeed: 4.5,
    bullets: [],
    alienBullets: [],
    aliens: [],
    alienDirection: 1,
    alienStepDown: 0,
    keys: {},
    lastAlienFire: 0,
  });

  const initAliens = (currentWave) => {
    const aliens = [];
    const rows = 4;
    const cols = 8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: 40 + c * 40,
          y: 35 + r * 28,
          width: 22,
          height: 16,
          alive: true,
          type: r === 0 ? 'squid' : r < 2 ? 'crab' : 'octopus',
          points: (4 - r) * 10,
        });
      }
    }
    return aliens;
  };

  useEffect(() => {
    gameStateRef.current.aliens = initAliens(1);

    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        // Fire bullet
        const state = gameStateRef.current;
        if (state.bullets.length < 3) {
          playArcadeSound('laser');
          state.bullets.push({
            x: state.playerX + state.playerWidth / 2 - 1.5,
            y: 340,
            width: 3,
            height: 10,
            speed: 7,
          });
        }
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
      } else if (e.key === 'Escape') {
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExit]);

  // Main canvas animation loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (!isGameOver && !isPaused) {
        const state = gameStateRef.current;

        // Player movement
        if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) {
          state.playerX = Math.max(10, state.playerX - state.playerSpeed);
        }
        if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) {
          state.playerX = Math.min(canvas.width - state.playerWidth - 10, state.playerX + state.playerSpeed);
        }

        // Bullets update
        state.bullets = state.bullets.filter(b => {
          b.y -= b.speed;
          return b.y > 0;
        });

        // Alien movement
        let hitEdge = false;
        const livingAliens = state.aliens.filter(a => a.alive);
        livingAliens.forEach(a => {
          if ((a.x + a.width >= canvas.width - 15 && state.alienDirection > 0) ||
              (a.x <= 15 && state.alienDirection < 0)) {
            hitEdge = true;
          }
        });

        if (hitEdge) {
          state.alienDirection *= -1;
          livingAliens.forEach(a => {
            a.y += 10;
            if (a.y >= 330) {
              // Aliens reached ground
              setIsGameOver(true);
              playArcadeSound('gameover');
            }
          });
        }

        const alienSpeed = 0.8 + (1 - livingAliens.length / 32) * 2;
        livingAliens.forEach(a => {
          a.x += state.alienDirection * alienSpeed;
        });

        // Alien random shooting
        const now = Date.now();
        if (now - state.lastAlienFire > Math.max(800, 1800 - wave * 200) && livingAliens.length > 0) {
          const shooter = livingAliens[Math.floor(Math.random() * livingAliens.length)];
          state.alienBullets.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height,
            width: 3,
            height: 8,
            speed: 3.5,
          });
          state.lastAlienFire = now;
        }

        // Alien bullets update & collision with player
        state.alienBullets = state.alienBullets.filter(ab => {
          ab.y += ab.speed;

          // Check hit player
          if (
            ab.x > state.playerX &&
            ab.x < state.playerX + state.playerWidth &&
            ab.y > 340 &&
            ab.y < 365
          ) {
            playArcadeSound('explosion');
            setLives(l => {
              if (l <= 1) {
                setIsGameOver(true);
                playArcadeSound('gameover');
                return 0;
              }
              return l - 1;
            });
            return false;
          }
          return ab.y < canvas.height;
        });

        // Player bullet collisions with aliens
        state.bullets.forEach((b, bIdx) => {
          state.aliens.forEach(a => {
            if (
              a.alive &&
              b.x > a.x &&
              b.x < a.x + a.width &&
              b.y > a.y &&
              b.y < a.y + a.height
            ) {
              a.alive = false;
              state.bullets.splice(bIdx, 1);
              playArcadeSound('explosion');
              setScore(s => {
                const nextScore = s + a.points;
                if (nextScore > highScore) {
                  setHighScore(nextScore);
                  localStorage.setItem('arcade84_invaders_hi', nextScore.toString());
                }
                return nextScore;
              });
            }
          });
        });

        // Check wave victory
        if (livingAliens.length === 0) {
          playArcadeSound('start');
          setWave(w => w + 1);
          state.aliens = initAliens(wave + 1);
          state.bullets = [];
          state.alienBullets = [];
        }
      }

      // Read active CRT theme CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const crtText = computedStyle.getPropertyValue('--crt-text').trim() || '#00ff66';
      const crtDim = computedStyle.getPropertyValue('--crt-text-dim').trim() || '#009933';
      const crtBg = computedStyle.getPropertyValue('--crt-bg').trim() || '#080808';
      const crtGlow = computedStyle.getPropertyValue('--crt-glow').trim() || 'rgba(0, 255, 102, 0.5)';

      // Render Scene
      ctx.fillStyle = crtBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield dots
      ctx.fillStyle = crtDim;
      for (let i = 0; i < 25; i++) {
        const sx = (i * 37) % canvas.width;
        const sy = (i * 53 + Date.now() * 0.02) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      const state = gameStateRef.current;

      // Draw Player Cannon (Theme Text color)
      ctx.fillStyle = crtText;
      ctx.shadowColor = crtGlow;
      ctx.shadowBlur = 8;
      ctx.fillRect(state.playerX, 348, state.playerWidth, 10);
      ctx.fillRect(state.playerX + 9, 340, 8, 8);
      ctx.fillRect(state.playerX + 11, 335, 4, 5);

      // Draw Player Lasers (Theme Text color)
      ctx.fillStyle = crtText;
      ctx.shadowColor = crtGlow;
      ctx.shadowBlur = 6;
      state.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });

      // Draw Alien Bombs (Hazard red/contrast)
      ctx.fillStyle = '#ff3b30';
      ctx.shadowColor = '#ff3b30';
      ctx.shadowBlur = 6;
      state.alienBullets.forEach(ab => {
        ctx.fillRect(ab.x, ab.y, ab.width, ab.height);
      });

      // Draw Aliens (Theme variation)
      state.aliens.forEach(a => {
        if (!a.alive) return;
        ctx.fillStyle = a.type === 'squid' ? crtText : a.type === 'crab' ? crtDim : crtText;
        ctx.shadowColor = crtGlow;
        ctx.shadowBlur = 6;

        // Pixel Alien shape
        ctx.fillRect(a.x + 4, a.y, 14, 4);
        ctx.fillRect(a.x, a.y + 4, 22, 6);
        ctx.fillRect(a.x + 2, a.y + 10, 4, 6);
        ctx.fillRect(a.x + 16, a.y + 10, 4, 6);
      });

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isPaused, wave, highScore]);

  const restartGame = () => {
    playArcadeSound('start');
    gameStateRef.current = {
      playerX: 200,
      playerWidth: 26,
      playerSpeed: 4.5,
      bullets: [],
      alienBullets: [],
      aliens: initAliens(1),
      alienDirection: 1,
      alienStepDown: 0,
      keys: {},
      lastAlienFire: 0,
    };
    setScore(0);
    setLives(3);
    setWave(1);
    setIsGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="game-cabinet-view">
      <div className="game-header-bar">
        <span className="game-title-badge">👾 SPACE INVADERS 84</span>
        <div className="game-stats-row">
          <span>SCORE: <b className="stat-highlight">{score}</b></span>
          <span>HIGH: <b>{highScore}</b></span>
          <span>LIVES: <b style={{ color: '#ff3b30' }}>{'▲ '.repeat(lives)}</b></span>
          <span>WAVE: <b>{wave}</b></span>
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

      <div className="invaders-canvas-wrapper">
        <canvas ref={canvasRef} width={420} height={380} className="arcade-pixel-canvas" />

        {isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-gameover-box">
              <h2 className="gameover-title">DEFENSE COMPROMISED</h2>
              <p>FINAL SCORE: <b>{score}</b> • WAVE {wave}</p>
              <div className="gameover-actions">
                <button className="arcade-btn-primary" onClick={restartGame}>
                  ▶ RE-ENGAGE ARMADA
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
          onMouseDown={() => { gameStateRef.current.keys['ArrowLeft'] = true; }}
          onMouseUp={() => { gameStateRef.current.keys['ArrowLeft'] = false; }}
          onTouchStart={() => { gameStateRef.current.keys['ArrowLeft'] = true; }}
          onTouchEnd={() => { gameStateRef.current.keys['ArrowLeft'] = false; }}
        >
          ◀ LEFT
        </button>
        <button
          className="arcade-btn-fire"
          onClick={() => {
            const state = gameStateRef.current;
            if (state.bullets.length < 3) {
              playArcadeSound('laser');
              state.bullets.push({
                x: state.playerX + state.playerWidth / 2 - 1.5,
                y: 340,
                width: 3,
                height: 10,
                speed: 7,
              });
            }
          }}
        >
          ⚡ FIRE LASER
        </button>
        <button
          className="arcade-btn-large"
          onMouseDown={() => { gameStateRef.current.keys['ArrowRight'] = true; }}
          onMouseUp={() => { gameStateRef.current.keys['ArrowRight'] = false; }}
          onTouchStart={() => { gameStateRef.current.keys['ArrowRight'] = true; }}
          onTouchEnd={() => { gameStateRef.current.keys['ArrowRight'] = false; }}
        >
          RIGHT ▶
        </button>
      </div>
    </div>
  );
};

export default SpaceInvaders84;
