'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

interface HeaderProps {
  brideNames: {
    bride: string;
    groom: string;
  };
  weddingDate: string;
}

export default function Header({ brideNames, weddingDate }: HeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dateRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const photo = photoRef.current;
    const title = titleRef.current;
    const date = dateRef.current;

    if (header && photo && title && date) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        header,
        { opacity: 0 },
        { opacity: 1, duration: 1.5 }
      )
        .fromTo(
          photo,
          { opacity: 0, scale: 0.8, rotateY: 45 },
          { opacity: 1, scale: 1, rotateY: 0, duration: 1.2, ease: "back.out(1.7)" },
          '-=1'
        )
        .fromTo(
          title,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.8'
        )
        .fromTo(
          date,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.5'
        );
    }
  }, []);

  return (
    <div
      ref={headerRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center text-center px-0 bg-gradient-to-b from-blue-200/70 to-blue-300/50 overflow-x-hidden"
    >
      <div className="absolute inset-0 bg-white/30"></div>
      <div className="relative z-10 text-gray-800 w-full max-w-4xl mx-auto px-3 sm:px-4 py-10">

        {/* Photo Frame - Arch Style */}
        <div
          ref={photoRef}
          className="mb-8 sm:mb-12 flex justify-center"
          style={{ perspective: '1000px' }}
        >
          <div className="relative w-48 h-60 sm:w-56 sm:h-72 md:w-64 md:h-80">
            {/* Main Arch Frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-white shadow-2xl border-4 border-white"
              style={{
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                clipPath: 'ellipse(50% 60% at 50% 40%)'
              }}>

              {/* Inner Shadow Ring */}
              <div className="absolute inset-2 shadow-inner bg-gradient-to-br from-slate-50 to-white"
                style={{
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  clipPath: 'ellipse(50% 60% at 50% 40%)'
                }}></div>

              {/* Decorative Arch Elements */}
              <div className="absolute inset-3 overflow-hidden"
                style={{
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  clipPath: 'ellipse(50% 60% at 50% 40%)'
                }}>

                {/* Arch Keystone */}
                <div className="absolute top-2 left-1/2 w-4 h-6 bg-gradient-to-b from-blue-400 to-blue-600 transform -translate-x-1/2 shadow-md border border-white"
                  style={{ borderRadius: '50% 50% 0 0' }}></div>

                {/* Side Pillars */}
                <div className="absolute top-6 left-3 w-2 h-8 bg-gradient-to-b from-slate-300 to-slate-400 shadow-sm"></div>
                <div className="absolute top-6 right-3 w-2 h-8 bg-gradient-to-b from-slate-300 to-slate-400 shadow-sm"></div>
              </div>

              {/* Photo Container */}
              <div className="absolute inset-4 overflow-hidden shadow-lg"
                style={{
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  clipPath: 'ellipse(50% 60% at 50% 40%)'
                }}>
                <Image
                  src="/images/swahaxadel-508.jpg"
                  alt="Adelita & Ansyah Wedding Photo"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Photo Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10"></div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md border border-white"></div>
              <div className="absolute top-0 right-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md border border-white"></div>
              <div className="absolute bottom-2 left-1/2 w-4 h-2 bg-gradient-to-r from-blue-400 to-blue-600 transform -translate-x-1/2 shadow-md border border-white"
                style={{ borderRadius: '0 0 50% 50%' }}></div>
            </div>

            {/* Outer Decorative Border */}
            <div className="absolute -inset-2 border-2 border-blue-200/50"
              style={{
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                clipPath: 'ellipse(52% 62% at 50% 40%)'
              }}></div>

            {/* Base Platform */}
            <div className="absolute -bottom-1 left-1/2 w-32 h-3 bg-gradient-to-r from-slate-200 via-white to-slate-200 transform -translate-x-1/2 shadow-lg border border-slate-300"
              style={{ borderRadius: '50px' }}></div>
          </div>
        </div>

        {/* Names and Date */}
        <h1 ref={titleRef} className="text-3xl sm:text-4xl md:text-6xl font-serif mb-4 md:mb-6 leading-tight text-blue-700">
          {brideNames.bride} <span className="font-light text-blue-500">&</span> {brideNames.groom}
        </h1>
        <p ref={dateRef} className="text-lg sm:text-xl md:text-2xl font-light text-blue-600">
          {weddingDate}
        </p>
      </div>
    </div>
  );
}
