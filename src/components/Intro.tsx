'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface IntroProps {
  message: string;
}

export default function Intro({ message }: IntroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;

    if (section && text) {
      gsap.fromTo(
        text,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, []);

  return (
    <div
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-white text-center w-full overflow-x-hidden"
    >
      <div className="w-full max-w-3xl mx-auto">
        <p
          ref={textRef}
          className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 font-light"
        >
          {message}
        </p>
      </div>
    </div>
  );
}
