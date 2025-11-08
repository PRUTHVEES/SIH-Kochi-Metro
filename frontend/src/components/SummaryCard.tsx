import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FleetSummary } from '../types';
import { Train, Clock, Wrench, CheckCircle } from 'lucide-react';

interface SummaryCardProps {
  summary: FleetSummary;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const stats = [
    {
      title: 'Ready',
      value: summary.ready,
      total: summary.total,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Standby',
      value: summary.standby,
      total: summary.total,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Maintenance',
      value: summary.maintenance,
      total: summary.total,
      icon: Wrench,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const percentage = summary.total > 0 ? (stat.value / summary.total) * 100 : 0;
        
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      stat.title === 'Ready' ? 'bg-green-500' :
                      stat.title === 'Standby' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span>{percentage.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCard;


