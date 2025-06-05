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

export const getDisplayMaps = (weddingInfo: WeddingInfo) => {
  const { maps_display_option, akad_maps_url, resepsi_maps_url } = weddingInfo;
  
  switch (maps_display_option) {
    case 'akad':
      return {
        showAkad: true,
        showResepsi: false,
        akadUrl: akad_maps_url,
        resepsiUrl: null
      };
    case 'resepsi':
      return {
        showAkad: false,
        showResepsi: true,
        akadUrl: null,
        resepsiUrl: resepsi_maps_url
      };
    case 'both':
      return {
        showAkad: true,
        showResepsi: true,
        akadUrl: akad_maps_url,
        resepsiUrl: resepsi_maps_url
      };
    case 'none':
    default:
      return {
        showAkad: false,
        showResepsi: false,
        akadUrl: null,
        resepsiUrl: null
      };
  }
};
