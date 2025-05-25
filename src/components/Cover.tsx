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
      className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center z-40 w-full h-full overflow-hidden"
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
      {/* Background dengan Gradasi dan Motif */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100"></div>

      {/* Layer Gradasi Tambahan */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 via-transparent to-blue-300/20"></div>

      {/* Motif Jawa dengan CSS */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px, 50px 50px',
          backgroundPosition: '0 0, 30px 30px, 10px 10px, 25px 25px'
        }}></div>
      </div>

      {/* Motif Bunga dengan CSS */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(ellipse 8px 12px at center, rgba(59, 130, 246, 0.15) 40%, transparent 50%),
            radial-gradient(ellipse 12px 8px at center, rgba(59, 130, 246, 0.15) 40%, transparent 50%),
            radial-gradient(ellipse 6px 10px at center, rgba(59, 130, 246, 0.1) 40%, transparent 50%)
          `,
          backgroundSize: '100px 100px, 120px 120px, 80px 80px',
          backgroundPosition: '0 0, 50px 50px, 25px 25px'
        }}></div>
      </div>

      {/* Pattern Batik Sederhana */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}></div>
      </div>

      {/* Overlay Gradasi Halus */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-50/30 to-blue-100/40"></div>

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
          <p className="text-base sm:text-lg md:text-xl uppercase tracking-[0.4em] text-blue-600 mb-8 sm:mb-12 md:mb-16 font-light">
            THE WEDDING OF
          </p>

          <h1 ref={nameRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif mb-6 sm:mb-8 md:mb-12 text-blue-700 leading-tight font-normal">
            <span className="font-light italic">{brideNames.bride}</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-blue-400 font-extralight my-2 sm:my-3 md:my-4">&</span>
            <span className="font-light italic">{brideNames.groom}</span>
          </h1>
        </div>

        <div ref={recipientRef} className="mb-10 sm:mb-12 md:mb-16">
          <p className="text-blue-600 mb-3 text-sm sm:text-base md:text-lg font-light tracking-wide uppercase">Kepada YTH:</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-blue-700 font-serif italic">{recipientName}</p>
        </div>

        <button
          ref={buttonRef}
          onClick={onOpenInvitation}
          className="group relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-full hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 active:from-blue-800 active:via-blue-900 active:to-blue-950 transition-all duration-700 shadow-lg hover:shadow-xl border border-blue-400/30 hover:border-blue-300/50 backdrop-blur-sm transform hover:scale-102 active:scale-98 flex items-center justify-center mx-auto text-sm sm:text-base font-light tracking-[0.15em] uppercase overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 50%, rgba(29, 78, 216, 1) 100%)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

          {/* Content */}
          <span className="relative z-10 flex items-center">
            Buka Undangan
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/0 via-blue-300/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </div>
    </div>
  );
}
