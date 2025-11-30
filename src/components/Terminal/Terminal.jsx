import { useState, useEffect, useRef } from 'react';
import { playKeySound, playEnterSound, playErrorSound, initAudio, playProgressBeep } from '../../utils/sounds';
import FileExplorer from '../FileExplorer';
import NvimEditor from '../NvimEditor';
import resumeMd from '../../content/resume.md?raw';
import { getFileContent, saveFile, fileExists, normalizePath, getFileType, getFileName, listFiles, getFileStructure, createDirectory, directoryExists, deleteFile, deleteDirectory, moveFile, copyFile, getFileSize, countLines, countWords, searchInFile, getHead, getTail, appendToFile, getDirectory } from '../../utils/fileSystem';
import './Terminal.css';

const Terminal = ({ onCommand, onShutdown, initialOutput = [], welcomeMessage = true }) => {
  const [history, setHistory] = useState(initialOutput);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showWelcome, setShowWelcome] = useState(welcomeMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingDots, setLoadingDots] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [hackStage, setHackStage] = useState('');
  const [hackLines, setHackLines] = useState([]);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(-1); // -1 means input is focused
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [showNvimEditor, setShowNvimEditor] = useState(false);
  const [editorFile, setEditorFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [fileSystemVersion, setFileSystemVersion] = useState(0); // Force re-render on file changes
  const [currentDir, setCurrentDir] = useState('~'); // Current working directory
  const [cursorPosition, setCursorPosition] = useState(0); // Track cursor position for block cursor
  const [cursorLeft, setCursorLeft] = useState(0); // Actual pixel offset for cursor
  // note: interactive confirmations removed; deletions run immediately
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const contentRef = useRef(null);
  const menuRefs = useRef([]);
  const measureRef = useRef(null);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Update cursor pixel position when text or cursor position changes
  useEffect(() => {
    if (measureRef.current) {
      setCursorLeft(measureRef.current.offsetWidth);
    }
  }, [currentInput, cursorPosition]);

  // Perform deletion immediately (no animation)
  const performDelete = async (targetPath, isDir = false) => {
    // immediate deletion without progress animation or beeps
    let result;
    if (isDir) result = deleteDirectory(targetPath);
    else result = deleteFile(targetPath);

    if (result.success) {
      setFileSystemVersion(prev => prev + 1);
      const msg = result.trashPath ? `Moved to trash: ${result.trashPath}` : `Removed: ${targetPath}`;
      setHistory(prev => [...prev, { type: 'output', content: msg }]);
    } else {
      setHistory(prev => [...prev, { type: 'output', content: `rm: ${result.error}` }]);
    }
  };

  const menuItems = ['File', 'View', 'Link', 'Setup', 'Help'];

  // Resolve path relative to current directory
  const resolvePath = (path) => {
    if (!path) return currentDir;
    if (path === '~') return '~';
    if (path === '.') return currentDir;
    if (path === '..') {
      if (currentDir === '~') return '~';
      const parts = currentDir.split('/');
      parts.pop();
      return parts.join('/') || '~';
    }
    if (path.startsWith('~') || path.startsWith('/')) {
      return normalizePath(path);
    }
    // Relative path
    return normalizePath(currentDir + '/' + path);
  };

  // Commands that should show loading animation
  const loadingCommands = {
    'about': { text: 'Loading profile data', duration: 800, hasProgressBar: false },
    'about me': { text: 'Loading profile data', duration: 800, hasProgressBar: false },
    'skills': { text: 'Scanning skill matrix', duration: 900, hasProgressBar: false },
    'skill': { text: 'Scanning skill matrix', duration: 900, hasProgressBar: false },
    'projects': { text: 'Fetching project data', duration: 1000, hasProgressBar: false },
    'project': { text: 'Fetching project data', duration: 1000, hasProgressBar: false },
    'work': { text: 'Fetching project data', duration: 1000, hasProgressBar: false },
    'contact': { text: 'Retrieving contact info', duration: 700, hasProgressBar: false },
    'email': { text: 'Retrieving contact info', duration: 700, hasProgressBar: false },
    'experience': { text: 'Loading work history', duration: 900, hasProgressBar: false },
    'exp': { text: 'Loading work history', duration: 900, hasProgressBar: false },
    'history': { text: 'Loading work history', duration: 900, hasProgressBar: false },
    'hack': { text: 'INITIATING HACK SEQUENCE', duration: 3500, hasProgressBar: true, isHack: true },
    'matrix': { text: 'INITIATING HACK SEQUENCE', duration: 3500, hasProgressBar: true, isHack: true },
  };

  // Loading dots animation
  useEffect(() => {
    if (!isLoading) return;
    
    const dotsInterval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 300);
    
    return () => clearInterval(dotsInterval);
  }, [isLoading]);

  // Clear terminal function
  const clearTerminal = () => {
    setHistory([]);
    setShowWelcome(true);
  };

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [history, isLoading, hackLines, hackStage]);

  // Focus input after loading completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
      // Ensure scroll is at bottom after command completes
      if (contentRef.current) {
        setTimeout(() => {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }, 50);
      }
    }
  }, [isLoading]);

  // Focus input on click anywhere in terminal
  const handleTerminalClick = () => {
    initAudio(); // Initialize audio on first click
    inputRef.current?.focus();
  };

  // Handle command submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    playEnterSound();
    const commandRaw = currentInput.trim();
    const command = commandRaw.toLowerCase();
    const commandParts = commandRaw.split(/\s+/);
    const baseCommand = commandParts[0].toLowerCase();
    const args = commandParts.slice(1);
    
    // Add command to history display (include current directory)
    setHistory(prev => [...prev, { type: 'input', content: currentInput, dir: currentDir }]);

    // interactive confirmations removed - commands execute immediately
    
    // Add to command history for up/down navigation
    setCommandHistory(prev => [...prev, currentInput]);
    setHistoryIndex(-1);
    setCurrentInput('');
    setCursorPosition(0);

    // Check for clear command
    if (command === 'clear' || command === 'cls') {
      clearTerminal();
      return;
    }

    // help - show commands (instant, no typing animation)
    if (baseCommand === 'help') {
      const helpLines = [
        'help      - Show available commands',
        'skills    - List my technical skills',
        'projects  - View my projects',
        'experience- Show work history',
        'contact   - Get contact information',
        'about     - Display information about me',
        'clear     - Clear the terminal',
      ];

      setHistory(prev => [...prev, { type: 'output', content: <pre className="typing-output">{helpLines.join('\n')}</pre> }]);
      return;
    }

    // about - type out the about.txt content with typing animation
    if (baseCommand === 'about' || command === 'about me') {
      const fileContent = getFileContent('~/about.txt') || `Name: Your Name\nRole: Developer\n\nUse 'help' to see commands.`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="typing-output">{fileContent}</pre> }]);
      return;
    }

    // resume - show resume.md content (prefer in-memory file if present)
    if (baseCommand === 'resume') {
      const mem = getFileContent('~/resume.md');
      const contentToShow = mem !== null ? mem : resumeMd;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{contentToShow}</pre> }]);
      return;
    }

    // Handle file commands
    if (baseCommand === 'nvim' || baseCommand === 'vim' || baseCommand === 'nano' || baseCommand === 'edit') {
      if (args.length === 0) {
        // Open empty new file in current directory
        const file = {
          name: '[New File]',
          path: resolvePath('untitled'),
          type: 'text',
          isNew: true
        };
        setEditorFile(file);
        setEditorContent('');
        setShowNvimEditor(true);
      } else {
        const filePath = resolvePath(args[0]);
        const content = getFileContent(filePath);
        const fileName = getFileName(filePath);
        const file = {
          name: fileName,
          path: filePath,
          type: getFileType(fileName),
          isNew: !fileExists(filePath)
        };
        setEditorFile(file);
        setEditorContent(content || '');
        setShowNvimEditor(true);
      }
      return;
    }

    if (baseCommand === 'touch') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'touch: missing file operand\nTry \'touch --help\' for more information.' }]);
        return;
      }
      
      // Touch can handle multiple files
      for (const arg of args) {
        if (arg.startsWith('-')) continue; // Skip flags
        
        const filePath = resolvePath(arg);
        
        // Check if it's a directory
        if (directoryExists(filePath) && !fileExists(filePath)) {
          // touch on directory just updates timestamp (simulated - no error)
          continue;
        }
        
        // Check if parent directory exists
        const parentDir = getDirectory(filePath);
        if (parentDir !== '~' && !directoryExists(parentDir)) {
          setHistory(prev => [...prev, { type: 'output', content: `touch: cannot touch '${arg}': No such file or directory` }]);
          continue;
        }
        
        if (!fileExists(filePath)) {
          saveFile(filePath, '');
          setFileSystemVersion(prev => prev + 1);
        }
        // If file exists, touch just updates timestamp (silent, like real touch)
      }
      // Silent success (like real touch)
      return;
    }

    if (baseCommand === 'mkdir') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'mkdir: missing operand\nTry \'mkdir --help\' for more information.' }]);
        return;
      }
      
      // Support -p flag for creating parent directories
      const hasParentFlag = args.includes('-p');
      const hasVerbose = args.includes('-v');
      const dirs = args.filter(a => !a.startsWith('-'));
      
      if (dirs.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'mkdir: missing operand\nTry \'mkdir --help\' for more information.' }]);
        return;
      }
      
      for (const dirPath of dirs) {
        const normalizedPath = resolvePath(dirPath);
        
        // Check if a file exists at this path
        if (fileExists(normalizedPath)) {
          setHistory(prev => [...prev, { type: 'output', content: `mkdir: cannot create directory '${dirPath}': File exists` }]);
          continue;
        }
        
        if (directoryExists(normalizedPath)) {
          if (!hasParentFlag) {
            setHistory(prev => [...prev, { type: 'output', content: `mkdir: cannot create directory '${dirPath}': File exists` }]);
          }
          // -p flag: silently succeed if directory exists
          continue;
        }
        
        const result = createDirectory(normalizedPath);
        if (result.success) {
          setFileSystemVersion(prev => prev + 1);
          if (hasVerbose) {
            setHistory(prev => [...prev, { type: 'output', content: `mkdir: created directory '${dirPath}'` }]);
          }
          // Silent success without -v (like real mkdir)
        } else {
          setHistory(prev => [...prev, { type: 'output', content: `mkdir: cannot create directory '${dirPath}': ${result.error}` }]);
        }
      }
      return;
    }

    if (baseCommand === 'cat') {
      if (args.length === 0) {
        // Real cat waits for stdin, but we'll show usage hint
        setHistory(prev => [...prev, { type: 'output', content: 'cat: missing file operand\nTry \'cat --help\' for more information.' }]);
        return;
      }
      
      // Handle multiple files
      let allContent = [];
      let hasError = false;
      
      for (const arg of args) {
        if (arg.startsWith('-')) continue; // Skip flags
        
        const filePath = resolvePath(arg);
        
        // Check if it's a directory
        if (directoryExists(filePath) && !fileExists(filePath)) {
          setHistory(prev => [...prev, { type: 'output', content: `cat: ${arg}: Is a directory` }]);
          hasError = true;
          continue;
        }
        
        const content = getFileContent(filePath);
        if (content !== null) {
          allContent.push(content);
        } else {
          setHistory(prev => [...prev, { type: 'output', content: `cat: ${arg}: No such file or directory` }]);
          hasError = true;
        }
      }
      
      if (allContent.length > 0) {
        setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{allContent.join('\n')}</pre> }]);
      }
      return;
    }

    if (baseCommand === 'ls' || baseCommand === 'dir') {
      const hasLong = args.includes('-l') || args.includes('-la') || args.includes('-al') || args.includes('-lh');
      const hasAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const hasHuman = args.includes('-h') || args.includes('-lh');
      const dirArg = args.filter(a => !a.startsWith('-'))[0];
      const dir = resolvePath(dirArg);
      
      // Check if directory exists
      if (dirArg && !directoryExists(dir) && dir !== '~') {
        setHistory(prev => [...prev, { type: 'output', content: `ls: cannot access '${dirArg}': No such file or directory` }]);
        return;
      }
      
      let files = listFiles(dir);
      
      // Filter hidden files unless -a flag
      if (!hasAll) {
        files = files.filter(f => !f.name.startsWith('.'));
      }
      
      // Empty directory - show nothing (like real ls)
      if (files.length === 0) {
        return;
      }
      
      if (hasLong) {
        // Long format listing like: -rw-r--r-- 1 guest guest  1234 Dec  1 12:00 file.txt
        const formatSize = (size) => {
          if (hasHuman) {
            if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + 'M';
            if (size >= 1024) return (size / 1024).toFixed(1) + 'K';
            return size + '';
          }
          return size.toString().padStart(5);
        };
        
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateStr = `${months[now.getMonth()]} ${now.getDate().toString().padStart(2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const totalBlocks = files.reduce((sum, f) => sum + (f.isDirectory ? 4 : Math.ceil((getFileSize(f.path) || 0) / 1024)), 0);
        
        const longLines = files.map(f => {
          const perms = f.isDirectory ? 'drwxr-xr-x' : '-rw-r--r--';
          const links = f.isDirectory ? '2' : '1';
          const size = f.isDirectory ? '4096' : formatSize(getFileSize(f.path) || 0);
          const name = f.isDirectory ? f.name.replace(/\/$/, '') : f.name;
          return `${perms} ${links} guest guest ${size.padStart(hasHuman ? 5 : 5)} ${dateStr} ${name}`;
        });
        
        const output = `total ${totalBlocks}\n${longLines.join('\n')}`;
        setHistory(prev => [...prev, { type: 'output', content: <pre className="ls-pre-output">{output}</pre> }]);
      } else {
        // Short format - display in columns like real ls
        const names = files.map(f => f.isDirectory ? f.name.replace(/\/$/, '') : f.name);
        const maxLen = Math.max(...names.map(n => n.length));
        const termWidth = 80;
        const colWidth = maxLen + 2;
        const numCols = Math.max(1, Math.floor(termWidth / colWidth));
        
        // Build output with proper column formatting
        const rows = [];
        for (let i = 0; i < names.length; i += numCols) {
          const rowItems = names.slice(i, i + numCols);
          rows.push(rowItems.map((name, idx) => {
            const file = files[i + idx];
            const displayName = name.padEnd(colWidth);
            return file.isDirectory 
              ? <span key={file.path} className="ls-dir">{displayName}</span>
              : <span key={file.path} className="ls-file">{displayName}</span>;
          }));
        }
        
        const output = rows.map((row, i) => <div key={i} className="ls-row">{row}</div>);
        setHistory(prev => [...prev, { type: 'output', content: <div className="ls-columns">{output}</div> }]);
      }
      return;
    }

    if (baseCommand === 'rm') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'rm: missing operand\nTry \'rm --help\' for more information.' }]);
        return;
      }

      // parse flags
      const flags = args.filter(a => a.startsWith('-')).join('');
      const targets = args.filter(a => !a.startsWith('-'));
      
      if (targets.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'rm: missing operand\nTry \'rm --help\' for more information.' }]);
        return;
      }

      const isRecursive = flags.includes('r') || flags.includes('R');
      const isForce = flags.includes('f');
      const isVerbose = flags.includes('v');

      for (const targetArg of targets) {
        const targetPath = resolvePath(targetArg);

        // If it's a directory
        if (directoryExists(targetPath) && !fileExists(targetPath)) {
          if (!isRecursive) {
            setHistory(prev => [...prev, { type: 'output', content: `rm: cannot remove '${targetArg}': Is a directory` }]);
            continue;
          }

          // Perform delete
          const result = deleteDirectory(targetPath);
          if (result.success) {
            setFileSystemVersion(prev => prev + 1);
            if (isVerbose) {
              setHistory(prev => [...prev, { type: 'output', content: `removed directory '${targetArg}'` }]);
            }
          } else {
            setHistory(prev => [...prev, { type: 'output', content: `rm: cannot remove '${targetArg}': ${result.error}` }]);
          }
          continue;
        }

        // Not a directory — attempt to remove file
        if (!fileExists(targetPath)) {
          if (!isForce) {
            setHistory(prev => [...prev, { type: 'output', content: `rm: cannot remove '${targetArg}': No such file or directory` }]);
          }
          continue;
        }

        // Delete file
        const result = deleteFile(targetPath);
        if (result.success) {
          setFileSystemVersion(prev => prev + 1);
          if (isVerbose) {
            setHistory(prev => [...prev, { type: 'output', content: `removed '${targetArg}'` }]);
          }
        } else {
          setHistory(prev => [...prev, { type: 'output', content: `rm: cannot remove '${targetArg}': ${result.error}` }]);
        }
      }
      return;
    }

    // mv - move/rename file
    if (baseCommand === 'mv') {
      if (args.length < 2) {
        setHistory(prev => [...prev, { type: 'output', content: `mv: missing destination file operand after '${args[0] || ''}'\nTry 'mv --help' for more information.` }]);
        return;
      }
      const isVerbose = args.includes('-v');
      const filteredArgs = args.filter(a => !a.startsWith('-'));
      const source = resolvePath(filteredArgs[0]);
      const dest = resolvePath(filteredArgs[1]);
      
      const result = moveFile(source, dest);
      if (result.success) {
        setFileSystemVersion(prev => prev + 1);
        if (isVerbose) {
          setHistory(prev => [...prev, { type: 'output', content: `renamed '${filteredArgs[0]}' -> '${filteredArgs[1]}'` }]);
        }
        // Silent success without -v (like real mv)
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `mv: cannot move '${filteredArgs[0]}' to '${filteredArgs[1]}': ${result.error}` }]);
      }
      return;
    }

    // cp - copy file
    if (baseCommand === 'cp') {
      if (args.length < 2) {
        setHistory(prev => [...prev, { type: 'output', content: `cp: missing destination file operand after '${args[0] || ''}'\nTry 'cp --help' for more information.` }]);
        return;
      }
      const isVerbose = args.includes('-v');
      const filteredArgs = args.filter(a => !a.startsWith('-'));
      const source = resolvePath(filteredArgs[0]);
      const dest = resolvePath(filteredArgs[1]);
      
      const result = copyFile(source, dest);
      if (result.success) {
        setFileSystemVersion(prev => prev + 1);
        if (isVerbose) {
          setHistory(prev => [...prev, { type: 'output', content: `'${filteredArgs[0]}' -> '${filteredArgs[1]}'` }]);
        }
        // Silent success without -v (like real cp)
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `cp: cannot copy '${filteredArgs[0]}' to '${filteredArgs[1]}': ${result.error}` }]);
      }
      return;
    }

    // pwd - print working directory
    if (baseCommand === 'pwd') {
      // Convert ~ to /home/guest for display like real Linux
      let displayPath = currentDir;
      if (displayPath === '~') {
        displayPath = '/home/guest';
      } else if (displayPath.startsWith('~/')) {
        displayPath = '/home/guest/' + displayPath.slice(2);
      } else if (displayPath.startsWith('~')) {
        displayPath = '/home/guest' + displayPath.slice(1);
      }
      setHistory(prev => [...prev, { type: 'output', content: displayPath }]);
      return;
    }

    // whoami - current user
    if (baseCommand === 'whoami') {
      setHistory(prev => [...prev, { type: 'output', content: 'guest' }]);
      return;
    }

    // hostname
    if (baseCommand === 'hostname') {
      setHistory(prev => [...prev, { type: 'output', content: 'retro-terminal' }]);
      return;
    }

    // uname - system info
    if (baseCommand === 'uname') {
      const hasAll = args.includes('-a');
      if (hasAll) {
        setHistory(prev => [...prev, { type: 'output', content: 'RetroOS 1.0.0 retro-terminal x86_64 GNU/Linux' }]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: 'RetroOS' }]);
      }
      return;
    }

    // date - current date/time
    if (baseCommand === 'date') {
      const now = new Date();
      setHistory(prev => [...prev, { type: 'output', content: now.toString() }]);
      return;
    }

    // echo - print text (like real bash)
    if (baseCommand === 'echo') {
      // Handle -n flag (no newline) - we just process it
      const hasNoNewline = args[0] === '-n';
      const textArgs = hasNoNewline ? args.slice(1) : args;
      
      // Find redirection operators
      const redirectAppendIdx = textArgs.findIndex(a => a === '>>');
      const redirectWriteIdx = textArgs.findIndex(a => a === '>');
      
      // Handle >> redirection (append)
      if (redirectAppendIdx !== -1) {
        const textPart = textArgs.slice(0, redirectAppendIdx).join(' ').replace(/^["']|["']$/g, '');
        const filePath = textArgs[redirectAppendIdx + 1];
        if (filePath) {
          const resolvedPath = resolvePath(filePath);
          appendToFile(resolvedPath, textPart);
          setFileSystemVersion(prev => prev + 1);
        } else {
          setHistory(prev => [...prev, { type: 'output', content: 'bash: syntax error near unexpected token `newline\'' }]);
        }
        return;
      }
      
      // Handle > redirection (overwrite)
      if (redirectWriteIdx !== -1) {
        const textPart = textArgs.slice(0, redirectWriteIdx).join(' ').replace(/^["']|["']$/g, '');
        const filePath = textArgs[redirectWriteIdx + 1];
        if (filePath) {
          const resolvedPath = resolvePath(filePath);
          saveFile(resolvedPath, textPart);
          setFileSystemVersion(prev => prev + 1);
        } else {
          setHistory(prev => [...prev, { type: 'output', content: 'bash: syntax error near unexpected token `newline\'' }]);
        }
        return;
      }
      
      // Regular echo - remove surrounding quotes if present
      const text = textArgs.join(' ').replace(/^["']|["']$/g, '');
      if (text || textArgs.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: text }]);
      }
      return;
    }

    // head - first n lines
    if (baseCommand === 'head') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'head: missing file operand\nTry \'head --help\' for more information.' }]);
        return;
      }
      let n = 10;
      let fileArg = args[0];
      
      // Handle -n flag or -NUMBER format
      if (args[0] === '-n' && args[1]) {
        n = parseInt(args[1]) || 10;
        fileArg = args[2];
      } else if (args[0].match(/^-\d+$/)) {
        n = parseInt(args[0].slice(1)) || 10;
        fileArg = args[1];
      }
      
      if (!fileArg) {
        setHistory(prev => [...prev, { type: 'output', content: 'head: missing file operand' }]);
        return;
      }
      
      const filePath = resolvePath(fileArg);
      const content = getHead(filePath, n);
      if (content !== null) {
        setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{content}</pre> }]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `head: cannot open '${fileArg}' for reading: No such file or directory` }]);
      }
      return;
    }

    // tail - last n lines
    if (baseCommand === 'tail') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'tail: missing file operand\nTry \'tail --help\' for more information.' }]);
        return;
      }
      let n = 10;
      let fileArg = args[0];
      
      // Handle -n flag or -NUMBER format
      if (args[0] === '-n' && args[1]) {
        n = parseInt(args[1]) || 10;
        fileArg = args[2];
      } else if (args[0].match(/^-\d+$/)) {
        n = parseInt(args[0].slice(1)) || 10;
        fileArg = args[1];
      }
      
      if (!fileArg) {
        setHistory(prev => [...prev, { type: 'output', content: 'tail: missing file operand' }]);
        return;
      }
      
      const filePath = resolvePath(fileArg);
      const content = getTail(filePath, n);
      if (content !== null) {
        setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{content}</pre> }]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `tail: cannot open '${fileArg}' for reading: No such file or directory` }]);
      }
      return;
    }

    // wc - word/line/char count
    if (baseCommand === 'wc') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'wc: missing file operand\nTry \'wc --help\' for more information.' }]);
        return;
      }
      
      const flags = args.filter(a => a.startsWith('-')).join('');
      const fileArg = args.filter(a => !a.startsWith('-'))[0];
      
      if (!fileArg) {
        setHistory(prev => [...prev, { type: 'output', content: 'wc: missing file operand' }]);
        return;
      }
      
      const filePath = resolvePath(fileArg);
      const lines = countLines(filePath);
      const words = countWords(filePath);
      const chars = getFileSize(filePath);
      
      if (lines !== null) {
        // Format output like real wc with proper spacing
        if (flags.includes('l') && !flags.includes('w') && !flags.includes('c')) {
          setHistory(prev => [...prev, { type: 'output', content: `${lines.toString().padStart(7)} ${fileArg}` }]);
        } else if (flags.includes('w') && !flags.includes('l') && !flags.includes('c')) {
          setHistory(prev => [...prev, { type: 'output', content: `${words.toString().padStart(7)} ${fileArg}` }]);
        } else if (flags.includes('c') && !flags.includes('l') && !flags.includes('w')) {
          setHistory(prev => [...prev, { type: 'output', content: `${chars.toString().padStart(7)} ${fileArg}` }]);
        } else {
          // Default: show all (lines words chars filename)
          setHistory(prev => [...prev, { type: 'output', content: `${lines.toString().padStart(7)} ${words.toString().padStart(7)} ${chars.toString().padStart(7)} ${fileArg}` }]);
        }
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `wc: ${fileArg}: No such file or directory` }]);
      }
      return;
    }

    // grep - search in file
    if (baseCommand === 'grep') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'Usage: grep [OPTION]... PATTERN [FILE]...\nTry \'grep --help\' for more information.' }]);
        return;
      }
      if (args.length < 2) {
        setHistory(prev => [...prev, { type: 'output', content: 'grep: missing file operand' }]);
        return;
      }
      
      const hasLineNum = args.includes('-n');
      const hasIgnoreCase = args.includes('-i');
      const filteredArgs = args.filter(a => !a.startsWith('-'));
      const pattern = filteredArgs[0];
      const fileArg = filteredArgs[1];
      
      const filePath = resolvePath(fileArg);
      const matches = searchInFile(filePath, pattern);
      
      if (matches === null) {
        setHistory(prev => [...prev, { type: 'output', content: `grep: ${fileArg}: No such file or directory` }]);
      } else if (matches.length === 0) {
        // Real grep exits silently with no matches (just returns exit code 1)
        return;
      } else {
        if (hasLineNum) {
          const output = matches.map(m => (
            <div key={m.lineNum} className="grep-line">
              <span className="grep-linenum">{m.lineNum}:</span>
              <span className="grep-content">{m.content}</span>
            </div>
          ));
          setHistory(prev => [...prev, { type: 'output', content: <div className="grep-output">{output}</div> }]);
        } else {
          // Without -n, just show matching lines
          const output = matches.map(m => m.content).join('\n');
          setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{output}</pre> }]);
        }
      }
      return;
    }

    // find - find files (like real find)
    if (baseCommand === 'find') {
      // Parse find options: find [path] [-name pattern] [-type f|d]
      let searchPath = '.';
      let namePattern = null;
      let typeFilter = null;
      
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-name' && args[i + 1]) {
          namePattern = args[i + 1].replace(/[*]/g, '.*').replace(/[?]/g, '.');
          i++;
        } else if (args[i] === '-type' && args[i + 1]) {
          typeFilter = args[i + 1]; // 'f' for file, 'd' for directory
          i++;
        } else if (!args[i].startsWith('-')) {
          searchPath = args[i];
        }
      }
      
      const resolvedPath = resolvePath(searchPath);
      const allFiles = getFileStructure();
      
      // Filter files based on path prefix
      let matches = allFiles.filter(f => {
        if (resolvedPath !== '~' && resolvedPath !== '.') {
          return f.path.startsWith(resolvedPath) || f.path === resolvedPath;
        }
        return true;
      });
      
      // Apply name filter if specified
      if (namePattern) {
        const regex = new RegExp(namePattern, 'i');
        matches = matches.filter(f => regex.test(f.name.replace(/\/$/, '')));
      }
      
      // Apply type filter if specified
      if (typeFilter === 'f') {
        matches = matches.filter(f => !f.isDirectory);
      } else if (typeFilter === 'd') {
        matches = matches.filter(f => f.isDirectory);
      }
      
      if (matches.length === 0) {
        // Real find shows nothing if no matches, just returns
        return;
      } else {
        const output = matches.map(f => f.path.replace('~', '.')).join('\n');
        setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{output}</pre> }]);
      }
      return;
    }

    // history - command history (like real bash)
    if (baseCommand === 'history') {
      if (commandHistory.length === 0) {
        // Real history shows nothing if empty
        return;
      }
      const histOutput = commandHistory.map((cmd, i) => 
        `${(i + 1).toString().padStart(5)}  ${cmd}`
      ).join('\n');
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{histOutput}</pre> }]);
      return;
    }

    // uptime (like real Linux uptime)
    if (baseCommand === 'uptime') {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      const secs = now.getSeconds().toString().padStart(2, '0');
      const uptimeMin = Math.floor(Math.random() * 60) + 5;
      setHistory(prev => [...prev, { type: 'output', content: ` ${hours}:${mins}:${secs} up ${uptimeMin} min,  1 user,  load average: 0.00, 0.01, 0.05` }]);
      return;
    }

    // df - disk free
    if (baseCommand === 'df') {
      const dfOutput = `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1      102400000 8234567  94165433   9% /
tmpfs            4096000       0   4096000   0% /dev/shm
/dev/sda2       51200000 2345678  48854322   5% /home`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{dfOutput}</pre> }]);
      return;
    }

    // free - memory info
    if (baseCommand === 'free') {
      const freeOutput = `              total        used        free      shared  buff/cache   available
Mem:        8192000     2345678     3456789      123456     2389533     5432100
Swap:       2097152           0     2097152`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{freeOutput}</pre> }]);
      return;
    }

    // ps - process list
    if (baseCommand === 'ps') {
      const psOutput = `  PID TTY          TIME CMD
    1 pts/0    00:00:00 init
   42 pts/0    00:00:01 terminal
  101 pts/0    00:00:00 bash
  102 pts/0    00:00:00 ps`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{psOutput}</pre> }]);
      return;
    }

    // top (simplified)
    if (baseCommand === 'top' || baseCommand === 'htop') {
      const topOutput = `top - ${new Date().toLocaleTimeString()} up 42 min, 1 user, load average: 0.00, 0.01, 0.05
Tasks:   4 total,   1 running,   3 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.0 us,  1.0 sy,  0.0 ni, 96.5 id,  0.5 wa,  0.0 hi,  0.0 si
MiB Mem:   8000.0 total,   3456.8 free,   2345.7 used,   2197.5 buff/cache

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   42 guest     20   0  123456  12345   8765 S   1.0   0.2   0:01.23 terminal
    1 root      20   0   65432   4321   3210 S   0.0   0.1   0:00.10 init

(Press q to exit - simulated)`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{topOutput}</pre> }]);
      return;
    }

    // id - user id info
    if (baseCommand === 'id') {
      setHistory(prev => [...prev, { type: 'output', content: 'uid=1000(guest) gid=1000(guest) groups=1000(guest),27(sudo)' }]);
      return;
    }

    // env - environment variables
    if (baseCommand === 'env' || baseCommand === 'printenv') {
      const envOutput = `USER=guest
HOME=/home/guest
SHELL=/bin/bash
TERM=xterm-256color
PATH=/usr/local/bin:/usr/bin:/bin
LANG=en_US.UTF-8
PWD=/home/guest
EDITOR=nvim`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{envOutput}</pre> }]);
      return;
    }

    // which - locate command
    if (baseCommand === 'which') {
      if (args.length === 0) {
        return;
      }
      const cmd = args[0];
      const validCmds = ['ls', 'cat', 'mkdir', 'touch', 'rm', 'mv', 'cp', 'pwd', 'echo', 'grep', 'find', 'nvim', 'vim'];
      if (validCmds.includes(cmd)) {
        setHistory(prev => [...prev, { type: 'output', content: `/usr/bin/${cmd}` }]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `${cmd} not found` }]);
      }
      return;
    }

    // man - manual (show help for command)
    if (baseCommand === 'man') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'What manual page do you want?' }]);
        return;
      }
      const manPages = {
        'ls': 'ls - list directory contents\n\nUsage: ls [directory]\n\nList files in the current or specified directory.',
        'cat': 'cat - concatenate files and print\n\nUsage: cat <file>\n\nDisplay file contents.',
        'mkdir': 'mkdir - make directories\n\nUsage: mkdir [-p] <directory>\n\nCreate directories. Use -p to create parent directories.',
        'touch': 'touch - create empty file\n\nUsage: touch <file>\n\nCreate an empty file.',
        'rm': 'rm - remove files\n\nUsage: rm [-rf] <file>\n\nRemove files. Use -rf for recursive/force.',
        'mv': 'mv - move/rename files\n\nUsage: mv <source> <dest>\n\nMove or rename files.',
        'cp': 'cp - copy files\n\nUsage: cp <source> <dest>\n\nCopy files.',
        'grep': 'grep - search for patterns\n\nUsage: grep <pattern> <file>\n\nSearch for pattern in file.',
        'nvim': 'nvim - text editor\n\nUsage: nvim [file]\n\nOpen file in nvim editor. Creates new if not exists.',
        'echo': 'echo - display text\n\nUsage: echo <text> [> file]\n\nDisplay text. Use > or >> for redirection.',
      };
      
      const page = manPages[args[0]];
      if (page) {
        setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{page}</pre> }]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `No manual entry for ${args[0]}` }]);
      }
      return;
    }

    // exit/logout
    if (baseCommand === 'exit' || baseCommand === 'logout') {
      setHistory(prev => [...prev, { type: 'output', content: 'logout: Cannot exit demo terminal. Type "help" for commands.' }]);
      return;
    }

    // init 0 / shutdown / poweroff - turn off the monitor
    if (command === 'init 0' || baseCommand === 'shutdown' || baseCommand === 'poweroff' || baseCommand === 'halt') {
      setHistory(prev => [...prev, { type: 'output', content: '' }]);
      
      // Show shutdown sequence
      const shutdownMessages = [
        'Broadcast message from root@retro-terminal:',
        '',
        'The system is going down for poweroff NOW!',
        '',
        'Stopping all processes...',
        'Unmounting filesystems...',
        'Syncing disks...',
        '',
        'System halted.',
      ];
      
      // Animate shutdown messages
      let delay = 0;
      for (const msg of shutdownMessages) {
        setTimeout(() => {
          setHistory(prev => [...prev, { type: 'output', content: msg }]);
        }, delay);
        delay += msg ? 400 : 200;
      }
      
      // Call shutdown callback after animation
      setTimeout(() => {
        if (onShutdown) {
          onShutdown();
        }
      }, delay + 800);
      
      return;
    }

    // sudo
    if (baseCommand === 'sudo') {
      if (args.length === 0) {
        setHistory(prev => [...prev, { type: 'output', content: 'usage: sudo <command>' }]);
        return;
      }
      setHistory(prev => [...prev, { type: 'output', content: `[sudo] password for guest: \nSorry, user guest is not allowed to execute '${args.join(' ')}' as root.` }]);
      return;
    }

    // cd - change directory
    if (baseCommand === 'cd') {
      // Handle cd with no args (go to home)
      if (args.length === 0) {
        setCurrentDir('~');
        return;
      }
      
      const targetArg = args[0];
      
      // Handle cd - (go to previous directory) - simplified: just go home
      if (targetArg === '-') {
        setCurrentDir('~');
        return;
      }
      
      const targetDir = resolvePath(targetArg);
      
      // Check if it's a file (not a directory)
      if (fileExists(targetDir)) {
        setHistory(prev => [...prev, { type: 'output', content: `bash: cd: ${targetArg}: Not a directory` }]);
        return;
      }
      
      if (targetDir === '~' || directoryExists(targetDir)) {
        setCurrentDir(targetDir);
        // Silent success (no output like real cd)
      } else {
        setHistory(prev => [...prev, { type: 'output', content: `bash: cd: ${targetArg}: No such file or directory` }]);
      }
      return;
    }

    // neofetch/screenfetch (fun system info)
    if (baseCommand === 'neofetch' || baseCommand === 'screenfetch') {
      const neofetchOutput = `
        .--.         guest@retro-terminal
       |o_o |        ------------------
       |:_/ |        OS: RetroOS 1.0.0
      //   \\ \\       Host: CRT Monitor
     (|     | )      Kernel: 5.15.0-retro
    /'\\_   _/\`\\      Uptime: 42 mins
    \\___)=(___/      Shell: bash 5.1.8
                     Terminal: retro-term
                     CPU: Intel 486 @ 66MHz
                     Memory: 2345 MiB / 8192 MiB
`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output neofetch">{neofetchOutput}</pre> }]);
      return;
    }

    // cowsay (fun)
    if (baseCommand === 'cowsay') {
      const text = args.join(' ') || 'Moo!';
      const line = '_'.repeat(text.length + 2);
      const cowOutput = `
 ${line}
< ${text} >
 ${'-'.repeat(text.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{cowOutput}</pre> }]);
      return;
    }

    // fortune (fun)
    if (baseCommand === 'fortune') {
      const fortunes = [
        'A journey of a thousand miles begins with a single step.',
        'The best time to plant a tree was 20 years ago. The second best time is now.',
        'Code is like humor. When you have to explain it, it\'s bad.',
        'First, solve the problem. Then, write the code.',
        'The only way to do great work is to love what you do.',
        'Debugging is twice as hard as writing the code in the first place.',
      ];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      setHistory(prev => [...prev, { type: 'output', content: fortune }]);
      return;
    }

    // cal - calendar
    if (baseCommand === 'cal') {
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      const calOutput = `     ${month} ${year}
Su Mo Tu We Th Fr Sa
          1  2  3  4
 5  6  7  8  9 10 11
12 13 14 15 16 17 18
19 20 21 22 23 24 25
26 27 28 29 30`;
      setHistory(prev => [...prev, { type: 'output', content: <pre className="cat-output">{calOutput}</pre> }]);
      return;
    }

    // Check if this command needs loading animation
    const loadingConfig = loadingCommands[command];
    
    if (loadingConfig) {
      // Show loading animation
      setIsLoading(true);
      setLoadingText(loadingConfig.text);
      setShowProgressBar(loadingConfig.hasProgressBar);
      setLoadingProgress(0);
      setHackStage('');
      setHackLines([]);
      
      const loadDuration = loadingConfig.duration + Math.random() * 400;
      
      if (loadingConfig.hasProgressBar && loadingConfig.isHack) {
        // Hack-specific loading with stages
        const hackStages = [
          { text: 'Initializing connection', target: 15 },
          { text: 'Scanning ports', target: 30 },
          { text: 'Probing vulnerabilities', target: 50 },
          { text: 'Attempting authentication', target: 70 },
          { text: 'Analyzing response', target: 85 },
          { text: 'Processing results', target: 100 },
        ];
        
        const hackTexts = [
          'SYN packet sent to port 443...',
          'TCP handshake initiated...',
          'SSL/TLS negotiation in progress...',
          'Probing network topology...',
          'Scanning open ports: 22, 80, 443...',
          'Attempting credential injection...',
          'Analyzing firewall rules...',
          'Checking for CVE vulnerabilities...',
          'DNS lookup: portfolio.local',
          'Traceroute: 3 hops detected',
        ];
        
        let currentStageIndex = 0;
        let currentProgress = 0;
        
        // Animate progress with stages
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            const increment = Math.random() * 3 + 0.5;
            const newProgress = Math.min(prev + increment, 100);
            
            // Check for stage transitions
            if (currentStageIndex < hackStages.length && 
                newProgress >= hackStages[currentStageIndex].target) {
              setHackStage(hackStages[currentStageIndex].text);
              currentStageIndex++;
            }
            
            currentProgress = newProgress;
            return newProgress;
          });
          
          // Randomly add hack text lines
          if (Math.random() > 0.7) {
            const randomText = hackTexts[Math.floor(Math.random() * hackTexts.length)];
            setHackLines(prev => [...prev.slice(-3), randomText]);
          }
        }, 80);
        
        // Play beeps during loading
        const beepInterval = setInterval(() => {
          playProgressBeep();
        }, 150);
        
        await new Promise(resolve => setTimeout(resolve, loadDuration));
        
        clearInterval(progressInterval);
        clearInterval(beepInterval);
        setLoadingProgress(100);
        setHackStage('COMPLETE');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (loadingConfig.hasProgressBar) {
        // Animate progress bar
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + Math.random() * 8 + 2;
          });
        }, loadDuration / 20);
        
        // Play beeps during loading
        const beepInterval = setInterval(() => {
          playProgressBeep();
        }, 200);
        
        await new Promise(resolve => setTimeout(resolve, loadDuration));
        
        clearInterval(progressInterval);
        clearInterval(beepInterval);
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        // Play beeps during loading
        const beepInterval = setInterval(() => {
          playProgressBeep();
        }, 250);
        
        await new Promise(resolve => setTimeout(resolve, loadDuration));
        
        clearInterval(beepInterval);
      }
      
      setIsLoading(false);
      setLoadingText('');
      setLoadingDots('');
      setShowProgressBar(false);
      setLoadingProgress(0);
      setHackStage('');
      setHackLines([]);
    }

    // Process command
    if (onCommand) {
      const result = onCommand(command);
      if (result) {
        setHistory(prev => [...prev, { type: 'output', content: result }]);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 
          ? historyIndex + 1 
          : historyIndex;
        setHistoryIndex(newIndex);
        const cmd = commandHistory[commandHistory.length - 1 - newIndex] || '';
        setCurrentInput(cmd);
        setCursorPosition(cmd.length);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const cmd = commandHistory[commandHistory.length - 1 - newIndex] || '';
        setCurrentInput(cmd);
        setCursorPosition(cmd.length);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
        setCursorPosition(0);
      }
    }
  };

  // Handle global keyboard events for menu navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Handle Tab key globally
      if (e.key === 'Tab') {
        e.preventDefault();
        playKeySound();
        if (focusedMenuIndex === -1) {
          // Currently on input, move to first menu item
          setFocusedMenuIndex(0);
          inputRef.current?.blur();
        } else {
          // Move to next menu item or back to input
          const nextIndex = focusedMenuIndex + 1;
          if (nextIndex >= menuItems.length) {
            setFocusedMenuIndex(-1);
            inputRef.current?.focus();
          } else {
            setFocusedMenuIndex(nextIndex);
          }
        }
      } else if (focusedMenuIndex >= 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          playKeySound();
          setFocusedMenuIndex(prev => prev > 0 ? prev - 1 : menuItems.length - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          playKeySound();
          setFocusedMenuIndex(prev => prev < menuItems.length - 1 ? prev + 1 : 0);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          playKeySound();
          setFocusedMenuIndex(-1);
          inputRef.current?.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          playEnterSound();
          handleMenuClick(menuItems[focusedMenuIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedMenuIndex]);

  // Handle menu item click
  const handleMenuClick = (menuItem) => {
    const menuName = menuItem.toLowerCase();
    
    if (menuName === 'file') {
      // Open file explorer
      setShowFileExplorer(true);
      setFocusedMenuIndex(-1);
      return;
    }
    
    // Add menu action to history
    setHistory(prev => [...prev, { type: 'output', content: `[Menu] ${menuItem} clicked - Feature coming soon!` }]);
    // Return focus to input after menu action
    setFocusedMenuIndex(-1);
    inputRef.current?.focus();
  };

  // Handle file selection from explorer
  const handleFileSelect = (command) => {
    // Execute the command
    if (onCommand) {
      // Add command to history display
      setHistory(prev => [...prev, { type: 'input', content: command }]);
      
      const result = onCommand(command);
      if (result) {
        setHistory(prev => [...prev, { type: 'output', content: result }]);
      }
    }
    inputRef.current?.focus();
  };

  // Close file explorer
  const handleCloseFileExplorer = () => {
    setShowFileExplorer(false);
    inputRef.current?.focus();
  };

  // Open nvim editor with file
  const handleOpenEditor = (file, content) => {
    setEditorFile(file);
    setEditorContent(content);
    setShowNvimEditor(true);
  };

  // Handle file save from editor
  const handleSaveFile = (filePath, content) => {
    const result = saveFile(filePath, content);
    if (result.success) {
      setFileSystemVersion(prev => prev + 1);
      if (result.isNew) {
        setHistory(prev => [...prev, { type: 'output', content: `[New File] ${filePath} created and saved` }]);
      }
    }
  };

  // Close nvim editor
  const handleCloseNvimEditor = () => {
    setShowNvimEditor(false);
    setEditorFile(null);
    setEditorContent('');
    inputRef.current?.focus();
  };

  return (
    <div className="terminal" onClick={handleTerminalClick} ref={terminalRef}>
      {/* Terminal Menu Bar */}
      <div className="terminal-menubar">
        {menuItems.map((item, index) => (
          <span
            key={item}
            ref={el => menuRefs.current[index] = el}
            className={`terminal-menu-item ${focusedMenuIndex === index ? 'focused' : ''}`}
            onClick={() => handleMenuClick(item)}
            tabIndex={0}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Terminal Content */}
      <div className="terminal-content" ref={contentRef}>
        {/* Welcome message */}
        {showWelcome && history.length === 0 && (
          <div className="terminal-welcome">
            <pre className="terminal-ascii">
{`
  ██████╗ ███████╗████████╗██████╗  ██████╗ 
  ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗
  ██████╔╝█████╗     ██║   ██████╔╝██║   ██║
  ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║
  ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝
  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ 
       ████████╗███████╗██████╗ ███╗   ███╗
       ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
          ██║   █████╗  ██████╔╝██╔████╔██║
          ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
          ██║   ███████╗██║  ██║██║ ╚═╝ ██║
          ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
`}
            </pre>
            <p className="terminal-subtitle">PORTFOLIO SYSTEM v1.0.0</p>
            <p className="terminal-hint">Type <span className="highlight">'help'</span> for available commands</p>
          </div>
        )}

        {/* History output */}
        {history.map((item, index) => (
          <div key={index} className={`terminal-line ${item.type}`}>
            {item.type === 'input' ? (
              <div className="terminal-input-line">
                <span className="terminal-prompt">guest@portfolio:{item.dir || '~'}$</span>
                <span className="terminal-command">{item.content}</span>
              </div>
            ) : (
              <div className="terminal-output">{item.content}</div>
            )}
          </div>
        ))}

        {/* Loading animation */}
        {isLoading && (
          <div className="terminal-loading">
            {showProgressBar ? (
              <div className="loading-progress-container">
                <div className="hack-header">
                  <span className="hack-icon">⚠</span>
                  <span className="loading-text">{loadingText}<span className="loading-dots">{loadingDots}</span></span>
                </div>
                {hackStage && (
                  <div className="hack-stage">
                    <span className="stage-arrow">▶</span> {hackStage}
                  </div>
                )}
                <div className="loading-progress-bar">
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                    />
                    <div className="progress-glow" style={{ left: `${Math.min(loadingProgress, 100)}%` }} />
                  </div>
                  <span className="progress-percent">{Math.min(Math.floor(loadingProgress), 100)}%</span>
                </div>
                {hackLines.length > 0 && (
                  <div className="hack-output">
                    {hackLines.map((line, i) => (
                      <div key={i} className="hack-line">{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className="loading-spinner"></span>
                <span className="loading-text">{loadingText}<span className="loading-dots">{loadingDots}</span></span>
              </>
            )}
          </div>
        )}

        {/* Current input line */}
        <form onSubmit={handleSubmit} className="terminal-input-form">
          <span className="terminal-prompt">guest@portfolio:{currentDir}$</span>
          <div className="terminal-input-wrapper">
            <span ref={measureRef} className="terminal-input-measure" aria-hidden="true">
              {currentInput.slice(0, cursorPosition)}
            </span>
            <span className="terminal-input-display" aria-hidden="true">
              {currentInput}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => {
                playKeySound();
                setCurrentInput(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
              onClick={(e) => setCursorPosition(e.target.selectionStart)}
              onSelect={(e) => setCursorPosition(e.target.selectionStart)}
              className="terminal-input"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              disabled={isLoading}
            />
            <span 
              className="terminal-block-cursor"
              style={{ left: `${cursorLeft}px` }}
            ></span>
          </div>
        </form>
      </div>

      {/* Status bar */}
      <div className="terminal-statusbar">
        <span>{isLoading ? 'PROCESSING...' : 'READY'}</span>
        <span>UTF-8</span>
        <span>LN 1, COL 1</span>
      </div>

      {/* File Explorer */}
      <FileExplorer 
        isOpen={showFileExplorer}
        onClose={handleCloseFileExplorer}
        onFileSelect={handleFileSelect}
        onOpenEditor={handleOpenEditor}
        key={fileSystemVersion}
        fileSystemVersion={fileSystemVersion}
      />

      {/* Nvim Editor */}
      <NvimEditor
        isOpen={showNvimEditor}
        onClose={handleCloseNvimEditor}
        file={editorFile}
        content={editorContent}
        onSave={handleSaveFile}
      />
    </div>
  );
};

export default Terminal;
