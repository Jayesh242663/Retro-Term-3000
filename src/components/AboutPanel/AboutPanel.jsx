import RetroDialog from '../RetroDialog';
import './AboutPanel.css';

const AboutPanel = ({ isCollapsed, onToggle }) => {
  return (
    <div className={`about-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle button */}
      <button 
        className="panel-toggle-btn left-toggle"
        onClick={onToggle}
        title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
      >
        <span className="toggle-icon">{isCollapsed ? '»' : '«'}</span>
        {isCollapsed && <span className="toggle-label">ABOUT</span>}
      </button>
      
      <RetroDialog title="ABOUT.TXT" className="about-dialog">
        <div className="about-content">
          <div className="about-ascii-art">
{`  ╔══════════════════════╗
  ║   RETRO-TERM 3000    ║
  ║   Portfolio System   ║
  ╚══════════════════════╝`}
          </div>
          
          <div className="about-section">
            <h3>■ SYSTEM INFO</h3>
            <p>Version: 1.0.0</p>
            <p>Build: 2024.12.04</p>
            <p>Author: Jayesh Channe</p>
          </div>

          <div className="about-section">
            <h3>■ DESCRIPTION</h3>
            <p>
              Welcome to my retro-themed portfolio terminal! 
              This interactive experience simulates a vintage 
              CRT computer terminal from the 1980s.
            </p>
          </div>

          <div className="about-section">
            <h3>■ FEATURES</h3>
            <ul>
              <li>→ Authentic CRT effects</li>
              <li>→ Scanline simulation</li>
              <li>→ Phosphor glow effects</li>
              <li>→ Retro sound design</li>
              <li>→ Multiple color themes</li>
              <li>→ Interactive terminal</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>■ TECHNOLOGIES</h3>
            <ul>
              <li>→ React.js</li>
              <li>→ CSS3 Animations</li>
              <li>→ Framer Motion</li>
              <li>→ Web Audio API</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>■ INSPIRATION</h3>
            <p>
              Inspired by classic terminals like the 
              Apple II, IBM 5150, and Commodore 64.
              Bringing back the golden age of computing!
            </p>
          </div>

          <div className="about-footer">
            <span className="blink">█</span> SYSTEM READY
          </div>
        </div>
      </RetroDialog>
    </div>
  );
};

export default AboutPanel;
