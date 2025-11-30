import { useState, useEffect, useRef } from 'react';
import './RetroCursor.css';

const RetroCursor = ({ containerRef }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isInsideScreen, setIsInsideScreen] = useState(false);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Check if cursor is inside the CRT screen container
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isInside = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        setIsInsideScreen(isInside);
        
        if (isInside) {
          // Calculate position relative to container
          setPosition({ 
            x: e.clientX - rect.left, 
            y: e.clientY - rect.top 
          });
          setIsVisible(true);
          
          // Add to trail
          setTrail(prev => {
            const newTrail = [...prev, { 
              x: e.clientX - rect.left, 
              y: e.clientY - rect.top, 
              id: Date.now() 
            }];
            return newTrail.slice(-5);
          });
        } else {
          setIsVisible(false);
          setTrail([]);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsInsideScreen(false);
      setTrail([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  // Clean up old trail points
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.filter(point => Date.now() - point.id < 100));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !isInsideScreen) return null;

  return (
    <div className="retro-cursor-container">
      {/* Trail effect */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="retro-cursor-trail"
          style={{
            left: point.x,
            top: point.y,
            opacity: (index + 1) / trail.length * 0.3,
          }}
        />
      ))}
      
      {/* Main cursor */}
      <div
        className={`retro-cursor ${isClicking ? 'clicking' : ''}`}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Pixelated arrow cursor */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 16 16"
          className="retro-cursor-svg"
        >
          {/* Main arrow shape - pixelated style */}
          <path
            d="M0,0 L0,14 L3,11 L5,16 L8,15 L6,10 L10,10 L0,0"
            className="cursor-fill"
          />
          {/* Outline */}
          <path
            d="M0,0 L0,14 L3,11 L5,16 L8,15 L6,10 L10,10 L0,0"
            className="cursor-outline"
            fill="none"
            strokeWidth="1"
          />
        </svg>
        
        {/* Glow effect */}
        <div className="retro-cursor-glow" />
      </div>
    </div>
  );
};

export default RetroCursor;
