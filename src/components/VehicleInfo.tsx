import React from 'react';
import { VehicleData } from '../services/carEmissions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

interface VehicleInfoProps {
  vehicleData: VehicleData;
}

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicleData }) => {
  // Check if we have valid vehicle data
  const hasValidData = vehicleData && 
    vehicleData.make && 
    vehicleData.model && 
    vehicleData.year &&
    typeof vehicleData.comb08 === 'number' && 
    vehicleData.comb08 > 0;

  if (!hasValidData) {
    return (
      <div className="alert alert-warning d-flex align-items-center" role="alert">
        <FontAwesomeIcon icon={faCar} className="me-2" />
        <div>
          <strong>Vehicle:</strong> {vehicleData?.year} {vehicleData?.make} {vehicleData?.model}
          <br />
          <small className="text-muted">Using average car emissions (25 MPG)</small>
        </div>
      </div>
    );
  }

  return (
    <div className="alert alert-info d-flex align-items-center" role="alert">
      <FontAwesomeIcon icon={faCar} className="me-2" />
      <div>
        <strong>{vehicleData.year} {vehicleData.make} {vehicleData.model}</strong>
        <br />
        <small className="text-muted">{vehicleData.comb08} MPG combined</small>
      </div>
    </div>
  );
};