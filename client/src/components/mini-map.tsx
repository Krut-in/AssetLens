import { useEffect, useRef, useState } from 'react';
import { initializeGoogleMaps } from '@/lib/google-maps';
import { Card, CardContent } from '@/components/ui/card';

interface MiniMapProps {
  lat?: number;
  lng?: number;
  address?: string;
  className?: string;
}

export default function MiniMap({ lat, lng, address, className }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await initializeGoogleMaps();
        
        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize map with default center
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            zoom: 15,
            center: { lat: 39.7684, lng: -86.1581 }, // Default to Indianapolis
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && lat && lng) {
      const position = { lat, lng };
      
      // Update map center and zoom
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(16);
      
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      
      // Add new marker
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: address || 'Selected Location',
        animation: window.google.maps.Animation.DROP
      });
    }
  }, [lat, lng, address]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-foreground flex items-center">
            <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
            Location Preview
          </h4>
          {address && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {address}
            </p>
          )}
        </div>
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-80 rounded-lg overflow-hidden bg-gray-100"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center text-muted-foreground">
                <i className="fas fa-spinner fa-spin text-xl mb-2"></i>
                <p className="text-sm">Loading map...</p>
              </div>
            </div>
          )}
          {!lat || !lng ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <i className="fas fa-map text-xl mb-2"></i>
                <p className="text-sm">Enter an address to view location</p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}