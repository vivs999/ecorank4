import axios from 'axios';

export interface VehicleMenu {
  value: string;
  text: string;
}

export interface VehicleData {
  id: string;
  year: number;
  make: string;
  model: string;
  city08: number;
  hwy08: number;
  comb08: number;
  co2TailpipeGpm: number;
  fuelType1: string;
  fuelType2?: string;
}

export interface EmissionData {
  smogScore: number;
  smartwayScore: number;
  emissionStandard: string;
}

class CarEmissionsService {
  private static instance: CarEmissionsService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'https://www.fueleconomy.gov/ws/rest';
  }

  public static getInstance(): CarEmissionsService {
    if (!CarEmissionsService.instance) {
      CarEmissionsService.instance = new CarEmissionsService();
    }
    return CarEmissionsService.instance;
  }

  async getYears(): Promise<VehicleMenu[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/vehicle/menu/year`);
      console.log('API Response for years:', response.data);
      
      // Handle different response structures
      if (response.data && response.data.menuItem) {
        return response.data.menuItem;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.Results)) {
        return response.data.Results.map((item: any) => ({
          value: item.value || item.Value || item.id || item.Id,
          text: item.text || item.Text || item.name || item.Name
        }));
      }
      
      console.warn('Unexpected response structure for years:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching years:', error);
      throw error;
    }
  }

  async getMakes(year: string): Promise<VehicleMenu[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/vehicle/menu/make?year=${year}`);
      console.log('API Response for makes:', response.data);
      
      // Handle different response structures
      if (response.data && response.data.menuItem) {
        return response.data.menuItem;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.Results)) {
        return response.data.Results.map((item: any) => ({
          value: item.value || item.Value || item.id || item.Id,
          text: item.text || item.Text || item.name || item.Name
        }));
      }
      
      console.warn('Unexpected response structure for makes:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching makes:', error);
      throw error;
    }
  }

  async getModels(year: string, make: string): Promise<VehicleMenu[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vehicle/menu/model?year=${year}&make=${make}`
      );
      console.log('API Response for models:', response.data);
      
      // Handle different response structures
      if (response.data && response.data.menuItem) {
        return response.data.menuItem;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.Results)) {
        return response.data.Results.map((item: any) => ({
          value: item.value || item.Value || item.id || item.Id,
          text: item.text || item.Text || item.name || item.Name
        }));
      }
      
      console.warn('Unexpected response structure for models:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async getOptions(year: string, make: string, model: string): Promise<VehicleMenu[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vehicle/menu/options?year=${year}&make=${make}&model=${model}`
      );
      console.log('API Response for options:', response.data);
      
      // Handle different response structures
      if (response.data && response.data.menuItem) {
        return response.data.menuItem;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.Results)) {
        return response.data.Results.map((item: any) => ({
          value: item.value || item.Value || item.id || item.Id,
          text: item.text || item.Text || item.name || item.Name
        }));
      }
      
      console.warn('Unexpected response structure for options:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching options:', error);
      throw error;
    }
  }

  async getVehicleData(vehicleId: string): Promise<VehicleData> {
    try {
      const response = await axios.get(`${this.baseUrl}/vehicle/${vehicleId}`);
      console.log('Vehicle data API response:', response.data);
      
      const data = response.data;
      
      // Ensure all numeric values are properly converted
      const vehicleData: VehicleData = {
        id: data.id || vehicleId,
        year: typeof data.year === 'number' ? data.year : parseInt(data.year) || 0,
        make: data.make || data.Make || '',
        model: data.model || data.Model || '',
        city08: typeof data.city08 === 'number' ? data.city08 : parseFloat(data.city08) || 0,
        hwy08: typeof data.hwy08 === 'number' ? data.hwy08 : parseFloat(data.hwy08) || 0,
        comb08: typeof data.comb08 === 'number' ? data.comb08 : parseFloat(data.comb08) || 0,
        co2TailpipeGpm: typeof data.co2TailpipeGpm === 'number' ? data.co2TailpipeGpm : parseFloat(data.co2TailpipeGpm) || 0,
        fuelType1: data.fuelType1 || data.fuelType || '',
        fuelType2: data.fuelType2 || undefined
      };
      
      console.log('Processed vehicle data:', vehicleData);
      return vehicleData;
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      throw error;
    }
  }

  async getEcoScore(vehicleId: string): Promise<EmissionData> {
    try {
      const response = await axios.get(`${this.baseUrl}/vehicle/emissions/${vehicleId}`);
      return {
        smogScore: response.data.smogScore || 0,
        smartwayScore: response.data.smartwayScore || 0,
        emissionStandard: response.data.emissionStandard || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching eco score:', error);
      throw error;
    }
  }
}

export const carEmissionsService = CarEmissionsService.getInstance(); 