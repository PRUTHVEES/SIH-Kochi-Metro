import axios from 'axios';
import { Trainset, OptimizationRequest, OptimizationResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Get all trainsets
  getTrainsets: async (): Promise<Trainset[]> => {
    try {
      const response = await api.get<Trainset[]>('/trainsets');
      return response.data;
    } catch (error) {
      console.error('Error fetching trainsets:', error);
      throw new Error('Failed to fetch trainsets');
    }
  },

  // Run optimization
  optimizeFleet: async (request: OptimizationRequest = {
    target_ready: 15,
    target_standby: 5,
    target_maintenance: 5
  }): Promise<OptimizationResponse> => {
    try {
      const response = await api.post<OptimizationResponse>('/optimize', request);
      return response.data;
    } catch (error) {
      console.error('Error running optimization:', error);
      throw new Error('Failed to run optimization');
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw new Error('Backend service unavailable');
    }
  },
};


