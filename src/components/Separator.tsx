'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SeparatorProps {
  imageSrc: string;
  title?: string;
  subtitle?: string;
}

export default function Separator({ imageSrc, title, subtitle }: SeparatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;

    if (container && image) {
      // Parallax effect for image
      gsap.fromTo(image, 
        { y: 50, scale: 1.1 },
        {
          y: -50,
          scale: 1,
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );

      // Fade in animation for text
      if (titleEl) {
        gsap.fromTo(titleEl,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: titleEl,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      if (subtitleEl) {
        gsap.fromTo(subtitleEl,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3,
            scrollTrigger: {
              trigger: subtitleEl,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div ref={imageRef} className="absolute inset-0 w-full h-full">
        <Image
          src={imageSrc}
          alt="Wedding Photo"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 sm:px-8">
        {title && (
          <h2 
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-light mb-4 sm:mb-6"
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p 
            ref={subtitleRef}
            className="text-lg sm:text-xl md:text-2xl font-light tracking-wide opacity-90"
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-16 bg-white/50"></div>
        <div className="w-2 h-2 bg-white/70 rounded-full mx-auto mt-2"></div>
      </div>
    </section>
  );
}
