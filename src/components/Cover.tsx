'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

interface CoverProps {
  brideNames: {
    bride: string;
    groom: string;
  };
  onOpenInvitation: () => void;
  recipientName?: string;
}

export default function Cover({
  brideNames,
  onOpenInvitation,
  recipientName = "Tamu Undangan"
}: CoverProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const recipientRef = useRef<HTMLDivElement>(null);
  const bunga1Ref = useRef<HTMLDivElement>(null);
  const bunga2Ref = useRef<HTMLDivElement>(null);



  useEffect(() => {
    // Prevent body scroll when cover is active
    document.body.classList.add('no-scroll');
    document.documentElement.style.overflow = 'hidden';

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const cover = coverRef.current;
    const content = contentRef.current;
    const name = nameRef.current;
    const button = buttonRef.current;
    const recipient = recipientRef.current;
    const bunga1 = bunga1Ref.current;
    const bunga2 = bunga2Ref.current;



    if (cover && content && name && button && recipient) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate flowers first
      tl.fromTo(
        [bunga1, bunga2],
        { opacity: 0, scale: 0.8, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1, stagger: 0.2 }
      )
        // Then animate content
        .fromTo(
          content,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.2 },
          '-=0.6'
        )
        .fromTo(
          recipient,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          name,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        .fromTo(
          button,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.2'
        );
    }
  }, []);

  return (
    <div
      ref={coverRef}
      className="fixed inset-0 flex items-center justify-center z-40 w-full h-full overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      {/* Background Image with Blur and Blue Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/swahaxadel-508.jpg"
          alt="Wedding Background"
          fill
          className="object-cover"
          style={{
            transform: 'scale(1.3) translateX(-5%)',
            transformOrigin: 'center center'
          }}
          priority
        />
        {/* Blue Overlay */}
        <div className="absolute inset-0 bg-sky-900/40"></div>
      </div>


      {/* Bunga1 - Pojok Kiri Atas */}
      <div
        ref={bunga1Ref}
        className="absolute -top-8 -left-8 sm:-top-12 sm:-left-12 md:-top-16 md:-left-16 lg:-top-20 lg:-left-24 xl:-top-24 xl:-left-32 w-60 h-60 sm:w-84 sm:h-84 md:w-[27rem] md:h-[27rem] lg:w-[36rem] lg:h-[36rem] xl:w-[45rem] xl:h-[45rem] z-10"
      >
        <Image
          src="/images/bunga1.png"
          alt="Bunga 1"
          fill
          className="object-contain object-top-left"
        />
      </div>

      {/* Bunga2 - Pojok Kanan Bawah */}
      <div
        ref={bunga2Ref}
        className="absolute -bottom-4 -right-12 sm:-bottom-6 sm:-right-16 md:-bottom-8 md:-right-20 lg:-bottom-12 lg:-right-28 xl:-bottom-16 xl:-right-36 w-60 h-60 sm:w-84 sm:h-84 md:w-[27rem] md:h-[27rem] lg:w-[36rem] lg:h-[36rem] xl:w-[45rem] xl:h-[45rem] z-10"
      >
        <Image
          src="/images/bunga2.png"
          alt="Bunga 2"
          fill
          className="object-contain object-bottom-right"
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-20 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto text-center px-6 sm:px-8"
      >
        <div className="mb-12 sm:mb-16 md:mb-20">
          <p className="text-base sm:text-lg md:text-xl uppercase tracking-[0.4em] text-white mb-8 sm:mb-12 md:mb-16 font-light drop-shadow-lg">
            THE WEDDING OF
          </p>

          <h1 ref={nameRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-tangerine mb-6 sm:mb-8 md:mb-12 text-white leading-tight font-bold drop-shadow-xl">
            <span className="">{brideNames.bride}</span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-blue-100 font-normal my-2 sm:my-3 md:my-4 drop-shadow-lg">&</span>
            <span className="">{brideNames.groom}</span>
          </h1>
        </div>

        <div ref={recipientRef} className="mb-10 sm:mb-12 md:mb-16">
          <p className="text-white mb-3 text-sm sm:text-base md:text-lg font-light tracking-wide uppercase drop-shadow-lg">Kepada YTH:</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-white font-serif italic drop-shadow-xl">{recipientName}</p>
        </div>

        <button
          ref={buttonRef}
          onClick={onOpenInvitation}
          className="group relative px-8 sm:px-10 py-3 sm:py-4 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center mx-auto text-sm sm:text-base font-medium tracking-wide backdrop-blur-md border border-white/20 hover:border-white/30"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Glass reflection */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50"></div>

          {/* Content */}
          <span className="relative z-10 flex items-center">
            Buka Undangan
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>

          {/* Hover glow */}
          <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
}
