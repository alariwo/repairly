
import React from 'react';
import { Badge } from "@/components/ui/badge";

type JobStatusBadgeProps = {
  status: string;
};

export const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  switch (status) {
    case 'diagnosis':
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Diagnosis</Badge>;
    case 'repair-in-progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Repair In Progress</Badge>;
    case 'repair-completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Repair Completed</Badge>;
    case 'stress-test':
      return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Stress Test</Badge>;
    case 'ready-for-delivery':
      return <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-200">Ready for Delivery</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status.replace('-', ' ')}</Badge>;
  }
};
