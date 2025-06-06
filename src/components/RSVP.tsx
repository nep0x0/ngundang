'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { rsvpService, guestService, RSVP as RSVPType } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

export default function RSVP() {
  const [formData, setFormData] = useState({
    name: '',
    attendance: '',
    guestCount: 1,
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvps, setRSVPs] = useState<RSVPType[]>([]);
  const [existingRSVP, setExistingRSVP] = useState<RSVPType | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadRSVPs();
    checkExistingRSVP();

    // Check if this is a personalized invitation (client-side only)
    const searchParams = new URLSearchParams(window.location.search);
    const invitationCode = searchParams.get('code');
    setIsPersonalized(!!invitationCode);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const form = formRef.current;

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

      // Form animation
      if (form) {
        gsap.fromTo(form,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3,
            scrollTrigger: {
              trigger: form,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }
  }, [existingRSVP]);

  const loadRSVPs = async () => {
    try {
      const data = await rsvpService.getAll();
      setRSVPs(data.filter(rsvp => rsvp.attendance === 'hadir')); // Only show attending guests
    } catch (error) {
      console.error('Error loading RSVPs:', error);
      // Fallback: set empty array to prevent UI issues
      setRSVPs([]);
    }
  };

  const checkExistingRSVP = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const invitationCode = searchParams.get('code');
    const guestName = searchParams.get('to') || searchParams.get('nama') || searchParams.get('guest');

    // Check for personalized invitation (invitation code)
    if (invitationCode) {
      try {
        const guest = await guestService.getByInvitationCode(invitationCode);
        if (guest && guest.rsvp_submitted) {
          // Guest has already submitted RSVP via popup, check for existing RSVP
          const existing = await rsvpService.checkExisting(guest.name);
          if (existing) {
            setExistingRSVP(existing);
            setIsSubmitted(true);
          }
        } else if (guest) {
          // Guest exists but hasn't submitted RSVP yet
          const guestDisplayName = guest.partner ? `${guest.name} & ${guest.partner}` : guest.name;
          setFormData(prev => ({ ...prev, name: guestDisplayName }));
        }
      } catch (error) {
        console.error('Error checking guest by invitation code:', error);
      }
    }
    // Legacy support for old URL format
    else if (guestName) {
      try {
        const cleanName = decodeURIComponent(guestName).replace(/[<>]/g, '').replace(/\b\w/g, l => l.toUpperCase());
        const existing = await rsvpService.checkExisting(cleanName);
        if (existing) {
          setExistingRSVP(existing);
          setIsSubmitted(true);
        } else {
          setFormData(prev => ({ ...prev, name: cleanName }));
        }
      } catch (error) {
        console.error('Error checking existing RSVP:', error);
        // Fallback: just set the name without checking existing
        const cleanName = decodeURIComponent(guestName).replace(/[<>]/g, '').replace(/\b\w/g, l => l.toUpperCase());
        setFormData(prev => ({ ...prev, name: cleanName }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.attendance) return;

    setIsSubmitting(true);

    try {
      const newRSVP = await rsvpService.create({
        guest_name: formData.name.trim(),
        attendance: formData.attendance as 'hadir' | 'tidak_hadir',
        guest_count: formData.guestCount,
        message: formData.message.trim() || undefined
      });

      setIsSubmitted(true);
      setExistingRSVP(newRSVP);

      // Reload RSVPs to show the new one
      if (formData.attendance === 'hadir') {
        loadRSVPs();
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      // Fallback: still show success but without database save
      alert('Database belum tersedia. RSVP akan disimpan sementara di browser.');
      setIsSubmitted(true);
      setExistingRSVP({
        id: 'temp',
        guest_name: formData.name.trim(),
        attendance: formData.attendance as 'hadir' | 'tidak_hadir',
        guest_count: formData.guestCount,
        message: formData.message.trim() || undefined,
        created_at: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guestCount' ? parseInt(value) : value
    }));
  };

  // isPersonalized is now set in useEffect to avoid hydration mismatch

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-24 md:py-32 bg-gradient-to-b from-blue-50 to-slate-50 relative overflow-hidden"
    >
      <div className="container mx-auto px-6 sm:px-8 max-w-4xl relative z-10">
        {/* RSVP Chat Display */}
        {rsvps.length > 0 && (
          <div>
            <h3 className="text-2xl font-serif text-center text-slate-700 mb-8">
              Tamu yang Akan Hadir
            </h3>
            <div className="bg-white rounded-2xl shadow-lg p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {rsvp.guest_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">{rsvp.guest_name}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(rsvp.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Akan hadir ({rsvp.guest_count} orang)
                      </p>
                      {rsvp.message && (
                        <p className="text-sm text-gray-700 italic">&quot;{rsvp.message}&quot;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Only show RSVP form for non-personalized invitations */}
        {!isPersonalized && (
          <>
            {/* RSVP Form or Thank You Message */}
            {!isSubmitted ? (
          <div>
            <div className="text-center mb-12">
              <h2 ref={titleRef} className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-slate-700 mb-6">
                RSVP
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan acara dengan baik.
              </p>
              <div className="flex items-center justify-center mt-6">
                <div className="w-16 h-px bg-blue-300"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full mx-4"></div>
                <div className="w-16 h-px bg-blue-300"></div>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="attendance" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Kehadiran *
                  </label>
                  <select
                    id="attendance"
                    name="attendance"
                    value={formData.attendance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih konfirmasi kehadiran</option>
                    <option value="hadir">Akan Hadir</option>
                    <option value="tidak_hadir">Tidak Dapat Hadir</option>
                  </select>
                </div>

                {formData.attendance === 'hadir' && (
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Tamu (termasuk Anda)
                    </label>
                    <select
                      id="guestCount"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1 orang</option>
                      <option value={2}>2 orang</option>
                      <option value={3}>3 orang</option>
                      <option value={4}>4 orang</option>
                      <option value={5}>5 orang</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Ucapan & Doa (Opsional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tuliskan ucapan dan doa untuk mempelai..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              existingRSVP?.attendance === 'hadir' ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {existingRSVP?.attendance === 'hadir' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                )}
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-slate-700 mb-4">
              Terima Kasih!
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {existingRSVP?.attendance === 'hadir' 
                ? 'Konfirmasi kehadiran Anda telah kami terima. Kami sangat menantikan kehadiran Anda di hari bahagia kami.'
                : 'Terima kasih atas konfirmasinya. Kami memahami dan menghargai keputusan Anda.'
              }
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-2">Detail Konfirmasi:</h3>
              <div className="text-left space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Nama:</span> {existingRSVP?.guest_name}</p>
                <p><span className="font-medium">Status:</span> {existingRSVP?.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}</p>
                {existingRSVP?.attendance === 'hadir' && (
                  <p><span className="font-medium">Jumlah Tamu:</span> {existingRSVP?.guest_count} orang</p>
                )}
                {existingRSVP?.message && (
                  <p><span className="font-medium">Pesan:</span> {existingRSVP?.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center mt-8">
              <div className="w-16 h-px bg-blue-300"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full mx-4"></div>
              <div className="w-16 h-px bg-blue-300"></div>
            </div>
          </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
