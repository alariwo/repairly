
import React from 'react';
import { JobStatusBadge } from './JobStatusBadge';
import { JobPriorityBadge } from './JobPriorityBadge';
import { JobActions } from './JobActions';
import { Job } from './JobTypes';

interface JobRowProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

export const JobRow: React.FC<JobRowProps> = ({ job, onViewDetails }) => {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4 align-middle">
        <div className="flex items-center space-x-2">
          {job.hasNotification && (
            <span className="relative h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          )}
          <span className="font-medium">{job.id}</span>
        </div>
      </td>
      <td className="p-4 align-middle">{job.customer}</td>
      <td className="p-4 align-middle">
        <div className="font-medium">{job.device}</div>
        <div className="text-sm text-muted-foreground">{job.issue}</div>
      </td>
      <td className="p-4 align-middle"><JobStatusBadge status={job.status} /></td>
      <td className="p-4 align-middle"><JobPriorityBadge priority={job.priority} /></td>
      <td className="p-4 align-middle">{job.dueDate}</td>
      <td className="p-4 align-middle">
        <JobActions job={job} onViewDetails={onViewDetails} />
      </td>
    </tr>
  );
};

export default JobRow;
