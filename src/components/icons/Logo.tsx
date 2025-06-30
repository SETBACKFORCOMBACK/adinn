import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 285 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        {/* Stylized A */}
        <path d="M42.5,7.5 L0,83.5 H18.5 L23,70.5 H63.5 L68,83.5 H85.5 Z" fill="#231F20" />
        <path d="M42.9 20.6L31.6 60.1H54.2L42.9 20.6Z" fill="#D82027" />

        {/* Text 'd inn' */}
        <text
          x="88"
          y="78"
          fontFamily="Orbitron, sans-serif"
          fontSize="60"
          fontWeight="700"
          fill="#231F20"
        >
          d inn
        </text>

        {/* Red dot */}
        <circle cx="203" cy="27" r="9" fill="#D82027" />
        
        {/* Underline */}
        <rect x="42" y="86" width="225" height="4" fill="#D82027" />
        
        {/* Subtitle */}
        <text
          x="75"
          y="100"
          fontFamily="Inter, sans-serif"
          fontSize="14"
          fontWeight="400"
          fill="#231F20"
        >
          Advertising Services Pvt. Ltd.
        </text>
      </g>
    </svg>
  );
}
