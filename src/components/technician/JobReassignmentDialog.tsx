
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Technician = {
  id: string;
  name: string;
};

type ReassignmentData = {
  technicianRole: 'internal' | 'external';
  technician: string;
  notes: string;
  cost: number;
};

type JobReassignmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  otherTechnicians: Technician[];
  onReassign: (data: ReassignmentData) => void;
};

export const JobReassignmentDialog = ({
  isOpen,
  onOpenChange,
  jobId,
  otherTechnicians,
  onReassign
}: JobReassignmentDialogProps) => {
  const [reassignment, setReassignment] = React.useState<ReassignmentData>({
    technicianRole: 'internal',
    technician: '',
    notes: '',
    cost: 0
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setReassignment({
        technicianRole: 'internal',
        technician: '',
        notes: '',
        cost: 0
      });
    }
  }, [isOpen]);

  const handleReassign = () => {
    onReassign(reassignment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reassign Job {jobId}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reassign To</label>
            <Select
              value={reassignment.technicianRole}
              onValueChange={(value: 'internal' | 'external') => 
                setReassignment(prev => ({ ...prev, technicianRole: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Technician</SelectItem>
                <SelectItem value="external">External Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reassignment.technicianRole === 'internal' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Technician</label>
              <Select
                value={reassignment.technician}
                onValueChange={(value) => setReassignment(prev => ({ ...prev, technician: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose technician" />
                </SelectTrigger>
                <SelectContent>
                  {otherTechnicians.map(tech => (
                    <SelectItem key={tech.id} value={tech.name}>{tech.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">External Provider Details</label>
              <Input
                placeholder="Provider name"
                value={reassignment.technician}
                onChange={(e) => setReassignment(prev => ({ ...prev, technician: e.target.value }))}
              />
              <div className="pt-2">
                <label className="text-sm font-medium">Estimated Cost</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={reassignment.cost || ''}
                  onChange={(e) => setReassignment(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes for Reassignment</label>
            <Textarea
              placeholder="Explain why this job is being reassigned..."
              value={reassignment.notes}
              onChange={(e) => setReassignment(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleReassign}>Reassign Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
