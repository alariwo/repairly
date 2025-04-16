
import React from 'react';
import { Badge } from '@/components/ui/badge';

type JobPriority = 'high' | 'medium' | 'low' | string;

interface JobPriorityBadgeProps {
  priority: JobPriority;
}

export const JobPriorityBadge: React.FC<JobPriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
    case 'low':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default JobPriorityBadge;
