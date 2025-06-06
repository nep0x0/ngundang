'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { useSearchParams } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);
import Header from "@/components/Header";
import Quote from "@/components/Quote";
import CoupleInfo from "@/components/CoupleInfo";
import Story from "@/components/Story";
import EventDetails from "@/components/EventDetails";
import CountdownTimer from "@/components/CountdownTimer";

import LocationMap from "@/components/LocationMap";
import RSVP from "@/components/RSVP";
import RSVPPopup from "@/components/RSVPPopup";

import Bottom from "@/components/Bottom";
import AudioPlayer from "@/components/AudioPlayer";
import Loading from "@/components/Loading";
import Cover from "@/components/Cover";
import { useWeddingInfo, formatWeddingDate, formatTime, formatFamilyDescription, getDisplayMaps } from '@/hooks/useWeddingInfo';
import { guestService, rsvpService, Guest } from '@/lib/supabase';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showCover, setShowCover] = useState(true);

  // Get search params for invitation code
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get('code');

  // Personalization states
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [recipientName, setRecipientName] = useState<string>("Tamu Undangan");
  const [showRSVPPopup, setShowRSVPPopup] = useState(false);
  const [hasSubmittedRSVP, setHasSubmittedRSVP] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);

  // Ref untuk trigger refresh RSVP list
  const rsvpRefreshTrigger = useRef(0);

  // Fetch wedding info from database
  const { weddingInfo, loading: weddingLoading, error: weddingError } = useWeddingInfo();

  // Fetch guest data if invitation code is provided
  useEffect(() => {
    const fetchGuestData = async () => {
      if (invitationCode) {
        try {
          const guestData = await guestService.getByInvitationCode(invitationCode);
          if (guestData) {
            setGuest(guestData);
            setIsPersonalized(true);

            // Set personalized recipient name
            const guestName = guestData.partner
              ? `${guestData.name} & ${guestData.partner}`
              : guestData.name;
            setRecipientName(guestName);

            // Check if guest has already submitted RSVP
            setHasSubmittedRSVP(guestData.rsvp_submitted);

            // Check RSVP status from database
            const existingRSVP = await rsvpService.checkExisting(guestData.name);
            if (existingRSVP) {
              setHasSubmittedRSVP(true);
            }
          }
        } catch (error) {
          console.error('Error fetching guest data:', error);
          // Fallback to generic invitation if guest not found
          setIsPersonalized(false);
        }
      } else {
        // Legacy support for old URL format (?to=name)
        const toParam = searchParams.get('to') || searchParams.get('nama') || searchParams.get('guest');
        if (toParam) {
          let cleanName = decodeURIComponent(toParam);
          cleanName = cleanName.replace(/[<>]/g, '');
          cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
          setRecipientName(cleanName);
        }
      }
    };

    fetchGuestData();
  }, [invitationCode, searchParams]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleOpenInvitation = () => {
    setShowCover(false);
    // Memulai musik otomatis setelah user berinteraksi dengan halaman
    document.body.style.overflow = 'auto'; // Mengaktifkan scroll

    // Trigger custom event untuk memulai audio
    const audioStartEvent = new CustomEvent('startAudio');
    window.dispatchEvent(audioStartEvent);

    // Refresh ScrollTrigger setelah content muncul
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  const handleRSVPSubmit = () => {
    setHasSubmittedRSVP(true);
    setShowRSVPPopup(false);
    setShowThankYouPopup(true);

    // Auto-hide thank you popup after 5 seconds
    setTimeout(() => {
      setShowThankYouPopup(false);
    }, 5000);
  };

  const handleRSVPSuccess = () => {
    // Trigger refresh of RSVP list by incrementing the trigger
    rsvpRefreshTrigger.current += 1;
    // Force re-render by updating state
    setHasSubmittedRSVP(prev => prev);
  };

  // Generate dynamic wedding data from database or fallback to static
  const weddingData = weddingInfo ? {
    couple: {
      bride: {
        name: weddingInfo.bride_nickname,
        fullName: weddingInfo.bride_full_name,
        photo: "/images/mempelai-wanita.jpg",
        description: formatFamilyDescription(
          weddingInfo.bride_child_order,
          weddingInfo.bride_father,
          weddingInfo.bride_mother
        )
      },
      groom: {
        name: weddingInfo.groom_nickname,
        fullName: weddingInfo.groom_full_name,
        photo: "/images/mempelai-pria.jpg",
        description: formatFamilyDescription(
          weddingInfo.groom_child_order,
          weddingInfo.groom_father,
          weddingInfo.groom_mother
        )
      }
    },
    date: formatWeddingDate(weddingInfo.akad_date),
    events: {
      akadNikah: {
        title: "Akad Nikah",
        date: formatWeddingDate(weddingInfo.akad_date),
        time: formatTime(weddingInfo.akad_time),
        location: weddingInfo.akad_venue_name,
        address: weddingInfo.akad_venue_address
      },
      resepsi: {
        title: "Resepsi",
        date: formatWeddingDate(weddingInfo.resepsi_date),
        time: formatTime(weddingInfo.resepsi_time),
        location: weddingInfo.resepsi_venue_name,
        address: weddingInfo.resepsi_venue_address
      }
    },
    location: getDisplayMaps(weddingInfo),
    audio: "/audio/wedding-song.mp3",
    quote: {
      text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang.",
      source: "QS. Ar-Rum: 21",
      author: "Al-Quran"
    },
    story: [
      {
        year: "2023",
        title: "Pertemuan Pertama",
        description: "Kami bertemu dan saling mengenal untuk pertama kalinya. Pertemuan yang sederhana namun menjadi awal dari perjalanan cinta yang indah ini.",
        image: "/images/story1.jpg"
      },
      {
        year: "2024",
        title: "Menjalin Hubungan Serius",
        description: "Seiring berjalannya waktu, kami memutuskan untuk menjalin hubungan yang lebih serius. Kami saling mendukung dan merencanakan masa depan bersama dengan penuh kasih sayang.",
        image: "/images/story2.jpg"
      },
      {
        year: "2025",
        title: "Lamaran",
        description: "Dengan restu kedua orang tua dan keluarga besar, kami melaksanakan acara lamaran sebagai langkah awal menuju jenjang pernikahan yang sakral.",
        image: "/images/story3.jpg"
      }
    ],
    thankYouMessage: "Terima kasih atas doa dan restu yang telah diberikan untuk pernikahan kami. Kehadiran dan dukungan Anda sangat berarti bagi kami dalam memulai babak baru kehidupan ini."
  } : {
    // Fallback static data jika database belum loaded
    couple: {
      bride: {
        name: "Adelita",
        fullName: "Adelita",
        photo: "/images/mempelai-wanita.jpg",
        description: "Putri Kedua Dari Bapak Andi Kuswanto (Alm) & Ibu Yulita Anggraini"
      },
      groom: {
        name: "Ansyah",
        fullName: "Niansyah Eko Putra, S.Kom",
        photo: "/images/mempelai-pria.jpg",
        description: "Putra pertama dari Bapak M.Syarkawi, A.Md dan Ibu Jatmi Asmarani, A.Md"
      }
    },
    date: "Jumat, 19 Desember 2025",
    events: {
      akadNikah: {
        title: "Akad Nikah",
        date: "Jumat, 19 Desember 2025",
        time: "08:00 - 11:00 WIB",
        location: "Kediaman Mempelai Wanita",
        address: "Jl. Dr. Sumbiyono RT 11 NO. 35 Kelurahan Jelutung Kecamatan Jelutung, Kota Jambi"
      },
      resepsi: {
        title: "Resepsi",
        date: "Jumat, 19 Desember 2025",
        time: "13:30 - 16:00 WIB",
        location: "Kediaman Mempelai Wanita",
        address: "Jl. Dr. Sumbiyono RT 11 NO. 35 Kelurahan Jelutung Kecamatan Jelutung, Kota Jambi"
      }
    },
    location: {
      showAkad: true,
      showResepsi: false,
      akadUrl: "https://www.google.com/maps/place/1%C2%B036'53.0%22S+103%C2%B037'06.4%22E/@-1.6147901,103.6184471,20z/data=!4m4!3m3!8m2!3d-1.6147192!4d103.6184381?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D",
      akadEmbedUrl: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637257!5m2!1sid!2sid",
      resepsiUrl: null,
      resepsiEmbedUrl: null
    },
    audio: "/audio/wedding-song.mp3",
    quote: {
      text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang.",
      source: "QS. Ar-Rum: 21",
      author: "Al-Quran"
    },
    story: [
      {
        year: "2023",
        title: "Pertemuan Pertama",
        description: "Kami bertemu dan saling mengenal untuk pertama kalinya. Pertemuan yang sederhana namun menjadi awal dari perjalanan cinta yang indah ini.",
        image: "/images/story1.jpg"
      },
      {
        year: "2024",
        title: "Menjalin Hubungan Serius",
        description: "Seiring berjalannya waktu, kami memutuskan untuk menjalin hubungan yang lebih serius. Kami saling mendukung dan merencanakan masa depan bersama dengan penuh kasih sayang.",
        image: "/images/story2.jpg"
      },
      {
        year: "2025",
        title: "Lamaran",
        description: "Dengan restu kedua orang tua dan keluarga besar, kami melaksanakan acara lamaran sebagai langkah awal menuju jenjang pernikahan yang sakral.",
        image: "/images/story3.jpg"
      }
    ],
    thankYouMessage: "Terima kasih atas doa dan restu yang telah diberikan untuk pernikahan kami. Kehadiran dan dukungan Anda sangat berarti bagi kami dalam memulai babak baru kehidupan ini."
  };

  // Intersection Observer for RSVP popup trigger
  useEffect(() => {
    if (!showCover && isPersonalized && !hasSubmittedRSVP) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShowRSVPPopup(true);
            }
          });
        },
        { threshold: 0.5 }
      );

      // Find location section (we'll add ID to it)
      const locationSection = document.getElementById('location-section');
      if (locationSection) {
        observer.observe(locationSection);
      }

      return () => {
        if (locationSection) {
          observer.unobserve(locationSection);
        }
      };
    }
  }, [showCover, isPersonalized, hasSubmittedRSVP]);

  // Mengatur overflow hidden saat menampilkan cover
  useEffect(() => {
    if (showCover) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      document.body.style.height = 'auto';
      // Force scroll to top when opening invitation
      window.scrollTo(0, 0);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      document.body.style.height = 'auto';
    };
  }, [showCover]);

  return (
    <div className="font-sans w-full overflow-x-hidden">
      {/* Loading Screen */}
      {(isLoading || weddingLoading) && (
        <Loading onLoadingComplete={handleLoadingComplete} />
      )}

      {/* Error State */}
      {weddingError && !weddingLoading && (
        <div className="fixed inset-0 bg-red-50 flex items-center justify-center z-50">
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Wedding Info</h2>
            <p className="text-red-500 mb-4">{weddingError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Cover Screen */}
      {!isLoading && showCover && (
        <Cover
          brideNames={{
            bride: weddingData.couple.bride.name,
            groom: weddingData.couple.groom.name
          }}
          onOpenInvitation={handleOpenInvitation}
          recipientName={recipientName}
        />
      )}

      {/* Main Content - hanya ditampilkan setelah cover dibuka */}
      <div
        className={`main-content transition-opacity duration-1000 w-full overflow-x-hidden min-h-screen ${!showCover ? 'opacity-100 relative z-10' : 'opacity-0 pointer-events-none absolute inset-0'}`}
        style={{
          visibility: !showCover ? 'visible' : 'hidden',
          display: !showCover ? 'block' : 'none'
        }}
      >
        <Header
          brideNames={{
            bride: weddingData.couple.bride.name,
            groom: weddingData.couple.groom.name
          }}
          weddingDate={weddingData.date}
        />

        {/* 1. Quote */}
        <Quote
          quote={weddingData.quote.text}
          source={weddingData.quote.source}
          author={weddingData.quote.author}
        />

        {/* 2. Couple Profile */}
        <CoupleInfo
          bride={weddingData.couple.bride}
          groom={weddingData.couple.groom}
        />

        {/* 3. Story perjalanan mempelai */}
        <Story stories={weddingData.story} />

        {/* 4. Wedding Detail */}
        <EventDetails
          akadNikah={weddingData.events.akadNikah}
          resepsi={weddingData.events.resepsi}
        />

        <CountdownTimer targetDate={weddingInfo?.akad_date || "2025-12-19"} />

        {/* Dynamic Location Maps based on configuration */}
        <div id="location-section">
          {weddingData.location.showAkad && (
            <LocationMap
              title="Lokasi Akad Nikah"
              mapEmbedUrl={weddingData.location.akadEmbedUrl || ""}
              locationName={weddingData.events.akadNikah.location}
              locationAddress={weddingData.events.akadNikah.address}
              googleMapsUrl={weddingData.location.akadUrl || ""}
            />
          )}

          {weddingData.location.showResepsi && (
            <LocationMap
              title="Lokasi Resepsi"
              mapEmbedUrl={weddingData.location.resepsiEmbedUrl || ""}
              locationName={weddingData.events.resepsi.location}
              locationAddress={weddingData.events.resepsi.address}
              googleMapsUrl={weddingData.location.resepsiUrl || ""}
            />
          )}
        </div>

        {/* 5. RSVP Section - Always show for chat functionality */}
        <RSVP key={rsvpRefreshTrigger.current} />

        {/* 6. Bottom */}
        <Bottom
          brideNames={{
            bride: weddingData.couple.bride.name,
            groom: weddingData.couple.groom.name
          }}
          weddingDate={weddingData.date}
          thankYouMessage={weddingData.thankYouMessage}
        />
      </div>

      {/* RSVP Popup for personalized invitations */}
      {showRSVPPopup && isPersonalized && guest && !hasSubmittedRSVP && (
        <RSVPPopup
          guest={guest}
          onClose={() => setShowRSVPPopup(false)}
          onSubmit={handleRSVPSubmit}
          onRSVPSuccess={handleRSVPSuccess}
        />
      )}

      {/* Thank You Popup */}
      {showThankYouPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-slate-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">✅ Terima Kasih!</h3>
                  <p className="text-blue-100 text-sm">Konfirmasi berhasil dikirim</p>
                </div>
                <button
                  onClick={() => setShowThankYouPopup(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-gray-700 leading-relaxed">
                Terima kasih <span className="font-semibold text-blue-700">{recipientName}</span> atas konfirmasi kehadirannya.
                Kami sangat menantikan kehadiran Anda di hari bahagia kami.
              </p>
              <div className="mt-6 text-xs text-gray-500">
                Popup ini akan hilang otomatis dalam 5 detik
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player - selalu ditampilkan */}
      <AudioPlayer audioSrc={weddingData.audio} />
    </div>
  );
}
