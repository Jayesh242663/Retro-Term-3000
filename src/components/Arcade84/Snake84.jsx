import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playArcadeSound } from './arcadeAudio';

const GRID_SIZE = 20;
const INITIAL_SPEED = 120;

const Snake84 = ({ onExit }) => {
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState({ x: 0, y: -1 }); // UP
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcade84_snake_hi') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);

  const nextDirectionRef = useRef(direction);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collision = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
      if (!collision) break;
    }
    return newFood;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (direction.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (direction.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (direction.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (direction.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (onExit) onExit();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [direction, onExit]);

  // Main game tick
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const speed = Math.max(50, INITIAL_SPEED - (level - 1) * 8);

    const interval = setInterval(() => {
      setDirection(nextDirectionRef.current);

      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + nextDirectionRef.current.x,
          y: head.y + nextDirectionRef.current.y,
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          playArcadeSound('gameover');
          setIsGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          playArcadeSound('gameover');
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          playArcadeSound('eat');
          const newScore = score + 10 * level;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('arcade84_snake_hi', newScore.toString());
          }
          if (newScore % 50 === 0) {
            setLevel(l => l + 1);
          }
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, food, level, score, highScore, generateFood]);

  const restartGame = () => {
    playArcadeSound('start');
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection({ x: 0, y: -1 });
    nextDirectionRef.current = { x: 0, y: -1 };
    setFood(generateFood(initialSnake));
    setScore(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="game-cabinet-view">
      <div className="game-header-bar">
        <span className="game-title-badge">🐍 CYBER SNAKE 84</span>
        <div className="game-stats-row">
          <span>SCORE: <b className="stat-highlight">{score}</b></span>
          <span>HIGH: <b>{highScore}</b></span>
          <span>LVL: <b>{level}</b></span>
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

      <div className="snake-grid-board">
        {[...Array(GRID_SIZE)].map((_, y) => (
          <div key={`row-${y}`} className="snake-row">
            {[...Array(GRID_SIZE)].map((_, x) => {
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.some((seg, idx) => idx > 0 && seg.x === x && seg.y === y);
              const isFoodItem = food.x === x && food.y === y;

              let cellClass = 'snake-cell';
              if (isHead) cellClass += ' cell-snake-head';
              else if (isBody) cellClass += ' cell-snake-body';
              else if (isFoodItem) cellClass += ' cell-food';

              return <div key={`cell-${x}-${y}`} className={cellClass} />;
            })}
          </div>
        ))}

        {isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-gameover-box">
              <h2 className="gameover-title">GAME OVER</h2>
              <p>FINAL SCORE: <b>{score}</b></p>
              <div className="gameover-actions">
                <button className="arcade-btn-primary" onClick={restartGame}>
                  ▶ PLAY AGAIN
                </button>
                <button className="arcade-btn-secondary" onClick={onExit}>
                  🗖 RETURN TO ARCADE
                </button>
              </div>
            </div>
          </div>
        )}

        {isPaused && !isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-gameover-box">
              <h2>GAME PAUSED</h2>
              <p>Press [SPACE] or Click to Continue</p>
              <button className="arcade-btn-primary" onClick={() => setIsPaused(false)}>
                ▶ RESUME GAME
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Touch Controls */}
      <div className="arcade-dpad-container">
        <button className="dpad-btn dpad-up" onClick={() => { if (direction.y === 0) nextDirectionRef.current = { x: 0, y: -1 }; }}>▲</button>
        <div className="dpad-middle">
          <button className="dpad-btn dpad-left" onClick={() => { if (direction.x === 0) nextDirectionRef.current = { x: -1, y: 0 }; }}>◀</button>
          <button className="dpad-btn dpad-center" onClick={() => setIsPaused(p => !p)}>❚❚</button>
          <button className="dpad-btn dpad-right" onClick={() => { if (direction.x === 0) nextDirectionRef.current = { x: 1, y: 0 }; }}>▶</button>
        </div>
        <button className="dpad-btn dpad-down" onClick={() => { if (direction.y === 0) nextDirectionRef.current = { x: 0, y: 1 }; }}>▼</button>
      </div>
    </div>
  );
};

export default Snake84;
