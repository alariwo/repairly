
import React from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobStatusBadge } from './JobStatusBadge';
import { JobPriorityBadge } from './JobPriorityBadge';
import { JobPrintables } from './JobPrintables';
import { Bell, FileText } from 'lucide-react';

export interface Job {
  id: string;
  customer: string;
  device: string;
  issue: string;
  status: string;
  priority: string;
  createdAt: string;
  dueDate: string;
  assignedTo: string;
  hasNotification: boolean;
  serialNumber: string;
  customerEmail: string;
  phoneNumber: string;
}

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
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs, customers, devices..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select 
            value={statusFilter} 
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="diagnosis">Diagnosis</SelectItem>
              <SelectItem value="repair-in-progress">Repair in Progress</SelectItem>
              <SelectItem value="repair-completed">Repair Completed</SelectItem>
              <SelectItem value="ready-for-delivery">Ready for Delivery</SelectItem>
              <SelectItem value="picked-up">Picked Up</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={priorityFilter} 
            onValueChange={onPriorityFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
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
            {filteredJobs.map(job => (
              <tr key={job.id} className="border-b hover:bg-muted/50">
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(job)}
                    >
                      View Details
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredJobs.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No jobs found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
