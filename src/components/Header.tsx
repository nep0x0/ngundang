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
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center text-center px-0 overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f8fafc 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease-in-out infinite'
      }}
    >
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left Ornament */}
        <div className="absolute top-8 left-8 w-24 h-24 opacity-20">
          <div className="w-full h-full border-2 border-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 border border-blue-200 rounded-full animate-ping"></div>
        </div>

        {/* Top Right Ornament */}
        <div className="absolute top-8 right-8 w-32 h-32 opacity-15">
          <div className="w-full h-full border-2 border-blue-400 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* Bottom Left Ornament */}
        <div className="absolute bottom-8 left-8 w-20 h-20 opacity-25">
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 rounded-full animate-pulse"></div>
        </div>

        {/* Bottom Right Ornament */}
        <div className="absolute bottom-8 right-8 w-28 h-28 opacity-20">
          <div className="w-full h-full border-2 border-blue-300 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        </div>
      </div>

      <div className="relative z-10 text-gray-800 w-full max-w-4xl mx-auto px-3 sm:px-4 py-10">

        {/* Luxury Photo Frame */}
        <div
          ref={photoRef}
          className="mb-12 sm:mb-16 flex justify-center"
          style={{ perspective: '1200px' }}
        >
          <div className="relative w-80 h-[26rem] sm:w-96 sm:h-[32rem] md:w-[26rem] md:h-[36rem] lg:w-[28rem] lg:h-[40rem]">

            {/* Outer Luxury Border */}
            <div className="absolute -inset-4 rounded-t-full bg-gradient-to-br from-blue-100 via-white to-blue-50 shadow-2xl border border-blue-200/30"></div>

            {/* Middle Decorative Ring */}
            <div className="absolute -inset-2 rounded-t-full bg-gradient-to-br from-white via-blue-50 to-white shadow-xl border-2 border-blue-200/50"></div>

            {/* Main Luxury Frame */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-2xl border-4 overflow-hidden"
              style={{
                borderRadius: '40% 40% 0 0',
                borderImage: 'linear-gradient(45deg, #dbeafe, #bfdbfe, #93c5fd, #bfdbfe, #dbeafe) 1',
                boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}
            >

              {/* Inner Glow Effect */}
              <div className="absolute inset-1 rounded-t-full bg-gradient-to-br from-white/80 via-transparent to-white/40 shadow-inner"></div>

              {/* Decorative Corner Gems */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg border-2 border-white animate-pulse"></div>
              <div className="absolute top-8 left-8 w-4 h-4 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow-md border border-white animate-ping"></div>
              <div className="absolute top-8 right-8 w-4 h-4 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow-md border border-white animate-ping" style={{ animationDelay: '1s' }}></div>

              {/* Photo Container with Luxury Clipping */}
              <div className="absolute inset-3 overflow-hidden shadow-2xl"
                style={{
                  borderRadius: '40% 40% 0 0',
                  clipPath: 'polygon(0 0, 100% 0, 100% 60%, 85% 100%, 15% 100%, 0 60%)'
                }}>
                <Image
                  src="/images/swahaxadel-508.jpg"
                  alt="Adelita & Ansyah Wedding Photo"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />

                {/* Photo Overlay with Luxury Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-300/10"></div>
              </div>

              {/* Bottom Decorative Elements */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg border border-white animate-pulse"></div>
                <div className="w-2 h-2 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow-md border border-white animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg border border-white animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>

            {/* Floating Light Effects */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-200/30 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute -top-4 -right-4 w-6 h-6 bg-blue-300/40 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-2 left-4 w-5 h-5 bg-blue-200/35 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Luxury Names and Date */}
        <div className="text-center space-y-6">
          {/* Decorative Top Ornament */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-300 to-blue-400"></div>
              <div className="w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg border border-white"></div>
              <div className="w-20 h-px bg-gradient-to-r from-blue-400 via-blue-300 to-transparent"></div>
            </div>
          </div>

          {/* Luxury Names */}
          <h1
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif mb-6 md:mb-8 leading-tight tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%, #1e40af 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
              filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))'
            }}
          >
            <span className="block sm:inline font-bold tracking-wider">{brideNames.bride}</span>
            <span className="mx-4 font-light text-blue-400 opacity-80 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">&</span>
            <span className="block sm:inline font-bold tracking-wider">{brideNames.groom}</span>
          </h1>

          {/* Decorative Middle Ornament */}
          <div className="flex justify-center my-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full animate-pulse"></div>
              <div className="w-12 h-px bg-gradient-to-r from-blue-300 to-blue-400"></div>
              <div className="w-4 h-4 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-md border border-white rotate-45"></div>
              <div className="w-12 h-px bg-gradient-to-r from-blue-400 to-blue-300"></div>
              <div className="w-2 h-2 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Luxury Date */}
          <p
            ref={dateRef}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
              letterSpacing: '0.1em'
            }}
          >
            {weddingDate}
          </p>

          {/* Decorative Bottom Ornament */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-300 to-blue-400"></div>
              <div className="w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg border border-white animate-pulse"></div>
              <div className="w-16 h-px bg-gradient-to-r from-blue-400 via-blue-300 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
