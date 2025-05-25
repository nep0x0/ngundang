'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioSrc: string;
}

export default function AudioPlayer({ audioSrc }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Simulasi audio player tanpa benar-benar memuat file audio
    audioRef.current = {} as HTMLAudioElement;
    audioRef.current.play = () => {
      console.log('Audio playing');
      return Promise.resolve();
    };
    audioRef.current.pause = () => console.log('Audio paused');

    // Clean up
    return () => {
      audioRef.current = null;
    };
  }, [audioSrc]);

  // Mendeteksi ketika user membuka undangan (cover dihilangkan)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isFirstPlay && !isPlaying && audioRef.current) {
        // Mulai musik otomatis setelah user berinteraksi dengan halaman
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsFirstPlay(false);
        }).catch(error => {
          console.error('Autoplay failed:', error);
        });
      }
    };

    // Mendengarkan event click pada document
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [isFirstPlay, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
    setIsFirstPlay(false);
  };

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 shadow-lg flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 transition-colors text-white"
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
    >
      {isPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      )}
    </button>
  );
}
