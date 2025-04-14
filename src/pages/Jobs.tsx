import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, MoreHorizontal, Clipboard, Bell, FileText, Tag, Calendar, MapPin, Flag, CalendarDays, UserRound, ListFilter } from 'lucide-react';
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
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [localJobs, setLocalJobs] = useLocalStorage('repair-app-jobs', initialJobs);
  const [newJob, setNewJob] = useState({
    customer: '',
    device: '',
    issue: '',
    serialNumber: '',
    customerEmail: '',
    phoneNumber: '',
    address: '',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [jobDetailsDialogOpen, setJobDetailsDialogOpen] = useState(false);
  const [jobToView, setJobToView] = useState<typeof initialJobs[0] | null>(null);
  const [localCustomers, setLocalCustomers] = useLocalStorage('repair-app-customers', []);
  const dialogRef = useRef<HTMLDivElement>(null);

  const technicians = React.useMemo(() => {
    const techSet = new Set(localJobs.map(job => job.assignedTo));
    return Array.from(techSet);
  }, [localJobs]);

  const safeCloseJobDetailsDialog = useCallback(() => {
    setJobDetailsDialogOpen(false);
    setTimeout(() => {
      navigate('/jobs', { replace: true });
      setJobToView(null);
    }, 10);
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get('jobId');
    
    if (jobId) {
      const job = localJobs.find(j => j.id === jobId);
      if (job) {
        setJobToView(job);
        setJobDetailsDialogOpen(true);
      }
    }

    const handleOpenNewJobDialog = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { customer, email, phone } = customEvent.detail;
        setNewJob(prev => ({
          ...prev,
          customer: customer || prev.customer,
          customerEmail: email || prev.customerEmail,
          phoneNumber: phone || prev.phoneNumber
        }));
      }
      setIsNewJobDialogOpen(true);
    };
    
    window.addEventListener('open-new-job-dialog', handleOpenNewJobDialog);
    
    return () => {
      window.removeEventListener('open-new-job-dialog', handleOpenNewJobDialog);
    };
  }, [location.search, localJobs]);

  const handleNewJob = () => {
    setNewJob({
      customer: '',
      device: '',
      issue: '',
      serialNumber: '',
      customerEmail: '',
      phoneNumber: '',
      address: '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    setIsNewJobDialogOpen(true);
  };

  const handleCreateJob = () => {
    if (!newJob.customer || !newJob.device || !newJob.issue || !newJob.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const jobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdJob = {
      ...newJob,
      id: jobId,
      status: 'received',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: newJob.dueDate instanceof Date 
        ? newJob.dueDate.toISOString().split('T')[0] 
        : newJob.dueDate,
      assignedTo: 'Unassigned',
      hasNotification: false
    };
    
    setLocalJobs([createdJob, ...localJobs]);
    
    const existingCustomerIndex = localCustomers.findIndex(
      c => c.email === newJob.customerEmail
    );
    
    if (existingCustomerIndex >= 0) {
      const updatedCustomers = [...localCustomers];
      updatedCustomers[existingCustomerIndex] = {
        ...updatedCustomers[existingCustomerIndex],
        name: newJob.customer,
        email: newJob.customerEmail,
        phone: newJob.phoneNumber || updatedCustomers[existingCustomerIndex].phone,
        location: newJob.address || updatedCustomers[existingCustomerIndex].location,
        jobsCompleted: updatedCustomers[existingCustomerIndex].jobsCompleted,
        totalSpent: updatedCustomers[existingCustomerIndex].totalSpent,
        lastJob: new Date().toISOString().split('T')[0]
      };
      setLocalCustomers(updatedCustomers);
    } else {
      const newCustomer = {
        id: localCustomers.length > 0 ? Math.max(...localCustomers.map(c => c.id)) + 1 : 1,
        name: newJob.customer,
        email: newJob.customerEmail,
        phone: newJob.phoneNumber || '',
        location: newJob.address || '',
        jobsCompleted: 0,
        totalSpent: 0,
        lastJob: new Date().toISOString().split('T')[0]
      };
      setLocalCustomers([newCustomer, ...localCustomers]);
    }
    
    setNewJob({
      customer: '',
      device: '',
      issue: '',
      serialNumber: '',
      customerEmail: '',
      phoneNumber: '',
      address: '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    setTimeout(() => {
      setIsNewJobDialogOpen(false);
      
      toast({
        title: "Job Created",
        description: `New repair job ${jobId} has been created successfully.`,
      });
    }, 10);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'picked-up':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Picked Up</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Received</Badge>;
      case 'diagnosis':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Under Diagnosis</Badge>;
      case 'repair-in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Repair In Progress</Badge>;
      case 'repair-completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Repair Completed</Badge>;
      case 'stress-test':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Stress Test</Badge>;
      case 'ready-for-delivery':
        return <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-200">Ready for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Delivered</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-200 text-green-900 border-green-300">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{priority}</Badge>;
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setTechnicianFilter('all');
    setDateFilter(undefined);
    setSearchTerm('');
  };

  const filteredJobs = localJobs.filter(job => {
    if (statusFilter !== 'all' && job.status !== statusFilter) {
      return false;
    }
    
    if (priorityFilter !== 'all' && job.priority !== priorityFilter) {
      return false;
    }
    
    if (technicianFilter !== 'all' && job.assignedTo !== technicianFilter) {
      return false;
    }
    
    if (dateFilter) {
      const jobDate = new Date(job.dueDate);
      const filterDate = new Date(dateFilter);
      
      if (
        jobDate.getDate() !== filterDate.getDate() ||
        jobDate.getMonth() !== filterDate.getMonth() ||
        jobDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }
    
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.serialNumber && job.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const notificationJobs = localJobs.filter(job => job.hasNotification);
  
  const handleClearNotifications = () => {
    setShowNotifications(false);
    setLocalJobs(localJobs.map(job => ({
      ...job,
      hasNotification: false
    })));
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been marked as read.",
    });
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const job = localJobs.find(j => j.id === jobId);
    if (!job) return;
    
    const updatedJobs = localJobs.map(j => 
      j.id === jobId 
        ? { ...j, status: newStatus } 
        : j
    );
    setLocalJobs(updatedJobs);
    
    toast({
      title: "Status Updated",
      description: `Job ${jobId} status changed to ${newStatus.replace('-', ' ')}`,
    });
    
    if (newStatus === 'ready-for-delivery' || newStatus === 'completed') {
      try {
        await sendEmailNotification(job.customerEmail, job.id, newStatus);
        toast({
          title: "Email Notification Sent",
          description: `Customer has been notified about status change for job ${jobId}`,
        });
      } catch (error) {
        toast({
          title: "Email Failed",
          description: "Failed to send email notification to customer",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewDetails = useCallback((job: typeof initialJobs[0]) => {
    setJobToView(job);
    setJobDetailsDialogOpen(true);
    navigate(`/jobs?jobId=${job.id}`, { replace: true });
  }, [navigate]);

  const handleMenuAction = useCallback((action: string, job: typeof initialJobs[0]) => {
    switch (action) {
      case 'view-details':
        handleViewDetails(job);
        break;
      case 'update-status':
        setActiveJob(job.id);
        toast({
          title: "Status Update",
          description: "Please select a new status for this job",
        });
        break;
      case 'add-parts':
        toast({
          title: "Add Parts",
          description: "Parts inventory system would open here",
        });
        break;
      case 'create-invoice':
        toast({
          title: "Create Invoice",
          description: `Creating invoice for job ${job.id}`,
        });
        navigate(`/invoices?jobId=${job.id}`);
        break;
      case 'message-customer':
        sendEmailNotification(job.customerEmail, job.id, job.status)
          .then(() => {
            toast({
              title: "Email Sent",
              description: `Customer has been notified about job ${job.id}`,
            });
          })
          .catch(() => {
            toast({
              title: "Email Failed",
              description: "Failed to send email to customer",
              variant: "destructive"
            });
          });
        break;
      default:
        break;
    }
  }, [handleViewDetails, navigate, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Repair Jobs</h1>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="relative" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {notificationJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {notificationJobs.length}
              </span>
            )}
          </Button>
          <Button onClick={handleNewJob} className="bg-repairam hover:bg-repairam-dark">
            <PlusCircle className="mr-2 h-4 w-4" /> New Job
          </Button>
        </div>
      </div>

      {showNotifications && notificationJobs.length > 0 && (
        <div className="space-y-3">
          {notificationJobs.map(job => (
            <Alert key={job.id} className="border-l-4 border-l-repairam">
              <AlertTitle className="flex justify-between">
                <span>Status Update: {job.id}</span>
                <span className="text-xs text-gray-500">Today</span>
              </AlertTitle>
              <AlertDescription>
                <p>{job.assignedTo} has marked this job as <strong>{job.status.replace('-', ' ')}</strong></p>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => handleStatusChange(job.id, 'delivered')}
                  >
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

      <Card>
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
          
          {isFilterExpanded && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border">
              <div>
                <Label className="text-xs mb-1 block">Status</Label>
                <Select 
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="picked-up">Picked Up</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="diagnosis">Under Diagnosis</SelectItem>
                    <SelectItem value="repair-in-progress">Repair In Progress</SelectItem>
                    <SelectItem value="repair-completed">Repair Completed</SelectItem>
                    <SelectItem value="stress-test">Stress Test</SelectItem>
                    <SelectItem value="ready-for-delivery">Ready for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs mb-1 block">Priority</Label>
                <Select 
                  value={priorityFilter}
                  onValueChange={(value) => setPriorityFilter(value)}
                >
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
                <Select 
                  value={technicianFilter}
                  onValueChange={(value) => setTechnicianFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {technicians.map(tech => (
                      <SelectItem key={tech} value={tech}>{tech}</SelectItem>
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
                      {dateFilter ? (
                        format(dateFilter, "PPP")
                      ) : (
                        <span>Select due date</span>
                      )}
                      <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                    {dateFilter && (
                      <div className="p-3 border-t border-border flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDateFilter(undefined)}
                        >
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
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className={`bg-white border-b hover:bg-gray-50 ${activeJob === job.id ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 font-medium">
                        {job.id}
                        {job.hasNotification && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                        )}
                      </td>
                      <td className="px-6 py-4">{job.customer}</td>
                      <td className="px-6 py-4">
                        <div>{job.device}</div>
                        <div className="text-gray-500">{job.issue}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {job.serialNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(job.priority)}
                      </td>
                      <td className="px-6 py-4">{job.dueDate}</td>
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
                              <DropdownMenuItem onClick={() => handleMenuAction('view-details', job)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMenuAction('update-status', job)}>
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleMenuAction('add-parts', job)}>
                                Add Parts
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMenuAction('create-invoice', job)}>
                                Create Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMenuAction('message-customer', job)}>
                                Message Customer
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
            
            {filteredJobs.length === 0 && (
              <div className="py-10 text-center text-gray-500">
                <p>No jobs found matching your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isNewJobDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => {
            setIsNewJobDialogOpen(false);
            setNewJob({
              customer: '',
              device: '',
              issue: '',
              serialNumber: '',
              customerEmail: '',
              phoneNumber: '',
              address: '',
              priority: 'medium',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
          }, 10);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Repair Job</DialogTitle>
            <DialogDescription>
              Enter the details for the new repair job. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer *
              </Label>
              <Input
                id="customer"
                value={newJob.customer}
                onChange={(e) => setNewJob({ ...newJob, customer: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={newJob.customerEmail}
                onChange={(e) => setNewJob({ ...newJob, customerEmail: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newJob.phoneNumber}
                onChange={(e) => setNewJob({ ...newJob, phoneNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </Label>
              <Input
                id="address"
                value={newJob.address}
                onChange={(e) => setNewJob({ ...newJob, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device" className="text-right">
                Device *
              </Label>
              <Input
                id="device"
                value={newJob.device}
                onChange={(e) => setNewJob({ ...newJob, device: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serial" className="text-right">
                Serial Number
              </Label>
              <Input
                id="serial"
                value={newJob.serialNumber}
                onChange={(e) => setNewJob({ ...newJob, serialNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issue" className="text-right">
                Issue *
              </Label>
              <Input
                id="issue"
                value={newJob.issue}
                onChange={(e) => setNewJob({ ...newJob, issue: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority
              </Label>
              <Select 
                value={newJob.priority} 
                onValueChange={(value) => setNewJob({ ...newJob, priority: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newJob.dueDate && "text-muted-foreground"
                      )}
                    >
                      {newJob.dueDate instanceof Date ? (
                        format(newJob.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newJob.dueDate instanceof Date ? newJob.dueDate : undefined}
                      onSelect={(date) => setNewJob({ ...newJob, dueDate: date || new Date() })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewJobDialogOpen(false);
              setNewJob({
                customer: '',
                device: '',
                issue: '',
                serialNumber: '',
                customerEmail: '',
                phoneNumber: '',
                address: '',
                priority: 'medium',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              });
            }}>Cancel</Button>
            <Button onClick={handleCreateJob}>Create Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={jobDetailsDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            safeCloseJobDetailsDialog();
          }
        }}
      >
        {jobToView && (
          <DialogContent className="sm:max-w-[650px]" ref={dialogRef}>
            <DialogHeader>
              <DialogTitle>Job Details: {jobToView.id}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Customer</h4>
                <p>{jobToView.customer}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Contact</h4>
                <p>{jobToView.customerEmail}</p>
                <p>{jobToView.phoneNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Device</h4>
                <p>{jobToView.device}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Serial Number</h4>
                <p className="font-mono text-xs">{jobToView.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Issue</h4>
                <p>{jobToView.issue}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <div className="mt-1">{getStatusBadge(jobToView.status)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p>{jobToView.createdAt}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Due Date</h4>
                <p>{jobToView.dueDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Priority</h4>
                <div className="mt-1">{getPriorityBadge(jobToView.priority)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Assigned To</h4>
                <p>{jobToView.assignedTo}</p>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <div>
                <JobPrintables job={jobToView} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  handleMenuAction('update-status', jobToView);
                  safeCloseJobDetailsDialog();
                }}>
                  Update Status
                </Button>
                <Button onClick={() => {
                  handleMenuAction('message-customer', jobToView);
                }}>
                  Message Customer
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Jobs;
