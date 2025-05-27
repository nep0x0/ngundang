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

    // Add delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (container) {
        // Refresh ScrollTrigger
        ScrollTrigger.refresh();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
            refreshPriority: -1
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
    }, 400);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
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

        {/* Social Media or Contact */}
        <div className="mb-12 sm:mb-16">
          <p className="text-sm sm:text-base text-slate-500 mb-6">
            Ikuti perjalanan kami selanjutnya
          </p>
          <div className="flex items-center justify-center space-x-6">
            {/* Instagram */}
            <a
              href="#"
              className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="#"
              className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </a>
          </div>
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
