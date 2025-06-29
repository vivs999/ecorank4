/**
 * Vehicle API Service
 * 
 * This service uses the free NHTSA Vehicle API to fetch real-world 
 * vehicle data and emission information.
 * https://vpic.nhtsa.dot.gov/api/
 */

import { VehicleEmissionData } from '../types';

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Emission factors (CO2 kg/km) by fuel type
const EMISSION_FACTORS = {
  GASOLINE: 0.120,
  DIESEL: 0.140,
  HYBRID: 0.085,
  ELECTRIC: 0.020,
  PLUGIN_HYBRID: 0.050,
} as const;

// Year adjustment factors for emission calculations
const YEAR_ADJUSTMENT: { [key: number]: number } = {
  2023: 0.92,
  2022: 0.94,
  2021: 0.96,
  2020: 0.98,
  2019: 1.0,
  2018: 1.03,
  2017: 1.06,
  2016: 1.09,
  2015: 1.12,
  2014: 1.15,
  2013: 1.18,
  2012: 1.21,
};

// Vehicle size adjustment factors for emission calculations
const SIZE_ADJUSTMENT = {
  'Compact': 0.85,
  'Midsize': 1.0,
  'Large': 1.2,
  'SUV': 1.3,
  'Pickup Truck': 1.4,
  'Van': 1.25,
} as const;

export type VehicleClass = keyof typeof SIZE_ADJUSTMENT;
export type FuelType = keyof typeof EMISSION_FACTORS;

export interface VehicleMake {
  id: number;
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  makeId: number;
}

export interface NHTSAResponse<T> {
  Count: number;
  Message: string;
  Results: T[];
  SearchCriteria?: string;
}

export const getMakes = async (): Promise<VehicleMake[]> => {
  try {
    const response = await fetch(`${NHTSA_API_BASE}/GetMakesForVehicleType/car?format=json`);
    const data: NHTSAResponse<{ Make_ID: number; Make_Name: string }> = await response.json();
    
    return data.Results.map(make => ({
      id: make.Make_ID,
      name: make.Make_Name
    }));
  } catch (error) {
    console.error('Error fetching makes:', error);
    return [];
  }
};

export const getModelsByMake = async (makeId: number): Promise<VehicleModel[]> => {
  try {
    const response = await fetch(`${NHTSA_API_BASE}/GetModelsForMakeId/${makeId}?format=json`);
    const data: NHTSAResponse<{ Model_ID: number; Model_Name: string; Make_ID: number }> = await response.json();
    
    return data.Results.map(model => ({
      id: model.Model_ID,
      name: model.Model_Name,
      makeId: model.Make_ID
    }));
  } catch (error) {
    console.error('Error fetching models for make:', error);
    return [];
  }
};

export const getVehicleDetails = async (
  make: string, 
  model: string, 
  year: number
): Promise<VehicleEmissionData | null> => {
  try {
    const modelLower = model.toLowerCase();
    const makeLower = make.toLowerCase();
    
    const fuelType = determineFuelType(modelLower, makeLower);
    const vehicleClass = determineVehicleClass(modelLower);
    
    const baseFactor = EMISSION_FACTORS[fuelType];
    const yearFactor = YEAR_ADJUSTMENT[year] || 1.0;
    const sizeFactor = SIZE_ADJUSTMENT[vehicleClass];
    
    const emissionFactor = baseFactor * yearFactor * sizeFactor;
    
    return {
      make,
      model,
      year,
      fuelType,
      vehicleClass,
      emissionFactor: parseFloat(emissionFactor.toFixed(3))
    };
  } catch (error) {
    console.error('Error getting vehicle details:', error);
    return null;
  }
};

function determineFuelType(model: string, make: string): FuelType {
  if (model.includes('electric') || model.includes('ev') || make === 'tesla') {
    return 'ELECTRIC';
  }
  if (model.includes('hybrid')) {
    return model.includes('plug') || model.includes('phev') ? 'PLUGIN_HYBRID' : 'HYBRID';
  }
  if (model.includes('diesel') || model.includes('tdi')) {
    return 'DIESEL';
  }
  return 'GASOLINE';
}

function determineVehicleClass(model: string): VehicleClass {
  if (model.includes('compact') || 
      model.includes('fiesta') || 
      model.includes('civic') || 
      model.includes('corolla')) {
    return 'Compact';
  }
  if (model.includes('suv') || 
      model.includes('explorer') || 
      model.includes('rav4') || 
      model.includes('cr-v')) {
    return 'SUV';
  }
  if (model.includes('truck') || 
      model.includes('pickup') || 
      model.includes('f-150') || 
      model.includes('silverado') || 
      model.includes('ram')) {
    return 'Pickup Truck';
  }
  if (model.includes('van') || 
      model.includes('caravan') || 
      model.includes('sienna')) {
    return 'Van';
  }
  if (model.includes('large') || 
      model.includes('full-size')) {
    return 'Large';
  }
  return 'Midsize';
}

/**
 * Search for vehicle makes matching the search term
 */
export const searchMakes = async (searchTerm: string): Promise<VehicleMake[]> => {
  try {
    const allMakes = await getMakes();
    return allMakes.filter(make => 
      make.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching vehicle makes:', error);
    return [];
  }
};

/**
 * Search vehicle emissions data by make and model
 */
export const searchVehicleEmissions = async (
  make: string, 
  model: string, 
  year: number
): Promise<VehicleEmissionData | null> => {
  return getVehicleDetails(make, model, year);
}; 