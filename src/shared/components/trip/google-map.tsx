import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef } from 'react';

// libraries 배열은 컴포넌트 외부에 고정 — 내부에 두면 리렌더마다 새 참조 생성 경고 발생
export const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

export type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
};

interface TripMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  markers?: MapMarker[];
}

export function TripMap({
  center = { lat: 41.9028, lng: 12.4964 },
  zoom = 13,
  className = 'w-full h-[641px] rounded-[10px] overflow-hidden',
  markers,
}: TripMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

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
      center={center}
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
          label={m.label ? { text: m.label, color: '#fff', fontWeight: 'bold', fontSize: '12px' } : undefined}
        />
      ))}
    </GoogleMap>
  );
}
