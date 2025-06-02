'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PersonInfo {
  name: string;
  fullName: string;
  photo: string;
  description: string;
  socialMedia?: {
    instagram?: string;
  };
}

interface CoupleInfoProps {
  bride: PersonInfo;
  groom: PersonInfo;
}

export default function CoupleInfo({ bride, groom }: CoupleInfoProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const brideRef = useRef<HTMLDivElement>(null);
  const groomRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const brideEl = brideRef.current;
    const groomEl = groomRef.current;
    const divider = dividerRef.current;

    if (section && brideEl && groomEl && divider) {
      gsap.fromTo(
        brideEl,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'center center',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        groomEl,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'center center',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        divider,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 0.3,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'center center',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, []);

  return (
    <div ref={sectionRef} className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-blue-50 w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-center font-serif mb-10 sm:mb-16 text-blue-600">Mempelai</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center w-full">
          <div ref={brideRef} className="text-center">
            <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4 sm:mb-6 overflow-hidden rounded-full bg-blue-200 relative shadow-lg border-4 border-white">
              {bride.photo ? (
                <Image
                  src={bride.photo}
                  alt={bride.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-serif text-blue-600">{bride.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-serif mb-1 sm:mb-2 text-blue-700">{bride.name}</h3>
            <p className="text-base sm:text-lg text-blue-600 mb-2 sm:mb-4">{bride.fullName}</p>
            <p className="text-sm sm:text-base text-blue-500">{bride.description}</p>
          </div>

          {/* Divider untuk mobile */}
          <div className="flex md:hidden justify-center my-4">
            <div className="text-4xl text-blue-400 font-serif">&</div>
          </div>

          {/* Divider untuk desktop */}
          <div ref={dividerRef} className="hidden md:flex justify-center">
            <div className="text-5xl text-blue-400 font-serif">&</div>
          </div>

          <div ref={groomRef} className="text-center md:col-start-2">
            <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4 sm:mb-6 overflow-hidden rounded-full bg-blue-200 relative shadow-lg border-4 border-white">
              {groom.photo ? (
                <Image
                  src={groom.photo}
                  alt={groom.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-serif text-blue-600">{groom.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-serif mb-1 sm:mb-2 text-blue-700">{groom.name}</h3>
            <p className="text-base sm:text-lg text-blue-600 mb-2 sm:mb-4">{groom.fullName}</p>
            <p className="text-sm sm:text-base text-blue-500">{groom.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
