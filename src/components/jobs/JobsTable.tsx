
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { JobRow } from './JobRow';
import { Job } from './JobTypes';

interface JobsTableProps {
  jobs: Job[];
  onViewDetails: (job: Job) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, onViewDetails }) => {
  return (
    <div className="border rounded-md">
      <ScrollArea className="h-full w-full">
        <div className="min-w-[900px]">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left h-12 px-4 align-middle font-medium">Job ID</th>
                <th className="text-left h-12 px-4 align-middle font-medium">Customer</th>
                <th className="text-left h-12 px-4 align-middle font-medium">Device</th>
                <th className="text-left h-12 px-4 align-middle font-medium">Status</th>
                <th className="text-left h-12 px-4 align-middle font-medium">Priority</th>
                <th className="text-left h-12 px-4 align-middle font-medium">Due Date</th>
                <th className="text-left h-12 px-4 align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <JobRow 
                  key={job.id} 
                  job={job} 
                  onViewDetails={onViewDetails} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
      
      {jobs.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No jobs found matching your filters.
        </div>
      )}
    </div>
  );
};

export default JobsTable;
