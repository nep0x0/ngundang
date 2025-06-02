'use client';

import { useState, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);
import Header from "@/components/Header";
import Quote from "@/components/Quote";
import CoupleInfo from "@/components/CoupleInfo";
import Story from "@/components/Story";
import EventDetails from "@/components/EventDetails";
import CountdownTimer from "@/components/CountdownTimer";

import LocationMap from "@/components/LocationMap";
import RSVP from "@/components/RSVP";

import Bottom from "@/components/Bottom";
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

    // Trigger custom event untuk memulai audio
    const audioStartEvent = new CustomEvent('startAudio');
    window.dispatchEvent(audioStartEvent);

    // Refresh ScrollTrigger setelah content muncul
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  // Data untuk undangan pernikahan
  const weddingData = {
    couple: {
      bride: {
        name: "Adelita",
        fullName: "Adelita",
        photo: "/images/mempelai-wanita.jpg",
        description: "Putri dari keluarga yang berbahagia"
      },
      groom: {
        name: "Niansyah",
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
      title: "Lokasi Acara",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6234567890123!2d103.6184471!3d-1.6147901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1682329193229!5m2!1sid!2sid",
      locationName: "Kediaman Mempelai Wanita",
      locationAddress: "Jl. Dr. Sumbiyono RT 11 NO. 35 Kelurahan Jelutung Kecamatan Jelutung, Kota Jambi",
      googleMapsUrl: "https://www.google.com/maps/place/1%C2%B036'53.0%22S+103%C2%B037'06.4%22E/@-1.6147901,103.6184471,20z/data=!4m4!3m3!8m2!3d-1.6147192!4d103.6184381?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"
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

        <CountdownTimer targetDate="2025-12-19" />

        <LocationMap
          title={weddingData.location.title}
          mapEmbedUrl={weddingData.location.mapEmbedUrl}
          locationName={weddingData.location.locationName}
          locationAddress={weddingData.location.locationAddress}
          googleMapsUrl={weddingData.location.googleMapsUrl}
        />

        {/* 5. RSVP */}
        <RSVP />

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

      {/* Audio Player - selalu ditampilkan */}
      <AudioPlayer audioSrc={weddingData.audio} />
    </div>
  );
}
