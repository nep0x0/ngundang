'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BottomProps {
  brideNames: {
    bride: string;
    groom: string;
  };
  weddingDate: string;
  thankYouMessage?: string;
}

export default function Bottom({ brideNames, weddingDate, thankYouMessage }: BottomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bunga1Ref = useRef<HTMLDivElement>(null);
  const bunga2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const bunga1 = bunga1Ref.current;
    const bunga2 = bunga2Ref.current;

    if (container) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate flowers
      if (bunga1 && bunga2) {
        tl.fromTo([bunga1, bunga2],
          { opacity: 0, scale: 0.8, rotation: -10 },
          { opacity: 1, scale: 1, rotation: 0, duration: 1.2, stagger: 0.2 }
        );
      }

      // Animate content
      if (content) {
        tl.fromTo(content,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.8"
        );
      }
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center overflow-hidden"
    >
      {/* Background Pattern */}
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

      {/* Bunga Kiri Atas */}
      <div
        ref={bunga1Ref}
        className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 z-10"
      >
        <Image
          src="/images/bunga1.png"
          alt="Bunga 1"
          fill
          className="object-contain"
        />
      </div>

      {/* Bunga Kanan Bawah */}
      <div
        ref={bunga2Ref}
        className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 z-10"
      >
        <Image
          src="/images/bunga2.png"
          alt="Bunga 2"
          fill
          className="object-contain"
        />
      </div>

      {/* Main Content */}
      <div
        ref={contentRef}
        className="relative z-20 text-center px-6 sm:px-8 max-w-4xl mx-auto"
      >
        {/* Thank You Message */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-slate-700 mb-6 sm:mb-8">
            Thank You
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {thankYouMessage || "Terima kasih atas doa dan restu yang telah diberikan untuk pernikahan kami. Kehadiran dan dukungan Anda sangat berarti bagi kami."}
          </p>
        </div>

        {/* Couple Names */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-px bg-blue-300"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-4"></div>
            <div className="w-16 h-px bg-blue-300"></div>
          </div>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-blue-700 mb-4">
            {brideNames.bride} <span className="text-blue-400 font-extralight">&</span> {brideNames.groom}
          </h3>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-light">
            {weddingDate}
          </p>
        </div>



        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-400">
            Made with ❤️ for our special day
          </p>
        </div>
      </div>
    </section>
  );
}
