import { useState, useCallback, useEffect } from 'react';
import CRTMonitor from './components/CRTMonitor';
import Terminal from './components/Terminal';
import { useTheme } from './components/ThemeSwitcher';
import { playThemeSwitchSound, playErrorSound, toggleAmbientNoise, isAmbientNoisePlaying, startAmbientNoise, stopAmbientNoise, initAudio, playCRTOnSound, playCRTOffSound, playClickSound, toggleAllSounds } from './utils/sounds';
import BootScreen from './components/BootScreen';
import AboutPanel from './components/AboutPanel';
import CheatSheet from './components/CheatSheet';
import MobileWarning from './components/MobileWarning';
import { 
  portfolioData, 
  commandOutputs,
  generateAbout,
  generateSkills,
  generateProjects,
  generateContact,
  generateExperience
} from './data/portfolio';
import './styles/crt-effects.css';
import './styles/themes.css';
import './App.css';

function App() {
  const [showBootScreen, setShowBootScreen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  // Panel collapse and fullscreen states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenOnly, setIsScreenOnly] = useState(false);

  // Toggle panel handlers
  const toggleLeftPanel = () => {
    playClickSound();
    setLeftPanelCollapsed(prev => !prev);
  };

  const toggleRightPanel = () => {
    playClickSound();
    setRightPanelCollapsed(prev => !prev);
  };

  const toggleFullscreen = () => {
    playClickSound();
    setIsFullscreen(prev => !prev);
    if (isScreenOnly) setIsScreenOnly(false);
  };

  const toggleScreenOnly = () => {
    playClickSound();
    setIsScreenOnly(prev => !prev);
    if (isFullscreen) setIsFullscreen(false);
  };

  // Exit fullscreen with Escape key (screen-only mode requires button click to exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        // Note: ESC does not exit screen-only mode - use the toggle button instead
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle power button press - start boot sequence
  const handlePowerOn = () => {
    // Initialize audio on power button click
    if (!audioStarted) {
      initAudio();
      setAudioStarted(true);
    }
    
    // Play CRT power on sound
    playCRTOnSound();
    
    // Show boot screen after a small delay
    setTimeout(() => {
      setShowBootScreen(true);
      startAmbientNoise();
    }, 600);
  };

  // Handle power button press - turn off
  const handlePowerOff = () => {
    // Play power off sound
    playCRTOffSound();
    
    // Stop ambient noise
    stopAmbientNoise();
    
    // Reset states
    setShowBootScreen(false);
    setShowTerminal(false);
  };

  // Handle boot screen completion
  const handleBootComplete = () => {
    setShowBootScreen(false);
    setShowTerminal(true);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('crt-theme') || 'amber';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Command handler for terminal
  const handleCommand = useCallback((command) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case 'help':
        return commandOutputs.help;
      
      case 'about':
      case 'about me':
        return generateAbout(portfolioData);
      
      case 'skills':
      case 'skill':
        return generateSkills(portfolioData);
      
      case 'projects':
      case 'project':
      case 'work':
        return generateProjects(portfolioData);
      
      case 'contact':
      case 'email':
        return generateContact(portfolioData);
      
      case 'experience':
      case 'exp':
      case 'history':
        return generateExperience(portfolioData);
      
      case 'whoami':
        return commandOutputs.whoami;
      
      case 'theme':
      case 'toggle':
        playThemeSwitchSound();
        const newTheme = toggleTheme();
        return `Theme switched to: ${newTheme.toUpperCase()}`;
      
      case 'sound':
      case 'audio':
      case 'noise':
      case 'mute':
        const soundsOn = toggleAllSounds();
        return `All sounds: ${soundsOn ? 'ON' : 'OFF'}`;
      
      case 'clear':
      case 'cls':
        // Handled by Terminal component directly
        return null;
      
      case 'date':
        return new Date().toLocaleString();
      
      case 'banner':
        return `
  ██████╗ ███████╗████████╗██████╗  ██████╗ 
  ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗
  ██████╔╝█████╗     ██║   ██████╔╝██║   ██║
  ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║
  ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝
  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ 
`;
      
      case 'sudo':
      case 'sudo rm -rf':
        return 'Nice try! 😄';
      
      case 'hack':
      case 'matrix':
        return `
SYSTEM SECURITY ALERT
Timestamp: ${new Date().toISOString()}

[!] Unauthorized access attempt detected

CONNECTION DETAILS
  Source IP    : 127.0.0.1
  Protocol     : TCP/443
  Status       : BLOCKED
  Threat Level : LOW

SECURITY STATUS
  Firewall         : ACTIVE
  IDS/IPS          : MONITORING
  Auth Required    : YES
  Session          : TERMINATED

Result: ACCESS DENIED

Note: This is a portfolio website.
      No actual security systems were harmed.

Type 'help' for available commands.
`;

      case 'coffee':
        return `
  Here's your coffee! ☕
  
      ( (
       ) )
    .______.
    |      |]
    \\      /
     '----'
  
  Now get back to coding!
`;
      
      case 'hello':
      case 'hi':
        return `Hello there! Welcome to my portfolio terminal. 
Type 'help' to see what you can explore!`;
      
      case '':
        return null;
      
      default:
        // Check if it's a project name
        const project = portfolioData.projects.find(
          p => p.name.toLowerCase() === cmd
        );
        if (project) {
          const techList = project.tech.map(t => `  > ${t}`).join('\n');
          return `╔════════════════════════════════════════════════╗
║  PROJECT: ${project.name.toUpperCase().padEnd(35)}║
╚════════════════════════════════════════════════╝

Description:
  ${project.description}

Technologies:
${techList}

Repository:
  ${project.link}`;
        }
        
        playErrorSound();
        return commandOutputs.notFound(cmd);
    }
  }, [toggleTheme]);

  // Determine layout class based on panel states
  const layoutClass = isScreenOnly
    ? 'screen-only-mode'
    : isFullscreen 
      ? 'fullscreen-mode' 
      : (leftPanelCollapsed && rightPanelCollapsed) 
        ? 'both-collapsed' 
        : leftPanelCollapsed 
          ? 'left-collapsed' 
          : rightPanelCollapsed 
            ? 'right-collapsed' 
            : '';

  return (
    <div className={`app ${layoutClass}`}>
      {/* Mobile Warning - shows error on small screens */}
      <MobileWarning />
      
      {/* Background grid effect */}
      <div className="background-grid" />
      
      {/* Left side - About Panel */}
      {!isFullscreen && !isScreenOnly && (
        <AboutPanel 
          isCollapsed={leftPanelCollapsed} 
          onToggle={toggleLeftPanel} 
        />
      )}
      
      {/* View toggle buttons */}
      <div className="view-toggle-buttons">
        <button 
          className={`view-toggle-btn ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Monitor'}
        >
          {isFullscreen ? '⊡' : '⛶'}
        </button>
        <button 
          className={`view-toggle-btn ${isScreenOnly ? 'active' : ''}`}
          onClick={toggleScreenOnly}
          title={isScreenOnly ? 'Exit Screen Mode' : 'Screen Only Mode'}
        >
          {isScreenOnly ? '⊟' : '▣'}
        </button>
      </div>
      
      {/* Main CRT Monitor - always visible */}
      <CRTMonitor onPowerOn={handlePowerOn} onPowerOff={handlePowerOff} isScreenOnly={isScreenOnly}>
        {/* Boot Screen - shows inside monitor after power on */}
        {showBootScreen && (
          <BootScreen onComplete={handleBootComplete} duration={4000} />
        )}
        
        {/* Terminal - shows after boot completes */}
        {showTerminal && (
          <Terminal 
            onCommand={handleCommand}
            onShutdown={handlePowerOff}
            welcomeMessage={true}
          />
        )}
      </CRTMonitor>

      {/* Right side - Cheat Sheet */}
      {!isFullscreen && !isScreenOnly && (
        <CheatSheet 
          isCollapsed={rightPanelCollapsed} 
          onToggle={toggleRightPanel} 
        />
      )}

      {/* Attribution */}
      
    </div>
  );
}

export default App;
