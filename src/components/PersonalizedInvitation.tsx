'use client';

import { useState, useEffect } from 'react';
import { Guest, rsvpService } from '@/lib/supabase';
import RSVPPopup from './RSVPPopup';

interface PersonalizedInvitationProps {
  guest: Guest;
}

export default function PersonalizedInvitation({ guest }: PersonalizedInvitationProps) {
  const [showRSVPPopup, setShowRSVPPopup] = useState(false);
  const [hasSubmittedRSVP, setHasSubmittedRSVP] = useState(guest.rsvp_submitted);

  useEffect(() => {
    // Check if guest has already submitted RSVP
    const checkRSVPStatus = async () => {
      try {
        const existingRSVP = await rsvpService.checkExisting(guest.name);
        if (existingRSVP) {
          setHasSubmittedRSVP(true);
        }
      } catch (error) {
        console.error('Error checking RSVP status:', error);
      }
    };

    checkRSVPStatus();
  }, [guest.name]);

  useEffect(() => {
    // Intersection Observer to detect when user scrolls to location section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasSubmittedRSVP) {
            setShowRSVPPopup(true);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    // Find location section
    const locationSection = document.getElementById('location-section');
    if (locationSection) {
      observer.observe(locationSection);
    }

    return () => {
      if (locationSection) {
        observer.unobserve(locationSection);
      }
    };
  }, [hasSubmittedRSVP]);

  const handleRSVPSubmit = () => {
    setHasSubmittedRSVP(true);
    setShowRSVPPopup(false);
  };

  const guestName = guest.partner ? `${guest.name} & ${guest.partner}` : guest.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
      {/* Personalized Header */}
      <section className="text-center py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-serif text-gray-800 mb-4">
              Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
            </h1>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-200/50">
              <p className="text-lg text-gray-700 mb-2">Kepada Yth.</p>
              <h2 className="text-xl md:text-2xl font-semibold text-rose-800 mb-2">
                Bapak/Ibu/Saudara/i
              </h2>
              <h3 className="text-2xl md:text-3xl font-bold text-rose-900">
                {guestName}
              </h3>
              <p className="text-gray-600 mt-2">Di tempat</p>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <p className="text-gray-700 leading-relaxed">
              Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i 
              untuk hadir di acara pernikahan kami
            </p>
          </div>
        </div>
      </section>

      {/* Wedding Content - You can import your existing wedding content here */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-8">
            The Wedding of
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-rose-800 mb-2">Adelita</h3>
              <p className="text-gray-600">Putri dari Bpk. Andi & Ibu Yulita</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-blue-800 mb-2">Ansyah</h3>
              <p className="text-gray-600">Putra dari Bpk. Ahmad & Ibu Siti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section - This will trigger RSVP popup */}
      <section id="location-section" className="py-16 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-center text-gray-800 mb-12">
            Lokasi Acara
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Akad Nikah</h3>
              <p className="text-gray-600 mb-2">📅 Sabtu, 15 Februari 2025</p>
              <p className="text-gray-600 mb-2">🕐 08:00 WIB</p>
              <p className="text-gray-600 mb-4">📍 Masjid Al-Ikhlas</p>
              <p className="text-sm text-gray-500">
                Jl. Masjid No. 45, Jakarta Selatan
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resepsi</h3>
              <p className="text-gray-600 mb-2">📅 Sabtu, 15 Februari 2025</p>
              <p className="text-gray-600 mb-2">🕐 11:00 WIB</p>
              <p className="text-gray-600 mb-4">📍 Gedung Serbaguna</p>
              <p className="text-sm text-gray-500">
                Jl. Raya No. 123, Jakarta Selatan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thank You Section (shown if RSVP already submitted) */}
      {hasSubmittedRSVP && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 shadow-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Terima Kasih!
              </h3>
              <p className="text-green-700">
                Terima kasih {guestName} atas konfirmasi kehadirannya. 
                Kami sangat menantikan kehadiran Anda di hari bahagia kami.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* RSVP Popup */}
      {showRSVPPopup && !hasSubmittedRSVP && (
        <RSVPPopup
          guest={guest}
          onClose={() => setShowRSVPPopup(false)}
          onSubmit={handleRSVPSubmit}
        />
      )}
    </div>
  );
}
