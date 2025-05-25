'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Intro from "@/components/Intro";
import CoupleInfo from "@/components/CoupleInfo";
import EventDetails from "@/components/EventDetails";
import CountdownTimer from "@/components/CountdownTimer";
import Gallery from "@/components/Gallery";
import LocationMap from "@/components/LocationMap";
import RSVP from "@/components/RSVP";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import Loading from "@/components/Loading";
import Cover from "@/components/Cover";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showCover, setShowCover] = useState(true);

  // Mendapatkan nama penerima dari URL query parameter (jika ada)
  const [recipientName, setRecipientName] = useState<string>("Tamu Undangan");

  useEffect(() => {
    // Mendapatkan nama penerima dari URL query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const toParam = searchParams.get('to');
    if (toParam) {
      setRecipientName(decodeURIComponent(toParam));
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleOpenInvitation = () => {
    setShowCover(false);
    // Memulai musik otomatis setelah user berinteraksi dengan halaman
    document.body.style.overflow = 'auto'; // Mengaktifkan scroll
  };

  // Data untuk undangan pernikahan
  const weddingData = {
    couple: {
      bride: {
        name: "Adelita",
        fullName: "Adelita Putri Maharani, S.Pd",
        photo: "/images/bride.jpg",
        description: "Putri pertama dari Bapak Hendra Wijaya dan Ibu Siti Rahayu",
        socialMedia: {
          instagram: "adelita_putri"
        }
      },
      groom: {
        name: "Ansyah",
        fullName: "Ansyah Rizky Pratama, S.T",
        photo: "/images/groom.jpg",
        description: "Putra kedua dari Bapak Joko Susanto dan Ibu Wati Handayani",
        socialMedia: {
          instagram: "ansyah_rizky"
        }
      }
    },
    date: "Sabtu, 15 Juni 2024",
    events: {
      akadNikah: {
        title: "Akad Nikah",
        date: "Sabtu, 15 Juni 2024",
        time: "08:00 - 10:00 WIB",
        location: "Masjid Al-Hikmah",
        address: "Jl. Kenanga No. 123, Jakarta Selatan"
      },
      resepsi: {
        title: "Resepsi",
        date: "Sabtu, 15 Juni 2024",
        time: "11:00 - 14:00 WIB",
        location: "Gedung Serbaguna Anggrek",
        address: "Jl. Anggrek No. 45, Jakarta Selatan"
      }
    },
    location: {
      title: "Lokasi Acara",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2904388242364!2d106.82687507418235!3d-6.226305993770337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3f03a962d85%3A0x2e7c2c43a9d9f9d1!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1682329193229!5m2!1sid!2sid",
      locationName: "Gedung Serbaguna Anggrek",
      locationAddress: "Jl. Anggrek No. 45, Jakarta Selatan",
      googleMapsUrl: "https://goo.gl/maps/1JmxYy9PBBt9tLmS6"
    },
    gallery: [
      { src: "/images/gallery1.jpg", alt: "Foto Prewedding 1" },
      { src: "/images/gallery2.jpg", alt: "Foto Prewedding 2" },
      { src: "/images/gallery3.jpg", alt: "Foto Prewedding 3" },
      { src: "/images/gallery4.jpg", alt: "Foto Prewedding 4" },
      { src: "/images/gallery5.jpg", alt: "Foto Prewedding 5" },
      { src: "/images/gallery6.jpg", alt: "Foto Prewedding 6" }
    ],
    audio: "/audio/wedding-song.mp3",
    introMessage: "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami. Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.",
    footerMessage: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."
  };

  // Mengatur overflow hidden saat menampilkan cover
  useEffect(() => {
    if (showCover) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCover]);

  return (
    <div className="font-sans w-full overflow-x-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <Loading onLoadingComplete={handleLoadingComplete} />
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
      <div className={`transition-opacity duration-1000 w-full overflow-x-hidden ${!showCover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Header
          brideNames={{
            bride: weddingData.couple.bride.name,
            groom: weddingData.couple.groom.name
          }}
          weddingDate={weddingData.date}
        />

        <Intro message={weddingData.introMessage} />

        <CoupleInfo
          bride={weddingData.couple.bride}
          groom={weddingData.couple.groom}
        />

        <EventDetails
          akadNikah={weddingData.events.akadNikah}
          resepsi={weddingData.events.resepsi}
        />

        <CountdownTimer targetDate="2024-06-15" />

        <Gallery images={weddingData.gallery} />

        <LocationMap
          title={weddingData.location.title}
          mapEmbedUrl={weddingData.location.mapEmbedUrl}
          locationName={weddingData.location.locationName}
          locationAddress={weddingData.location.locationAddress}
          googleMapsUrl={weddingData.location.googleMapsUrl}
        />

        <RSVP />

        <Footer
          coupleNames={`${weddingData.couple.bride.name} & ${weddingData.couple.groom.name}`}
          weddingDate={weddingData.date}
          message={weddingData.footerMessage}
        />
      </div>

      {/* Audio Player - selalu ditampilkan */}
      <AudioPlayer audioSrc={weddingData.audio} />
    </div>
  );
}
