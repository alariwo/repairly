
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { JobList } from '@/components/technician/JobList';
import { JobDetailsEditor } from '@/components/technician/JobDetailsEditor';
import { JobReassignmentDialog } from '@/components/technician/JobReassignmentDialog';
import { sendEmailWithAttachments } from '@/utils/notifications';

// Mock data
const currentTechnician = {
  id: 'tech-001',
  name: 'Mike Technician',
};

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
    phoneNumber: '555-123-4567',
    customerEmail: 'john.smith@example.com'
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
    phoneNumber: '555-345-6789',
    customerEmail: 'michael.b@example.com'
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
    phoneNumber: '555-567-8901',
    customerEmail: 'david.w@example.com'
  },
];

const otherTechnicians = [
  { id: 'tech-002', name: 'Lisa Technician' },
  { id: 'tech-003', name: 'John Technician' },
  { id: 'tech-004', name: 'Sarah Technician' },
];

const TechnicianDashboard = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(technicianJobs);
  const [selectedJob, setSelectedJob] = useState<null | typeof technicianJobs[0]>(null);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [statusUpdateHistory, setStatusUpdateHistory] = useState<Record<string, string[]>>({});

  // Effect to simulate syncing with backend/database
  useEffect(() => {
    console.log('Jobs updated:', jobs);
    // This would be where you sync with your backend in a real app
  }, [jobs]);

  const handleSelectJob = (job: typeof technicianJobs[0]) => {
    setSelectedJob(job);
    
    toast({
      title: "Job Selected",
      description: `You are now editing job ${job.id}`,
    });
  };

  const handleJobUpdate = (updatedJobData: Partial<typeof technicianJobs[0]>) => {
    if (!selectedJob) return;
    
    const updatedJobs = jobs.map(job => 
      job.id === selectedJob.id 
        ? { ...job, ...updatedJobData } 
        : job
    );
    
    setJobs(updatedJobs);
    
    // Find the updated job to set as selected
    const updatedJob = updatedJobs.find(job => job.id === selectedJob.id);
    if (updatedJob) {
      setSelectedJob(updatedJob);
    }
    
    const newStatus = updatedJobData.status;
    if (newStatus && newStatus !== selectedJob.status) {
      // Track status update history
      setStatusUpdateHistory(prev => ({
        ...prev,
        [selectedJob.id]: [
          ...(prev[selectedJob.id] || []),
          `Status changed from ${selectedJob.status} to ${newStatus} on ${new Date().toLocaleString()}`
        ]
      }));

      if (newStatus === 'repair-completed' || newStatus === 'ready-for-delivery') {
        toast({
          title: "Admin Notification Sent",
          description: `Admin has been notified about the status change for job ${selectedJob.id}.`,
        });
      }
    }
    
    toast({
      title: "Job Updated",
      description: `Job ${selectedJob.id} has been updated successfully.`,
    });
  };

  const handleNotifyCustomer = async (job: typeof technicianJobs[0], notes: string) => {
    if (!job.customerEmail) return;
    
    const statusName = job.status.replace(/-/g, ' ');
    const emailContent = `
      Dear ${job.customer},
      
      This is an update regarding your repair job (${job.id}).
      
      Current Status: ${statusName}
      
      Additional Notes:
      ${notes || 'No additional notes provided.'}
      
      If you have any questions, please contact us.
      
      Thank you for choosing our service.
    `;
    
    // Prepare any image attachments if needed
    const attachments = [];
    if (job.afterImages.length > 0) {
      attachments.push({
        name: 'repair-photos.jpg',
        type: 'image/jpeg'
      });
    }
    
    try {
      await sendEmailWithAttachments(
        job.customerEmail,
        `Update on Your Repair Job ${job.id}`,
        emailContent,
        attachments
      );
      
      // Update notification history if needed
      setStatusUpdateHistory(prev => ({
        ...prev,
        [job.id]: [
          ...(prev[job.id] || []),
          `Customer notified about status "${statusName}" on ${new Date().toLocaleString()}`
        ]
      }));
      
    } catch (error) {
      console.error('Failed to send email with attachments:', error);
    }
  };

  const handleJobReassign = (reassignmentData: any) => {
    if (!selectedJob) return;
    
    toast({
      title: "Job Reassigned",
      description: reassignmentData.technicianRole === 'internal' 
        ? `Job ${selectedJob.id} has been reassigned to ${reassignmentData.technician}.`
        : `Job ${selectedJob.id} has been sent to external provider with notes.`,
    });
    
    const updatedJobs = jobs.filter(job => job.id !== selectedJob.id);
    setJobs(updatedJobs);
    setSelectedJob(null);
    setIsReassignDialogOpen(false);
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
          <CardTitle>My Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <JobList 
            jobs={jobs} 
            onSelectJob={handleSelectJob} 
            selectedJobId={selectedJob?.id || null} 
          />
        </CardContent>
      </Card>

      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Update Job: {selectedJob.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <JobDetailsEditor 
              job={selectedJob}
              onUpdate={handleJobUpdate}
              onCancel={() => setSelectedJob(null)}
              onReassign={() => setIsReassignDialogOpen(true)}
              onNotifyCustomer={handleNotifyCustomer}
            />
          </CardContent>
        </Card>
      )}

      <JobReassignmentDialog 
        isOpen={isReassignDialogOpen}
        onOpenChange={setIsReassignDialogOpen}
        jobId={selectedJob?.id || ''}
        otherTechnicians={otherTechnicians}
        onReassign={handleJobReassign}
      />
    </div>
  );
};

export default TechnicianDashboard;
