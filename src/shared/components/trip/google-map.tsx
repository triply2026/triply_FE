import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';

// libraries 배열은 컴포넌트 외부에 고정 — 내부에 두면 리렌더마다 새 참조 생성 경고 발생
export const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];
const DEFAULT_MAP_CENTER = { lat: 36.5, lng: 127.8 };

export type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
};

interface TripMapProps {
  center?: google.maps.LatLngLiteral;
  centerQuery?: string;
  zoom?: number;
  className?: string;
  markers?: MapMarker[];
}

export function TripMap({
  center = DEFAULT_MAP_CENTER,
  centerQuery,
  zoom = 13,
  className = 'w-full h-[641px] rounded-[10px] overflow-hidden',
  markers,
}: TripMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [resolvedCenter, setResolvedCenter] = useState(center);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    setResolvedCenter(center);
  }, [center]);

  useEffect(() => {
    if (!isLoaded || !centerQuery) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: centerQuery }, (results, status) => {
      if (status !== 'OK' || !results?.[0]) return;

      const location = results[0].geometry.location;
      const nextCenter = { lat: location.lat(), lng: location.lng() };

      setResolvedCenter(nextCenter);
      mapRef.current?.setCenter(nextCenter);
      mapRef.current?.setZoom(zoom);
    });
  }, [centerQuery, isLoaded, zoom]);

  // 마커가 변경될 때 bounds를 자동으로 맞춤
  useEffect(() => {
    if (!mapRef.current || !markers || markers.length === 0) return;

    if (markers.length === 1) {
      mapRef.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      mapRef.current.setZoom(15);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const m of markers) {
      bounds.extend({ lat: m.lat, lng: m.lng });
    }
    mapRef.current.fitBounds(bounds, 40);
  }, [markers]);

  if (!isLoaded) {
    return (
      <div className={`flex-col-center bg-gray-100 ${className}`}>
        <span className="body text-gray-400">지도 불러오는 중...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={className}
      center={resolvedCenter}
      zoom={zoom}
      onLoad={onLoad}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
      }}
    >
      {markers?.map((m, i) => (
        <Marker
          key={`${m.lat}-${m.lng}-${i}`}
          position={{ lat: m.lat, lng: m.lng }}
          label={
            m.label
              ? { text: m.label, color: '#fff', fontWeight: 'bold', fontSize: '12px' }
              : undefined
          }
        />
      ))}
    </GoogleMap>
  );
}
