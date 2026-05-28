import { GoogleMap, OverlayView, useJsApiLoader } from '@react-google-maps/api';
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

// ─── 번호 핀 마커 ─────────────────────────────────────────────────────────────

function NumberPin({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 24,
        height: 30,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* 핀 몸체 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="30"
        viewBox="0 0 32 40"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
          fill="#3b82f6"
        />
      </svg>
      {/* 숫자 */}
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 0,
          width: 24,
          textAlign: 'center',
          fontSize: label.length > 1 ? 11 : 13,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: '16px',
          fontFamily: 'sans-serif',
          userSelect: 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
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
    if (!isLoaded || !mapRef.current || !markers || markers.length === 0) return;

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
  }, [markers, isLoaded]);

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
        <OverlayView
          key={`${m.lat}-${m.lng}-${i}`}
          position={{ lat: m.lat, lng: m.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <NumberPin label={m.label ?? String(i + 1)} />
        </OverlayView>
      ))}
    </GoogleMap>
  );
}
