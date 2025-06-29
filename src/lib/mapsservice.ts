import { MapsApiKey } from './config';

declare global {
  interface Window {
    google: typeof google;
  }
}

class MapsService {
  private static instance: MapsService;
  private map: google.maps.Map | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  private constructor() {
    this.loadGoogleMapsScript();
  }

  public static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  private loadGoogleMapsScript(): void {
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  public async initializeMap(element: HTMLElement, options: google.maps.MapOptions): Promise<google.maps.Map> {
    if (!window.google) {
      await new Promise<void>((resolve) => {
        const checkGoogle = setInterval(() => {
          if (window.google) {
            clearInterval(checkGoogle);
            resolve();
          }
        }, 100);
      });
    }

    this.map = new google.maps.Map(element, options);
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
    this.geocoder = new google.maps.Geocoder();
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(this.map);

    return this.map;
  }

  public async getDirections(
    origin: string,
    destination: string,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route(
        {
          origin,
          destination,
          travelMode,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  public async geocodeAddress(address: string): Promise<google.maps.GeocoderResult> {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          resolve(results[0]);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  public async getPlacePredictions(
    input: string,
    types: string[] = ['address']
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.autocompleteService) {
      throw new Error('Autocomplete service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input,
          types,
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            reject(new Error(`Place predictions failed: ${status}`));
          }
        }
      );
    });
  }

  public async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'geometry'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error(`Place details failed: ${status}`));
          }
        }
      );
    });
  }

  public calculateDistance(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLon = this.toRad(destination.lng - origin.lng);
    const lat1 = this.toRad(origin.lat);
    const lat2 = this.toRad(destination.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  public calculateCarbonFootprint(
    distance: number,
    transportMode: string
  ): number {
    // Carbon emission factors in kg CO2 per km
    const emissionFactors: { [key: string]: number } = {
      DRIVING: 0.404, // Average car
      BICYCLING: 0,
      TRANSIT: 0.101, // Average public transport
      WALKING: 0,
    };

    const factor = emissionFactors[transportMode] || emissionFactors.DRIVING;
    return distance * factor;
  }
}

export default MapsService; 