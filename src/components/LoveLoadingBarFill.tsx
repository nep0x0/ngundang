'use client';

import React from 'react';

interface LoveLoadingBarFillProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export default function LoveLoadingBarFill({
  progress,
  color = '#89CFF0', // Baby blue default
  backgroundColor = '#E6F4FF',
  width = 300,
  height = 80,
}: LoveLoadingBarFillProps) {
  const clipPathId = `love-clip-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = `love-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Heart shape SVG path
  const heartPath = "M25,10 C25,10 20,0 10,0 C5,0 0,5 0,10 C0,20 10,25 25,35 C40,25 50,20 50,10 C50,5 45,0 40,0 C30,0 25,10 25,10 Z";

  // Scale the heart to fit the container
  const viewBoxWidth = 50;
  const viewBoxHeight = 35;

  // Calculate the y position for the gradient stop based on progress
  // Invert the progress since SVG coordinates start from top
  const gradientY = 100 - progress;

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Define gradient for filling effect */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset={`${gradientY}%`} stopColor={color} />
            <stop offset={`${gradientY}%`} stopColor="transparent" />
          </linearGradient>

          {/* Define clip path using heart shape */}
          <clipPath id={clipPathId}>
            <path d={heartPath} />
          </clipPath>
        </defs>

        {/* Background heart outline */}
        <path
          d={heartPath}
          fill="none"
          stroke={backgroundColor}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Filled heart with gradient and clip path */}
        <rect
          x="0"
          y="0"
          width={viewBoxWidth}
          height={viewBoxHeight}
          fill={`url(#${gradientId})`}
          clipPath={`url(#${clipPathId})`}
          style={{
            transition: 'all 0.5s ease-in-out',
          }}
        />

        {/* Heart outline on top for better definition */}
        <path
          d={heartPath}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Progress text in the middle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
