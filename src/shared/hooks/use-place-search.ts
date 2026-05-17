import { GOOGLE_MAPS_LIBRARIES } from '@components/trip/google-map';
import type { PlaceResult } from '@components/trip/add-place-modal';
import { useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 400;
const MAX_RESULTS = 5;

function toPlaceResult(place: google.maps.places.PlaceResult): PlaceResult {
  const photo = place.photos?.[0];
  const loc = place.geometry?.location;
  return {
    id: place.place_id ?? crypto.randomUUID(),
    name: place.name ?? '',
    address: place.formatted_address ?? place.vicinity ?? '',
    rating: place.rating ?? 0,
    info: place.opening_hours?.isOpen?.() === false
      ? '영업마감'
      : place.vicinity ?? '',
    imageUrl: photo ? photo.getUrl({ maxWidth: 120, maxHeight: 120 }) : undefined,
    location: loc ? { lat: loc.lat(), lng: loc.lng() } : undefined,
  };
}

export function usePlaceSearch() {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // PlacesService는 DOM 엘리먼트를 필요로 하므로 ref로 유지
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // API 로드 후 서비스 초기화
  useEffect(() => {
    if (!isLoaded) return;
    const container = document.createElement('div');
    serviceRef.current = new google.maps.places.PlacesService(container);
  }, [isLoaded]);

  const search = useCallback(
    (query: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!query.trim()) {
        setResults([]);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        if (!serviceRef.current) return;

        setIsLoading(true);
        serviceRef.current.textSearch(
          { query },
          (places, status) => {
            setIsLoading(false);
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              places
            ) {
              setResults(places.slice(0, MAX_RESULTS).map(toPlaceResult));
            } else {
              setResults([]);
            }
          },
        );
      }, DEBOUNCE_MS);
    },
    [],
  );

  // unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { results, isLoading, search };
}
