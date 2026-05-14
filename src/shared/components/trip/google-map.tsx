import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

interface TripMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
}

export function TripMap({
  center = { lat: 41.9028, lng: 12.4964 },
  zoom = 13,
  className = 'w-full h-[641px] rounded-[10px] overflow-hidden',
}: TripMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

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
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
      }}
    />
  );
}
