
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Pill Body Outline - Teal */}
    <g transform="rotate(-45 50 50)">
      <rect 
        x="20" 
        y="35" 
        width="60" 
        height="30" 
        rx="15" 
        stroke="currentColor" 
        strokeWidth="8" 
      />
      {/* Middle Divider */}
      <line 
        x1="50" 
        y1="35" 
        x2="50" 
        y2="65" 
        stroke="currentColor" 
        strokeWidth="8" 
      />
      {/* Shine/Reflection Detail */}
      <path 
        d="M32 45C35 41 40 41 43 45" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        opacity="0.4"
      />
    </g>
    
    {/* Checkmark - Warm Amber */}
    <path 
      d="M50 55L65 70L90 40" 
      stroke="#F2A65A" 
      strokeWidth="12" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="drop-shadow-sm"
    />
  </svg>
);

export const BRAND_NAME = "MedTrack";
