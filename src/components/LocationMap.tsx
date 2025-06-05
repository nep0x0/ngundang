'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LocationMapProps {
  title: string;
  mapEmbedUrl: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
}

export default function LocationMap({
  title,
  mapEmbedUrl,
  locationName,
  locationAddress,
  googleMapsUrl
}: LocationMapProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const map = mapRef.current;
    const info = infoRef.current;

    if (section && titleEl && map && info) {
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        map,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        info,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.4,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, []);

  return (
    <div ref={sectionRef} className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-blue-50 w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl text-center font-serif mb-6 sm:mb-8 md:mb-10 text-blue-600">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center w-full">
          <div ref={mapRef} className="w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">{locationName}</h3>
              <p className="text-sm text-blue-600 mb-6 leading-relaxed">{locationAddress}</p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>🗺️</span>
                <span>Lihat di Google Maps</span>
              </a>
            </div>
          </div>

          <div ref={infoRef} className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-serif mb-2 sm:mb-4 text-blue-700">{locationName}</h3>
            <p className="text-sm sm:text-base text-blue-500 mb-4 sm:mb-6">{locationAddress}</p>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white text-sm sm:text-base rounded-full hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
