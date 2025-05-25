'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  coupleNames: string;
  weddingDate: string;
  message: string;
}

export default function Footer({ coupleNames, weddingDate, message }: FooterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (section && content) {
      gsap.fromTo(
        content,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, []);

  return (
    <div
      ref={sectionRef}
      className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 bg-blue-300 text-center w-full overflow-x-hidden"
    >
      <div
        ref={contentRef}
        className="w-full max-w-3xl mx-auto"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif mb-3 sm:mb-4 text-blue-800">
          {coupleNames}
        </h2>
        <p className="text-sm sm:text-base text-blue-700 mb-4 sm:mb-6">
          {weddingDate}
        </p>
        <p className="text-xs sm:text-sm text-blue-600 italic px-2">
          {message}
        </p>

        <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-blue-200 text-xs sm:text-sm text-blue-700">
          <p>© {new Date().getFullYear()} - Undangan Pernikahan Online</p>
        </div>
      </div>
    </div>
  );
}
