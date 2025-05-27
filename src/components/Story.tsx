'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StoryItem {
  year: string;
  title: string;
  description: string;
  image?: string;
}

interface StoryProps {
  stories: StoryItem[];
}

export default function Story({ stories }: StoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const timeline = timelineRef.current;

    if (container && title) {
      // Title animation
      gsap.fromTo(title,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: title,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Timeline items animation
      const items = timeline?.querySelectorAll('.story-item');
      if (items) {
        items.forEach((item, index) => {
          const isMobile = window.innerWidth < 768;
          gsap.fromTo(item,
            {
              opacity: 0,
              x: isMobile ? 0 : (index % 2 === 0 ? -50 : 50),
              y: isMobile ? 30 : 0
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 1,
              delay: index * 0.2,
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      }
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-blue-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px'
        }}></div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 max-w-6xl relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16 sm:mb-20">
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-slate-700 mb-6"
          >
            Our Love Story
          </h2>
          <div className="flex items-center justify-center">
            <div className="w-16 h-px bg-blue-300"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-4"></div>
            <div className="w-16 h-px bg-blue-300"></div>
          </div>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 hidden md:block"></div>

          {/* Timeline Items */}
          <div className="space-y-16 sm:space-y-20">
            {stories.map((story, index) => (
              <div
                key={index}
                className={`story-item flex flex-col md:flex-row items-center gap-8 md:gap-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
              >
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                      {story.year}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-light text-slate-700 mb-4">
                      {story.title}
                    </h3>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:block relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>

                {/* Image */}
                <div className="flex-1">
                  {story.image ? (
                    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                        <p className="text-blue-600 font-medium">{story.year}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
