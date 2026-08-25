import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  playMoveSFX,
  playRotateSFX,
  playDropSFX,
  playHardDropSFX,
  playHoldSFX,
  playLineClearSFX,
  playLevelUpSFX,
  playGameOverSFX,
  startTetrisMusic,
  stopTetrisMusic,
  toggleTetrisMusic,
  isMusicActive,
} from './tetrisAudio';
import './Tetris.css';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 22;

// 7 Standard Tetrominoes
const SHAPES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00ffff' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
};

const SHAPE_KEYS = Object.keys(SHAPES);

// Helper: 7-Bag Random Generator
const createBag = () => {
  const bag = [...SHAPE_KEYS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const Tetris = ({ isOpen, onClose }) => {
  const [board, setBoard] = useState(createEmptyBoard);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('crt_tetris_highscore') || '0', 10);
  });
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  // Active pieces
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [holdPiece, setHoldPiece] = useState(null);
  const [canHold, setCanHold] = useState(true);

  const bagRef = useRef([]);
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const holdCanvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const dropTimeRef = useRef(800);

  // Get next piece from 7-bag
  const getNextPieceKey = useCallback(() => {
    if (bagRef.current.length === 0) {
      bagRef.current = createBag();
    }
    return bagRef.current.pop();
  }, []);

  // Spawn new piece
  const spawnPiece = useCallback((key) => {
    const shapeData = SHAPES[key];
    const shape = shapeData.shape;
    const col = Math.floor((COLS - shape[0].length) / 2);
    return {
      key,
      shape,
      color: shapeData.color,
      x: col,
      y: 0,
    };
  }, []);

  // Collision detection
  const checkCollision = useCallback((piece, grid, offsetX = 0, offsetY = 0) => {
    if (!piece) return false;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const newX = piece.x + c + offsetX;
          const newY = piece.y + r + offsetY;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          if (newY >= 0 && grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Rotate piece matrix clockwise
  const rotateMatrix = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  };

  // Start new game
  const startGame = useCallback(() => {
    bagRef.current = createBag();
    const firstKey = getNextPieceKey();
    const nextKey = getNextPieceKey();

    setBoard(createEmptyBoard());
    setCurrentPiece(spawnPiece(firstKey));
    setNextPiece(spawnPiece(nextKey));
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setLevel(1);
    dropTimeRef.current = 800;
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);

    if (musicOn) {
      startTetrisMusic();
    }
  }, [getNextPieceKey, spawnPiece, musicOn]);

  // Lock piece into board and clear completed lines
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map((row) => [...row]);
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c] !== 0) {
          const boardY = currentPiece.y + r;
          const boardX = currentPiece.x + c;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    // Check full lines
    let clearedCount = 0;
    const filteredBoard = newBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== 0);
      if (isFull) clearedCount++;
      return !isFull;
    });

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(0));
    }

    if (clearedCount > 0) {
      playLineClearSFX(clearedCount);
      const points = [0, 100, 300, 500, 800][clearedCount] * level;
      const newScore = score + points;
      const newLines = lines + clearedCount;
      const newLevel = Math.floor(newLines / 10) + 1;

      if (newLevel > level) {
        playLevelUpSFX();
        setLevel(newLevel);
        dropTimeRef.current = Math.max(100, 800 - (newLevel - 1) * 70);
      }

      setScore(newScore);
      setLines(newLines);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('crt_tetris_highscore', newScore.toString());
      }
    } else {
      playDropSFX();
    }

    setBoard(filteredBoard);

    // Spawn next piece
    const nextKey = getNextPieceKey();
    const candidate = spawnPiece(nextPiece ? nextPiece.key : nextKey);

    if (checkCollision(candidate, filteredBoard)) {
      setGameOver(true);
      playGameOverSFX();
      stopTetrisMusic();
    } else {
      setCurrentPiece(candidate);
      setNextPiece(spawnPiece(nextKey));
      setCanHold(true);
    }
  }, [
    board,
    currentPiece,
    nextPiece,
    score,
    highScore,
    lines,
    level,
    getNextPieceKey,
    spawnPiece,
    checkCollision,
  ]);

  // Movement operations
  const moveLeft = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !hasStarted) return;
    if (!checkCollision(currentPiece, board, -1, 0)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x - 1 }));
      playMoveSFX();
    }
  }, [currentPiece, board, gameOver, isPaused, hasStarted, checkCollision]);

  const moveRight = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !hasStarted) return;
    if (!checkCollision(currentPiece, board, 1, 0)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x + 1 }));
      playMoveSFX();
    }
  }, [currentPiece, board, gameOver, isPaused, hasStarted, checkCollision]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !hasStarted) return;
    if (!checkCollision(currentPiece, board, 0, 1)) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }));
      setScore((s) => s + 1);
    } else {
      lockPiece();
    }
  }, [currentPiece, board, gameOver, isPaused, hasStarted, checkCollision, lockPiece]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !hasStarted) return;
    let dropY = 0;
    while (!checkCollision(currentPiece, board, 0, dropY + 1)) {
      dropY++;
    }
    playHardDropSFX();
    setScore((s) => s + dropY * 2);
    setCurrentPiece((prev) => {
      const dropped = { ...prev, y: prev.y + dropY };
      setTimeout(() => lockPiece(), 0);
      return dropped;
    });
  }, [currentPiece, board, gameOver, isPaused, hasStarted, checkCollision, lockPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !hasStarted) return;
    const rotatedShape = rotateMatrix(currentPiece.shape);
    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    // Wall kick attempts
    const offsets = [0, -1, 1, -2, 2];
    for (const offset of offsets) {
      if (!checkCollision(rotatedPiece, board, offset, 0)) {
        setCurrentPiece({
          ...rotatedPiece,
          x: currentPiece.x + offset,
        });
        playRotateSFX();
        return;
      }
    }
  }, [currentPiece, board, gameOver, isPaused, hasStarted, checkCollision]);

  const handleHold = useCallback(() => {
    if (!currentPiece || !canHold || gameOver || isPaused || !hasStarted) return;
    playHoldSFX();
    setCanHold(false);

    if (holdPiece) {
      const tempKey = holdPiece.key;
      setHoldPiece(spawnPiece(currentPiece.key));
      setCurrentPiece(spawnPiece(tempKey));
    } else {
      setHoldPiece(spawnPiece(currentPiece.key));
      const nextKey = getNextPieceKey();
      setCurrentPiece(spawnPiece(nextPiece.key));
      setNextPiece(spawnPiece(nextKey));
    }
  }, [currentPiece, holdPiece, canHold, gameOver, isPaused, hasStarted, nextPiece, getNextPieceKey, spawnPiece]);

  const togglePause = useCallback(() => {
    if (!hasStarted || gameOver) return;
    setIsPaused((p) => !p);
  }, [hasStarted, gameOver]);

  const handleMusicToggle = () => {
    const active = toggleTetrisMusic();
    setMusicOn(active);
  };

  // Keyboard navigation & game controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (!hasStarted) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
        break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          handleHold();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          handleMusicToggle();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    hasStarted,
    gameOver,
    isPaused,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    handleHold,
    togglePause,
    startGame,
    onClose,
  ]);

  // Main game tick loop
  useEffect(() => {
    if (!hasStarted || isPaused || gameOver || !isOpen) return;

    gameLoopRef.current = setInterval(() => {
      moveDown();
    }, dropTimeRef.current);

    return () => clearInterval(gameLoopRef.current);
  }, [hasStarted, isPaused, gameOver, isOpen, moveDown]);

  // Stop music when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopTetrisMusic();
    }
  }, [isOpen]);

  // Render Main Board & Ghost Piece on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.strokeStyle = 'rgba(255, 176, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw locked blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] !== 0) {
          drawBlock(ctx, c * BLOCK_SIZE, r * BLOCK_SIZE, board[r][c]);
        }
      }
    }

    if (currentPiece && !gameOver) {
      // Calculate ghost piece drop Y
      let ghostY = 0;
      while (!checkCollision(currentPiece, board, 0, ghostY + 1)) {
        ghostY++;
      }

      // Draw Ghost Piece (Dashed Outline)
      ctx.strokeStyle = currentPiece.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const gx = (currentPiece.x + c) * BLOCK_SIZE;
            const gy = (currentPiece.y + ghostY + r) * BLOCK_SIZE;
            ctx.strokeRect(gx + 2, gy + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
          }
        }
      }
      ctx.setLineDash([]);

      // Draw Active Piece
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const px = (currentPiece.x + c) * BLOCK_SIZE;
            const py = (currentPiece.y + r) * BLOCK_SIZE;
            drawBlock(ctx, px, py, currentPiece.color);
          }
        }
      }
    }
  }, [board, currentPiece, gameOver, checkCollision]);

  // Render Mini Preview for Next & Hold Piece
  const renderMiniPiece = (canvas, piece) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!piece) return;
    const shape = piece.shape;
    const size = 16;
    const offsetX = (canvas.width - shape[0].length * size) / 2;
    const offsetY = (canvas.height - shape.length * size) / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          drawBlock(ctx, offsetX + c * size, offsetY + r * size, piece.color, size);
        }
      }
    }
  };

  useEffect(() => {
    renderMiniPiece(nextCanvasRef.current, nextPiece);
  }, [nextPiece]);

  useEffect(() => {
    renderMiniPiece(holdCanvasRef.current, holdPiece);
  }, [holdPiece]);

  // Helper block renderer with retro CRT bevel & glow
  const drawBlock = (ctx, x, y, color, size = BLOCK_SIZE) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    // Retro bevel highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + 1, y + 1, size - 2, 2);
    ctx.fillRect(x + 1, y + 1, 2, size - 2);

    // Bevel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 1, y + size - 3, size - 2, 2);
    ctx.fillRect(x + size - 3, y + 1, 2, size - 2);
  };

  if (!isOpen) return null;

  return (
    <div className="tetris-overlay">
      <div className="tetris-window">
        {/* Header */}
        <div className="tetris-header">
          <div className="tetris-title">
            <span>[▲]</span> RETRO-TETRIS 3000
          </div>
          <div className="tetris-header-btns">
            <button
              className="tetris-btn-icon"
              onClick={handleMusicToggle}
              title="Toggle 8-bit Music [M]"
            >
              {musicOn ? '♪ MUSIC: ON' : '♪ MUSIC: OFF'}
            </button>
            <button className="tetris-btn-icon" onClick={onClose}>
              [ESC] EXIT
            </button>
          </div>
        </div>

        {/* Game Body */}
        <div className="tetris-body">
          {/* Left Column: Hold & Level */}
          <div className="tetris-side-col">
            <div className="tetris-panel-box">
              <span className="tetris-box-title">HOLD [C]</span>
              <canvas ref={holdCanvasRef} width={72} height={72} className="preview-canvas" />
            </div>

            <div className="tetris-panel-box">
              <span className="tetris-box-title">LEVEL</span>
              <span className="tetris-stat-value">{level}</span>
            </div>

            <div className="tetris-panel-box">
              <span className="tetris-box-title">LINES</span>
              <span className="tetris-stat-value">{lines}</span>
            </div>
          </div>

          {/* Center Stage */}
          <div className="tetris-center-stage">
            <div className="main-board-container">
              <canvas
                ref={canvasRef}
                width={COLS * BLOCK_SIZE}
                height={ROWS * BLOCK_SIZE}
                className="tetris-canvas"
              />

              {/* Start Screen Overlay */}
              {!hasStarted && (
                <div className="tetris-state-overlay">
                  <h2>RETRO TETRIS</h2>
                  <p>Authentic 1984 CRT Arcade Edition</p>
                  <button className="tetris-action-btn" onClick={startGame}>
                    PRESS START [ENTER]
                  </button>
                </div>
              )}

              {/* Pause Overlay */}
              {isPaused && (
                <div className="tetris-state-overlay">
                  <h2>PAUSED</h2>
                  <p>Press [P] or click below to resume</p>
                  <button className="tetris-action-btn" onClick={togglePause}>
                    RESUME
                  </button>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="tetris-state-overlay">
                  <h2>GAME OVER</h2>
                  <p>FINAL SCORE: {score}</p>
                  {score >= highScore && score > 0 && <p>★ NEW HIGH SCORE! ★</p>}
                  <button className="tetris-action-btn" onClick={startGame}>
                    PLAY AGAIN [ENTER]
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Touch On-Screen Pad */}
            <div className="tetris-touch-controls">
              <button className="touch-btn" onClick={moveLeft}>◀</button>
              <button className="touch-btn" onClick={rotate}>▲</button>
              <button className="touch-btn" onClick={moveDown}>▼</button>
              <button className="touch-btn" onClick={moveRight}>▶</button>
              <button className="touch-btn" onClick={hardDrop}>⚡</button>
            </div>
          </div>

          {/* Right Column: Next & Score */}
          <div className="tetris-side-col">
            <div className="tetris-panel-box">
              <span className="tetris-box-title">NEXT</span>
              <canvas ref={nextCanvasRef} width={72} height={72} className="preview-canvas" />
            </div>

            <div className="tetris-panel-box">
              <span className="tetris-box-title">SCORE</span>
              <span className="tetris-stat-value">{score}</span>
            </div>

            <div className="tetris-panel-box">
              <span className="tetris-box-title">HI-SCORE</span>
              <span className="tetris-stat-value">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Footer Keys Guide */}
        <div className="tetris-footer">
          <div className="tetris-keys-guide">
            <span><span className="tetris-key-badge">←/→</span> Move</span>
            <span><span className="tetris-key-badge">↑</span> Rotate</span>
            <span><span className="tetris-key-badge">↓</span> Soft Drop</span>
            <span><span className="tetris-key-badge">SPACE</span> Hard Drop</span>
            <span><span className="tetris-key-badge">C</span> Hold</span>
            <span><span className="tetris-key-badge">P</span> Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
