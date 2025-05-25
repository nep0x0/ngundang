'use client';

import { useEffect, useState } from 'react';
import LoveLoadingBar from './LoveLoadingBar';

interface LoadingProps {
  onLoadingComplete: () => void;
}

export default function Loading({ onLoadingComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadingComplete();
          }, 800); // Delay sebelum menghilangkan loading screen
          return 100;
        }
        // Simulasi loading yang semakin lambat mendekati 100%
        const increment = Math.max(1, 10 - Math.floor(prevProgress / 10));
        return Math.min(prevProgress + increment, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-blue-100 flex flex-col items-center justify-center z-50 p-3 sm:p-4 w-full overflow-x-hidden">
      <div className="text-center w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="flex justify-center items-center p-4">
          <LoveLoadingBar
            progress={progress}
            color="#89CFF0"
            backgroundColor="#E6F4FF"
            width={140}
            height={80}
          />
        </div>
      </div>
    </div>
  );
}
