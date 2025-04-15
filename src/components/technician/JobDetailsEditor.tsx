import React, { useState } from 'react';
import { Save, Upload, Image, UserRound, Mail, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { sendEmailNotification } from '@/utils/notifications';
import { PartsSelector } from '@/components/parts/PartsSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Job = {
  id: string;
  deviceType: string;
  issue: string;
  status: string;
  notes: string;
  beforeImages: string[];
  afterImages: string[];
  createdAt: string;
  dueDate: string;
  serialNumber: string;
  customer: string;
  phoneNumber: string;
  customerEmail?: string;
};

type JobDetailsEditorProps = {
  job: Job;
  onUpdate: (updatedJob: Partial<Job>) => void;
  onCancel: () => void;
  onReassign: () => void;
  onNotifyCustomer?: (job: Job, notes: string) => void;
};

export const JobDetailsEditor = ({ 
  job, 
  onUpdate, 
  onCancel,
  onReassign,
  onNotifyCustomer
}: JobDetailsEditorProps) => {
  const { toast } = useToast();
  const [jobNotes, setJobNotes] = React.useState(job.notes);
  const [jobStatus, setJobStatus] = React.useState(job.status);
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false);

  const handleSave = () => {
    onUpdate({ 
      notes: jobNotes, 
      status: jobStatus 
    });
  };

  const handleNotifyCustomer = async () => {
    if (!job.customerEmail) {
      toast({
        title: "Email Missing",
        description: "This customer doesn't have an email address registered.",
        variant: "destructive"
      });
      return;
    }

    setIsNotifying(true);
    try {
      await sendEmailNotification(
        job.customerEmail,
        job.id,
        jobStatus
      );
      
      toast({
        title: "Customer Notified",
        description: `Email sent to customer about job ${job.id}`,
      });
      
      if (onNotifyCustomer) {
        onNotifyCustomer(job, jobNotes);
      }
    } catch (error) {
      toast({
        title: "Notification Failed",
        description: "Failed to send email to customer. Please try again.",
        variant: "destructive"
      });
      console.error("Email notification error:", error);
    } finally {
      setIsNotifying(false);
    }
  };

  const handleFileUpload = (type: 'before' | 'after') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          
          if (type === 'before') {
            onUpdate({ 
              beforeImages: [...job.beforeImages, imageData] 
            });
          } else {
            onUpdate({ 
              afterImages: [...job.afterImages, imageData] 
            });
          }
          
          toast({
            title: "Image Uploaded",
            description: `${type} image uploaded successfully for job ${job.id}`,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Device</label>
          <div className="mt-1">{job.deviceType}</div>
        </div>
        <div>
          <label className="text-sm font-medium">Serial Number</label>
          <div className="mt-1 font-mono text-sm">{job.serialNumber || 'Not provided'}</div>
        </div>
        <div>
          <label className="text-sm font-medium">Issue</label>
          <div className="mt-1">{job.issue}</div>
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
        <div className="flex space-x-2 pt-3">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={onReassign}
          >
            <UserRound className="mr-2 h-4 w-4" /> Reassign Job
          </Button>
          
          <Button 
            variant="secondary"
            className="flex-1"
            onClick={handleNotifyCustomer}
            disabled={isNotifying || !job.customerEmail}
          >
            <Mail className="mr-2 h-4 w-4" /> Notify Customer
          </Button>
          
          <Button 
            variant="outline"
            className="gap-1"
            onClick={() => setIsPartsDialogOpen(true)}
          >
            <Package className="h-4 w-4" /> Add Parts
          </Button>
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
                {job.beforeImages.length > 0 ? (
                  <div className="text-sm">
                    {job.beforeImages.length} image(s) uploaded
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
                {job.afterImages.length > 0 ? (
                  <div className="text-sm">
                    {job.afterImages.length} image(s) uploaded
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
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>

    <Dialog open={isPartsDialogOpen} onOpenChange={setIsPartsDialogOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Parts to Job</DialogTitle>
        </DialogHeader>
        
        <PartsSelector 
          jobId={job.id} 
          customerName={job.customer}
          technicianId={/* get technician ID */}
          technicianName={/* get technician name */}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsPartsDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
