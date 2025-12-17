import React from 'react';
import './PythonIcon.css';

const PythonIcon = ({ size = '16px', className = '' }) => {
  return (
    <svg
      className={`python-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Python snake/logo in retro style */}
      <path
        d="M11.5 2C8.5 2 7 3.5 7 6V8H11.5V8.5H6C3.5 8.5 2 10 2 13C2 16 3.5 17.5 6 17.5H8V15C8 12.5 9.5 11 12 11H16C18 11 19 10 19 8V6C19 3.5 17.5 2 14.5 2H11.5Z"
        className="python-top"
      />
      <path
        d="M12.5 22C15.5 22 17 20.5 17 18V16H12.5V15.5H18C20.5 15.5 22 14 22 11C22 8 20.5 6.5 18 6.5H16V9C16 11.5 14.5 13 12 13H8C6 13 5 14 5 16V18C5 20.5 6.5 22 9.5 22H12.5Z"
        className="python-bottom"
      />
      {/* Eyes - retro dots */}
      <circle cx="9.5" cy="5.5" r="1" className="python-eye" />
      <circle cx="14.5" cy="18.5" r="1" className="python-eye" />
    </svg>
  );
};

export default PythonIcon;
