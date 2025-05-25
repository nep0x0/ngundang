'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RSVP() {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const form = formRef.current;

    if (section && title && form) {
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
        form,
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
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form
      setName('');
      setAttendance('');
      setNumberOfGuests(1);
      setMessage('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div ref={sectionRef} className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-white w-full overflow-x-hidden">
      <div className="w-full max-w-3xl mx-auto">
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl text-center font-serif mb-4 sm:mb-6 md:mb-8 text-blue-600">
          RSVP
        </h2>

        <p className="text-center text-sm sm:text-base text-blue-500 mb-4 sm:mb-6 md:mb-8">
          Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan acara dengan baik.
        </p>

        {submitSuccess && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 text-blue-700 rounded-lg text-center text-sm sm:text-base border border-blue-200">
            Terima kasih! RSVP Anda telah kami terima.
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block mb-1 sm:mb-2 text-sm sm:text-base text-blue-600">
              Nama
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label htmlFor="attendance" className="block mb-1 sm:mb-2 text-sm sm:text-base text-blue-600">
              Kehadiran
            </label>
            <select
              id="attendance"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            >
              <option value="">Pilih</option>
              <option value="hadir">Akan Hadir</option>
              <option value="tidak_hadir">Tidak Dapat Hadir</option>
              <option value="mungkin">Mungkin Hadir</option>
            </select>
          </div>

          {attendance === 'hadir' && (
            <div>
              <label htmlFor="guests" className="block mb-1 sm:mb-2 text-sm sm:text-base text-blue-600">
                Jumlah Tamu (termasuk Anda)
              </label>
              <input
                type="number"
                id="guests"
                min="1"
                max="5"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <label htmlFor="message" className="block mb-1 sm:mb-2 text-sm sm:text-base text-blue-600">
              Ucapan & Doa
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            ></textarea>
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white text-sm sm:text-base rounded-full hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim RSVP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
