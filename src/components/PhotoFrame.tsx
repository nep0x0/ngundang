'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PhotoFrameProps {
  imageSrc: string;
  alt?: string;
}

export default function PhotoFrame({ imageSrc, alt = "Wedding Photo" }: PhotoFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const frame = frameRef.current;
    const image = imageRef.current;

    if (container && frame && image) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate frame first
      tl.fromTo(frame,
        { opacity: 0, scale: 0.8, rotateY: 45 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 1.2, ease: "back.out(1.7)" }
      );

      // Then animate image
      tl.fromTo(image,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 0.8 },
        "-=0.6"
      );
    }
  }, []);

  return (
    <section 
      ref={containerRef}
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-slate-50 to-blue-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 flex justify-center relative z-10">
        {/* Window Frame */}
        <div 
          ref={frameRef}
          className="relative"
          style={{ perspective: '1000px' }}
        >
          {/* Outer Frame - Window Style */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem]">
            {/* Main Frame */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 via-slate-100 to-white shadow-2xl border-8 border-white">
              {/* Inner Shadow Ring */}
              <div className="absolute inset-4 rounded-full shadow-inner bg-gradient-to-br from-slate-50 to-white"></div>
              
              {/* Window Panes - Cross Pattern */}
              <div className="absolute inset-6 rounded-full overflow-hidden">
                {/* Vertical Divider */}
                <div className="absolute left-1/2 top-4 bottom-4 w-2 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 transform -translate-x-1/2 shadow-md"></div>
                
                {/* Horizontal Divider */}
                <div className="absolute top-1/2 left-4 right-4 h-2 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 transform -translate-y-1/2 shadow-md"></div>
                
                {/* Center Medallion */}
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white"></div>
              </div>

              {/* Photo Container */}
              <div 
                ref={imageRef}
                className="absolute inset-8 rounded-full overflow-hidden shadow-xl"
              >
                <Image
                  src={imageSrc}
                  alt={alt}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Photo Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10"></div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg border-2 border-white"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg border-2 border-white"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg border-2 border-white"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg border-2 border-white"></div>
            </div>

            {/* Outer Decorative Ring */}
            <div className="absolute -inset-4 rounded-full border-4 border-blue-200/50"></div>
            <div className="absolute -inset-6 rounded-full border-2 border-blue-100/30"></div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-8 left-1/4 w-4 h-4 bg-blue-300 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-8 right-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/4 -left-8 w-2 h-2 bg-blue-500 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 -right-8 w-3 h-3 bg-blue-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center">
        <div className="w-16 h-px bg-blue-300"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full mx-4"></div>
        <div className="w-16 h-px bg-blue-300"></div>
      </div>
    </section>
  );
}
