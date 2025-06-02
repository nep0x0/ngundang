'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioSrc: string;
}

export default function AudioPlayer({ audioSrc }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Membuat elemen audio yang sesungguhnya
    const audio = new Audio(audioSrc);
    audio.loop = true; // Mengatur agar audio berputar otomatis
    audio.preload = 'auto';
    audio.volume = 0.7; // Set volume ke 70%

    // Event listeners untuk audio
    audio.addEventListener('loadeddata', () => {
      setIsLoaded(true);
      console.log('Audio loaded successfully');
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
      console.log('Audio started playing');
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
      console.log('Audio paused');
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    audioRef.current = audio;

    // Clean up
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadeddata', () => {});
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('pause', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current = null;
      }
    };
  }, [audioSrc]);

  // Mendeteksi ketika user membuka undangan (cover dihilangkan)
  useEffect(() => {
    const handleStartAudio = () => {
      if (audioRef.current && isLoaded && isFirstPlay) {
        // Mulai musik otomatis setelah user membuka undangan
        audioRef.current.play().then(() => {
          setIsFirstPlay(false);
          console.log('Auto-play started successfully');
        }).catch(error => {
          console.error('Autoplay failed:', error);
          // Jika autoplay gagal, user masih bisa klik tombol play manual
        });
      }
    };

    const handleUserInteraction = () => {
      if (isFirstPlay && !isPlaying && audioRef.current && isLoaded) {
        // Fallback: Mulai musik otomatis setelah user berinteraksi dengan halaman
        audioRef.current.play().then(() => {
          setIsFirstPlay(false);
        }).catch(error => {
          console.error('Autoplay failed:', error);
        });
      }
    };

    // Mendengarkan custom event dari halaman utama
    window.addEventListener('startAudio', handleStartAudio);

    // Fallback: Mendengarkan event click pada document
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('startAudio', handleStartAudio);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [isFirstPlay, isPlaying, isLoaded]);

  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Play failed:', error);
      });
    }

    setIsFirstPlay(false);
  };

  return (
    <button
      onClick={togglePlay}
      disabled={!isLoaded}
      className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 text-white ${
        !isLoaded
          ? 'bg-gray-400 cursor-not-allowed'
          : isPlaying
            ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
      }`}
      aria-label={!isLoaded ? 'Loading music...' : isPlaying ? 'Pause music' : 'Play music'}
      title={!isLoaded ? 'Loading music...' : isPlaying ? 'Pause music' : 'Play music'}
    >
      {!isLoaded ? (
        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isPlaying ? (
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
