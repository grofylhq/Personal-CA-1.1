
import React from 'react';

export const Logo = ({ size = 24, className = "", animate = false }: { size?: number, className?: string, animate?: boolean }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`${className} ${animate ? 'animate-pulse scale-110 transition-all duration-700' : ''}`}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" rx="24" fill="url(#logo-gradient)" />
    <path d="M20 52L42 74L95 22" stroke="white" strokeWidth="16" strokeLinecap="square" strokeLinejoin="miter" />
  </svg>
);

export default Logo;
