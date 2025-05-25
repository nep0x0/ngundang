'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
}

interface EventDetailsProps {
  akadNikah: Event;
  resepsi: Event;
}

export default function EventDetails({ akadNikah, resepsi }: EventDetailsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const akadRef = useRef<HTMLDivElement>(null);
  const resepsiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const akad = akadRef.current;
    const resepsi = resepsiRef.current;

    if (section && title && akad && resepsi) {
      gsap.fromTo(
        title,
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
        akad,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
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
        resepsi,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
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
    <div
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-gradient-to-b from-blue-100 to-white w-full overflow-x-hidden"
    >
      <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg border border-blue-200">
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl text-center font-serif mb-6 sm:mb-8 md:mb-10 text-blue-600">
          Jadwal Acara
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full">
          <div ref={akadRef} className="text-center p-4 sm:p-6 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-xl sm:text-2xl font-serif mb-3 sm:mb-4 text-blue-600">{akadNikah.title}</h3>
            <div className="mb-3 sm:mb-4">
              <p className="text-base sm:text-lg font-medium text-blue-700">{akadNikah.date}</p>
              <p className="text-sm sm:text-base text-blue-500">{akadNikah.time}</p>
            </div>
            <div>
              <p className="text-base font-medium text-blue-700">{akadNikah.location}</p>
              <p className="text-sm sm:text-base text-blue-500">{akadNikah.address}</p>
            </div>
          </div>

          <div ref={resepsiRef} className="text-center p-4 sm:p-6 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-xl sm:text-2xl font-serif mb-3 sm:mb-4 text-blue-600">{resepsi.title}</h3>
            <div className="mb-3 sm:mb-4">
              <p className="text-base sm:text-lg font-medium text-blue-700">{resepsi.date}</p>
              <p className="text-sm sm:text-base text-blue-500">{resepsi.time}</p>
            </div>
            <div>
              <p className="text-base font-medium text-blue-700">{resepsi.location}</p>
              <p className="text-sm sm:text-base text-blue-500">{resepsi.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
