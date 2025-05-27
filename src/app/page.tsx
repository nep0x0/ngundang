'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Intro from "@/components/Intro";
import Separator from "@/components/Separator";
import Quote from "@/components/Quote";
import CoupleInfo from "@/components/CoupleInfo";
import Story from "@/components/Story";
import EventDetails from "@/components/EventDetails";
import CountdownTimer from "@/components/CountdownTimer";
import Gallery from "@/components/Gallery";
import LocationMap from "@/components/LocationMap";
import RSVP from "@/components/RSVP";
import Footer from "@/components/Footer";
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
    footerMessage: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
    separator: {
      imageSrc: "/images/wedding-photo.jpg",
      title: "Our Wedding",
      subtitle: "A celebration of love"
    },
    quote: {
      text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang.",
      source: "QS. Ar-Rum: 21",
      author: "Al-Quran"
    },
    story: [
      {
        year: "2020",
        title: "Pertemuan Pertama",
        description: "Kami bertemu pertama kali di kampus saat mengikuti kegiatan organisasi mahasiswa. Saat itu, kami hanya berteman biasa dan saling mengenal sebagai teman satu fakultas.",
        image: "/images/story1.jpg"
      },
      {
        year: "2021",
        title: "Mulai Dekat",
        description: "Seiring berjalannya waktu, kami mulai sering mengobrol dan berbagi cerita. Dari teman biasa, kami mulai merasa nyaman satu sama lain dan sering menghabiskan waktu bersama.",
        image: "/images/story2.jpg"
      },
      {
        year: "2022",
        title: "Menjalin Hubungan",
        description: "Akhirnya kami memutuskan untuk menjalin hubungan yang lebih serius. Kami saling mendukung dalam menyelesaikan studi dan merencanakan masa depan bersama.",
        image: "/images/story3.jpg"
      },
      {
        year: "2023",
        title: "Lamaran",
        description: "Setelah lulus kuliah dan memiliki pekerjaan yang stabil, kami memutuskan untuk melanjutkan hubungan ke jenjang yang lebih serius dengan acara lamaran yang dihadiri kedua keluarga.",
        image: "/images/story4.jpg"
      },
      {
        year: "2024",
        title: "Pernikahan",
        description: "Dan akhirnya, kami akan menikah! Terima kasih untuk semua doa dan dukungan dari keluarga dan teman-teman. Kami sangat bahagia bisa memulai hidup baru bersama.",
        image: "/images/story5.jpg"
      }
    ],
    thankYouMessage: "Terima kasih atas doa dan restu yang telah diberikan untuk pernikahan kami. Kehadiran dan dukungan Anda sangat berarti bagi kami dalam memulai babak baru kehidupan ini."
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

        {/* 1. Separator - Pembuka undangan foto */}
        <Separator
          imageSrc={weddingData.separator.imageSrc}
          title={weddingData.separator.title}
          subtitle={weddingData.separator.subtitle}
        />

        <Intro message={weddingData.introMessage} />

        {/* 2. Quote */}
        <Quote
          quote={weddingData.quote.text}
          source={weddingData.quote.source}
          author={weddingData.quote.author}
        />

        {/* 3. Couple Profile */}
        <CoupleInfo
          bride={weddingData.couple.bride}
          groom={weddingData.couple.groom}
        />

        {/* 4. Story perjalanan mempelai */}
        <Story stories={weddingData.story} />

        {/* 5. Wedding Detail */}
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

        {/* 6. RSVP */}
        <RSVP />

        <Footer
          coupleNames={`${weddingData.couple.bride.name} & ${weddingData.couple.groom.name}`}
          weddingDate={weddingData.date}
          message={weddingData.footerMessage}
        />

        {/* 7. Bottom */}
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
