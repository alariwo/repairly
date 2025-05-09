import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Tag, FileText, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
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
  customerEmail?: string;
}

interface JobPrintablesProps {
  job: JobDetails;
}

// Declare html2pdf on window (if not using module import)
declare global {
  interface Window {
    html2pdf: any;
  }
}

export const JobPrintables: React.FC<JobPrintablesProps> = ({ job }) => {
  const [openJobCard, setOpenJobCard] = React.useState(false);
  const [openJobLabel, setOpenJobLabel] = React.useState(false);
  const { toast } = useToast();

  const handleDownloadPdf = (type: 'card' | 'label') => {
    const element = document.getElementById(`${type}-printable`);
    if (!element) {
      toast({
        title: "Error",
        description: `Could not find ${type} content to generate PDF.`,
        variant: "destructive"
      });
      return;
    }

    // Ensure styles are included by wrapping in a div with correct styles
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.color = '#000000';
    wrapper.innerHTML = element.innerHTML;

    document.body.appendChild(wrapper);

    const options = {
      margin:       0.5,
      filename:     `${job.id}_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    try {
      // Generate PDF and remove wrapper
      window.html2pdf(wrapper, options);
      toast({ title: "PDF Generated", description: `${type === 'card' ? 'Job card' : 'Job label'} has been saved as PDF.` });
    } catch (error) {
      toast({
        title: "PDF Error",
        description: "An error occurred while generating the PDF.",
        variant: "destructive"
      });
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const handlePrint = (type: 'card' | 'label') => {
    const printElement = document.getElementById(`${type}-printable`);

    if (!printElement) {
      toast({
        title: "Error",
        description: `Could not find ${type} content to print.`,
        variant: "destructive"
      });
      return;
    }

    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '_blank', '');
    
    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to print this document.",
        variant: "destructive"
      });
      return;
    }

    printWindow.document.write(`
      <html>
        <head><title>${type === 'card' ? 'Job Card' : 'Job Label'}</title></head>
        <body>${printElement.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    toast({ title: "Printing Started", description: `The ${type} is being sent to your printer.` });
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

          {/* Hidden Printable Content - Job Card */}
          <div id="card-printable" className="hidden">
            <div className="p-6 border rounded-lg bg-white shadow-none text-black">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">RepairAM</h2>
                  <p className="text-sm text-gray-500">Professional Repair Services</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold">JOB CARD</h3>
                  <p className="text-lg font-semibold text-blue-600">{job.id}</p>
                </div>
              </div>

              <div className="my-6 border-t border-b py-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Customer Details</h4>
                  <p className="mt-2"><strong>Name:</strong> {job.customer}</p>
                  <p><strong>Email:</strong> {job.customerEmail || 'N/A'}</p>
                  <p><strong>Phone:</strong> {job.phoneNumber || 'Not provided'}</p>
                  <p><strong>Date Received:</strong> {job.createdAt}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Device Details</h4>
                  <p className="mt-2"><strong>Device:</strong> {job.device}</p>
                  <p><strong>Serial Number:</strong> {job.serialNumber || 'N/A'}</p>
                  <p><strong>Status:</strong> {job.status.replace('-', ' ')}</p>
                  <p><strong>Assigned To:</strong> {job.assignedTo}</p>
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
          </div>

          {/* Visible Dialog Content */}
          <div className="p-6 border rounded-lg overflow-auto max-h-[70vh]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">RepairAM</h2>
                <p className="text-sm text-gray-500">Professional Repair Services</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold">JOB CARD</h3>
                <p className="text-lg font-semibold text-blue-600">{job.id}</p>
              </div>
            </div>

            <div className="my-6 border-t border-b py-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Customer Details</h4>
                <p className="mt-2">{job.customer}</p>
                <p>{job.customerEmail || 'No email provided'}</p>
                <p>{job.phoneNumber || 'No phone number provided'}</p>
                <p>Date Received: {job.createdAt}</p>
              </div>
              <div>
                <h4 className="font-semibold">Device Details</h4>
                <p className="mt-2">{job.device}</p>
                <p>Serial Number: {job.serialNumber || 'N/A'}</p>
                <p>Status: {job.status.replace('-', ' ')}</p>
                <p>Assigned To: {job.assignedTo}</p>
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

          {/* Hidden Printable Content - Job Label */}
          <div id="label-printable" className="hidden">
            <div className="p-4 border rounded-lg bg-white shadow-none text-black">
              <div className="text-center">
                <h3 className="text-3xl font-bold">{job.id}</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="col-span-2">
                  <p className="font-medium">{job.customer}</p>
                  <p className="text-sm">Device: {job.device}</p>
                  <p className="text-sm">S/N: {job.serialNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Issue: {job.issue}</p>
                  <p className="text-sm">Status: {job.status.replace('-', ' ')}</p>
                  <p className="text-sm">Assigned To: {job.assignedTo}</p>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <div className="h-24 w-24 bg-gray-200 flex items-center justify-center border">
                    <p className="text-xs text-center">QR Code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visible Label Preview */}
          <div className="p-4 border rounded-lg">
            <div className="text-center">
              <h3 className="text-3xl font-bold">{job.id}</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="col-span-2">
                <p className="font-medium">{job.customer}</p>
                <p className="text-sm">Device: {job.device}</p>
                <p className="text-sm">S/N: {job.serialNumber || 'N/A'}</p>
                <p className="text-sm text-gray-600">Issue: {job.issue.length > 20 ? job.issue.substring(0, 20) + '...' : job.issue}</p>
                <p className="text-sm">Status: {job.status.replace('-', ' ')}</p>
                <p className="text-sm">Assigned To: {job.assignedTo}</p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
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