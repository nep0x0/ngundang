'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CountdownTimerProps {
  targetDate: string; // Format: 'YYYY-MM-DD'
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const timer = timerRef.current;

    if (section && title && timer) {
      gsap.fromTo(
        title,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        timer,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-blue-50 text-center w-full overflow-x-hidden"
    >
      <div className="w-full max-w-4xl mx-auto">
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl font-serif mb-6 sm:mb-10 text-blue-600">
          Menghitung Hari
        </h2>

        <div
          ref={timerRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6 w-full"
        >
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-blue-100">
            <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-blue-700 mb-1 sm:mb-2">{days}</div>
            <div className="text-sm sm:text-base text-blue-500">Hari</div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-blue-100">
            <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-blue-700 mb-1 sm:mb-2">{hours}</div>
            <div className="text-sm sm:text-base text-blue-500">Jam</div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-blue-100">
            <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-blue-700 mb-1 sm:mb-2">{minutes}</div>
            <div className="text-sm sm:text-base text-blue-500">Menit</div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-blue-100">
            <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-blue-700 mb-1 sm:mb-2">{seconds}</div>
            <div className="text-sm sm:text-base text-blue-500">Detik</div>
          </div>
        </div>
      </div>
    </div>
  );
}
