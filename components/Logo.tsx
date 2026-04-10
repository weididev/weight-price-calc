import React from 'react';
import { Theme } from '../types.ts';

interface LogoProps {
  theme: Theme;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme, className }) => {
  const isDark = theme === 'dark';
  
  // Colors
  const skinColor = "#e2b08e";
  const skinShadow = "#cfa07e";
  const goldLight = "#fcd34d";
  const goldDark = "#b45309";
  const goldMain = "#fbbf24";
  
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fceabb" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* --- HAND (Holding the scale) --- */}
      {/* Wrist */}
      <path d="M50 100 V 75" stroke={skinColor} strokeWidth="14" strokeLinecap="round" />
      
      {/* Hand Grip */}
      <rect x="38" y="65" width="24" height="16" rx="6" fill={skinColor} />
      <path d="M38 70 H 62" stroke={skinShadow} strokeWidth="1" opacity="0.3" />
      <path d="M38 75 H 62" stroke={skinShadow} strokeWidth="1" opacity="0.3" />
      
      {/* Thumb (wrapping around) */}
      <rect x="42" y="68" width="16" height="6" rx="3" fill={skinShadow} opacity="0.5" />

      {/* --- SCALE STRUCTURE (Golden Tarazu) --- */}
      
      {/* Center Rod */}
      <rect x="48" y="20" width="4" height="50" fill="url(#goldGradient)" />
      
      {/* Top Pivot */}
      <circle cx="50" cy="20" r="5" fill="url(#goldGradient)" stroke={goldDark} strokeWidth="0.5" />
      <circle cx="50" cy="20" r="2" fill="#fff" opacity="0.5" />

      {/* Horizontal Beam */}
      <path d="M15 20 H 85" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round" />
      
      {/* --- LEFT PAN (Vegetables) --- */}
      {/* Strings */}
      <path d="M15 20 L 10 45" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="0.5" />
      <path d="M15 20 L 20 45" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="0.5" />
      <path d="M15 20 L 15 45" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="0.5" />
      
      {/* Pan */}
      <path d="M10 45 Q 15 55 20 45" fill="url(#goldGradient)" stroke={goldDark} strokeWidth="0.5" />
      
      {/* Veggies */}
      <circle cx="13" cy="42" r="3" fill="#ef4444" /> {/* Tomato */}
      <circle cx="17" cy="43" r="3" fill="#22c55e" /> {/* Green Veg */}
      <circle cx="15" cy="40" r="2.5" fill="#eab308" /> {/* Potato/Lemon */}

      {/* --- RIGHT PAN (Money) --- */}
      {/* Strings */}
      <path d="M85 20 L 80 45" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="0.5" />
      <path d="M85 20 L 90 45" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="0.5" />
      <path d="M85 20 L 85 45" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="0.5" />
      
      {/* Pan */}
      <path d="M80 45 Q 85 55 90 45" fill="url(#goldGradient)" stroke={goldDark} strokeWidth="0.5" />
      
      {/* Rupee Symbol */}
      <text x="85" y="44" textAnchor="middle" fill={isDark ? "#4ade80" : "#16a34a"} fontSize="10" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>₹</text>

      {/* Shine/Reflection on Beam */}
      <path d="M20 19 H 80" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />

    </svg>
  );
};

export default Logo;
