'use client';

import React, { useEffect, useRef } from 'react';

interface LoveLoadingBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export default function LoveLoadingBar({
  progress,
  color = '#89CFF0', // Baby blue default
  backgroundColor = '#E6F4FF',
  width = 120,
  height = 60,
}: LoveLoadingBarProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (progressPathRef.current) {
      // Get the total length of the path
      const pathLength = progressPathRef.current.getTotalLength();

      // Set the initial state of the path
      progressPathRef.current.style.strokeDasharray = `${pathLength}`;

      // Animate the path based on progress - we reverse the calculation
      // because we want to show the progress from start to end
      const offset = pathLength - (progress / 100) * pathLength;
      progressPathRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [progress]);

  // Heart shape SVG path - more detailed and smoother with padding at top
  const heartPath = "M25,15 C25,15 20,5 10,5 C5,5 0,10 0,15 C0,25 10,30 25,40 C40,30 50,25 50,15 C50,10 45,5 40,5 C30,5 25,15 25,15 Z";

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 50 45"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background heart - just outline */}
        <path
          ref={pathRef}
          d={heartPath}
          fill="none"
          stroke={backgroundColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Progress heart - this will be animated */}
        <path
          ref={progressPathRef}
          d={heartPath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
    </div>
  );
}
