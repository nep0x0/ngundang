'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

interface HeaderProps {
  brideNames: {
    bride: string;
    groom: string;
  };
  // weddingDate dihapus
}

export default function Header({ brideNames }: HeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // dateRef dihapus

  useEffect(() => {
    const header = headerRef.current;
    const photo = photoRef.current;
    const title = titleRef.current;
    // dateRef dihapus

    if (header && photo && title) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        header,
        { opacity: 0 },
        { opacity: 1, duration: 1.5 }
      )
        .fromTo(
          photo,
          { opacity: 0, scale: 0.8, rotateY: 45 },
          { opacity: 1, scale: 1, rotateY: 0, duration: 1.2, ease: "back.out(1.7)" },
          '-=1'
        )
        .fromTo(
          title,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.8'
        );
    }
  }, []);

  return (
    <div
      ref={headerRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center text-center px-0 bg-white overflow-x-hidden"
    >
      <div className="relative z-10 text-gray-800 w-full max-w-4xl mx-auto px-3 sm:px-4 py-10">
        {/* Photo Frame - Arch Style */}
        <div
          ref={photoRef}
          className="mb-16 sm:mb-20 flex justify-center"
          style={{ perspective: '1000px' }}
        >
          <div className="relative w-80 h-[28rem] sm:w-96 sm:h-[36rem] md:w-[28rem] md:h-[40rem] lg:w-[32rem] lg:h-[44rem]">
            {/* Large Arch Frame */}
            <div className="absolute inset-0 border-4 border-blue-300 bg-transparent shadow-lg overflow-hidden rounded-t-full">
              {/* Photo Container - No Gap */}
              <div className="absolute inset-0 overflow-hidden rounded-t-full">
                <Image
                  src="/images/swahaxadel-508.jpg"
                  alt="Adelita & Ansyah Wedding Photo"
                  fill
                  className="object-cover scale-150 -translate-x-5"
                  priority
                />
              </div>
            </div>
          </div>
          {/* Flower decorations */}
          <div className="absolute bottom-[-4rem] left-[1%] w-[180px] h-[180px]">
            <Image
              src="/images/bunga5.png"
              alt="Dekorasi bunga kiri"
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-[-4rem] right-[1%] w-[180px] h-[180px]">
            <Image
              src="/images/bunga5.png"
              alt="Dekorasi bunga kanan"
              fill
              className="object-contain scale-x-[-1]"
            />
          </div>
        </div>

        {/* Names */}
        <h1
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-6xl font-serif mb-4 md:mb-6 leading-tight text-blue-700"
        >
          {brideNames.bride} <span className="font-light text-blue-500">&</span> {brideNames.groom}
        </h1>
      </div>
    </div>
  );
}
