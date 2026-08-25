import React from 'react';
import './RetroIcon.css';

/**
 * RetroIcon replaces standard Unicode emojis with theme-responsive retro CRT vector icons.
 */
const RetroIcon = ({ name, size = '14px', className = '', title }) => {
  const normalized = (name || '').trim().toLowerCase();

  const renderIconContent = () => {
    switch (normalized) {
      case 'folder':
        return (
          <>
            {/* Retro closed directory folder */}
            <path d="M2 5C2 4.4 2.4 4 3 4H8L10 6H21C21.6 6 22 6.4 22 7V18C22 18.6 21.6 19 21 19H3C2.4 19 2 18.6 2 18V5Z" className="retro-secondary" opacity="0.3" />
            <path d="M2 5C2 4.4 2.4 4 3 4H8L10 6H21C21.6 6 22 6.4 22 7V18C22 18.6 21.6 19 21 19H3C2.4 19 2 18.6 2 18V5Z" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="2" y1="9" x2="22" y2="9" strokeWidth="1.5" className="retro-stroke-primary" />
          </>
        );

      case 'folder-open':
      case 'filesystem':
        return (
          <>
            {/* Retro open folder */}
            <path d="M2 6C2 4.9 2.9 4 4 4H9L11 6H19C20.1 6 21 6.9 21 8V10H6C4.5 10 3.2 11.1 3 12.6L2 19V6Z" className="retro-secondary" opacity="0.4" />
            <path d="M2 6C2 4.9 2.9 4 4 4H9L11 6H19C20.1 6 21 6.9 21 8V10H6" fill="none" strokeWidth="1.8" className="retro-stroke-dim" />
            <polygon points="3,20 6.5,10 22.5,10 19,20" className="retro-secondary" opacity="0.3" />
            <polygon points="3,20 6.5,10 22.5,10 19,20" fill="none" strokeWidth="1.8" strokeLinejoin="round" className="retro-stroke-primary" />
          </>
        );

      case 'editor':
      case 'pencil':
      case 'edit':
        return (
          <>
            {/* Retro stylus / pencil / terminal cursor */}
            <path d="M17 3L21 7L7 21H3V17L17 3Z" className="retro-secondary" opacity="0.25" />
            <path d="M17 3L21 7L7 21H3V17L17 3Z" fill="none" strokeWidth="1.8" strokeLinejoin="round" className="retro-stroke-primary" />
            <line x1="14" y1="6" x2="18" y2="10" strokeWidth="1.5" className="retro-stroke-dim" />
            <line x1="6" y1="18" x2="8" y2="20" strokeWidth="1.5" className="retro-stroke-primary" />
          </>
        );

      case 'document':
      case 'text':
      case 'textprocessing':
        return (
          <>
            {/* Retro folded text file */}
            <path d="M4 3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22H5C4.4 22 4 21.6 4 21V3Z" className="retro-secondary" opacity="0.2" />
            <path d="M4 3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22H5C4.4 22 4 21.6 4 21V3Z" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <path d="M14 2V8H20" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.6" strokeLinecap="round" className="retro-stroke-primary" />
            <line x1="8" y1="15.5" x2="16" y2="15.5" strokeWidth="1.6" strokeLinecap="round" className="retro-stroke-dim" />
            <line x1="8" y1="19" x2="13" y2="19" strokeWidth="1.6" strokeLinecap="round" className="retro-stroke-dim" />
          </>
        );

      case 'system':
      case 'gear':
      case 'chip':
        return (
          <>
            {/* Retro microchip processor */}
            <rect x="5" y="5" width="14" height="14" rx="2" className="retro-secondary" opacity="0.3" />
            <rect x="5" y="5" width="14" height="14" rx="2" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <rect x="9" y="9" width="6" height="6" fill="none" strokeWidth="1.5" className="retro-stroke-dim" />
            {/* Chip pins */}
            <line x1="8" y1="2" x2="8" y2="5" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="12" y1="2" x2="12" y2="5" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="16" y1="2" x2="16" y2="5" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="8" y1="19" x2="8" y2="22" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="12" y1="19" x2="12" y2="22" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="16" y1="19" x2="16" y2="22" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="2" y1="8" x2="5" y2="8" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="2" y1="12" x2="5" y2="12" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="2" y1="16" x2="5" y2="16" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="19" y1="8" x2="22" y2="8" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="19" y1="12" x2="22" y2="12" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="19" y1="16" x2="22" y2="16" strokeWidth="1.8" className="retro-stroke-primary" />
          </>
        );

      case 'globe':
      case 'networking':
      case 'network':
        return (
          <>
            {/* Retro wireframe globe / net */}
            <circle cx="12" cy="12" r="9" className="retro-secondary" opacity="0.2" />
            <circle cx="12" cy="12" r="9" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <ellipse cx="12" cy="12" rx="4.5" ry="9" fill="none" strokeWidth="1.5" className="retro-stroke-dim" />
            <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.6" className="retro-stroke-primary" />
            <line x1="5.5" y1="7" x2="18.5" y2="7" strokeWidth="1.2" className="retro-stroke-dim" />
            <line x1="5.5" y1="17" x2="18.5" y2="17" strokeWidth="1.2" className="retro-stroke-dim" />
          </>
        );

      case 'gamepad':
      case 'fun':
      case 'arcade':
      case 'invader':
        return (
          <>
            {/* Retro arcade space invader */}
            <path
              d="M6 3H8V5H10V7H14V5H16V3H18V7H20V13H18V15H16V13H14V15H10V13H8V15H6V13H4V7H6V3ZM8 9V11H10V9H8ZM14 9V11H16V9H14ZM4 17H6V21H4V17ZM18 17H20V21H18V17Z"
              className="retro-primary"
            />
          </>
        );

      case 'power':
      case 'session':
        return (
          <>
            {/* Retro power toggle */}
            <path d="M12 3V11" strokeWidth="2" strokeLinecap="round" className="retro-stroke-primary" />
            <path
              d="M7 6.5C4.5 8.5 3.5 12 4.5 15.5C5.8 19 9.5 21 13 20.8C16.5 20.5 19.5 18 20.2 14.5C21 11 19.5 7.5 17 6.5"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="retro-stroke-primary"
            />
          </>
        );

      case 'heart':
      case 'credits':
        return (
          <>
            {/* Retro pixel / CRT phosphor heart */}
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
              className="retro-secondary"
              opacity="0.3"
            />
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
              fill="none"
              strokeWidth="1.8"
              className="retro-stroke-primary"
            />
          </>
        );

      case 'bulb':
      case 'tip':
        return (
          <>
            {/* Retro CRT bulb */}
            <path
              d="M12 3C8.5 3 6 5.5 6 9C6 11.5 7.5 13.5 9 15V17C9 17.5 9.5 18 10 18H14C14.5 18 15 17.5 15 17V15C16.5 13.5 18 11.5 18 9C18 5.5 15.5 3 12 3Z"
              className="retro-secondary"
              opacity="0.25"
            />
            <path
              d="M12 3C8.5 3 6 5.5 6 9C6 11.5 7.5 13.5 9 15V17C9 17.5 9.5 18 10 18H14C14.5 18 15 17.5 15 17V15C16.5 13.5 18 11.5 18 9C18 5.5 15.5 3 12 3Z"
              fill="none"
              strokeWidth="1.8"
              className="retro-stroke-primary"
            />
            <line x1="9" y1="21" x2="15" y2="21" strokeWidth="1.8" strokeLinecap="round" className="retro-stroke-primary" />
            <line x1="12" y1="7" x2="12" y2="12" strokeWidth="1.5" className="retro-stroke-dim" />
          </>
        );

      case 'coffee':
        return (
          <>
            {/* Retro steaming coffee mug */}
            <path d="M8 4C9 3 9 2 8.5 1" fill="none" strokeWidth="1.4" strokeLinecap="round" className="retro-stroke-primary" />
            <path d="M12 4C13 3 13 2 12.5 1" fill="none" strokeWidth="1.4" strokeLinecap="round" className="retro-stroke-dim" />
            <path d="M4 7H16V14C16 17 13.5 19 10 19C6.5 19 4 17 4 14V7Z" className="retro-secondary" opacity="0.3" />
            <path d="M4 7H16V14C16 17 13.5 19 10 19C6.5 19 4 17 4 14V7Z" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <path d="M16 8C18 8 19.5 9 19.5 10.5C19.5 12 18 13 16 13" fill="none" strokeWidth="1.6" className="retro-stroke-dim" />
            <line x1="2" y1="21" x2="18" y2="21" strokeWidth="1.8" strokeLinecap="round" className="retro-stroke-primary" />
          </>
        );

      case 'wink':
      case 'smile':
      case 'face':
        return (
          <>
            {/* Retro terminal smiley face */}
            <circle cx="12" cy="12" r="9" className="retro-secondary" opacity="0.25" />
            <circle cx="12" cy="12" r="9" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <path d="M8 9H10" strokeWidth="2" strokeLinecap="round" className="retro-stroke-primary" />
            <path d="M14 9L16 10L14 11" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="retro-stroke-primary" />
            <path d="M8 14C9.5 16.5 14.5 16.5 16 14" fill="none" strokeWidth="1.8" strokeLinecap="round" className="retro-stroke-primary" />
          </>
        );

      case 'warning':
      case 'alert':
        return (
          <>
            {/* Retro CRT alert triangle */}
            <polygon points="12,2 22,20 2,20" className="retro-secondary" opacity="0.3" />
            <polygon points="12,2 22,20 2,20" fill="none" strokeWidth="1.8" strokeLinejoin="round" className="retro-stroke-primary" />
            <line x1="12" y1="8" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" className="retro-stroke-primary" />
            <circle cx="12" cy="17" r="1.2" className="retro-primary" />
          </>
        );

      case 'pin':
      case 'map-pin':
      case 'location':
      case 'geo':
        return (
          <>
            {/* Retro CRT vector map pin */}
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              className="retro-secondary"
              opacity="0.25"
            />
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="none"
              strokeWidth="1.8"
              strokeLinejoin="round"
              className="retro-stroke-primary"
            />
            <circle
              cx="12"
              cy="9"
              r="2.5"
              fill="none"
              strokeWidth="1.6"
              className="retro-stroke-primary"
            />
          </>
        );

      case 'clock':
      case 'time':
      case 'timer':
        return (
          <>
            {/* Retro CRT chronometer */}
            <circle cx="12" cy="12" r="9" className="retro-secondary" opacity="0.2" />
            <circle cx="12" cy="12" r="9" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <polyline points="12,6 12,12 16,14" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="retro-stroke-primary" />
          </>
        );

      case 'search':
      case 'find':
      case 'lookup':
        return (
          <>
            {/* Retro vector magnifying search icon */}
            <circle cx="10.5" cy="10.5" r="6.5" className="retro-secondary" opacity="0.25" />
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" strokeWidth="2.2" strokeLinecap="round" className="retro-stroke-primary" />
          </>
        );

      case 'tape':
      case 'cassette':
        return (
          <>
            {/* Retro compact cassette tape */}
            <rect x="2" y="5" width="20" height="14" rx="2" className="retro-secondary" opacity="0.25" />
            <rect x="2" y="5" width="20" height="14" rx="2" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <rect x="6" y="9" width="12" height="6" rx="1" fill="none" strokeWidth="1.2" className="retro-stroke-dim" />
            <circle cx="9" cy="12" r="1.6" className="retro-primary" />
            <circle cx="15" cy="12" r="1.6" className="retro-primary" />
            <path d="M7 19L9 16H15L17 19" fill="none" strokeWidth="1.4" className="retro-stroke-dim" />
          </>
        );

      case 'music':
      case 'audio':
      case 'note':
        return (
          <>
            {/* Retro 8-bit musical notes */}
            <path d="M9 18V5L20 3V16" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="retro-stroke-primary" />
            <circle cx="6" cy="18" r="3" className="retro-secondary" opacity="0.4" />
            <circle cx="6" cy="18" r="3" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <circle cx="17" cy="16" r="3" className="retro-secondary" opacity="0.4" />
            <circle cx="17" cy="16" r="3" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <path d="M9 9L20 7" strokeWidth="1.8" className="retro-stroke-primary" />
          </>
        );

      case 'deck':
      case 'window':
      case 'expand':
        return (
          <>
            {/* Retro window expand icon */}
            <rect x="3" y="4" width="18" height="16" rx="1.5" className="retro-secondary" opacity="0.2" />
            <rect x="3" y="4" width="18" height="16" rx="1.5" fill="none" strokeWidth="1.8" className="retro-stroke-primary" />
            <line x1="3" y1="8" x2="21" y2="8" strokeWidth="1.4" className="retro-stroke-dim" />
            <rect x="13" y="11" width="5" height="5" fill="none" strokeWidth="1.4" className="retro-stroke-primary" />
          </>
        );

      default:
        return (
          <circle cx="12" cy="12" r="4" className="retro-primary" />
        );
    }
  };

  return (
    <svg
      className={`retro-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || name}
    >
      {title && <title>{title}</title>}
      {renderIconContent()}
    </svg>
  );
};

export default RetroIcon;
