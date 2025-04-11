
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, Tag, FileText, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface JobDetails {
  id: string;
  customer: string;
  device: string;
  issue: string;
  status: string;
  createdAt: string;
  assignedTo: string;
  serialNumber?: string;
  phoneNumber?: string;
}

interface JobPrintablesProps {
  job: JobDetails;
}

export const JobPrintables: React.FC<JobPrintablesProps> = ({ job }) => {
  const [openJobCard, setOpenJobCard] = React.useState(false);
  const [openJobLabel, setOpenJobLabel] = React.useState(false);
  const { toast } = useToast();
  
  const handlePrint = (type: 'card' | 'label') => {
    if (type === 'card') {
      setOpenJobCard(false);
    } else {
      setOpenJobLabel(false);
    }
    
    // Use setTimeout to allow the dialog to close before printing
    setTimeout(() => {
      window.print();
      toast({
        title: "Print started",
        description: `The ${type === 'card' ? 'job card' : 'job label'} is being sent to your printer.`,
      });
    }, 100);
  };
  
  const handleDownloadPdf = (type: 'card' | 'label') => {
    if (type === 'card') {
      setOpenJobCard(false);
    } else {
      setOpenJobLabel(false);
    }
    
    toast({
      title: "PDF Generated",
      description: `The ${type === 'card' ? 'job card' : 'job label'} PDF would be downloaded in a real implementation.`,
    });
  };
  
  return (
    <>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setOpenJobCard(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Job Card
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setOpenJobLabel(true)}
        >
          <Tag className="mr-2 h-4 w-4" />
          Job Label
        </Button>
      </div>
      
      {/* Job Card Dialog */}
      <Dialog open={openJobCard} onOpenChange={setOpenJobCard}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Job Card Preview</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">RepairAM</h2>
                <p className="text-sm text-gray-500">Professional Repair Services</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold">JOB CARD</h3>
                <p className="text-lg font-semibold text-repairam">{job.id}</p>
              </div>
            </div>
            
            <div className="my-6 border-t border-b py-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Customer Details</h4>
                <p className="mt-2">{job.customer}</p>
                <p>{job.phoneNumber || 'No phone number provided'}</p>
                <p>Date Received: {job.createdAt}</p>
              </div>
              <div>
                <h4 className="font-semibold">Device Details</h4>
                <p className="mt-2">{job.device}</p>
                <p>Serial Number: {job.serialNumber || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold">Reported Issue</h4>
              <p className="mt-2">{job.issue}</p>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold">Customer Signature</h4>
              <div className="mt-2 h-16 border-b border-dashed"></div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => handleDownloadPdf('card')}>
              <Download className="mr-2 h-4 w-4" /> Save as PDF
            </Button>
            <Button onClick={() => handlePrint('card')}>
              <Printer className="mr-2 h-4 w-4" /> Print Job Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Job Label Dialog */}
      <Dialog open={openJobLabel} onOpenChange={setOpenJobLabel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Job Label Preview</DialogTitle>
          </DialogHeader>
          
          <div className="p-4 border rounded-lg">
            <div className="text-center">
              <h3 className="text-3xl font-bold">{job.id}</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="col-span-2">
                <p className="font-medium">{job.customer.length > 15 ? job.customer.substring(0, 15) + '...' : job.customer}</p>
                <p className="text-sm">{job.device}</p>
                <p className="text-sm">S/N: {job.serialNumber || 'N/A'}</p>
                <p className="text-sm text-gray-600">{job.issue.length > 20 ? job.issue.substring(0, 20) + '...' : job.issue}</p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                {/* Placeholder for barcode/QR code */}
                <div className="h-24 w-24 bg-gray-200 flex items-center justify-center border">
                  <p className="text-xs text-center">QR Code</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => handleDownloadPdf('label')}>
              <Download className="mr-2 h-4 w-4" /> Save as PDF
            </Button>
            <Button onClick={() => handlePrint('label')}>
              <Printer className="mr-2 h-4 w-4" /> Print Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
