export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  startLocation: Location;
  endLocation: Location;
  polyline: string;
}

class GoogleMapsService {
  private static instance: GoogleMapsService;
  private apiKey: string;
  private isLoaded: boolean = false;

  private constructor() {
    // TODO: Replace with your actual Google Maps API key
    // Get your API key from: https://console.cloud.google.com/apis/credentials
    this.apiKey = 'AIzaSyBIHeUlheNpYZz-ZRq0EpkNJY8o31FbfU8';
  }

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  private async loadGoogleMapsAPI(): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  async geocodeAddress(address: string): Promise<Location> {
    await this.loadGoogleMapsAPI();

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            address: results[0].formatted_address,
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async calculateRoute(startAddress: string, endAddress: string): Promise<RouteInfo> {
    await this.loadGoogleMapsAPI();

    try {
      // Geocode both addresses
      const [startLocation, endLocation] = await Promise.all([
        this.geocodeAddress(startAddress),
        this.geocodeAddress(endAddress)
      ]);

      return new Promise((resolve, reject) => {
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route({
          origin: { lat: startLocation.lat, lng: startLocation.lng },
          destination: { lat: endLocation.lat, lng: endLocation.lng },
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK' && result) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            if (!leg.distance || !leg.duration) {
              reject(new Error('Route calculation failed: Missing distance or duration data'));
              return;
            }
            
            resolve({
              distance: leg.distance.value / 1000, // Convert meters to kilometers
              duration: leg.duration.value / 60, // Convert seconds to minutes
              startLocation,
              endLocation,
              polyline: route.overview_polyline
            });
          } else {
            reject(new Error(`Route calculation failed: ${status}`));
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to calculate route: ${error}`);
    }
  }

  async getAutocompleteSuggestions(input: string): Promise<string[]> {
    await this.loadGoogleMapsAPI();

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input,
        types: ['geocode']
      }, (predictions, status) => {
        if (status === 'OK' && predictions) {
          resolve(predictions.map(prediction => prediction.description));
        } else {
          resolve([]);
        }
      });
    });
  }

  // Calculate carbon footprint based on distance and transport type
  calculateCarbonFootprint(distance: number, transportType: string): number {
    const emissionFactors = {
      car: 0.2, // kg CO2 per km
      public: 0.05, // kg CO2 per km
      bike: 0, // kg CO2 per km
      walk: 0 // kg CO2 per km
    };

    const factor = emissionFactors[transportType as keyof typeof emissionFactors] || 0.2;
    return distance * factor;
  }
}

export const googleMapsService = GoogleMapsService.getInstance(); 