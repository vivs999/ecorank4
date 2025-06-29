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

  class DirectionsService {
    constructor();
    route(
      request: DirectionsRequest,
      callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
    ): void;
  }

  class DirectionsRenderer {
    constructor(opts?: DirectionsRendererOptions);
    setMap(map: Map | null): void;
    setDirections(directions: DirectionsResult | null): void;
  }

  namespace places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
    }
  }

  interface MapOptions {
    center: LatLng | LatLngLiteral;
    zoom: number;
  }

  interface DirectionsRequest {
    origin: LatLng | string;
    destination: LatLng | string;
    travelMode: TravelMode;
  }

  interface DirectionsResult {
    routes: DirectionsRoute[];
  }

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

  interface DirectionsStep {
    distance: Distance;
    duration: Duration;
    instructions: string;
  }

  interface Distance {
    text: string;
    value: number;
  }

  interface Duration {
    text: string;
    value: number;
  }

  interface DirectionsRendererOptions {
    map?: Map;
  }

  interface AutocompleteOptions {
    types?: string[];
  }

  interface LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface Place {
    location: LatLng;
  }

  enum TravelMode {
    DRIVING = 'DRIVING',
    WALKING = 'WALKING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT'
  }

  type DirectionsStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';

  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
    ): void;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng;
  }

  interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
  }

  type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';

  interface AutocompletionRequest {
    input: string;
    types?: string[];
  }

  interface AutocompletePrediction {
    description: string;
    place_id: string;
  }

  type PlacesServiceStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'NOT_FOUND' | 'UNKNOWN_ERROR';

  class AutocompleteService {
    getPlacePredictions(
      request: AutocompletionRequest,
      callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
    ): void;
  }
}

export {}; 