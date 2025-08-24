import { Loader } from '@googlemaps/js-api-loader';

// Extend window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

let googleMapsLoader: Loader | null = null;
let googleMapsLoaded = false;

// Get API key from server-side environment
const getApiKey = async (): Promise<string> => {
  try {
    const response = await fetch('/api/maps-config');
    const config = await response.json();
    return config.apiKey || '';
  } catch (error) {
    console.error('Failed to fetch maps config:', error);
    return '';
  }
};

export const initializeGoogleMaps = async (): Promise<any> => {
  if (googleMapsLoaded && window.google?.maps) {
    return window.google.maps;
  }

  if (!googleMapsLoader) {
    const apiKey = await getApiKey();
    googleMapsLoader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  await googleMapsLoader.load();
  googleMapsLoaded = true;
  return window.google.maps;
};

// Define the 7 permitted counties with their boundaries
export const PERMITTED_COUNTIES = [
  {
    name: 'Marion County, Indiana',
    fipsCode: '18097',
    state: 'IN',
    bounds: {
      north: 39.9366,
      south: 39.6378,
      east: -85.9368,
      west: -86.3425
    }
  },
  {
    name: 'Dallas County, Texas', 
    fipsCode: '48113',
    state: 'TX',
    bounds: {
      north: 33.0175,
      south: 32.6183,
      east: -96.4637,
      west: -97.0226
    }
  },
  {
    name: 'Wilson County, Tennessee',
    fipsCode: '47189', 
    state: 'TN',
    bounds: {
      north: 36.3444,
      south: 35.9844,
      east: -86.0531,
      west: -86.6181
    }
  },
  {
    name: 'Durham County, North Carolina',
    fipsCode: '32063',
    state: 'NC', 
    bounds: {
      north: 36.1831,
      south: 35.8194,
      east: -78.5731,
      west: -79.1056
    }
  },
  {
    name: 'Fillmore County, Nebraska',
    fipsCode: '31059',
    state: 'NE',
    bounds: {
      north: 40.8781,
      south: 40.5031,
      east: -97.4256,
      west: -98.0481
    }
  },
  {
    name: 'Clark County, Wisconsin', 
    fipsCode: '55019',
    state: 'WI',
    bounds: {
      north: 45.0819,
      south: 44.2719,
      east: -90.1531,
      west: -90.9681
    }
  },
  {
    name: 'Gurabo Municipio, Puerto Rico',
    fipsCode: '72063',
    state: 'PR',
    bounds: {
      north: 18.2944,
      south: 18.2031,
      east: -65.9156,
      west: -66.0056
    }
  }
];

export const isLocationInPermittedCounty = (lat: number, lng: number): { isPermitted: boolean; county?: string } => {
  for (const county of PERMITTED_COUNTIES) {
    if (
      lat >= county.bounds.south &&
      lat <= county.bounds.north &&
      lng >= county.bounds.west &&
      lng <= county.bounds.east
    ) {
      return { isPermitted: true, county: county.name };
    }
  }
  return { isPermitted: false };
};