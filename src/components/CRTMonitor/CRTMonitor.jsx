import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import RetroCursor from '../RetroCursor';
import './CRTMonitor.css';

const CRTMonitor = ({ children, onPowerOn, onPowerOff, isScreenOnly = false }) => {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [isPoweringOff, setIsPoweringOff] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const screenRef = useRef(null);

  const handlePowerClick = () => {
    // Prevent clicks during transitions
    if (isPoweringOff) return;
    // Prevent turning off while still booting
    if (isBooting && !isPoweredOn) return;
    
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 200);
    
    if (isPoweredOn) {
      // Power OFF sequence
      setIsPoweringOff(true);
      setIsBooting(false);
      if (onPowerOff) onPowerOff();
      
      // Hide content immediately
      setShowContent(false);
      
      // Animate screen collapse after a brief moment
      setTimeout(() => {
        setIsPoweredOn(false);
      }, 100);
      
      // Reset states after animation completes
      setTimeout(() => {
        setIsPoweringOff(false);
      }, 800);
      
    } else {
      // Power ON sequence
      setIsBooting(true);
      
      // Power on the screen after a brief delay (CRT warm-up)
      setTimeout(() => {
        setIsPoweredOn(true);
      }, 300);

      // Show content after screen animation and mark boot as complete
      setTimeout(() => {
        setShowContent(true);
        setIsBooting(false); // Boot sequence complete
        if (onPowerOn) onPowerOn();
      }, 1200);
    }
  };

  // Use a unified structure - conditionally show/hide elements based on mode
  // This prevents remounting of children when switching modes
  return (
    <div className={`crt-monitor ${!isPoweredOn ? 'crt-off' : ''} ${isScreenOnly ? 'screen-only-mode' : ''}`}>
      {/* Top vents - hidden in screen-only mode */}
      {!isScreenOnly && (
        <div className="crt-vents crt-vents-top">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="crt-vent" />
          ))}
        </div>
      )}

      {/* Monitor brand label - hidden in screen-only mode */}
      {!isScreenOnly && (
        <div className="crt-brand-area">
          <div className="crt-brand-logo">RETRO-TERM</div>
          <div className="crt-brand-model">3000</div>
        </div>
      )}
      
      {/* Screen bezel - simplified in screen-only mode */}
      <div className={`crt-bezel ${isScreenOnly ? 'screen-only-bezel' : ''}`}>
        {/* Inner bezel shadow */}
        <div className={`crt-bezel-inner ${isScreenOnly ? 'screen-only-bezel-inner' : ''}`}>
          {/* Main screen */}
          <motion.div 
            className={`crt-screen ${isPoweredOn ? 'crt-boot' : 'crt-screen-off'} ${isPoweringOff ? 'crt-powering-off' : ''} ${isScreenOnly ? 'screen-only-screen' : ''}`}
            ref={screenRef}
            initial={false}
            animate={isPoweredOn 
              ? { scaleY: 1, scaleX: 1, opacity: 1 } 
              : { scaleY: isScreenOnly ? 1 : 0.003, scaleX: isScreenOnly ? 1 : 0.8, opacity: isPoweringOff ? 1 : (isScreenOnly ? 1 : 0.3) }
            }
            transition={{ 
              duration: isPoweringOff ? 0.3 : 0.6, 
              ease: isPoweringOff ? "easeIn" : "easeOut"
            }}
          >
            {/* Glass reflection */}
            <div className="crt-glass-reflection" />
            
            {/* Noise overlay */}
            <div className="crt-noise" />
            
            {/* Scanlines */}
            <div className="crt-scanlines" />
            
            {/* RGB pixel effect */}
            <div className="crt-rgb-mask" />
            
            {/* Retro cursor - visible inside screen */}
            {showContent && <RetroCursor containerRef={screenRef} />}
            
            {/* Screen content - always render to preserve state */}
            <div className={`crt-content ${showContent ? 'visible' : ''}`}>
              {showContent && children}
            </div>
          </motion.div>
          
          {/* Off screen message */}
          {!isPoweredOn && !isBooting && (
            <div className={`crt-off-message ${isScreenOnly ? 'screen-only-off-message' : ''}`}>
              <span>{isScreenOnly ? 'Click power button to start' : 'Press power button to start'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel with centered power button - hidden in screen-only mode when powered on */}
      {!isScreenOnly && (
        <div className="crt-bottom-panel">
          {/* Power button area - centered */}
          <div className="crt-power-area">
            <button 
              className={`crt-power-button ${isPoweredOn ? 'powered-on' : ''} ${buttonPressed ? 'pressed' : ''}`}
              onClick={handlePowerClick}
              title="Power"
            >
              <div className="crt-power-button-inner">
                <div className="crt-power-symbol">⏻</div>
              </div>
            </button>
          </div>
        </div>
      )}
      
      {/* Floating power button for screen-only mode when not powered on */}
      {isScreenOnly && !isPoweredOn && (
        <div className="screen-only-power-area">
          <button 
            className={`crt-power-button ${isPoweredOn ? 'powered-on' : ''} ${buttonPressed ? 'pressed' : ''}`}
            onClick={handlePowerClick}
            title="Power"
          >
            <div className="crt-power-button-inner">
              <div className="crt-power-symbol">⏻</div>
            </div>
          </button>
          <span className="screen-only-hint">Click to power on</span>
        </div>
      )}

      {/* Monitor feet - hidden in screen-only mode */}
      {!isScreenOnly && (
        <div className="crt-feet">
          <div className="crt-foot crt-foot-left" />
          <div className="crt-foot crt-foot-right" />
        </div>
      )}
    </div>
  );
};

export default CRTMonitor;
