import React from 'react';

interface MunimJiAvatarProps {
  className?: string;
  size?: number;
}

export const MunimJiAvatar: React.FC<MunimJiAvatarProps> = ({
  className = '',
  size = 96,
}) => {
  return (
    <div
      className={`relative inline-block shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Munim Ji Mascot"
    >
      {/* Sparkle Star on Top-Left */}
      <svg
        className="absolute -top-1.5 -left-1.5 w-7 h-7 z-10 drop-shadow-[1px_1px_0px_#141413]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 1L14.2 8.8L22 11L14.2 13.2L12 21L9.8 13.2L2 11L9.8 8.8L12 1Z"
          fill="#CCFF33"
          stroke="#141413"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>

      {/* Main Avatar Badge */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[3px_3px_0px_#141413]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Badge */}
        <circle cx="50" cy="50" r="46" fill="#FFBE0B" stroke="#141413" strokeWidth="4" />

        {/* Turban / Pagdi Band at top */}
        <path
          d="M24 35C27 24 38 18 50 18C62 18 73 24 76 35C68 31 52 30 24 35Z"
          fill="#FB5607"
          stroke="#141413"
          strokeWidth="3"
        />
        {/* Turban fold accent */}
        <path
          d="M32 29C42 24 58 24 68 29"
          stroke="#FFBE0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Green Pencil tucked over ear */}
        <g transform="rotate(-30 74 30)">
          <rect x="70" y="24" width="8" height="22" rx="2" fill="#CCFF33" stroke="#141413" strokeWidth="2.5" />
          <polygon points="70,46 78,46 74,52" fill="#FB5607" stroke="#141413" strokeWidth="2" />
          <polygon points="73,50 75,50 74,52" fill="#141413" />
        </g>

        {/* Ears */}
        <circle cx="21" cy="52" r="6" fill="#FDE047" stroke="#141413" strokeWidth="3" />
        <circle cx="79" cy="52" r="6" fill="#FDE047" stroke="#141413" strokeWidth="3" />

        {/* Red Tilak on forehead */}
        <ellipse cx="50" cy="38" rx="2.5" ry="4" fill="#E11D48" />

        {/* Glasses - Left & Right Lenses with Bridge */}
        {/* Left Lens */}
        <circle cx="37" cy="51" r="11" fill="#FFFFFF" stroke="#141413" strokeWidth="3.5" />
        {/* Right Lens */}
        <circle cx="63" cy="51" r="11" fill="#FFFFFF" stroke="#141413" strokeWidth="3.5" />
        {/* Glasses Bridge */}
        <path d="M48 50C49 48 51 48 52 50" stroke="#141413" strokeWidth="3.5" strokeLinecap="round" />
        {/* Left Frame Side */}
        <path d="M26 50L21 49" stroke="#141413" strokeWidth="3" strokeLinecap="round" />
        {/* Right Frame Side */}
        <path d="M74 50L79 49" stroke="#141413" strokeWidth="3" strokeLinecap="round" />

        {/* Eyes inside glasses */}
        <circle cx="38" cy="51" r="3.5" fill="#141413" />
        <circle cx="39.5" cy="49.5" r="1.2" fill="#FFFFFF" />
        <circle cx="62" cy="51" r="3.5" fill="#141413" />
        <circle cx="63.5" cy="49.5" r="1.2" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M30 40C33 38 39 39 42 41" stroke="#141413" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M70 40C67 38 61 39 58 41" stroke="#141413" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Friendly Nose */}
        <path d="M50 51V57" stroke="#141413" strokeWidth="3" strokeLinecap="round" />

        {/* Cheerful Mustache (Traditional Indian Handlebar) */}
        <path
          d="M50 63C44 57 32 58 26 64C25 65.5 28 66 31 65C38 63 45 66 50 69C55 66 62 63 69 65C72 66 75 65.5 74 64C68 58 56 57 50 63Z"
          fill="#141413"
        />

        {/* Big Happy Smile */}
        <path
          d="M42 69C44 76 56 76 58 69"
          stroke="#141413"
          strokeWidth="3"
          strokeLinecap="round"
          fill="#E11D48"
        />

        {/* Chin line */}
        <path d="M47 80C49 81 51 81 53 80" stroke="#141413" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
