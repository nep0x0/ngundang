'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface QuoteProps {
  quote: string;
  source: string;
  author?: string;
}

export default function Quote({ quote, source, author }: QuoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const sourceRef = useRef<HTMLParagraphElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const quoteEl = quoteRef.current;
    const sourceEl = sourceRef.current;
    const decor = decorRef.current;

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

        if (decor) {
          tl.fromTo(decor,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.8 }
          );
        }

        if (quoteEl) {
          tl.fromTo(quoteEl,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1 },
            "-=0.5"
          );
        }

        if (sourceEl) {
          tl.fromTo(sourceEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8 },
            "-=0.3"
          );
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-24 md:py-32 bg-gradient-to-b from-blue-50 to-slate-50 relative overflow-hidden"
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

      <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center relative z-10">
        {/* Decorative Quote Mark */}
        <div ref={decorRef} className="mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
            </svg>
          </div>
        </div>

        {/* Quote Text */}
        <p
          ref={quoteRef}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-slate-700 leading-relaxed mb-8 sm:mb-12 italic"
        >
          "{quote}"
        </p>

        {/* Source */}
        <div ref={sourceRef} className="space-y-2">
          <p className="text-lg sm:text-xl text-blue-600 font-medium">
            {source}
          </p>
          {author && (
            <p className="text-base sm:text-lg text-slate-500 font-light">
              - {author}
            </p>
          )}
        </div>

        {/* Decorative Line */}
        <div className="mt-12 sm:mt-16 flex items-center justify-center">
          <div className="w-16 h-px bg-blue-300"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full mx-4"></div>
          <div className="w-16 h-px bg-blue-300"></div>
        </div>
      </div>
    </section>
  );
}
