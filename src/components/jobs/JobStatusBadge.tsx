
import React from 'react';
import { Badge } from '@/components/ui/badge';

type JobStatus = 'diagnosis' | 'repair-in-progress' | 'repair-completed' | 'ready-for-delivery' | 'picked-up' | string;

interface JobStatusBadgeProps {
  status: JobStatus;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'diagnosis':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Diagnosis</Badge>;
    case 'repair-in-progress':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Repair in Progress</Badge>;
    case 'repair-completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Repair Completed</Badge>;
    case 'ready-for-delivery':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Ready for Delivery</Badge>;
    case 'picked-up':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Picked Up</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default JobStatusBadge;
