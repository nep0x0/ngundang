'use client';

import { useState, useEffect } from 'react';
import { weddingInfoService, WeddingInfo } from '@/lib/supabase';

export function useWeddingInfo() {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeddingInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await weddingInfoService.getWeddingInfo();
        setWeddingInfo(data);
      } catch (err) {
        console.error('Error fetching wedding info:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wedding information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeddingInfo();
  }, []);

  return { weddingInfo, loading, error };
}

// Helper functions untuk formatting
export const formatWeddingDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('id-ID', options);
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes} WIB`;
};

export const formatFamilyDescription = (
  childOrder: string,
  father: string,
  mother: string
): string => {
  return `${childOrder} dari ${father} & ${mother}`;
};

// Convert Google Maps URL to embeddable iframe URL
export const convertToEmbedUrl = (googleMapsUrl: string): string => {
  if (!googleMapsUrl) return '';

  try {
    // Extract coordinates from various Google Maps URL formats
    let lat: string = '';
    let lng: string = '';

    // Format 1: https://maps.google.com/maps?q=lat,lng
    const coordMatch1 = googleMapsUrl.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch1) {
      lat = coordMatch1[1];
      lng = coordMatch1[2];
    }

    // Format 2: https://www.google.com/maps/place/.../@lat,lng,zoom
    const coordMatch2 = googleMapsUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),/);
    if (coordMatch2) {
      lat = coordMatch2[1];
      lng = coordMatch2[2];
    }

    // Format 3: https://maps.app.goo.gl/... (shortened URL - fallback to search)
    if (googleMapsUrl.includes('maps.app.goo.gl') || googleMapsUrl.includes('goo.gl/maps')) {
      // For shortened URLs, we'll use the URL as a search query
      const encodedUrl = encodeURIComponent(googleMapsUrl);
      return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodedUrl}`;
    }

    if (lat && lng) {
      // Use coordinates for embed
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.0!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat},${lng}!5e0!3m2!1sen!2sid!4v1682329193229!5m2!1sen!2sid`;
    }

    // Fallback: try to extract place name for search
    const placeMatch = googleMapsUrl.match(/place\/([^\/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      const encodedPlace = encodeURIComponent(placeName);
      return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodedPlace}`;
    }

    // Last resort: use a default embed with search
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.0!2d106.8456!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLTYuMjA4OCwxMDYuODQ1Ng!5e0!3m2!1sen!2sid!4v1682329193229!5m2!1sen!2sid`;

  } catch (error) {
    console.error('Error converting Google Maps URL:', error);
    // Return a default embed URL
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.0!2d106.8456!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLTYuMjA4OCwxMDYuODQ1Ng!5e0!3m2!1sen!2sid!4v1682329193229!5m2!1sen!2sid`;
  }
};

export const getDisplayMaps = (weddingInfo: WeddingInfo) => {
  const { maps_display_option, akad_maps_url, resepsi_maps_url } = weddingInfo;

  switch (maps_display_option) {
    case 'akad':
      return {
        showAkad: true,
        showResepsi: false,
        akadUrl: akad_maps_url,
        akadEmbedUrl: convertToEmbedUrl(akad_maps_url),
        resepsiUrl: null,
        resepsiEmbedUrl: null
      };
    case 'resepsi':
      return {
        showAkad: false,
        showResepsi: true,
        akadUrl: null,
        akadEmbedUrl: null,
        resepsiUrl: resepsi_maps_url,
        resepsiEmbedUrl: convertToEmbedUrl(resepsi_maps_url)
      };
    case 'both':
      return {
        showAkad: true,
        showResepsi: true,
        akadUrl: akad_maps_url,
        akadEmbedUrl: convertToEmbedUrl(akad_maps_url),
        resepsiUrl: resepsi_maps_url,
        resepsiEmbedUrl: convertToEmbedUrl(resepsi_maps_url)
      };
    case 'none':
    default:
      return {
        showAkad: false,
        showResepsi: false,
        akadUrl: null,
        akadEmbedUrl: null,
        resepsiUrl: null,
        resepsiEmbedUrl: null
      };
  }
};
