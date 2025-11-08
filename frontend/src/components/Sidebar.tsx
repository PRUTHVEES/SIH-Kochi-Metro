import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Train, 
  Brain, 
  BarChart3, 
  Settings, 
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  onOptimize: () => void;
  isOptimizing: boolean;
  lastOptimization?: string;
  optimizationScore?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onOptimize, 
  isOptimizing, 
  lastOptimization,
  optimizationScore 
}) => {
  const menuItems = [
    { icon: Train, label: 'Trainsets', active: true },
    { icon: Brain, label: 'Optimization', active: false },
    { icon: BarChart3, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Kochi Metro
        </h1>
        <p className="text-sm text-gray-600">
          AI-Driven Train Induction Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Optimization Panel */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">AI Optimization</h3>
            <p className="text-xs text-gray-600">
              Run nightly fleet optimization to determine optimal train induction status
            </p>
          </div>
          
          <Button 
            onClick={onOptimize} 
            disabled={isOptimizing}
            className="w-full"
            size="sm"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Optimization
              </>
            )}
          </Button>

          {/* Optimization Status */}
          {lastOptimization && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Last Run:</span>
                <span className="text-gray-900">
                  {new Date(lastOptimization).toLocaleTimeString()}
                </span>
              </div>
              
              {optimizationScore && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Score:</span>
                  <Badge 
                    variant={optimizationScore > 2.5 ? "success" : optimizationScore > 2.0 ? "warning" : "destructive"}
                    className="text-xs"
                  >
                    {optimizationScore.toFixed(2)}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Target Ready:</span>
              <span className="font-semibold">15</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Target Standby:</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Target Maintenance:</span>
              <span className="font-semibold">5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">System Online</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Backend API connected
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;


