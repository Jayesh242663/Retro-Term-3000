import './MobileWarning.css';

const MobileWarning = () => {
  return (
    <div className="mobile-warning">
      <div className="mobile-warning-box">
        <div className="warning-header">
          <span className="header-icon">!</span>
          <span className="header-text">DISPLAY ERROR</span>
          <span className="header-icon">!</span>
        </div>
        
        <div className="warning-content">
          <div className="warning-icon-box">
            <span className="warning-x">X</span>
          </div>
          
          <div className="warning-text">
            <p>This terminal requires a</p>
            <p><span className="highlight">DESKTOP</span> or <span className="highlight">LAPTOP</span></p>
            <p>display to function.</p>
          </div>
          
          <div className="warning-divider">- - - - - - - - - - - -</div>
          
          <div className="warning-details">
            <div className="detail-row">
              <span className="detail-label">STATUS:</span>
              <span className="detail-value error">FAILED</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">SCREEN:</span>
              <span className="detail-value">TOO SMALL</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">REQUIRED:</span>
              <span className="detail-value">1200px+</span>
            </div>
          </div>
        </div>
        
        <div className="warning-footer">
          <span className="blink">{'>'}</span> Please switch to desktop
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;
