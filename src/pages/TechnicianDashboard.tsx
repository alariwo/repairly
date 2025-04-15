import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { JobList } from '@/components/technician/JobList';
import { JobDetailsEditor } from '@/components/technician/JobDetailsEditor';
import { JobReassignmentDialog } from '@/components/technician/JobReassignmentDialog';
import { ExternalTechnicianWorkForm } from '@/components/technician/ExternalTechnicianWorkForm';
import { sendEmailWithAttachments } from '@/utils/notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, ExternalLink } from 'lucide-react';

const currentTechnician = {
  id: 'tech-001',
  name: 'Mike Technician',
  isExternal: false
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

const externalTechAssignments = [
  {
    id: 'JOB-1008',
    deviceType: 'MacBook Pro 2021',
    issue: 'Logic Board Replacement',
    status: 'assigned-to-external',
    notes: 'Need specialized repair. Assigned to external technician.',
    beforeImages: [],
    afterImages: [],
    createdAt: '2025-04-12',
    dueDate: '2025-04-22',
    serialNumber: 'C02G26ZFMD6M',
    customer: 'Edward Thompson',
    phoneNumber: '555-999-8888',
    customerEmail: 'edward.t@example.com',
    externalTechnicianId: 'tech-005',
    externalTechnicianName: 'Express Repair'
  }
];

const otherTechnicians = [
  { id: 'tech-002', name: 'Lisa Technician' },
  { id: 'tech-003', name: 'John Technician' },
  { id: 'tech-004', name: 'Sarah Technician' },
  { id: 'tech-005', name: 'Express Repair', isExternal: true },
];

const TechnicianDashboard = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(technicianJobs);
  const [externalJobs, setExternalJobs] = useState(externalTechAssignments);
  const [selectedJob, setSelectedJob] = useState<null | typeof technicianJobs[0]>(null);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [statusUpdateHistory, setStatusUpdateHistory] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState('internal');
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [selectedExternalJob, setSelectedExternalJob] = useState<null | typeof externalTechAssignments[0]>(null);

  const isExternalTechnician = currentTechnician.isExternal;

  useEffect(() => {
    console.log('Jobs updated:', jobs);
  }, [jobs]);

  useEffect(() => {
    if (isExternalTechnician) {
      setActiveTab('external');
    }
  }, [isExternalTechnician]);

  const handleSelectJob = (job: typeof technicianJobs[0]) => {
    setSelectedJob(job);
    setSelectedExternalJob(null);
    setShowExternalForm(false);
    
    toast({
      title: "Job Selected",
      description: `You are now editing job ${job.id}`,
    });
  };

  const handleSelectExternalJob = (job: typeof externalTechAssignments[0]) => {
    setSelectedExternalJob(job);
    setSelectedJob(null);
    setShowExternalForm(true);
    
    toast({
      title: "External Job Selected",
      description: `You are now viewing external job ${job.id}`,
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
    
    const updatedJob = updatedJobs.find(job => job.id === selectedJob.id);
    if (updatedJob) {
      setSelectedJob(updatedJob);
    }
    
    const newStatus = updatedJobData.status;
    if (newStatus && newStatus !== selectedJob.status) {
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
      
      setStatusUpdateHistory(prev => ({
        ...prev,
        [job.id]: [
          ...(prev[job.id] || []),
          `Customer notified about status "${statusName}" on ${new Date().toLocaleString()}`
        ]
      }));
      
      toast({
        title: "Customer Notified",
        description: "An email has been sent to the customer with the status update.",
      });
      
    } catch (error) {
      console.error('Failed to send email with attachments:', error);
      toast({
        title: "Notification Failed",
        description: "Failed to send email notification to customer.",
        variant: "destructive"
      });
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

  const handleExternalWorkSubmit = (notes: string, totalCost: number, lineItems: any[]) => {
    if (!selectedExternalJob) return;
    
    const updatedExternalJobs = externalJobs.map(job => 
      job.id === selectedExternalJob.id 
        ? { 
            ...job, 
            notes: job.notes + '\n\n' + notes,
            status: 'external-work-completed',
            billingAmount: totalCost,
            billingLineItems: lineItems
          } 
        : job
    );
    
    setExternalJobs(updatedExternalJobs);
    setSelectedExternalJob(null);
    setShowExternalForm(false);
    
    toast({
      title: "Work Report Submitted",
      description: `Your report for job ${selectedExternalJob.id} has been submitted successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Technician Dashboard</h1>
        <div className="text-sm text-gray-500">
          Logged in as <span className="font-semibold">{currentTechnician.name}</span>
          {currentTechnician.isExternal && <span className="ml-1 text-purple-600">(External)</span>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {!isExternalTechnician && (
            <TabsTrigger value="internal" className="flex items-center gap-1.5">
              <UserRound className="h-4 w-4" />
              <span>My Assigned Jobs</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="external" className="flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4" />
            <span>External Work</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal">
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
        </TabsContent>
        
        <TabsContent value="external">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>External Work Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {externalJobs.length > 0 ? (
                <div className="space-y-4">
                  {externalJobs.map(job => (
                    <div 
                      key={job.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedExternalJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleSelectExternalJob(job)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{job.id}: {job.deviceType}</h3>
                          <p className="text-sm text-gray-600">{job.issue}</p>
                          <p className="text-xs text-gray-500 mt-1">Due: {job.dueDate}</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            External Work
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No external work assignments found.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {showExternalForm && selectedExternalJob && (
            <ExternalTechnicianWorkForm 
              jobId={selectedExternalJob.id}
              onSubmit={handleExternalWorkSubmit}
            />
          )}
        </TabsContent>
      </Tabs>

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
