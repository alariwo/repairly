
import React from 'react';
import { MoreHorizontal, UserCheck, ClipboardCheck, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { JobPrintables } from './JobPrintables';
import { Job } from './JobTypes';

interface JobActionsProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

export const JobActions: React.FC<JobActionsProps> = ({ job, onViewDetails }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewDetails(job)}
      >
        View Details
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
      >
        <UserCheck className="h-4 w-4" />
        Assign
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
      >
        <ClipboardCheck className="h-4 w-4" />
        Status
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
      >
        <FileText className="h-4 w-4" />
        Log
      </Button>
      
      <JobPrintables job={job} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2">
            <Bell className="h-4 w-4" />
            Notify Customer
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <FileText className="h-4 w-4" />
            Create Invoice
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-red-600">
            Cancel Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default JobActions;
