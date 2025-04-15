
import React from 'react';
import { Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from './JobStatusBadge';
import { JobPrintables } from '@/components/jobs/JobPrintables';

type Job = {
  id: string;
  deviceType: string;
  issue: string;
  status: string;
  notes: string;
  beforeImages: string[];
  afterImages: string[];
  createdAt: string;
  dueDate: string;
  serialNumber: string;
  customer: string;
  phoneNumber: string;
};

type JobListProps = {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  selectedJobId: string | null;
};

export const JobList = ({ 
  jobs, 
  onSelectJob, 
  selectedJobId 
}: JobListProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredJobs = jobs.filter(job => {
    if (statusFilter !== 'all' && job.status !== statusFilter) {
      return false;
    }
    
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.serialNumber && job.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const transformJobForPrintables = (job: Job) => {
    return {
      id: job.id,
      customer: job.customer,
      device: job.deviceType,
      issue: job.issue,
      status: job.status,
      createdAt: job.createdAt,
      assignedTo: 'Current Technician', // This would ideally come from a context or prop
      serialNumber: job.serialNumber,
      phoneNumber: job.phoneNumber
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Assigned Jobs</h2>
        <div className="flex items-center space-x-2">
          <Select 
            defaultValue="all"
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="diagnosis">Diagnosis</SelectItem>
              <SelectItem value="repair-in-progress">Repair In Progress</SelectItem>
              <SelectItem value="repair-completed">Repair Completed</SelectItem>
              <SelectItem value="stress-test">Stress Test</SelectItem>
              <SelectItem value="ready-for-delivery">Ready for Delivery</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs, serial numbers..."
              className="pl-10 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Device/Issue</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id} className={selectedJobId === job.id ? "bg-gray-50" : ""}>
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>
                  <div>{job.deviceType}</div>
                  <div className="text-gray-500">{job.issue}</div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {job.serialNumber || 'N/A'}
                </TableCell>
                <TableCell><JobStatusBadge status={job.status} /></TableCell>
                <TableCell>{job.dueDate}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onSelectJob(job)}
                    >
                      Select
                    </Button>
                    <JobPrintables job={transformJobForPrintables(job)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredJobs.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            <p>No jobs found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
