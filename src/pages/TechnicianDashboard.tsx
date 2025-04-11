
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
    status: 'received',
    notes: '',
    beforeImages: [],
    afterImages: [],
    createdAt: '2025-04-10',
    dueDate: '2025-04-15',
  },
  {
    id: 'JOB-1003',
    deviceType: 'Samsung Galaxy S21',
    issue: 'Charging Port',
    status: 'in-progress',
    notes: 'Ordered replacement part',
    beforeImages: ['damaged-port.jpg'],
    afterImages: [],
    createdAt: '2025-04-08',
    dueDate: '2025-04-18',
  },
  {
    id: 'JOB-1005',
    deviceType: 'iPad Pro',
    issue: 'Broken Home Button',
    status: 'in-progress',
    notes: 'Disassembled device, waiting for parts',
    beforeImages: ['broken-button.jpg'],
    afterImages: [],
    createdAt: '2025-04-06',
    dueDate: '2025-04-13',
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
    
    // Apply search term
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSelectJob = (job: typeof technicianJobs[0]) => {
    setSelectedJob(job);
    setJobNotes(job.notes);
    setJobStatus(job.status);
  };

  const handleJobUpdate = () => {
    if (!selectedJob) return;
    
    // Update job in the local state
    setJobs(jobs.map(job => 
      job.id === selectedJob.id 
        ? { ...job, notes: jobNotes, status: jobStatus } 
        : job
    ));
    
    // Clear selection and show success message
    setSelectedJob(null);
    toast({
      title: "Job Updated",
      description: `Job ${selectedJob.id} has been updated successfully.`,
    });
  };

  const handleFileUpload = (type: 'before' | 'after') => {
    // In a real app, this would trigger a file upload dialog
    // For demo purposes, we'll just show a toast
    toast({
      title: "Upload Feature",
      description: `The ${type} image upload would open here.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Received</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Delivered</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
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
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
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
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.dueDate}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSelectJob(job)}
                      >
                        Select
                      </Button>
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
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
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
