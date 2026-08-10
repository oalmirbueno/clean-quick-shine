import { useState, useCallback } from "react";

interface GeocodeSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export function useGeocode() {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=br&limit=5&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "pt-BR" } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "pt-BR" } }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Geocodificação direta (endereço → lat/lng) usada como fallback quando o
  // usuário digita o endereço sem selecionar no mapa/busca.
  const forwardGeocode = useCallback(async (query: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "pt-BR" } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error("Forward geocoding error:", error);
      return null;
    }
  }, []);

  return { suggestions, loading, searchAddress, reverseGeocode, forwardGeocode, clearSuggestions };
}
