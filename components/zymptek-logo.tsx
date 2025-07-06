import React from 'react';

interface ZymptekLogoProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  enableGlow?: boolean;
  showText?: boolean;
  variant?: 'default' | 'icon-only' | 'compact';
}

/**
 * Zymptek Logo React Component - Enhanced Version.
 *
 * This component renders a pixel-perfect, correctly aligned replica of the Zymptek logo,
 * featuring the correct brand gradient and an optional, subtle glow animation.
 */
const ZymptekLogo: React.FC<ZymptekLogoProps> = ({ 
  title = 'Zymptek Logo', 
  enableGlow = false, 
  showText = true, 
  variant = 'default', 
  ...rest 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={variant === 'icon-only' || !showText ? "0 0 120 120" : "0 0 344 90"}
      aria-labelledby="logoTitle"
      className={enableGlow ? 'animate-pulse' : ''}
      style={{
        filter: enableGlow ? 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.4))' : undefined,
        transition: 'filter 0.3s ease',
      }}
      suppressHydrationWarning
      {...rest}
    >
      <title id="logoTitle">{title}</title>

      <defs>
        {/* Enhanced gradient with more vibrant colors */}
        <linearGradient id="zymptek-enhanced-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />    {/* blue-500 */}
          <stop offset="50%" stopColor="#6366f1" />   {/* indigo-500 */}
          <stop offset="100%" stopColor="#a855f7" />  {/* purple-500 */}
        </linearGradient>
      </defs>

      {/* Icon Group */}
      <g 
        transform={variant === 'icon-only' || !showText ? "translate(10, 10) scale(0.45)" : "translate(-44, -54.4) scale(0.85)"} 
        fill="url(#zymptek-enhanced-gradient)"
      >
        <path d="M106.393 70.4642C108.346 68.5116 111.512 68.5116 113.464 70.4642L119.793 76.7934L116.257 80.3285L113.464 77.5355C111.512 75.583 108.346 75.5829 106.393 77.5355L70.5355 113.393C68.5829 115.346 68.5829 118.512 70.5355 120.464L106.393 156.322C108.346 158.274 111.512 158.274 113.464 156.322L149.323 120.464C151.275 118.512 151.275 115.346 149.323 113.393L117.671 81.7426L121.207 78.2074L156.393 113.393C158.346 115.346 158.346 118.512 156.393 120.464L113.464 163.393C111.512 165.346 108.346 165.346 106.393 163.393L63.4642 120.464C61.5116 118.512 61.5116 115.346 63.4642 113.393L106.393 70.4642Z" />
        <path d="M128.393 70.4642C130.346 68.5116 133.512 68.5116 135.464 70.4642L178.393 113.393C180.346 115.346 180.346 118.512 178.393 120.464L135.464 163.393C133.512 165.346 130.346 165.346 128.393 163.393L117.884 152.884L121.419 149.348L128.393 156.322C130.346 158.274 133.512 158.274 135.464 156.322L171.322 120.464C173.274 118.512 173.274 115.346 171.322 113.393L135.464 77.5355C133.512 75.5829 130.346 75.5829 128.393 77.5355L92.5355 113.393C90.5829 115.346 90.5829 118.512 92.5355 120.464L119.652 147.58L116.117 151.117L85.4642 120.464C83.5116 118.512 83.5116 115.346 85.4642 113.393L128.393 70.4642Z" />
      </g>
      
      {/* Text element - only show if showText is true */}
      {showText && variant !== 'icon-only' && (
        <text
          x="125"
          y="45"
          fill="url(#zymptek-enhanced-gradient)"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
            fontSize: '42px',
            fontWeight: 700,
            dominantBaseline: 'middle',
          }}
        >
          Zymptek
        </text>
      )}
    </svg>
  );
};

export default ZymptekLogo; 