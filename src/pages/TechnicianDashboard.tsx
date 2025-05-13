import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import {
  Clock,
  CheckCircle,
  Users,
  Calendar,
  FileText,
  Package,
  Bell,
  Search,
  MoreHorizontal,
  RotateCw,
  Download,
  Printer,
} from 'lucide-react';

// Types
interface Job {
  _id?: string;
  id: string;
  deviceType: string;
  issue: string;
  serialNumber: string;
  status: string;
  dueDate: string;
  assignedTo: string;
  customerEmail: string;
  technicianNotes?: string;
}

const TechnicianDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentTechnician, setCurrentTechnician] = useState<{ name: string; role: string } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [reassignTechnician, setReassignTechnician] = useState('');
  const [technicians, setTechnicians] = useState<{ name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Get logged-in technician info
  const getLoggedInTechnicianName = () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    try {
      const user = JSON.parse(userString);
      return {
        name: user.name || user.email,
        role: user.role,
      };
    } catch (error) {
      console.error('Failed to parse user:', error);
      return null;
    }
  };

  // Fetch technician jobs
  const fetchTechnicianJobs = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const technician = getLoggedInTechnicianName();
      if (!technician) throw new Error('Could not identify technician');

      const response = await fetch(`https://repairly-backend.onrender.com/api/technicians/${encodeURIComponent(technician.name!)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to load technician jobs.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Map API response to expected format
      const formattedJobs = data.map((job) => ({
        ...job,
        id: job.jobId,
        deviceType: job.deviceType || 'Unknown Device',
        issue: job.issueDescription || 'No description provided',
        serialNumber: job.serialNumber || 'N/A',
        status: job.status || 'unknown',
        dueDate: job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A',
        assignedTo: technician.name,
        customerEmail: job.customerEmail || 'N/A',
      }));

      setJobs(formattedJobs);
      setCurrentTechnician(technician);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load technician jobs.',
        variant: 'destructive',
      });
    }
  };

  // Fetch list of technicians for reassign modal
  const fetchTechniciansList = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const res = await fetch('https://repairly-backend.onrender.com/api/user ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch technicians');

      const result = await res.json();

      const techList = result.users
        .filter((user) => user.role === 'technician' || user.role === 'admin')
        .map((user) => ({ name: user.name }));

      setTechnicians(techList);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch technician list.',
        variant: 'destructive',
      });
    }
  };

  // Handle update job status
  const handleUpdateJobStatus = async () => {
    if (!selectedJob || !newStatus) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const jobId = selectedJob._id || selectedJob.id;

      const response = await fetch(`https://repairly-backend.onrender.com/api/jobs/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to update job status.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedJob = await response.json();

      setJobs(jobs.map(job => (job.id === jobId ? updatedJob : job)));
      setIsStatusDialogOpen(false);
      toast({ title: 'Status Updated', description: `Job #${jobId} status changed to "${newStatus}"` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job status.',
        variant: 'destructive',
      });
    }
  };

  // Handle reassign job
  const handleReassignJob = async () => {
    if (!selectedJob || !reassignTechnician) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const jobId = selectedJob._id || selectedJob.id;

      const response = await fetch(`https://repairly-backend.onrender.com/api/jobs/jobs/${jobId}/reassign`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newTechnician: reassignTechnician,
          note: 'Job reassigned via dashboard',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to reassign job.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedJob = await response.json();
      setJobs(jobs.map(job => (job.id === jobId ? updatedJob : job)));
      setIsReassignDialogOpen(false);
      toast({ title: 'Job Reassigned', description: `Job #${jobId} reassigned to "${reassignTechnician}"` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reassign job.',
        variant: 'destructive',
      });
    }
  };

  // Generate printable job card
  const generatePrintableJobCard = (job: Job) => {
    const wrapper = document.createElement("div");
    wrapper.style.padding = "20px";
    wrapper.style.backgroundColor = "#ffffff";
    wrapper.innerHTML = `
      <h2>Repair Job Card</h2>
      <p><strong>Job ID:</strong> ${job.id}</p>
      <p><strong>Device:</strong> ${job.deviceType}</p>
      <p><strong>Status:</strong> ${job.status}</p>
      <p><strong>Due Date:</strong> ${new Date(job.dueDate).toLocaleDateString()}</p>
      <p><strong>Issue:</strong> ${job.issue}</p>
    `;
    document.body.appendChild(wrapper);

    const options = {
      margin: [10, 10],
      filename: `${job.id}_job_card.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf(wrapper, options).save();
    document.body.removeChild(wrapper);
  };

  // Open status dialog
  const openStatusUpdateDialog = (job: Job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setIsStatusDialogOpen(true);
  };

  // Open reassign dialog
  const openReassignDialog = (job: Job) => {
    setSelectedJob(job);
    setReassignTechnician('');
    setIsReassignDialogOpen(true);
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) =>
    job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.issue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'picked-up':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Picked Up</Badge>;
      case 'received':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Received</Badge>;
      case 'diagnosis':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Diagnosis</Badge>;
      case 'repair-completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Repair Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Load data on mount
  useEffect(() => {
    const technician = getLoggedInTechnicianName();
    if (!technician) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in as a technician.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (technician.role !== 'technician' && technician.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only technicians or admins can access this page.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    fetchTechnicianJobs();
    fetchTechniciansList();
  }, []);

  return (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Technician Dashboard</h1>
        <div className="text-sm text-gray-500">
            Logged in as{' '}
            <span className="font-semibold">{currentTechnician?.name || 'Unknown'}</span>
          </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50 cursor-pointer">
                      <TableCell className="font-medium">{job.id}</TableCell>
                      <TableCell>{job.deviceType}</TableCell>
                      <TableCell>{job.issue}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{job.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openStatusUpdateDialog(job)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openReassignDialog(job)}>
                          <Users className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No jobs found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update Status Modal */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>Select the new status below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Select New Status</Label>
              <Select onValueChange={setNewStatus} value={newStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="repair-completed">Repair Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Optional Note</Label>
              <Input
                id="note"
                placeholder="Add a note for admin/customer"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateJobStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Technician Modal */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Job</DialogTitle>
            <DialogDescription>Select a new technician for this job.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="technician">Technician</Label>
              <Select onValueChange={setReassignTechnician} value={reassignTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech, index) => (
                    <SelectItem key={index} value={tech.name}>{tech.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason For Reassignment(Optional):</Label>
              <Input
                id="reason"
                placeholder="Why are you reassigning?"
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReassignJob}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicianDashboard;