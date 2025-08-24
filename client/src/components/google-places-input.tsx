import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { initializeGoogleMaps, isLocationInPermittedCounty } from '@/lib/google-maps';
import { useToast } from '@/hooks/use-toast';

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: {
    address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function GooglePlacesInput({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  className
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        setIsLoading(true);
        await initializeGoogleMaps();
        
        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: ['us', 'pr'] },
            fields: ['formatted_address', 'geometry', 'address_components'],
            types: ['address']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            
            if (!place?.geometry?.location) {
              toast({
                title: 'Invalid Address',
                description: 'Please select a valid address from the suggestions.',
                variant: 'destructive'
              });
              return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Check if location is in permitted counties
            const locationCheck = isLocationInPermittedCounty(lat, lng);
            
            if (!locationCheck.isPermitted) {
              toast({
                title: 'Location Not Supported',
                description: 'Sorry, this address is outside our supported counties. Please try an address from one of our 7 permitted counties: Marion County (IN), Dallas County (TX), Wilson County (TN), Durham County (NC), Fillmore County (NE), Clark County (WI), or Gurabo Municipio (PR).',
                variant: 'destructive'
              });
              return;
            }

            // Extract address components
            let city = '';
            let state = '';
            let zipCode = '';
            
            place.address_components?.forEach((component: any) => {
              const types = component.types;
              if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });

            const addressInfo = {
              address: place.formatted_address || '',
              lat,
              lng,
              city,
              state,
              zipCode
            };

            onChange(place.formatted_address || '');
            onPlaceSelected(addressInfo);
            
            toast({
              title: 'Address Validated',
              description: `Location confirmed in ${locationCheck.county}`,
              variant: 'default'
            });
          });
        }
      } catch (error) {
        console.error('Error initializing Google Places:', error);
        toast({
          title: 'Maps Loading Error',
          description: 'Unable to load address suggestions. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAutocomplete();
  }, [onChange, onPlaceSelected, toast]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoading ? 'Loading maps...' : placeholder}
        className={className}
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-3">
          <i className="fas fa-spinner fa-spin text-gray-400"></i>
        </div>
      )}
    </div>
  );
}