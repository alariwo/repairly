import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, MoreHorizontal, Clipboard, Bell, FileText, Tag, Calendar, MapPin, Flag, CalendarDays, UserRound, ListFilter, ClipboardList, Mail, Phone } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JobPrintables } from '@/components/jobs/JobPrintables';
import { sendEmailNotification } from '@/utils/notifications';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from "@/lib/utils";
import { Textarea } from '@/components/ui/textarea';
import { PartsSelector } from '@/components/parts/PartsSelector';

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

const Jobs = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);
  const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  
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
  
  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setIsJobDetailsDialogOpen(true);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'diagnosis':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Diagnosis</Badge>;
      case 'repair-in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Repair in Progress</Badge>;
      case 'repair-completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Repair Completed</Badge>;
      case 'ready-for-delivery':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Ready for Delivery</Badge>;
      case 'picked-up':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Picked Up</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs, customers, devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
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
                onValueChange={setPriorityFilter}
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
                    <td className="p-4 align-middle">{getStatusBadge(job.status)}</td>
                    <td className="p-4 align-middle">{getPriorityBadge(job.priority)}</td>
                    <td className="p-4 align-middle">{job.dueDate}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewJobDetails(job)}
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
        </CardContent>
      </Card>
      
      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={isJobDetailsDialogOpen} onOpenChange={setIsJobDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Job Details: {selectedJob.id}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedJob.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedJob.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedJob.phoneNumber}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Device Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Device:</span>
                      <span>{selectedJob.device}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Serial Number:</span>
                      <code className="bg-muted p-1 rounded text-xs">{selectedJob.serialNumber}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Issue:</span>
                      <span>{selectedJob.issue}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Repair Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedJob.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      {getPriorityBadge(selectedJob.priority)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span>{selectedJob.assignedTo}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{selectedJob.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{selectedJob.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Parts Used</h3>
              <div className="border rounded-md p-4 space-y-2">
                <PartsSelector 
                  jobId={selectedJob.id} 
                  customerName={selectedJob.customer}
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Timeline
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Customer
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsJobDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Create New Job Dialog */}
      <Dialog open={isCreateJobDialogOpen} onOpenChange={setIsCreateJobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Repair Job</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input id="customer" placeholder="Enter customer name" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="customer@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(555) 123-4567" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Input id="device" placeholder="iPhone 12, MacBook Pro, etc." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serial">Serial Number (Optional)</Label>
              <Input id="serial" placeholder="Enter device serial number" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issue">Issue Description</Label>
              <Textarea id="issue" placeholder="Describe the issue with the device..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      <span>Pick a date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateJobDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Job Created",
                description: "New repair job has been created successfully."
              });
              setIsCreateJobDialogOpen(false);
            }}>
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
