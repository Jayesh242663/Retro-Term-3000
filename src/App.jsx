import { useState, useCallback, useEffect } from 'react';
import CRTMonitor from './components/CRTMonitor';
import Terminal from './components/Terminal';
import { useTheme } from './components/ThemeSwitcher';
import { playThemeSwitchSound, playErrorSound, startAmbientNoise, stopAmbientNoise, initAudio, playCRTOnSound, playCRTOffSound, toggleAllSounds } from './utils/sounds';
import BootScreen from './components/BootScreen';
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
  const [powerCycleKey, setPowerCycleKey] = useState(0);
  const { toggleTheme } = useTheme();
  
  const isScreenOnly = true;

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

  const handleCommandShutdown = () => {
    handlePowerOff();
    setPowerCycleKey(prev => prev + 1);
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

  const layoutClass = 'screen-only-mode';

  return (
    <div className={`app ${layoutClass}`}>
      {/* Mobile Warning - shows error on small screens */}
      <MobileWarning />
      
      {/* Background grid effect */}
      <div className="background-grid" />
      
      {/* Main CRT Monitor - always visible */}
      <CRTMonitor key={powerCycleKey} onPowerOn={handlePowerOn} onPowerOff={handlePowerOff} isScreenOnly={isScreenOnly}>
        {/* Boot Screen - shows inside monitor after power on */}
        {showBootScreen && (
          <BootScreen onComplete={handleBootComplete} duration={4000} />
        )}
        
        {/* Terminal - shows after boot completes */}
        {showTerminal && (
          <Terminal 
            onCommand={handleCommand}
            onShutdown={handleCommandShutdown}
            welcomeMessage={true}
          />
        )}
      </CRTMonitor>

      {/* Attribution */}
      
    </div>
  );
}

export default App;
