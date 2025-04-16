
import React from 'react';
import { SearchAndFilter } from './SearchAndFilter';
import { JobsTable } from './JobsTable';
import { Job } from './JobTypes';

interface JobListProps {
  jobs: Job[];
  onViewDetails: (job: Job) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  onViewDetails,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange
}) => {
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <SearchAndFilter 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={onPriorityFilterChange}
      />
      
      <JobsTable 
        jobs={filteredJobs}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};

export default JobList;
