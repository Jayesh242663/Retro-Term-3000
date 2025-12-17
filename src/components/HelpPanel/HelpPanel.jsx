import { useState, useEffect, useRef } from 'react';
import { playKeySound, playEnterSound } from '../../utils/sounds';
import './HelpPanel.css';

const HelpPanel = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('about');
  const [selectedNavIndex, setSelectedNavIndex] = useState(0);
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  const navItems = [
    { id: 'about', label: 'About', icon: '?' },
    { id: 'commands', label: 'Commands', icon: '>' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨' },
    { id: 'themes', label: 'Themes', icon: '◐' },
    { id: 'credits', label: 'Credits', icon: '♥' },
  ];

  const commandCategories = {
    portfolio: {
      title: 'Portfolio Commands',
      icon: '📁',
      commands: [
        { cmd: 'help', desc: 'Open this help panel' },
        { cmd: 'profile / dossier', desc: 'Open surveillance-style profile' },
        { cmd: 'about', desc: 'Display information about me' },
        { cmd: 'resume', desc: 'View my resume/CV' },
        { cmd: 'skills', desc: 'List my technical skills' },
        { cmd: 'projects', desc: 'View my projects' },
        { cmd: 'experience', desc: 'Show work history' },
        { cmd: 'contact', desc: 'Get contact information' },
      ]
    },
    filesystem: {
      title: 'File System',
      icon: '📂',
      commands: [
        { cmd: 'ls / dir', desc: 'List directory contents' },
        { cmd: 'cd <dir>', desc: 'Change directory' },
        { cmd: 'pwd', desc: 'Print working directory' },
        { cmd: 'cat <file>', desc: 'Display file contents' },
        { cmd: 'mkdir <dir>', desc: 'Create a directory' },
        { cmd: 'touch <file>', desc: 'Create an empty file' },
        { cmd: 'rm <file>', desc: 'Remove a file' },
        { cmd: 'mv <src> <dst>', desc: 'Move/rename file' },
        { cmd: 'cp <src> <dst>', desc: 'Copy file' },
        { cmd: 'tree', desc: 'Display directory tree' },
      ]
    },
    editor: {
      title: 'Editor Commands',
      icon: '✎',
      commands: [
        { cmd: 'nvim <file>', desc: 'Open file in Neovim editor' },
        { cmd: 'vim <file>', desc: 'Open file in Vim editor' },
        { cmd: 'nano <file>', desc: 'Open file in Nano editor' },
        { cmd: 'edit <file>', desc: 'Open file in editor' },
      ]
    },
    textProcessing: {
      title: 'Text Processing',
      icon: '📝',
      commands: [
        { cmd: 'head <file>', desc: 'Show first lines of file' },
        { cmd: 'tail <file>', desc: 'Show last lines of file' },
        { cmd: 'wc <file>', desc: 'Word/line/char count' },
        { cmd: 'grep <pattern> <file>', desc: 'Search for pattern in file' },
        { cmd: 'find <name>', desc: 'Find files by name' },
        { cmd: 'echo <text>', desc: 'Print text to terminal' },
      ]
    },
    system: {
      title: 'System Commands',
      icon: '⚙',
      commands: [
        { cmd: 'clear / cls', desc: 'Clear the terminal' },
        { cmd: 'history', desc: 'Show command history' },
        { cmd: 'whoami', desc: 'Display current user' },
        { cmd: 'hostname', desc: 'Show system hostname' },
        { cmd: 'uname', desc: 'System information' },
        { cmd: 'date', desc: 'Show current date/time' },
        { cmd: 'uptime', desc: 'System uptime' },
        { cmd: 'df', desc: 'Disk space usage' },
        { cmd: 'free', desc: 'Memory usage' },
        { cmd: 'ps / top / htop', desc: 'Process information' },
        { cmd: 'neofetch', desc: 'System info display' },
      ]
    },
    networking: {
      title: 'Networking',
      icon: '🌐',
      commands: [
        { cmd: 'ping <host>', desc: 'Send ICMP packets to host' },
        { cmd: 'ifconfig / ip addr', desc: 'Network interface config' },
        { cmd: 'netstat / ss', desc: 'Network connections' },
        { cmd: 'curl <url>', desc: 'Fetch URL content' },
        { cmd: 'wget <url>', desc: 'Download from URL' },
        { cmd: 'traceroute <host>', desc: 'Trace packet route' },
        { cmd: 'nslookup <host>', desc: 'DNS lookup' },
        { cmd: 'dig <host>', desc: 'DNS query tool' },
        { cmd: 'arp', desc: 'ARP cache entries' },
        { cmd: 'route', desc: 'Routing table' },
        { cmd: 'ssh <host>', desc: 'SSH client' },
        { cmd: 'telnet <host>', desc: 'Telnet client' },
      ]
    },
    fun: {
      title: 'Fun Commands',
      icon: '🎮',
      commands: [
        { cmd: 'cowsay <text>', desc: 'Make a cow say something' },
        { cmd: 'fortune', desc: 'Random fortune message' },
        { cmd: 'cal', desc: 'Show calendar' },
        { cmd: 'hack', desc: 'Fake hacking animation' },
      ]
    },
    session: {
      title: 'Session',
      icon: '⏻',
      commands: [
        { cmd: 'theme', desc: 'Change color theme' },
        { cmd: 'sound', desc: 'Toggle sound effects' },
        { cmd: 'exit / logout', desc: 'End session' },
        { cmd: 'shutdown', desc: 'Power off the terminal' },
      ]
    },
  };

  const shortcuts = [
    { keys: 'Tab', desc: 'Auto-complete commands/files, or navigate menu when input is empty' },
    { keys: 'Up/Down', desc: 'Navigate command history' },
    { keys: 'Left/Right', desc: 'Move cursor in input' },
    { keys: 'Ctrl+C', desc: 'Cancel current operation' },
    { keys: 'Ctrl+L', desc: 'Clear terminal screen' },
    { keys: 'Escape', desc: 'Close panels/return to terminal' },
    { keys: 'Enter', desc: 'Execute command or select item' },
    { keys: 'F1', desc: 'Open Help panel' },
    { keys: 'F2', desc: 'Open File Explorer' },
  ];

  const themes = [
    { name: 'Green Phosphor', desc: 'Classic green CRT look', color: '#00ff00' },
    { name: 'Amber', desc: 'Warm amber monochrome', color: '#ffb000' },
    { name: 'Blue Ice', desc: 'Cool blue terminal', color: '#00d4ff' },
    { name: 'Purple Haze', desc: 'Cyberpunk purple', color: '#bf00ff' },
    { name: 'Matrix', desc: 'The Matrix inspired', color: '#00ff41' },
  ];

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          playEnterSound();
          onClose();
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          playKeySound();
          setSelectedNavIndex(prev => Math.max(0, prev - 1));
          setActiveSection(navItems[Math.max(0, selectedNavIndex - 1)].id);
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          playKeySound();
          setSelectedNavIndex(prev => Math.min(navItems.length - 1, prev + 1));
          setActiveSection(navItems[Math.min(navItems.length - 1, selectedNavIndex + 1)].id);
          break;
        case 'Enter':
          e.preventDefault();
          playEnterSound();
          setActiveSection(navItems[selectedNavIndex].id);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedNavIndex, navItems]);

  // Scroll content to top when section changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  const handleNavClick = (id, index) => {
    playEnterSound();
    setActiveSection(id);
    setSelectedNavIndex(index);
  };

  if (!isOpen) return null;

  const renderAbout = () => (
    <div className="help-section">
      <h2 className="section-title">╔══ ABOUT RETRO-TERM 3000 ══╗</h2>
      
      <div className="about-block">
        <pre className="ascii-logo">{`
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
                    ═══ 3000 ═══
        `}</pre>
      </div>

      <div className="about-block">
        <h3>▸ What is Retro-Term 3000?</h3>
        <p>
          Retro-Term 3000 is a nostalgic journey back to the golden age of computing, 
          wrapped in a modern web-based portfolio experience. This interactive terminal 
          emulator brings the charm of vintage CRT monitors and command-line interfaces 
          to showcase developer portfolios in a unique, memorable way.
        </p>
      </div>

      <div className="about-block">
        <h3>▸ Features</h3>
        <ul>
          <li>◆ Authentic CRT monitor effects with scanlines and screen curvature</li>
          <li>◆ Realistic boot sequence inspired by classic BIOS/POST screens</li>
          <li>◆ Full-featured terminal with 50+ commands</li>
          <li>◆ Built-in Neovim-style text editor</li>
          <li>◆ Virtual file system with persistent storage</li>
          <li>◆ Tab auto-completion for commands and file paths</li>
          <li>◆ Multiple retro color themes</li>
          <li>◆ Authentic retro sound effects</li>
          <li>◆ Networking commands simulation</li>
        </ul>
      </div>

      <div className="about-block">
        <h3>▸ Technology Stack</h3>
        <ul>
          <li>◆ React 18 with Hooks</li>
          <li>◆ Vite for blazing fast builds</li>
          <li>◆ Pure CSS for retro effects</li>
          <li>◆ Web Audio API for sound</li>
          <li>◆ LocalStorage for persistence</li>
        </ul>
      </div>

      <div className="about-block">
        <h3>▸ Getting Started</h3>
        <p>
          Type <span className="cmd-highlight">help</span> in the terminal to see available commands, 
          or use <span className="cmd-highlight">Tab</span> to auto-complete. Navigate through your 
          files with <span className="cmd-highlight">ls</span> and <span className="cmd-highlight">cd</span>, 
          and edit them with <span className="cmd-highlight">nvim</span>.
        </p>
      </div>

      <div className="about-block version-info">
        <p>Version: 3.0.0 | Build: 2024.12.04</p>
        <p>Made with ♥ and lots of phosphor glow</p>
      </div>
    </div>
  );

  const renderCommands = () => (
    <div className="help-section">
      <h2 className="section-title">COMMAND REFERENCE</h2>
      <p className="section-desc">All available commands organized by category</p>
      
      {Object.entries(commandCategories).map(([key, category]) => (
        <div key={key} className="command-category">
          <h3 className="category-title">
            <span className="category-icon">{category.icon}</span>
            {category.title}
          </h3>
          <div className="command-list">
            {category.commands.map((cmd, index) => (
              <div key={index} className="command-item">
                <span className="command-name">{cmd.cmd}</span>
                <span className="command-desc">{cmd.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderShortcuts = () => (
    <div className="help-section">
      <h2 className="section-title">╔══ KEYBOARD SHORTCUTS ══╗</h2>
      <p className="section-desc">Master these keys to navigate like a pro</p>
      
      <div className="shortcuts-container">
        <div className="shortcut-group">
          <h3>Terminal Navigation</h3>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <kbd className="shortcut-key">{shortcut.keys}</kbd>
              <span className="shortcut-desc">{shortcut.desc}</span>
            </div>
          ))}
        </div>

        <div className="shortcut-group">
          <h3>Editor Mode (Nvim)</h3>
          <div className="shortcut-item">
            <kbd className="shortcut-key">i</kbd>
            <span className="shortcut-desc">Enter insert mode</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">Escape</kbd>
            <span className="shortcut-desc">Exit insert mode</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">:w</kbd>
            <span className="shortcut-desc">Save file</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">:q</kbd>
            <span className="shortcut-desc">Quit editor</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">:wq</kbd>
            <span className="shortcut-desc">Save and quit</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">h/j/k/l</kbd>
            <span className="shortcut-desc">Navigate (vim style)</span>
          </div>
        </div>

        <div className="shortcut-group">
          <h3>File Explorer</h3>
          <div className="shortcut-item">
            <kbd className="shortcut-key">j/k or ↑/↓</kbd>
            <span className="shortcut-desc">Navigate files</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">Enter</kbd>
            <span className="shortcut-desc">Open file/folder</span>
          </div>
          <div className="shortcut-item">
            <kbd className="shortcut-key">Escape</kbd>
            <span className="shortcut-desc">Close explorer</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThemes = () => (
    <div className="help-section">
      <h2 className="section-title">COLOR THEMES</h2>
      <p className="section-desc">Customize your terminal's appearance</p>
      
      <div className="themes-grid">
        {themes.map((theme, index) => (
          <div key={index} className="theme-card" style={{ '--theme-color': theme.color }}>
            <div className="theme-preview">
              <div className="theme-preview-line">guest@retro:~$</div>
              <div className="theme-preview-line">neofetch</div>
            </div>
            <div className="theme-info">
              <h4>{theme.name}</h4>
              <p>{theme.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="theme-tip">
        <p>💡 Tip: Type <span className="cmd-highlight">theme</span> in the terminal to cycle through themes, 
        or use the theme button in the top-right corner of the CRT monitor.</p>
      </div>
    </div>
  );

  const renderCredits = () => (
    <div className="help-section">
      <h2 className="section-title">CREDITS & ACKNOWLEDGMENTS </h2>
      
      <div className="credits-block">
        <h3>▸ Created By</h3>
        <p className="creator-name">Jayesh Channe</p>
        <p>Full-Stack Developer & Retro Computing Enthusiast</p>
      </div>

      <div className="credits-block">
        <h3>▸ Inspiration</h3>
        <ul>
          <li>◆ Classic IBM PC and Apple II terminals</li>
          <li>◆ The golden age of BBS systems</li>
          <li>◆ VT100 and VT220 terminal emulators</li>
          <li>◆ Fallout series Pip-Boy interface</li>
          <li>◆ The Matrix and Tron aesthetics</li>
        </ul>
      </div>

      <div className="credits-block">
        <h3>▸ Special Thanks</h3>
        <ul>
          <li>◆ The open-source community</li>
          <li>◆ Retro computing preservation projects</li>
          <li>◆ Everyone who appreciates the beauty of CRT monitors</li>
        </ul>
      </div>

      <div className="credits-block">
        <h3>▸ Open Source</h3>
        <p>
          This project is open source and available on GitHub. 
          Contributions, bug reports, and feature requests are welcome!
        </p>
        <a 
          className="github-link" 
          href="https://github.com/Jayesh242663/Retro-Term-3000" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <span className="link-icon">◈</span>
          <span className="github-url">https://github.com/Jayesh242663/Retro-Term-3000</span>
        </a>
      </div>

      <div className="credits-block license">
        <h3>▸ License</h3>
        <p>MIT License - Feel free to use, modify, and distribute.</p>
      </div>

      <div className="ascii-footer">
        <pre>{`
    
      Thank you for using Retro-Term 3000!     
      May your code compile on the first try.  
        `}</pre>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return renderAbout();
      case 'commands':
        return renderCommands();
      case 'shortcuts':
        return renderShortcuts();
      case 'themes':
        return renderThemes();
      case 'credits':
        return renderCredits();
      default:
        return renderAbout();
    }
  };

  return (
    <div className="help-panel-overlay" ref={panelRef}>
      <div className="help-panel">
        <div className="help-header">
          <div className="help-title">
            <span className="title-icon">?</span>
            <span>HELP & DOCUMENTATION</span>
          </div>
          <button className="help-close" onClick={onClose}>
            <span>[ESC]</span> Close
          </button>
        </div>
        
        <div className="help-body">
          <nav className="help-nav">
            <div className="nav-header">Navigation</div>
            {navItems.map((item, index) => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''} ${selectedNavIndex === index ? 'focused' : ''}`}
                onClick={() => handleNavClick(item.id, index)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {activeSection === item.id && <span className="nav-indicator">◄</span>}
              </button>
            ))}
            <div className="nav-footer">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
            </div>
          </nav>
          
          <div className="help-content" ref={contentRef}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;
