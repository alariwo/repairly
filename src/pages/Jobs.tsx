
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JobList from '@/components/jobs/JobList';
import { Job } from '@/components/jobs/JobTypes';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';
import CreateJobModal from '@/components/jobs/CreateJobModal';

const initialJobs = [
  {
    id: 'JOB-1001',
    customer: 'John Smith',
    device: 'iPhone 12',
    issue: 'Cracked Screen',
    status: 'picked-up',
    priority: 'high',
    createdAt: '2025-04-10',
    dueDate: '2025-04-15',
    assignedTo: 'Mike Technician',
    hasNotification: true,
    serialNumber: 'SN12345678',
    customerEmail: 'john.smith@example.com',
    phoneNumber: '555-123-4567'
  },
  {
    id: 'JOB-1002',
    customer: 'Sarah Johnson',
    device: 'MacBook Pro',
    issue: 'Battery Replacement',
    status: 'diagnosis',
    priority: 'medium',
    createdAt: '2025-04-09',
    dueDate: '2025-04-16',
    assignedTo: 'Lisa Technician',
    hasNotification: false,
    serialNumber: 'C02XL0GHJGH5',
    customerEmail: 'sarah.j@example.com',
    phoneNumber: '555-234-5678'
  },
  {
    id: 'JOB-1003',
    customer: 'Michael Brown',
    device: 'Samsung Galaxy S21',
    issue: 'Charging Port',
    status: 'repair-in-progress',
    priority: 'medium',
    createdAt: '2025-04-08',
    dueDate: '2025-04-18',
    assignedTo: 'Mike Technician',
    hasNotification: false,
    serialNumber: 'RZ8G61LCX2P',
    customerEmail: 'michael.b@example.com',
    phoneNumber: '555-345-6789'
  },
  {
    id: 'JOB-1004',
    customer: 'Emily Davis',
    device: 'Dell XPS 13',
    issue: 'Virus Removal',
    status: 'repair-completed',
    priority: 'low',
    createdAt: '2025-04-07',
    dueDate: '2025-04-11',
    assignedTo: 'Lisa Technician',
    hasNotification: true,
    serialNumber: 'JN2YRNM',
    customerEmail: 'emily.d@example.com',
    phoneNumber: '555-456-7890'
  },
  {
    id: 'JOB-1005',
    customer: 'David Wilson',
    device: 'iPad Pro',
    issue: 'Broken Home Button',
    status: 'ready-for-delivery',
    priority: 'high',
    createdAt: '2025-04-06',
    dueDate: '2025-04-13',
    assignedTo: 'Mike Technician',
    hasNotification: true,
    serialNumber: 'DMPWH8MYHJKT',
    customerEmail: 'david.w@example.com',
    phoneNumber: '555-567-8901'
  },
];

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);
  const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] = useState(false);
  
  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Repair Jobs</h1>
        <Button onClick={() => setIsCreateJobDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <JobList 
            jobs={jobs}
            onViewDetails={handleViewJobDetails}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
        </CardContent>
      </Card>
      
      {/* Job Details Modal */}
      <JobDetailsModal 
        job={selectedJob}
        isOpen={isJobDetailsDialogOpen}
        onOpenChange={setIsJobDetailsDialogOpen}
      />
      
      {/* Create New Job Modal */}
      <CreateJobModal 
        isOpen={isCreateJobDialogOpen}
        onOpenChange={setIsCreateJobDialogOpen}
      />
    </div>
  );
};

export default Jobs;
