import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 10L16 4L26 10L16 16L6 10Z"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M6 14V22L16 28V20L6 14Z"
        fill="currentColor"
        className="text-primary/70"
      />
      <path
        d="M26 14V22L16 28V20L26 14Z"
        fill="currentColor"
        className="text-accent"
      />
    </svg>
  );
}
