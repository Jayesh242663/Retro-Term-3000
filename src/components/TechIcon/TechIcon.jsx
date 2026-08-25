import React from 'react';
import './TechIcon.css';

/**
 * TechIcon renders custom SVG icons with their authentic brand colors
 * and CRT phosphor glow effects for the profile section.
 */
const TechIcon = ({ name, size = '18px', className = '', title }) => {
  const normalized = (name || '').trim().toLowerCase();
  const displayTitle = title || name;

  const renderIconContent = () => {
    switch (normalized) {
      case 'python':
        return (
          <>
            <path
              d="M11.5 2C8.5 2 7 3.5 7 6V8H11.5V8.5H6C3.5 8.5 2 10 2 13C2 16 3.5 17.5 6 17.5H8V15C8 12.5 9.5 11 12 11H16C18 11 19 10 19 8V6C19 3.5 17.5 2 14.5 2H11.5Z"
              fill="#3776AB"
            />
            <path
              d="M12.5 22C15.5 22 17 20.5 17 18V16H12.5V15.5H18C20.5 15.5 22 14 22 11C22 8 20.5 6.5 18 6.5H16V9C16 11.5 14.5 13 12 13H8C6 13 5 14 5 16V18C5 20.5 6.5 22 9.5 22H12.5Z"
              fill="#FFD438"
            />
            <circle cx="9.5" cy="5.5" r="1.1" fill="#0D1117" />
            <circle cx="14.5" cy="18.5" r="1.1" fill="#0D1117" />
          </>
        );

      case 'javascript':
      case 'js':
        return (
          <>
            {/* JavaScript Yellow Badge */}
            <rect x="2" y="2" width="20" height="20" rx="3" fill="#F7DF1E" />
            {/* JS Bold Black Letters */}
            <path
              d="M9 9.5V16C9 17.5 7.8 18 6.5 18C5.5 18 4.7 17.4 4.4 16.7L5.9 15.6C6.1 16 6.4 16.3 6.9 16.3C7.4 16.3 7.6 16 7.6 15.3V9.5H9Z"
              fill="#000000"
            />
            <path
              d="M12.2 16.2C12.8 16.8 13.7 17.2 14.8 17.2C16.1 17.2 17.1 16.4 17.1 15.2C17.1 14.1 16.4 13.6 15 13C13.5 12.4 12.3 11.8 12.3 10.3C12.3 8.8 13.5 7.7 15.1 7.7C16.2 7.7 17 8.1 17.6 8.9L16.2 10.1C15.8 9.6 15.3 9.3 14.8 9.3C14.2 9.3 13.7 9.7 13.7 10.3C13.7 11 14.3 11.4 15.6 12C17.2 12.6 18.5 13.3 18.5 15.1C18.5 17 17 18.3 14.8 18.3C13.2 18.3 11.8 17.5 11.1 16.3L12.2 16.2Z"
              fill="#000000"
            />
          </>
        );

      case 'c':
        return (
          <>
            {/* C Official Blue Hexagon */}
            <polygon points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2" fill="#00599C" />
            <polygon points="12,3.5 19.5,7.8 19.5,16.2 12,20.5 4.5,16.2 4.5,7.8" fill="#00447C" />
            {/* C Crisp White Glyph */}
            <path
              d="M15 8.5C14.2 7.6 13.1 7 11.8 7C9.1 7 7 9.2 7 12C7 14.8 9.1 17 11.8 17C13.1 17 14.2 16.4 15 15.5L16.5 16.8C15.3 18.2 13.6 19 11.8 19C7.9 19 5 15.9 5 12C5 8.1 7.9 5 11.8 5C13.6 5 15.3 5.8 16.5 7.2L15 8.5Z"
              fill="#FFFFFF"
            />
          </>
        );

      case 'java':
        return (
          <>
            {/* Java Orange/Red Steam */}
            <path d="M7 6C8 4.5 10 4 10 2.5C10 2.5 11 4 10 5.5C9 7 7 6 7 6Z" fill="#E76F00" />
            <path d="M12 5C13 3.5 15 3 15 1.5C15 1.5 16 3 15 4.5C14 6 12 5 12 5Z" fill="#F89820" />
            <path d="M16 6.5C17 5.5 18 5 18 4C18 4 19 5 18 6C17 7 16 6.5 16 6.5Z" fill="#E76F00" />
            {/* Java Blue Cup */}
            <path d="M4 11H17C17 15.5 14 18 10.5 18C7 18 4 15.5 4 11Z" fill="#5382A1" />
            <path d="M16.5 12C18.5 12 20 13 20 14.5C20 16 18.5 17 16 17" stroke="#5382A1" strokeWidth="2" fill="none" />
            <path d="M3 20C7 22 14 22 18 20" stroke="#E76F00" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      case 'react':
        return (
          <>
            {/* Official React Cyan */}
            <circle cx="12" cy="12" r="2.5" fill="#61DAFB" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)" fill="none" stroke="#61DAFB" strokeWidth="1.6" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" fill="none" stroke="#61DAFB" strokeWidth="1.6" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" fill="none" stroke="#61DAFB" strokeWidth="1.6" />
          </>
        );

      case 'html':
      case 'html5':
        return (
          <>
            {/* HTML5 Orange Shield */}
            <path d="M4 3L5.6 19L12 21L18.4 19L20 3H4Z" fill="#E44D26" />
            <path d="M12 4.5V19.5L17 17.8L18.4 4.5H12Z" fill="#F16529" />
            {/* Markup < / > symbol */}
            <path d="M8.5 8.5L6 12L8.5 15.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M15.5 8.5L18 12L15.5 15.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="13" y1="7.5" x2="11" y2="16.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );

      case 'css':
      case 'css3':
        return (
          <>
            {/* CSS3 Blue Shield */}
            <path d="M4 3L5.6 19L12 21L18.4 19L20 3H4Z" fill="#1572B6" />
            <path d="M12 4.5V19.5L17 17.8L18.4 4.5H12Z" fill="#33A9DC" />
            {/* Code Curly Brackets { } */}
            <path d="M9.5 8C8.5 8 8 8.8 8 9.8V10.8C8 11.6 7.2 12 6.5 12C7.2 12 8 12.4 8 13.2V14.2C8 15.2 8.5 16 9.5 16" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M14.5 8C15.5 8 16 8.8 16 9.8V10.8C16 11.6 16.8 12 17.5 12C16.8 12 16 12.4 16 13.2V14.2C16 15.2 15.5 16 14.5 16" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        );

      case 'node.js':
      case 'nodejs':
      case 'node':
        return (
          <>
            {/* Node Green Hexagon */}
            <polygon points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2" fill="#5FA04E" />
            <polygon points="12,3.5 19.5,7.8 19.5,16.2 12,20.5 4.5,16.2 4.5,7.8" fill="#4B883E" />
            {/* Inner White Node N */}
            <path
              d="M8 16V8.5L16 15.5V8"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="8" cy="8.5" r="1.5" fill="#333333" />
            <circle cx="16" cy="15.5" r="1.5" fill="#333333" />
          </>
        );

      case 'express.js':
      case 'express':
      case 'expressjs':
        return (
          <>
            {/* Express Black Badge */}
            <rect x="2" y="4" width="20" height="16" rx="3" fill="#222222" stroke="#444444" strokeWidth="1" />
            {/* Official Express Clean White Letters */}
            <path d="M6 9H11V10.8H8.5V12.2H10.5V13.8H8.5V15.2H11V17H6V9Z" fill="#FFFFFF" />
            <path d="M12.5 9L15 13L12.5 17H14.5L16 14.5L17.5 17H19.5L17 13L19.5 9H17.5L16 11.5L14.5 9H12.5Z" fill="#FFFFFF" />
          </>
        );

      case 'mysql':
        return (
          <>
            {/* MySQL Blue Dolphin & Orange Accent */}
            <path
              d="M12 2C8 2 4 4.5 3 8C4.5 7.5 7 7.5 9 8.5C6 10 4 13 4 16C5.5 15 8 15 10 16C7.5 18 6 21 6 22C10 21 13 18.5 15 15C17 15.5 19 15 21 13.5C21 11 19 9 17 8.5C17 5 15 2 12 2Z"
              fill="#00758F"
            />
            <circle cx="9" cy="5.5" r="1.2" fill="#F29111" />
            <path d="M15 15C17 15.5 19 15 21 13.5" stroke="#F29111" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      case 'mongodb':
      case 'mongo':
        return (
          <>
            {/* Mongo Green Leaf */}
            <path
              d="M12 2C12 2 6 8.5 6 14C6 17.5 8.5 20.5 11.5 21.5V17L12 16.5L12.5 17V21.5C15.5 20.5 18 17.5 18 14C18 8.5 12 2 12 2Z"
              fill="#47A248"
            />
            <path
              d="M12 2C12 2 12 8.5 12 16.5L12.5 17V21.5C15.5 20.5 18 17.5 18 14C18 8.5 12 2 12 2Z"
              fill="#3FA037"
            />
            <line x1="12" y1="3" x2="12" y2="21" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
          </>
        );

      case 'postgresql':
      case 'postgres':
        return (
          <>
            {/* Postgres Official Blue Elephant */}
            <path
              d="M12 3C8 3 4 5.5 4 10C4 13.5 5.5 16 8 17.5V21H11V18H13V21H16V17.5C18.5 16 20 13.5 20 10C20 5.5 16 3 12 3Z"
              fill="#336791"
            />
            <path d="M12 7V13C12 14.5 13 15.5 14.5 15.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <circle cx="8.5" cy="8.5" r="1.2" fill="#FFFFFF" />
            <circle cx="15.5" cy="8.5" r="1.2" fill="#FFFFFF" />
          </>
        );

      case 'git':
        return (
          <>
            {/* Git Orange-Red Diamond */}
            <rect x="3.5" y="3.5" width="17" height="17" rx="3" transform="rotate(45 12 12)" fill="#F05032" />
            {/* Git White Branch Graph */}
            <line x1="8" y1="12" x2="16" y2="12" stroke="#FFFFFF" strokeWidth="1.8" />
            <path d="M11 12C11 14 13 15.5 15 15.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
            <circle cx="8" cy="12" r="2" fill="#FFFFFF" />
            <circle cx="16" cy="12" r="2" fill="#FFFFFF" />
            <circle cx="15" cy="15.5" r="1.8" fill="#FFFFFF" />
          </>
        );

      case 'github':
        return (
          <>
            {/* GitHub Octocat Silhouette */}
            <circle cx="12" cy="12" r="10" fill="#24292E" />
            <path
              d="M12 3.5C7.3 3.5 3.5 7.3 3.5 12C3.5 15.7 6 18.9 9.3 20C9.7 20.1 9.9 19.8 9.9 19.6V18.1C7.5 18.6 7 17 7 17C6.6 16 6 15.8 6 15.8C5.2 15.3 6.1 15.3 6.1 15.3C7 15.4 7.4 16.2 7.4 16.2C8.2 17.5 9.4 17.1 9.9 16.9C10 16.4 10.2 16 10.4 15.7C8.5 15.5 6.5 14.8 6.5 11.6C6.5 10.7 6.8 9.9 7.4 9.3C7.3 9.1 7 8.2 7.5 7C7.5 7 8.3 6.7 10 7.9C10.7 7.7 11.4 7.6 12.1 7.6C12.8 7.6 13.5 7.7 14.2 7.9C15.9 6.7 16.7 7 16.7 7C17.2 8.2 16.9 9.1 16.8 9.3C17.4 9.9 17.7 10.7 17.7 11.6C17.7 14.8 15.7 15.5 13.8 15.7C14.1 16 14.4 16.6 14.4 17.4V19.6C14.4 19.8 14.6 20.1 15 20C18.3 18.9 20.8 15.7 20.8 12C20.8 7.3 17 3.5 12 3.5Z"
              fill="#FFFFFF"
            />
          </>
        );

      case 'wireshark':
      case 'wire shark':
        return (
          <>
            {/* Wireshark Blue Fin & Waves */}
            <path
              d="M3 17C6 17 8 15 10 12C12 9 13 4 13 4C13 4 16 9 18 13C19 15 20 17 21 17H3Z"
              fill="#1679A7"
            />
            <path d="M2 20H22" stroke="#00B4D8" strokeWidth="2" />
            <path d="M6 13C8 11.5 10 11.5 12 13" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            <path d="M14 13C16 11.5 18 11.5 20 13" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          </>
        );

      case 'burp suite':
      case 'burpsuite':
        return (
          <>
            {/* Burp Suite Orange Shield */}
            <path d="M12 2L3 6V11C3 16.5 6.8 21.7 12 23C17.2 21.7 21 16.5 21 11V6L12 2Z" fill="#FF6633" />
            {/* Crisp White Intercept 'B' Symbol */}
            <path
              d="M9 7H13.5C14.9 7 16 8.1 16 9.5C16 10.6 15.3 11.5 14.3 11.8C15.5 12.2 16.5 13.3 16.5 14.5C16.5 16 15.2 17 13.5 17H9V7Z"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              fill="none"
            />
            <line x1="9" y1="12" x2="14" y2="12" stroke="#FFFFFF" strokeWidth="1.5" />
          </>
        );

      default:
        return (
          <>
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#333333" stroke="#666666" strokeWidth="1.5" />
            <text x="12" y="16" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace">
              {(name || '?').slice(0, 2).toUpperCase()}
            </text>
          </>
        );
    }
  };

  return (
    <svg
      className={`tech-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={displayTitle}
      title={displayTitle}
    >
      <title>{displayTitle}</title>
      {renderIconContent()}
    </svg>
  );
};

export default TechIcon;
