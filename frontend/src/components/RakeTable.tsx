import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Trainset } from '../types';

interface RakeTableProps {
  trainsets: Trainset[];
}

const RakeTable: React.FC<RakeTableProps> = ({ trainsets }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'ready';
      case 'standby':
        return 'standby';
      case 'maintenance':
        return 'maintenance';
      default:
        return 'secondary';
    }
  };

  const getFitnessBadgeVariant = (fitness: string) => {
    switch (fitness.toLowerCase()) {
      case 'valid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getCleaningBadgeVariant = (cleaning: string) => {
    switch (cleaning.toLowerCase()) {
      case 'complete':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'pending':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Fleet Status Overview</span>
          <Badge variant="outline">{trainsets.length} Trainsets</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rake ID</TableHead>
                <TableHead>Fitness</TableHead>
                <TableHead>Open Jobs</TableHead>
                <TableHead>Brand Hours</TableHead>
                <TableHead>Mileage (km)</TableHead>
                <TableHead>Cleaning</TableHead>
                <TableHead>Stabling</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainsets.map((trainset) => (
                <TableRow key={trainset.id}>
                  <TableCell className="font-medium">
                    {trainset.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getFitnessBadgeVariant(trainset.fitness_status)}>
                      {trainset.fitness_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={trainset.job_cards_open > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      {trainset.job_cards_open}
                    </span>
                  </TableCell>
                  <TableCell>{trainset.branding_hours}</TableCell>
                  <TableCell>{trainset.mileage_km.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getCleaningBadgeVariant(trainset.cleaning_status)}>
                      {trainset.cleaning_status}
                    </Badge>
                  </TableCell>
                  <TableCell>Position {trainset.stabling_position}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(trainset.status)}>
                      {trainset.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RakeTable;


