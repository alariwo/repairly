
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, FileText, UserRound, Mail, Phone } from 'lucide-react';
import { PartsSelector } from '@/components/parts/PartsSelector';
import { JobStatusBadge } from './JobStatusBadge';
import { JobPriorityBadge } from './JobPriorityBadge';
import { Job } from './JobList';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ 
  job, 
  isOpen, 
  onOpenChange 
}) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Job Details: {job.id}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  <span>{job.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{job.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{job.phoneNumber}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Device Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Device:</span>
                  <span>{job.device}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Serial Number:</span>
                  <code className="bg-muted p-1 rounded text-xs">{job.serialNumber}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Issue:</span>
                  <span>{job.issue}</span>
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
                  <JobStatusBadge status={job.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <JobPriorityBadge priority={job.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span>{job.assignedTo}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{job.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{job.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Parts Used</h3>
          <div className="border rounded-md p-4 space-y-2">
            <PartsSelector 
              jobId={job.id} 
              customerName={job.customer}
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
              onClick={() => onOpenChange(false)}
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
  );
};

export default JobDetailsModal;
