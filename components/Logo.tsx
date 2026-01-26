import React from 'react';
import { Theme } from '../types.ts';

interface LogoProps {
  theme: Theme;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme, className }) => {
  const isDark = theme === 'dark';
  const primaryColor = isDark ? "#38bdf8" : "#0ea5e9";
  const metalColor = isDark ? "#94a3b8" : "#64748b";
  const skinColor = "#e2b08e"; // Skin tone for hand
  const panFill = isDark ? "#1e293b" : "#f1f5f9";
  
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      
      {/* --- HAND HOLDING THE SCALE --- */}
      {/* Wrist */}
      <path d="M50 0 V 15" stroke={skinColor} strokeWidth="8" strokeLinecap="round" />
      
      {/* Hand Grip (Fingers wrapping around ring) */}
      <rect x="42" y="12" width="16" height="8" rx="3" fill={skinColor} />
      <path d="M42 16 H 58" stroke="#cfa07e" strokeWidth="1" /> 

      {/* Top Ring */}
      <circle cx="50" cy="22" r="4" stroke={metalColor} strokeWidth="2" fill="none" />

      {/* Main Vertical Rod */}
      <path d="M50 26 L 50 45" stroke={metalColor} strokeWidth="2" />

      {/* Horizontal Beam */}
      <path d="M15 45 H 85" stroke={isDark ? "#cbd5e1" : "#334155"} strokeWidth="3" strokeLinecap="round" />
      
      {/* Center Pivot Point */}
      <circle cx="50" cy="45" r="3" fill={primaryColor} />

      {/* --- LEFT PAN (Items) --- */}
      {/* Strings */}
      <path d="M15 45 L 10 75" stroke={metalColor} strokeWidth="1" />
      <path d="M25 45 L 30 75" stroke={metalColor} strokeWidth="1" />
      {/* Pan */}
      <path d="M10 75 Q 20 90 30 75" fill={panFill} stroke={primaryColor} strokeWidth="2" />
      
      {/* Item on Left (Milk Bottle) */}
       <rect x="18" y="65" width="4" height="8" fill="#e0f2fe" stroke={primaryColor} strokeWidth="0.5" />


      {/* --- RIGHT PAN (Rupee) --- */}
      {/* Strings */}
      <path d="M75 45 L 70 75" stroke={metalColor} strokeWidth="1" />
      <path d="M85 45 L 90 75" stroke={metalColor} strokeWidth="1" />
      {/* Pan */}
      <path d="M70 75 Q 80 90 90 75" fill={panFill} stroke={primaryColor} strokeWidth="2" />
      
      {/* Rupee Symbol */}
      <text x="80" y="73" textAnchor="middle" fill={isDark ? "#4ade80" : "#16a34a"} fontSize="10" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>₹</text>

    </svg>
  );
};

export default Logo;
