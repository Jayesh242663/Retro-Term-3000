import React, { useState } from 'react';
import BootScreen1984 from './BootScreen1984';
import Snake84 from './Snake84';
import SpaceInvaders84 from './SpaceInvaders84';
import Pong84 from './Pong84';
import Tetris from '../Tetris/Tetris';
import { playArcadeSound } from './arcadeAudio';
import './Arcade84.css';

const ARCADE_GAMES = [
  {
    id: 'tetris',
    num: '1',
    file: 'TETRIS.EXE',
    size: '32KB',
    type: 'EXEC-USSR',
    title: 'TETRIS 84',
    subtitle: 'SOVIET 1984 BRICK STACKER',
    description: 'Classic USSR brick stacking challenge. Clear lines and climb speed levels.',
    bootVariant: 'playstation',
    bootTitle: 'Tetris 84',
    bootSub: 'USSR 1984 モスクワ製',
  },
  {
    id: 'snake',
    num: '2',
    file: 'SNAKE.COM',
    size: '16KB',
    type: 'EXEC-CYBER',
    title: 'CYBER SNAKE 84',
    subtitle: 'NEON SERPENT BYTE HUNTER',
    description: 'Guide the pixel cyber serpent to consume energy bytes.',
    bootVariant: 'windows84',
    bootTitle: 'Snake 84',
    bootSub: 'Version 1.3 日本語版',
  },
  {
    id: 'invaders',
    num: '3',
    file: 'INVADERS.ROM',
    size: '24KB',
    type: 'CARTRIDGE',
    title: 'SPACE INVADERS 84',
    subtitle: 'GALAXY DEFENSE ARMADA',
    description: 'Defend earth against descending alien squid, crab, and octopus fleets.',
    bootVariant: 'twitter84',
    bootTitle: 'Invaders 84',
    bootSub: 'Taito 1984 宇宙艦隊',
  },
  {
    id: 'pong',
    num: '4',
    file: 'PONG.BAS',
    size: '08KB',
    type: 'BASIC-CODE',
    title: 'PONG 84',
    subtitle: 'CYBER TENNIS DUEL',
    description: 'Fast-paced 1984 paddle duel against intelligent CPU matrix AI.',
    bootVariant: 'netflix84',
    bootTitle: 'Pong 84',
    bootSub: 'Atari 1984 インターネット',
  },
];

const STAGES = {
  INITIAL_BOOT: 'INITIAL_BOOT',
  MENU: 'MENU',
  GAME_LOADING: 'GAME_LOADING',
  PLAYING: 'PLAYING',
};

const Arcade84 = ({ isOpen, initialGame = null, onClose }) => {
  const [stage, setStage] = useState(initialGame ? STAGES.GAME_LOADING : STAGES.INITIAL_BOOT);
  const [selectedGame, setSelectedGame] = useState(
    initialGame ? ARCADE_GAMES.find(g => g.id === initialGame) || ARCADE_GAMES[0] : ARCADE_GAMES[0]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset stage every time modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStage(initialGame ? STAGES.GAME_LOADING : STAGES.INITIAL_BOOT);
      if (initialGame) {
        const found = ARCADE_GAMES.find(g => g.id === initialGame);
        if (found) setSelectedGame(found);
      }
    }
  }, [isOpen, initialGame]);

  // Keyboard navigation for old computer BIOS menu ([1-4], Up/Down, Enter, Esc)
  React.useEffect(() => {
    if (!isOpen || stage !== STAGES.MENU) return;

    const handleMenuKeys = (e) => {
      if (e.key === '1') {
        e.preventDefault();
        handleSelectGame(ARCADE_GAMES[0]);
      } else if (e.key === '2') {
        e.preventDefault();
        handleSelectGame(ARCADE_GAMES[1]);
      } else if (e.key === '3') {
        e.preventDefault();
        handleSelectGame(ARCADE_GAMES[2]);
      } else if (e.key === '4') {
        e.preventDefault();
        handleSelectGame(ARCADE_GAMES[3]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playArcadeSound('select');
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : ARCADE_GAMES.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playArcadeSound('select');
        setSelectedIndex(prev => (prev < ARCADE_GAMES.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectGame(ARCADE_GAMES[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleMenuKeys);
    return () => window.removeEventListener('keydown', handleMenuKeys);
  }, [isOpen, stage, selectedIndex, onClose]);

  if (!isOpen) return null;

  const handleSelectGame = (game) => {
    playArcadeSound('select');
    setSelectedGame(game);
    setStage(STAGES.GAME_LOADING);
  };

  const handleInitialBootComplete = () => {
    setStage(STAGES.MENU);
  };

  const handleGameLoadingComplete = () => {
    playArcadeSound('start');
    setStage(STAGES.PLAYING);
  };

  const handleReturnToMenu = () => {
    playArcadeSound('select');
    setStage(STAGES.MENU);
  };

  // STAGE 1 & 3: FULLSCREEN PURE BLACK 1984 CRT BOOT SCREEN (No window box, pure black background)
  if (stage === STAGES.INITIAL_BOOT) {
    return (
      <div className="arcade-boot-fullscreen-overlay">
        <BootScreen1984
          variant="playstation"
          title="PlayStation"
          subtitle="日本製1984年"
          statusText="Processing Payment..."
          duration={5000}
          onComplete={handleInitialBootComplete}
        />
      </div>
    );
  }

  if (stage === STAGES.GAME_LOADING && selectedGame) {
    return (
      <div className="arcade-boot-fullscreen-overlay">
        <BootScreen1984
          variant={selectedGame.bootVariant || 'game'}
          title={selectedGame.bootTitle || selectedGame.title}
          subtitle={selectedGame.bootSub || 'アメリカ製1984'}
          statusText={`Loading ${selectedGame.file}...`}
          duration={1600}
          onComplete={handleGameLoadingComplete}
        />
      </div>
    );
  }

  return (
    <div className="arcade-overlay">
      <div className="arcade-cabinet-window">
        {/* Old Computer Monitor Top Bar */}
        <div className="arcade-header">
          <div className="arcade-brand">
            <span className="arcade-brand-icon">■</span>
            <span>MICRO-DOS v1.84 (64KB RAM)</span>
          </div>
          <div className="arcade-header-controls">
            {stage === STAGES.PLAYING && (
              <button className="arcade-btn-sm" onClick={handleReturnToMenu}>
                [DIR] MENU
              </button>
            )}
            <button className="arcade-btn-sm" onClick={onClose}>
              [ESC] EXIT
            </button>
          </div>
        </div>

        {/* Dynamic Stages */}
        <div className="arcade-stage-content">
          {/* STAGE 2: VINTAGE COMPUTER DISK DIRECTORY & GAME LOADER */}
          {stage === STAGES.MENU && (
            <div className="arcade-menu-view">
              <div className="old-computer-bios-banner">
                <div className="bios-line">*** RETRO-84 DISK SYSTEM v1.84 *** (C) 1984 MICRO-LOGIC</div>
                <div className="bios-line bios-subline">64K RAM SYSTEM • 38911 BYTES FREE • DRIVE A:\GAMES&gt;</div>
              </div>

              {/* Old Computer File Directory Table */}
              <div className="old-computer-dir-table">
                <div className="dir-table-header">
                  <span className="col-idx">KEY</span>
                  <span className="col-file">FILENAME</span>
                  <span className="col-size">SIZE</span>
                  <span className="col-type">TYPE</span>
                  <span className="col-desc">DESCRIPTION</span>
                </div>

                <div className="dir-table-body">
                  {ARCADE_GAMES.map((game, idx) => (
                    <div
                      key={game.id}
                      className={`dir-row ${selectedIndex === idx ? 'dir-row-active' : ''}`}
                      onClick={() => handleSelectGame(game)}
                      onMouseEnter={() => {
                        setSelectedIndex(idx);
                        playArcadeSound('select');
                      }}
                    >
                      <span className="col-idx">[{game.num}]</span>
                      <span className="col-file">{game.file}</span>
                      <span className="col-size">{game.size}</span>
                      <span className="col-type">{game.type}</span>
                      <span className="col-desc">{game.subtitle}</span>
                      <span className="col-cursor">{selectedIndex === idx ? '◄ RUN' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimal Prompt & Instructions */}
              <div className="old-computer-prompt-footer">
                <div className="prompt-action-line">
                  <span className="prompt-blinking-cursor">&gt;</span> PRESS <b>[1]</b>, <b>[2]</b>, <b>[3]</b>, <b>[4]</b> OR USE <b>[▲/▼] + [ENTER]</b> TO EXECUTE
                </div>
                <div className="prompt-sub-line">
                  CLICK OR TAP ANY ROW TO MOUNT & RUN PROGRAM
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: GAME-SPECIFIC 1984 LOADING SCREEN */}
          {stage === STAGES.GAME_LOADING && selectedGame && (
            <BootScreen1984
              variant={selectedGame.bootVariant || 'game'}
              title={selectedGame.bootTitle || selectedGame.title}
              subtitle={selectedGame.bootSub || 'アメリカ製1984'}
              statusText={`Loading ${selectedGame.file}...`}
              duration={1600}
              onComplete={handleGameLoadingComplete}
            />
          )}

          {/* STAGE 4: ACTIVE RETRO GAME */}
          {stage === STAGES.PLAYING && selectedGame && (
            <div className="active-game-container">
              <div className="old-comp-status-line">
                <span>A:\&gt; RUN "{selectedGame.file}"</span>
                <span className="comp-exec-badge">● EXECUTING PROGRAM</span>
              </div>
              {selectedGame.id === 'snake' && <Snake84 onExit={handleReturnToMenu} />}
              {selectedGame.id === 'invaders' && <SpaceInvaders84 onExit={handleReturnToMenu} />}
              {selectedGame.id === 'pong' && <Pong84 onExit={handleReturnToMenu} />}
              {selectedGame.id === 'tetris' && (
                <div className="tetris-arcade-wrap">
                  <Tetris isOpen={true} onClose={handleReturnToMenu} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Arcade84;
