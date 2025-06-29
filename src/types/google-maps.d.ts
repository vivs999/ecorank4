declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
  }

  // Unused - commented out to avoid ESLint warnings
  // class DirectionsService {
  //   constructor();
  //   route(
  //     request: DirectionsRequest,
  //     callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
  //   ): void;
  // }

  // Unused - commented out to avoid ESLint warnings
  // class DirectionsRenderer {
  //   constructor(opts?: DirectionsRendererOptions);
  //   setMap(map: Map | null): void;
  //   setDirections(directions: DirectionsResult | null): void;
  // }

  // Unused - commented out to avoid ESLint warnings
  // namespace places {
  //   class Autocomplete {
  //     constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
  //   }
  // }

  interface MapOptions {
    center: LatLng | LatLngLiteral;
    zoom: number;
  }

  // Unused - commented out to avoid ESLint warnings
  // interface DirectionsRequest {
  //   origin: LatLng | string;
  //   destination: LatLng | string;
  //   travelMode: TravelMode;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface DirectionsResult {
  //   routes: DirectionsRoute[];
  // }

  interface DirectionsRoute {
    legs: DirectionsLeg[];
    overview_polyline: string;
  }

  interface DirectionsLeg {
    distance: {
      value: number;
      text: string;
    };
    duration: {
      value: number;
      text: string;
    };
  }

  // Unused - commented out to avoid ESLint warnings
  // interface DirectionsStep {
  //   distance: Distance;
  //   duration: Duration;
  //   instructions: string;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface Distance {
  //   text: string;
  //   value: number;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface Duration {
  //   text: string;
  //   value: number;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface DirectionsRendererOptions {
  //   map?: Map;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface AutocompleteOptions {
  //   types?: string[];
  // }

  interface LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  // Unused - commented out to avoid ESLint warnings
  // interface Place {
  //   location: LatLng;
  // }

  enum TravelMode {
    DRIVING = 'DRIVING',
    WALKING = 'WALKING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT'
  }

  // Unused - commented out to avoid ESLint warnings
  // type DirectionsStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';

  // Unused - commented out to avoid ESLint warnings
  // class Geocoder {
  //   geocode(
  //     request: GeocoderRequest,
  //     callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
  //   ): void;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface GeocoderRequest {
  //   address?: string;
  //   location?: LatLng;
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface GeocoderResult {
  //   formatted_address: string;
  //   geometry: {
  //     location: LatLng;
  //   };
  // }

  // Unused - commented out to avoid ESLint warnings
  // type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';

  // Unused - commented out to avoid ESLint warnings
  // interface AutocompletionRequest {
  //   input: string;
  //   types?: string[];
  // }

  // Unused - commented out to avoid ESLint warnings
  // interface AutocompletePrediction {
  //   description: string;
  //   place_id: string;
  // }

  // Unused - commented out to avoid ESLint warnings
  // type PlacesServiceStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'NOT_FOUND' | 'UNKNOWN_ERROR';

  // Unused - commented out to avoid ESLint warnings
  // class AutocompleteService {
  //   getPlacePredictions(
  //     request: AutocompletionRequest,
  //     callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
  //   ): void;
  // }
}

export {}; 