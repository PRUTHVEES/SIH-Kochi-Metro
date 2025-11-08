export interface Trainset {
  id: number;
  name: string;
  fitness_status: string;
  job_cards_open: number;
  branding_hours: number;
  mileage_km: number;
  cleaning_status: string;
  stabling_position: number;
  status: string;
}

export interface OptimizationRequest {
  target_ready: number;
  target_standby: number;
  target_maintenance: number;
}

export interface OptimizationResponse {
  optimized_trainsets: Trainset[];
  summary: {
    total_trainsets: number;
    status_distribution: {
      Ready: number;
      Standby: number;
      Maintenance: number;
    };
    optimization_timestamp: string;
    target_distribution: {
      ready: number;
      standby: number;
      maintenance: number;
    };
  };
  optimization_score: number;
}

export interface FleetSummary {
  total: number;
  ready: number;
  standby: number;
  maintenance: number;
}


