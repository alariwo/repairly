import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  Clipboard,
  Bell,
  FileText,
  Tag,
  Calendar,
  MapPin,
  Flag,
  CalendarDays,
  UserRound,
  ListFilter,
  ClipboardList,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { JobPrintables } from '@/components/jobs/JobPrintables';
import { sendEmailNotification } from '@/utils/notifications';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Technician {
  name: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  jobsCompleted: number;
  totalSpent: number;
  lastJob: string;
}

interface Job {
  _id?: string;
  id: string;
  customer: string;
  device: string;
  issue: string;
  serialNumber?: string;
  customerEmail?: string;
  phoneNumber?: string;
  address?: string;
  priority: string;
  dueDate: string | Date;
  status: string;
  assignedTo: string;
  hasNotification: boolean;
  createdAt?: string;
}

const Jobs = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [jobToUpdate, setJobToUpdate] = useState<Job | null>(null);
  const [updatedJob, setUpdatedJob] = useState<Partial<Job>>({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newJob, setNewJob] = useState({
    customer: '',
    device: '',
    issue: '',
    serialNumber: '',
    customerEmail: '',
    phoneNumber: '',
    address: '',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Additional state variables
  const [jobToView, setJobToView] = useState<Job | null>(null);
  const [jobDetailsDialogOpen, setJobDetailsDialogOpen] = useState(false);
  const [jobToAssign, setJobToAssign] = useState<Job | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/jobs ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load jobs.',
        variant: 'destructive',
      });
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/customers ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load customers.',
        variant: 'destructive',
      });
    }
  };

  // Fetch technicians
  const fetchTechnicians = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/user/users?role=technician ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch technicians');

      const result = await response.json();

      if (Array.isArray(result.users)) {
        setTechnicians(result.users.map(u => ({ name: u.name })));
      } else {
        throw new Error('Unexpected technician data format');
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load technicians.',
        variant: 'destructive',
      });
    }
  };

  // Create a new job via API
  const handleCreateJob = async () => {
    if (
      !newJob.customer ||
      !newJob.device ||
      !newJob.issue ||
      !newJob.dueDate ||
      !newJob.customerEmail
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const jobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
      const response = await fetch('https://repairly-backend.onrender.com/api/jobs ', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newJob,
          id: jobId,
          status: 'received',
          assignedTo: 'Unassigned',
          hasNotification: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create job');

      const createdJob = await response.json();
      setJobs([createdJob, ...jobs]);
      setIsNewJobDialogOpen(false);

      toast({
        title: 'Job Created',
        description: `New repair job ${jobId} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create job.',
        variant: 'destructive',
      });
    }
  };

  // Update job status
  const handleUpdateJobStatus = async () => {
    if (!jobToUpdate || !newStatus) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/jobs/${jobToUpdate.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update job status');

      const updatedJobData = await response.json();
      setJobs(jobs.map(job => (job.id === jobToUpdate.id ? updatedJobData : job)));
      setJobToUpdate(null);
      setStatusUpdateDialogOpen(false);

      try {
        await sendEmailNotification(jobToUpdate.customerEmail, jobToUpdate.id, newStatus);
        toast({
          title: 'Email Notification Sent',
          description: `Customer has been notified about status change for job ${jobToUpdate.id}`,
        });
      } catch (emailError) {
        toast({
          title: 'Email Failed',
          description: 'Failed to send email to customer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job status.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignJob = async () => {
    if (!jobToAssign || !selectedTechnician) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/jobs/${jobToAssign.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo: selectedTechnician }),
      });

      if (!response.ok) throw new Error('Failed to assign job');

      const updatedJob = await response.json();
      setJobs(jobs.map(job => (job.id === jobToAssign.id ? updatedJob : job)));
      setIsAssignDialogOpen(false);
      setJobToAssign(null);

      toast({
        title: 'Job Assigned',
        description: `Job ${jobToAssign.id} has been assigned to ${selectedTechnician}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign job.',
        variant: 'destructive',
      });
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId: string) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete job');

      const result = await response.json();
      if (result.message && result.message.includes('successfully')) {
        setJobs(jobs.filter(job => job.id !== jobId));
        toast({ title: 'Job Deleted', description: `Job ${jobId} has been deleted.` });
      } else {
        throw new Error('Unexpected server response.');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete job.',
        variant: 'destructive',
      });
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchJobs();
    fetchCustomers();
    fetchTechnicians();
  }, []);

  // Handle filter date change
  useEffect(() => {
    if (dateFilter) {
      const filtered = jobs.filter(job => {
        const jobDate = new Date(job.dueDate);
        const filterDate = new Date(dateFilter);
        return (
          jobDate.getDate() === filterDate.getDate() &&
          jobDate.getMonth() === filterDate.getMonth() &&
          jobDate.getFullYear() === filterDate.getFullYear()
        );
      });
      // You can do something with filtered results here
    }
  }, [dateFilter]);

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'picked-up':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Picked Up</Badge>;
      case 'received':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Received</Badge>;
      case 'diagnosis':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Under Diagnosis</Badge>;
      case 'repair-in-progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Repair In Progress</Badge>;
      case 'repair-completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Repair Completed</Badge>;
      case 'stress-test':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Stress Test</Badge>;
      case 'ready-for-delivery':
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Ready for Delivery</Badge>;
      case 'delivered':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Delivered</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  // Get priority badge component
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{priority}</Badge>;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setTechnicianFilter('all');
    setDateFilter(undefined);
    setSearchTerm('');
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && job.priority !== priorityFilter) return false;
    if (technicianFilter !== 'all' && job.assignedTo !== technicianFilter) return false;
    if (dateFilter) {
      const jobDate = new Date(job.dueDate);
      const filterDate = new Date(dateFilter);
      if (
        jobDate.getDate() !== filterDate.getDate() ||
        jobDate.getMonth() !== filterDate.getMonth() ||
        jobDate.getFullYear() !== filterDate.getFullYear()
      )
        return false;
    }
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.serialNumber && job.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // 🔢 Pagination logic
  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const notificationJobs = jobs.filter(job => job.hasNotification);

  // Clear all notifications
  const handleClearNotifications = () => {
    setShowNotifications(false);
    setJobs(jobs.map(job => ({ ...job, hasNotification: false })));
    toast({ title: "Notifications Cleared", description: "All notifications have been marked as read." });
  };

  // Open view job details dialog
  const handleViewDetails = (job: Job) => {
    setJobToView(job);
    setJobDetailsDialogOpen(true);
  };

  // Open status update dialog
  const openStatusUpdateDialog = (job: Job) => {
    setJobToUpdate(job);
    setNewStatus(job.status);
    setStatusUpdateNote('');
    setStatusUpdateDialogOpen(true);
  };

  // Submit status update
  const handleStatusUpdateSubmit = () => {
    if (!jobToUpdate || newStatus === jobToUpdate.status) return;
    setJobs(
      jobs.map(job =>
        job.id === jobToUpdate.id ? { ...job, status: newStatus } : job
      )
    );
    setStatusUpdateDialogOpen(false);
    setJobToUpdate(null);
    toast({ title: "Status Updated", description: `Job ${jobToUpdate?.id} status changed to ${newStatus}` });
  };

  // Open assign technician dialog
  const openAssignDialog = (job: Job) => {
    setJobToAssign(job);
    setIsAssignDialogOpen(true);
  };

  // Handle dropdown menu actions
  const handleMenuAction = useCallback(
    (action: string, job: Job) => {
      switch (action) {
        case 'view-details':
          handleViewDetails(job);
          break;
        case 'update-status':
          openStatusUpdateDialog(job);
          break;
        case 'assign-technician':
          openAssignDialog(job);
          break;
        case 'create-invoice':
          toast({ title: 'Create Invoice', description: `Creating invoice for job ${job.id}` });
          navigate(`/invoices?jobId=${job.id}`);
          break;
        case 'message-customer':
          sendEmailNotification(job.customerEmail, job.id, job.status)
            .then(() =>
              toast({ title: 'Email Sent', description: `Customer notified for job ${job.id}` })
            )
            .catch(() =>
              toast({ title: 'Email Failed', description: 'Failed to send email.', variant: 'destructive' })
            );
          break;
        case 'delete-job':
          handleDeleteJob(job.id);
          break;
        default:
          break;
      }
    },
    [navigate, toast]
  );

  // Safe close for job details dialog
  const safeCloseJobDetailsDialog = () => {
    setJobDetailsDialogOpen(false);
    setJobToView(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center p-6 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Repair Jobs</h1>
        <div className="flex space-x-3">
          <Button variant="outline" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5" />
            {notificationJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {notificationJobs.length}
              </span>
            )}
          </Button>
          <Button onClick={() => setIsNewJobDialogOpen(true)} className="bg-repairam hover:bg-repairam-dark">
            <PlusCircle className="mr-2 h-4 w-4" /> New Job
          </Button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && notificationJobs.length > 0 && (
        <div className="space-y-3 px-6 py-4 bg-gray-50">
          {notificationJobs.map((job) => (
            <Alert key={job.id} className="border-l-4 border-l-repairam">
              <AlertTitle className="flex justify-between">
                <span>Status Update: {job.id}</span>
                <span className="text-xs text-gray-500">Today</span>
              </AlertTitle>
              <AlertDescription>
                <p>
                  {job.assignedTo} has marked this job as{' '}
                  <strong>{job.status.replace('-', ' ')}</strong>
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleStatusChange(job.id, 'delivered')}>
                    Mark as Delivered
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearNotifications}>
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Job Management Card */}
      <Card className="sm:max-h-[calc(100vh-20rem)] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Job Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-1"
              >
                <ListFilter className="h-4 w-4" />
                {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, serial numbers..."
                  className="pl-10 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          {isFilterExpanded && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border">
              <div>
                <Label className="text-xs mb-1 block">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="diagnosis">Under Diagnosis</SelectItem>
                    <SelectItem value="repair-in-progress">Repair In Progress</SelectItem>
                    <SelectItem value="repair-completed">Repair Completed</SelectItem>
                    <SelectItem value="stress-test">Stress Test</SelectItem>
                    <SelectItem value="ready-for-delivery">Ready for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Priority</Label>
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value)}>
                  <SelectTrigger className="w-full">
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

              <div>
                <Label className="text-xs mb-1 block">Technician</Label>
                <Select value={technicianFilter} onValueChange={(value) => setTechnicianFilter(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.name} value={tech.name}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      {dateFilter ? format(dateFilter, "PPP") : <span>Select due date</span>}
                      <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                    {dateFilter && (
                      <div className="p-3 border-t border-border flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="md:col-span-4 flex justify-end mt-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Job ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Device/Issue</th>
                    <th className="px-6 py-3">Serial Number</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs">{job.id}</td>
                      <td className="px-6 py-4">{job.customer}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{job.device}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{job.issue}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{job.serialNumber || 'N/A'}</td>
                      <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                      <td className="px-6 py-4">{getPriorityBadge(job.priority)}</td>
                      <td className="px-6 py-4">{format(new Date(job.dueDate), 'PPP')}</td>
                      <td className="px-6 py-4">{job.assignedTo}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <JobPrintables job={job} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleMenuAction('view-details', job)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMenuAction('update-status', job)}>Update Status</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMenuAction('assign-technician', job)}>Assign Technician</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleMenuAction('delete-job', job)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Job Dialog */}
      <Dialog open={isNewJobDialogOpen} onOpenChange={setIsNewJobDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Repair Job</DialogTitle>
            <DialogDescription>Enter the details for the new repair job below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                name="customer"
                placeholder="Customer name"
                value={newJob.customer}
                onChange={(e) => setNewJob({ ...newJob, customer: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="device">Device Type</Label>
              <Input
                id="device"
                name="device"
                placeholder="Phone, laptop, etc."
                value={newJob.device}
                onChange={(e) => setNewJob({ ...newJob, device: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issue">Issue Description</Label>
              <Textarea
                id="issue"
                name="issue"
                placeholder="Describe the issue with the device"
                value={newJob.issue}
                onChange={(e) => setNewJob({ ...newJob, issue: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                placeholder="Device serial number"
                value={newJob.serialNumber}
                onChange={(e) => setNewJob({ ...newJob, serialNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                placeholder="customer@example.com"
                value={newJob.customerEmail}
                onChange={(e) => setNewJob({ ...newJob, customerEmail: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+1 (555) 123-4567"
                value={newJob.phoneNumber}
                onChange={(e) => setNewJob({ ...newJob, phoneNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Customer address"
                value={newJob.address}
                onChange={(e) => setNewJob({ ...newJob, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={newJob.priority} onValueChange={(value) => setNewJob({ ...newJob, priority: value })}>
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
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !newJob.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {newJob.dueDate ? format(new Date(newJob.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newJob.dueDate ? new Date(newJob.dueDate) : undefined}
                    onSelect={(date) =>
                      setNewJob({ ...newJob, dueDate: date?.toISOString().split("T")[0] || "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewJobDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-repairam hover:bg-repairam-dark" onClick={handleCreateJob}>
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>Change the current status of this repair job.</DialogDescription>
          </DialogHeader>
          {jobToUpdate && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Current Status</Label>
                <Badge variant="outline" className="inline-flex w-fit px-3 py-1">
                  {jobToUpdate.status.replace('-', ' ')}
                </Badge>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="diagnosis">Under Diagnosis</SelectItem>
                    <SelectItem value="repair-in-progress">Repair In Progress</SelectItem>
                    <SelectItem value="repair-completed">Repair Completed</SelectItem>
                    <SelectItem value="stress-test">Stress Test</SelectItem>
                    <SelectItem value="ready-for-delivery">Ready for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-repairam hover:bg-repairam-dark" onClick={handleStatusUpdateSubmit}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>Select which technician should handle this repair job.</DialogDescription>
          </DialogHeader>
          {jobToAssign && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Job Information</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p><strong>Job ID:</strong> {jobToAssign.id}</p>
                  <p><strong>Device:</strong> {jobToAssign.device}</p>
                  <p><strong>Issue:</strong> {jobToAssign.issue}</p>
                  <p><strong>Current Technician:</strong> {jobToAssign.assignedTo}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="technician">Assign to Technician</Label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.name} value={tech.name}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-repairam hover:bg-repairam-dark"
              onClick={handleAssignJob}
              disabled={!selectedTechnician || (jobToAssign && selectedTechnician === jobToAssign.assignedTo)}
            >
              Assign Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Job Details Dialog */}
<Dialog open={jobDetailsDialogOpen} onOpenChange={safeCloseJobDetailsDialog}>
  <DialogContent className="sm:max-w-[700px] max-h-screen overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Job Details</DialogTitle>
    </DialogHeader>
    {jobToView && (
      <div className="space-y-6 p-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{jobToView.device}</h3>
            <p className="text-gray-500 text-sm">{jobToView.issue}</p>
          </div>
          <div>{getStatusBadge(jobToView.status)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Customer Info:</h4>
            <div className="mt-1 space-y-1">
              <p className="font-medium">{jobToView.customer}</p>
              {jobToView.customerEmail && (
                <p className="text-sm text-blue-600">{jobToView.customerEmail}</p>
              )}
              {jobToView.phoneNumber && (
                <p className="text-sm">{jobToView.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Serial Number */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Device Serial Number:</h4>
            <p className="mt-1 font-mono text-sm">{jobToView.serialNumber || 'N/A'}</p>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Technician:</h4>
            <p className="mt-1">{jobToView.assignedTo}</p>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Dates:</h4>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Created:</p>
                <p className="text-sm">{format(new Date(jobToView.createdAt), 'PPP')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date:</p>
                <p className="text-sm">{format(new Date(jobToView.dueDate), 'PPP')}</p>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Priority:</h4>
            <div className="mt-1">{getPriorityBadge(jobToView.priority)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium text-gray-500">Actions:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                safeCloseJobDetailsDialog();
                openStatusUpdateDialog(jobToView);
              }}
            >
              Update Job Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                safeCloseJobDetailsDialog();
                openAssignDialog(jobToView);
              }}
            >
              Assign To A Technician
            </Button>
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Jobs;