import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import RakeTable from '../components/RakeTable';
import { apiService } from '../services/api';
import { Trainset, FleetSummary, OptimizationResponse } from '../types';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [trainsets, setTrainsets] = useState<Trainset[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOptimization, setLastOptimization] = useState<string | null>(null);
  const [optimizationScore, setOptimizationScore] = useState<number | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);

  // Calculate fleet summary
  const fleetSummary: FleetSummary = {
    total: trainsets.length,
    ready: trainsets.filter(t => t.status === 'Ready').length,
    standby: trainsets.filter(t => t.status === 'Standby').length,
    maintenance: trainsets.filter(t => t.status === 'Maintenance').length,
  };

  // Fetch trainsets on component mount
  useEffect(() => {
    fetchTrainsets();
  }, []);

  const fetchTrainsets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTrainsets();
      setTrainsets(data);
    } catch (err) {
      setError('Failed to fetch trainsets. Please check if the backend is running.');
      console.error('Error fetching trainsets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      setError(null);
      
      const result = await apiService.optimizeFleet({
        target_ready: 15,
        target_standby: 5,
        target_maintenance: 5,
      });
      
      setTrainsets(result.optimized_trainsets);
      setLastOptimization(result.summary.optimization_timestamp);
      setOptimizationScore(result.optimization_score);
      setOptimizationResult(result);
      
    } catch (err) {
      setError('Failed to run optimization. Please check if the backend is running.');
      console.error('Error running optimization:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleRefresh = () => {
    fetchTrainsets();
  };


  //CODE STARTS HERE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        onOptimize={handleOptimize}
        isOptimizing={optimizing}
        lastOptimization={lastOptimization}
        optimizationScore={optimizationScore}
      />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Fleet Induction Planner
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time monitoring and AI-driven optimization for Kochi Metro fleet
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Optimization Result Alert */}
        {optimizationResult && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>
                  Optimization completed successfully! 
                  Fleet status updated with score: {optimizationResult.optimization_score.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Badge variant="success">
                    Ready: {optimizationResult.summary.status_distribution.Ready}
                  </Badge>
                  <Badge variant="warning">
                    Standby: {optimizationResult.summary.status_distribution.Standby}
                  </Badge>
                  <Badge variant="destructive">
                    Maintenance: {optimizationResult.summary.status_distribution.Maintenance}
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Fleet Summary Cards */}
        <SummaryCard summary={fleetSummary} />

        {/* Trainsets Table */}
        <RakeTable trainsets={trainsets} />

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a prototype dashboard for Kochi Metro Rail Ltd. 
            The optimization algorithm uses heuristic scoring and will be replaced with ML models in production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


