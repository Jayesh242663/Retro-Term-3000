import RetroDialog from '../RetroDialog';
import './CheatSheet.css';

const CheatSheet = ({ isCollapsed, onToggle }) => {
  return (
    <div className={`cheatsheet-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle button */}
      <button 
        className="panel-toggle-btn right-toggle"
        onClick={onToggle}
        title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
      >
        <span className="toggle-icon">{isCollapsed ? '«' : '»'}</span>
        {isCollapsed && <span className="toggle-label">COMMANDS</span>}
      </button>
      
      <RetroDialog title="COMMANDS.HLP" className="cheatsheet-wrapper">
        <div className="cheatsheet-content">
          <div className="cheatsheet-inner">
            {/* Basic Commands */}
            <div className="cmd-group">
              <div className="cmd-group-title">BASIC COMMANDS</div>
              <div className="cmd-list">
                <div className="cmd-item">
                  <span className="cmd">help</span>
                  <span className="desc">Show all commands</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">clear</span>
                  <span className="desc">Clear terminal</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">date</span>
                  <span className="desc">Show current date</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">banner</span>
                  <span className="desc">Show ASCII banner</span>
                </div>
              </div>
            </div>

            {/* Portfolio Commands */}
            <div className="cmd-group">
              <div className="cmd-group-title">PORTFOLIO</div>
              <div className="cmd-list">
                <div className="cmd-item">
                  <span className="cmd">about</span>
                  <span className="desc">About me info</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">skills</span>
                  <span className="desc">Technical skills</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">projects</span>
                  <span className="desc">My projects</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">experience</span>
                  <span className="desc">Work history</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">contact</span>
                  <span className="desc">Contact info</span>
                </div>
              </div>
            </div>

            {/* System Commands */}
            <div className="cmd-group">
              <div className="cmd-group-title">SYSTEM</div>
              <div className="cmd-list">
                <div className="cmd-item">
                  <span className="cmd">theme</span>
                  <span className="desc">Toggle color theme</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">sound</span>
                  <span className="desc">Toggle audio</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">whoami</span>
                  <span className="desc">Current user</span>
                </div>
              </div>
            </div>

            {/* Fun Commands */}
            <div className="cmd-group">
              <div className="cmd-group-title">EASTER EGGS</div>
              <div className="cmd-list">
                <div className="cmd-item">
                  <span className="cmd">hello</span>
                  <span className="desc">Say hi!</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">coffee</span>
                  <span className="desc">Get coffee ☕</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">matrix</span>
                  <span className="desc">Hack mode</span>
                </div>
                <div className="cmd-item">
                  <span className="cmd">sudo</span>
                  <span className="desc">Try it... 😉</span>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="cmd-group">
              <div className="cmd-group-title">PRO TIPS</div>
              <ul className="tips-list">
                <li>→ Press power button to boot</li>
                <li>→ Type project name for details</li>
                <li>→ Use ↑↓ for command history</li>
                <li>→ Tab for autocomplete</li>
              </ul>
            </div>

            <div className="cheatsheet-footer">
              <span>Type 'help' for full list</span>
            </div>
          </div>
        </div>
      </RetroDialog>
    </div>
  );
};

export default CheatSheet;
