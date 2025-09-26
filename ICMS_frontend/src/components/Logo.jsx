import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1001 1001"
    >
      <path 
        d="M 311,112 L 310,113 L 298,113 L 297,114 L 290,114 L 289,115" 
        fill="currentColor" 
        stroke="none" 
      />
    </svg>
  );
};

export default Logo; 