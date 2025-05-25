'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const gallery = galleryRef.current;
    const imageElements = imageRefs.current.filter(Boolean);

    if (section && title && gallery && imageElements.length) {
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
        imageElements,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: gallery,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, []);

  const openLightbox = (src: string) => {
    setSelectedImage(src);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  return (
    <div ref={sectionRef} className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-white w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl text-center font-serif mb-6 sm:mb-8 md:mb-10 text-blue-600">
          Galeri Foto
        </h2>

        <div
          ref={galleryRef}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full"
        >
          {images.map((image, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) {
                  imageRefs.current[index] = el;
                }
              }}
              className="aspect-square overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-blue-100"
              onClick={() => openLightbox(image.src)}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-serif text-blue-500">Photo {index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl z-10"
            onClick={closeLightbox}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="w-full max-w-4xl h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-300/30 to-blue-400/30">
            <span className="text-2xl sm:text-3xl md:text-4xl font-serif text-white">Photo Preview</span>
          </div>
        </div>
      )}
    </div>
  );
}
