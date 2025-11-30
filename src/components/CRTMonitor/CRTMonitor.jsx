import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import RetroCursor from '../RetroCursor';
import './CRTMonitor.css';

const CRTMonitor = ({ children, onPowerOn, onPowerOff }) => {
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

  return (
    <div className={`crt-monitor ${!isPoweredOn ? 'crt-off' : ''}`}>
      {/* Top vents */}
      <div className="crt-vents crt-vents-top">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="crt-vent" />
        ))}
      </div>

      {/* Monitor brand label */}
      <div className="crt-brand-area">
        <div className="crt-brand-logo">RETRO-TERM</div>
        <div className="crt-brand-model">3000</div>
      </div>
      
      {/* Screen bezel */}
      <div className="crt-bezel">
        {/* Inner bezel shadow */}
        <div className="crt-bezel-inner">
          {/* Main screen */}
          <motion.div 
            className={`crt-screen ${isPoweredOn ? 'crt-boot' : 'crt-screen-off'} ${isPoweringOff ? 'crt-powering-off' : ''}`}
            ref={screenRef}
            initial={{ scaleY: 0.003, scaleX: 0.5 }}
            animate={isPoweredOn 
              ? { scaleY: 1, scaleX: 1, opacity: 1 } 
              : { scaleY: 0.003, scaleX: 0.8, opacity: isPoweringOff ? 1 : 0.3 }
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
            
            {/* Retro cursor - only visible inside screen */}
            {showContent && <RetroCursor containerRef={screenRef} />}
            
            {/* Screen content */}
            <div className={`crt-content ${showContent ? 'visible' : ''}`}>
              {showContent && children}
            </div>
          </motion.div>
          
          {/* Off screen message */}
          {!isPoweredOn && !isBooting && (
            <div className="crt-off-message">
              <span>Press power button to start</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel with centered power button */}
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

      {/* Monitor feet */}
      <div className="crt-feet">
        <div className="crt-foot crt-foot-left" />
        <div className="crt-foot crt-foot-right" />
      </div>
    </div>
  );
};

export default CRTMonitor;
