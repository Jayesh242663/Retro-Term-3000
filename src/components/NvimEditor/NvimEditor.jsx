import { useState, useEffect, useRef } from 'react';
import { playKeySound, playEnterSound } from '../../utils/sounds';
import './NvimEditor.css';

const NvimEditor = ({ isOpen, onClose, file, content: initialContent, onSave }) => {
  const [mode, setMode] = useState('NORMAL'); // NORMAL, INSERT, COMMAND, VISUAL
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [commandInput, setCommandInput] = useState('');
  const [showCommand, setShowCommand] = useState(false);
  const [lines, setLines] = useState(['']);
  const [statusMessage, setStatusMessage] = useState('');
  const [isModified, setIsModified] = useState(false);
  const editorRef = useRef(null);
  const contentRef = useRef(null);

  // Initialize content when opened
  useEffect(() => {
    if (isOpen) {
      const contentLines = initialContent ? initialContent.split('\n') : [''];
      setLines(contentLines);
      setCursorLine(1);
      setCursorCol(1);
      setMode('NORMAL');
      setCommandInput('');
      setShowCommand(false);
      setStatusMessage('');
      setIsModified(false);
    }
  }, [isOpen, initialContent]);

  // Scroll to cursor position
  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = 22;
      const scrollTop = (cursorLine - 5) * lineHeight;
      contentRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, [cursorLine]);

  // Show temporary status message
  const showStatus = (msg, duration = 2000) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), duration);
  };

  // Insert character at cursor
  const insertChar = (char) => {
    setLines(prev => {
      const newLines = [...prev];
      const line = newLines[cursorLine - 1] || '';
      newLines[cursorLine - 1] = line.slice(0, cursorCol - 1) + char + line.slice(cursorCol - 1);
      return newLines;
    });
    setCursorCol(prev => prev + 1);
    setIsModified(true);
  };

  // Delete character before cursor (backspace)
  const deleteCharBefore = () => {
    if (cursorCol > 1) {
      setLines(prev => {
        const newLines = [...prev];
        const line = newLines[cursorLine - 1] || '';
        newLines[cursorLine - 1] = line.slice(0, cursorCol - 2) + line.slice(cursorCol - 1);
        return newLines;
      });
      setCursorCol(prev => prev - 1);
      setIsModified(true);
    } else if (cursorLine > 1) {
      // Join with previous line
      setLines(prev => {
        const newLines = [...prev];
        const currentLine = newLines[cursorLine - 1] || '';
        const prevLineLength = (newLines[cursorLine - 2] || '').length;
        newLines[cursorLine - 2] = (newLines[cursorLine - 2] || '') + currentLine;
        newLines.splice(cursorLine - 1, 1);
        setCursorCol(prevLineLength + 1);
        return newLines;
      });
      setCursorLine(prev => prev - 1);
      setIsModified(true);
    }
  };

  // Delete character at cursor (x in normal mode)
  const deleteCharAt = () => {
    setLines(prev => {
      const newLines = [...prev];
      const line = newLines[cursorLine - 1] || '';
      if (line.length > 0) {
        newLines[cursorLine - 1] = line.slice(0, cursorCol - 1) + line.slice(cursorCol);
      }
      return newLines;
    });
    setIsModified(true);
  };

  // Insert new line
  const insertNewLine = () => {
    setLines(prev => {
      const newLines = [...prev];
      const line = newLines[cursorLine - 1] || '';
      const beforeCursor = line.slice(0, cursorCol - 1);
      const afterCursor = line.slice(cursorCol - 1);
      newLines[cursorLine - 1] = beforeCursor;
      newLines.splice(cursorLine, 0, afterCursor);
      return newLines;
    });
    setCursorLine(prev => prev + 1);
    setCursorCol(1);
    setIsModified(true);
  };

  // Delete current line (dd)
  const deleteLine = () => {
    setLines(prev => {
      if (prev.length === 1) {
        setIsModified(true);
        return [''];
      }
      const newLines = [...prev];
      newLines.splice(cursorLine - 1, 1);
      return newLines;
    });
    if (cursorLine > lines.length - 1 && cursorLine > 1) {
      setCursorLine(prev => prev - 1);
    }
    setCursorCol(1);
    setIsModified(true);
    showStatus('1 line deleted');
  };

  // Open new line below (o)
  const openLineBelow = () => {
    setLines(prev => {
      const newLines = [...prev];
      newLines.splice(cursorLine, 0, '');
      return newLines;
    });
    setCursorLine(prev => prev + 1);
    setCursorCol(1);
    setMode('INSERT');
    setIsModified(true);
  };

  // Open new line above (O)
  const openLineAbove = () => {
    setLines(prev => {
      const newLines = [...prev];
      newLines.splice(cursorLine - 1, 0, '');
      return newLines;
    });
    setCursorCol(1);
    setMode('INSERT');
    setIsModified(true);
  };

  // Handle vim commands
  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    const cmdLower = trimmedCmd.toLowerCase();
    const cmdParts = trimmedCmd.split(/\s+/);
    const baseCmd = cmdParts[0].toLowerCase();
    const args = cmdParts.slice(1).join(' ');
    
    if (cmdLower === 'q' || cmdLower === 'quit') {
      if (isModified) {
        showStatus('E37: No write since last change (add ! to override)');
        return;
      }
      onClose();
    } else if (cmdLower === 'q!' || cmdLower === 'quit!') {
      onClose();
    } else if (baseCmd === 'w' || baseCmd === 'write') {
      // Save file, optionally with new filename
      const savePath = args || (file ? file.path : null);
      if (onSave && savePath) {
        const fileName = savePath.split('/').pop();
        onSave(savePath, lines.join('\n'));
        setIsModified(false);
        showStatus(`"${fileName}" written`);
        // Update file info if saved with new name
        if (args && file) {
          file.path = savePath;
          file.name = fileName;
        }
      } else if (!savePath) {
        showStatus('E32: No file name');
      } else {
        showStatus('File saved (simulated)');
        setIsModified(false);
      }
    } else if (baseCmd === 'wq' || baseCmd === 'x') {
      const savePath = args || (file ? file.path : null);
      if (onSave && savePath) {
        onSave(savePath, lines.join('\n'));
      }
      onClose();
    } else if (trimmedCmd.match(/^\d+$/)) {
      // Go to line number
      const lineNum = parseInt(trimmedCmd);
      if (lineNum >= 1 && lineNum <= lines.length) {
        setCursorLine(lineNum);
        setCursorCol(1);
      }
    } else if (cmdLower === '$') {
      // Go to last line
      setCursorLine(lines.length);
    } else if (cmdLower === '0' || cmdLower === '1') {
      // Go to first line
      setCursorLine(1);
    } else {
      showStatus(`E492: Not an editor command: ${trimmedCmd}`);
    }
  };

  // Handle keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Command mode input
      if (showCommand) {
        if (e.key === 'Enter') {
          e.preventDefault();
          playEnterSound();
          handleCommand(commandInput);
          setCommandInput('');
          setShowCommand(false);
          setMode('NORMAL');
        } else if (e.key === 'Escape') {
          e.preventDefault();
          playKeySound();
          setCommandInput('');
          setShowCommand(false);
          setMode('NORMAL');
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          playKeySound();
          if (commandInput.length === 0) {
            setShowCommand(false);
            setMode('NORMAL');
          } else {
            setCommandInput(prev => prev.slice(0, -1));
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          playKeySound();
          setCommandInput(prev => prev + e.key);
        }
        return;
      }

      // INSERT mode
      if (mode === 'INSERT') {
        if (e.key === 'Escape') {
          e.preventDefault();
          playKeySound();
          setMode('NORMAL');
          // Move cursor back one if not at start
          if (cursorCol > 1) {
            setCursorCol(prev => prev - 1);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          playKeySound();
          insertNewLine();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          playKeySound();
          deleteCharBefore();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          playKeySound();
          insertChar('  '); // 2 spaces for tab
          setCursorCol(prev => prev + 1); // Extra increment for 2nd space
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setCursorLine(prev => Math.max(1, prev - 1));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setCursorLine(prev => Math.min(lines.length, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCursorCol(prev => Math.max(1, prev - 1));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const lineLen = (lines[cursorLine - 1] || '').length;
          setCursorCol(prev => Math.min(lineLen + 1, prev + 1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          playKeySound();
          insertChar(e.key);
        }
        return;
      }

      // NORMAL mode
      if (mode === 'NORMAL') {
        const lineLen = (lines[cursorLine - 1] || '').length;
        
        switch (e.key) {
          case 'j':
          case 'ArrowDown':
            e.preventDefault();
            playKeySound();
            setCursorLine(prev => Math.min(lines.length, prev + 1));
            break;
          case 'k':
          case 'ArrowUp':
            e.preventDefault();
            playKeySound();
            setCursorLine(prev => Math.max(1, prev - 1));
            break;
          case 'h':
          case 'ArrowLeft':
            e.preventDefault();
            playKeySound();
            setCursorCol(prev => Math.max(1, prev - 1));
            break;
          case 'l':
          case 'ArrowRight':
            e.preventDefault();
            playKeySound();
            setCursorCol(prev => Math.min(Math.max(lineLen, 1), prev + 1));
            break;
          case 'w':
            // Move to next word
            e.preventDefault();
            playKeySound();
            const currentLine = lines[cursorLine - 1] || '';
            const afterCursor = currentLine.slice(cursorCol - 1);
            const wordMatch = afterCursor.match(/^\S*\s*/);
            if (wordMatch) {
              const newCol = cursorCol + wordMatch[0].length;
              if (newCol <= currentLine.length) {
                setCursorCol(newCol);
              } else if (cursorLine < lines.length) {
                setCursorLine(prev => prev + 1);
                setCursorCol(1);
              }
            }
            break;
          case 'b':
            // Move to previous word
            e.preventDefault();
            playKeySound();
            if (cursorCol > 1) {
              const beforeCursor = (lines[cursorLine - 1] || '').slice(0, cursorCol - 1);
              const words = beforeCursor.trimEnd().split(/\s+/);
              if (words.length > 0) {
                const lastWord = words[words.length - 1];
                setCursorCol(beforeCursor.lastIndexOf(lastWord) + 1);
              }
            } else if (cursorLine > 1) {
              setCursorLine(prev => prev - 1);
              setCursorCol((lines[cursorLine - 2] || '').length || 1);
            }
            break;
          case 'g':
            e.preventDefault();
            playKeySound();
            setCursorLine(1);
            setCursorCol(1);
            break;
          case 'G':
            e.preventDefault();
            playKeySound();
            setCursorLine(lines.length);
            setCursorCol(1);
            break;
          case '0':
          case 'Home':
            e.preventDefault();
            playKeySound();
            setCursorCol(1);
            break;
          case '$':
          case 'End':
            e.preventDefault();
            playKeySound();
            setCursorCol(Math.max(lineLen, 1));
            break;
          case '^':
            // Go to first non-whitespace character
            e.preventDefault();
            playKeySound();
            const firstNonSpace = (lines[cursorLine - 1] || '').search(/\S/);
            setCursorCol(firstNonSpace >= 0 ? firstNonSpace + 1 : 1);
            break;
          case 'i':
            e.preventDefault();
            playKeySound();
            setMode('INSERT');
            break;
          case 'I':
            // Insert at beginning of line
            e.preventDefault();
            playKeySound();
            setCursorCol(1);
            setMode('INSERT');
            break;
          case 'a':
            // Append after cursor
            e.preventDefault();
            playKeySound();
            setCursorCol(prev => Math.min(lineLen + 1, prev + 1));
            setMode('INSERT');
            break;
          case 'A':
            // Append at end of line
            e.preventDefault();
            playKeySound();
            setCursorCol(lineLen + 1);
            setMode('INSERT');
            break;
          case 'o':
            e.preventDefault();
            playKeySound();
            openLineBelow();
            break;
          case 'O':
            e.preventDefault();
            playKeySound();
            openLineAbove();
            break;
          case 'x':
            // Delete character at cursor
            e.preventDefault();
            playKeySound();
            deleteCharAt();
            break;
          case 'd':
            // Start delete command (simplified: just delete line)
            e.preventDefault();
            playKeySound();
            // For simplicity, 'd' alone deletes line (like dd)
            deleteLine();
            break;
          case 'u':
            // Undo (simplified: just show message)
            e.preventDefault();
            playKeySound();
            showStatus('Undo not available in this demo');
            break;
          case ':':
            e.preventDefault();
            playKeySound();
            setShowCommand(true);
            setMode('COMMAND');
            break;
          case 'Escape':
            e.preventDefault();
            playKeySound();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, showCommand, commandInput, cursorLine, cursorCol, lines]);

  if (!isOpen) return null;

  return (
    <div className="nvim-editor-overlay">
      <div className="nvim-editor" ref={editorRef}>
        {/* Tab bar */}
        <div className="nvim-tabbar">
          <span className="nvim-tab active">
            {file?.name || 'untitled'}
            {isModified && ' [+]'}
          </span>
          <span className="nvim-tab-fill"></span>
        </div>

        {/* Editor content */}
        <div className="nvim-content" ref={contentRef}>
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isCurrentLine = lineNum === cursorLine;
            const lineLen = line.length;
            
            return (
              <div 
                key={index} 
                className={`nvim-line ${isCurrentLine ? 'current' : ''}`}
              >
                <span className={`nvim-line-number ${isCurrentLine ? 'current' : ''}`}>
                  {String(lineNum).padStart(3, ' ')}
                </span>
                <span className="nvim-line-content">
                  {isCurrentLine ? (
                    <>
                      {line.slice(0, cursorCol - 1)}
                      <span className={`nvim-cursor ${mode === 'INSERT' ? 'insert' : ''}`}>
                        {line[cursorCol - 1] || ' '}
                      </span>
                      {line.slice(cursorCol)}
                    </>
                  ) : (
                    line || ' '
                  )}
                </span>
              </div>
            );
          })}
          
          {/* Empty lines with tildes */}
          {Array.from({ length: Math.max(0, 15 - lines.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="nvim-line empty">
              <span className="nvim-line-number empty">~</span>
              <span className="nvim-line-content"></span>
            </div>
          ))}
        </div>

        {/* Status line */}
        <div className="nvim-statusline">
          <span className={`nvim-mode-indicator ${mode.toLowerCase()}`}>{mode}</span>
          <span className="nvim-filename">
            {file?.path || '[No Name]'}
            {isModified && ' [+]'}
          </span>
          <span className="nvim-filetype">[{file?.type || 'text'}]</span>
          <span className="nvim-position">{cursorLine},{cursorCol}</span>
          <span className="nvim-percentage">
            {lines.length > 0 ? Math.round((cursorLine / lines.length) * 100) : 0}%
          </span>
        </div>

        {/* Command line */}
        <div className="nvim-commandline">
          {showCommand ? (
            <span className="nvim-command-input">:{commandInput}<span className="nvim-command-cursor">▌</span></span>
          ) : statusMessage ? (
            <span className="nvim-status-message">{statusMessage}</span>
          ) : mode === 'INSERT' ? (
            <span className="nvim-insert-msg">-- INSERT --</span>
          ) : (
            <span className="nvim-help-hint">NORMAL | i:insert a:append o:newline d:delete :w:save :q:quit</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NvimEditor;
