import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck, Upload, MessageSquare, Image, Save, Filter, Search } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { JobPrintables } from '@/components/jobs/JobPrintables';

// Demo user data - in a real app, this would come from authentication
const currentTechnician = {
  id: 'tech-001',
  name: 'Mike Technician',
};

// Demo data - in a real app, this would come from an API call
const technicianJobs = [
  {
    id: 'JOB-1001',
    deviceType: 'iPhone 12',
    issue: 'Cracked Screen',
    status: 'diagnosis',
    notes: '',
    beforeImages: [],
    afterImages: [],
    createdAt: '2025-04-10',
    dueDate: '2025-04-15',
    serialNumber: 'SN12345678',
    customer: 'John Smith',
    phoneNumber: '555-123-4567'
  },
  {
    id: 'JOB-1003',
    deviceType: 'Samsung Galaxy S21',
    issue: 'Charging Port',
    status: 'repair-in-progress',
    notes: 'Ordered replacement part',
    beforeImages: ['damaged-port.jpg'],
    afterImages: [],
    createdAt: '2025-04-08',
    dueDate: '2025-04-18',
    serialNumber: 'RZ8G61LCX2P',
    customer: 'Michael Brown',
    phoneNumber: '555-345-6789'
  },
  {
    id: 'JOB-1005',
    deviceType: 'iPad Pro',
    issue: 'Broken Home Button',
    status: 'repair-completed',
    notes: 'Disassembled device, waiting for parts',
    beforeImages: ['broken-button.jpg'],
    afterImages: [],
    createdAt: '2025-04-06',
    dueDate: '2025-04-13',
    serialNumber: 'DMPWH8MYHJKT',
    customer: 'David Wilson',
    phoneNumber: '555-567-8901'
  },
];

const TechnicianDashboard = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(technicianJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<null | typeof technicianJobs[0]>(null);
  const [jobNotes, setJobNotes] = useState('');
  const [jobStatus, setJobStatus] = useState('');

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter(job => {
    // Apply status filter
    if (statusFilter !== 'all' && job.status !== statusFilter) {
      return false;
    }
    
    // Apply search term including serial number
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.serialNumber && job.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleSelectJob = (job: typeof technicianJobs[0]) => {
    setSelectedJob(job);
    setJobNotes(job.notes);
    setJobStatus(job.status);
    
    // Added toast notification for job selection
    toast({
      title: "Job Selected",
      description: `You are now editing job ${job.id}`,
    });
  };

  const handleJobUpdate = () => {
    if (!selectedJob) return;
    
    // Update job in the local state
    const updatedJobs = jobs.map(job => 
      job.id === selectedJob.id 
        ? { ...job, notes: jobNotes, status: jobStatus } 
        : job
    );
    setJobs(updatedJobs);
    
    // Notify admin if job is completed
    if (jobStatus === 'repair-completed' || jobStatus === 'ready-for-delivery') {
      toast({
        title: "Admin Notification Sent",
        description: `Admin has been notified about the status change for job ${selectedJob.id}.`,
      });
    }
    
    // Clear selection and show success message
    setSelectedJob(null);
    toast({
      title: "Job Updated",
      description: `Job ${selectedJob.id} has been updated successfully.`,
    });
  };

  const handleFileUpload = (type: 'before' | 'after') => {
    // Trigger file upload dialog and handle file selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!selectedJob) return;
          
          const updatedJobs = jobs.map(job => {
            if (job.id === selectedJob.id) {
              const updatedJob = { ...job };
              if (type === 'before') {
                updatedJob.beforeImages = [...updatedJob.beforeImages, e.target?.result as string];
              } else {
                updatedJob.afterImages = [...updatedJob.afterImages, e.target?.result as string];
              }
              return updatedJob;
            }
            return job;
          });
          
          setJobs(updatedJobs);
          setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
          
          toast({
            title: "Image Uploaded",
            description: `${type} image uploaded successfully for job ${selectedJob.id}`,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const getStatusBadge = (status: string) => {
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

  const transformJobForPrintables = (job: typeof technicianJobs[0]) => {
    return {
      id: job.id,
      customer: job.customer,
      device: job.deviceType,
      issue: job.issue,
      status: job.status,
      createdAt: job.createdAt,
      assignedTo: currentTechnician.name,
      serialNumber: job.serialNumber,
      phoneNumber: job.phoneNumber
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Technician Dashboard</h1>
        <div className="text-sm text-gray-500">
          Logged in as <span className="font-semibold">{currentTechnician.name}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>My Assigned Jobs</CardTitle>
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
        </CardHeader>
        <CardContent>
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
                  <TableRow key={job.id} className={selectedJob?.id === job.id ? "bg-gray-50" : ""}>
                    <TableCell className="font-medium">{job.id}</TableCell>
                    <TableCell>
                      <div>{job.deviceType}</div>
                      <div className="text-gray-500">{job.issue}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {job.serialNumber || 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSelectJob(job)}
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
        </CardContent>
      </Card>

      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Update Job: {selectedJob.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Device</label>
                  <div className="mt-1">{selectedJob.deviceType}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Serial Number</label>
                  <div className="mt-1 font-mono text-sm">{selectedJob.serialNumber || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Issue</label>
                  <div className="mt-1">{selectedJob.issue}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={jobStatus} 
                    onValueChange={setJobStatus}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="repair-in-progress">Repair In Progress</SelectItem>
                      <SelectItem value="repair-completed">Repair Completed</SelectItem>
                      <SelectItem value="stress-test">Stress Test</SelectItem>
                      <SelectItem value="ready-for-delivery">Ready for Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea 
                    placeholder="Describe the work done..." 
                    className="mt-1"
                    value={jobNotes}
                    onChange={(e) => setJobNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Images</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Before</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFileUpload('before')}
                        >
                          <Upload className="h-4 w-4 mr-1" /> Upload
                        </Button>
                      </div>
                      <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                        {selectedJob.beforeImages.length > 0 ? (
                          <div className="text-sm">
                            {selectedJob.beforeImages.length} image(s) uploaded
                          </div>
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">After</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFileUpload('after')}
                        >
                          <Upload className="h-4 w-4 mr-1" /> Upload
                        </Button>
                      </div>
                      <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                        {selectedJob.afterImages.length > 0 ? (
                          <div className="text-sm">
                            {selectedJob.afterImages.length} image(s) uploaded
                          </div>
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button 
                    className="w-full bg-repairam hover:bg-repairam-dark"
                    onClick={handleJobUpdate}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setSelectedJob(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechnicianDashboard;
