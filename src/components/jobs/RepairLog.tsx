
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, MoreHorizontal, Plus, Clipboard, User, Wrench, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RepairLogEntry {
  id: string;
  timestamp: Date;
  technician: string;
  technicianRole: 'internal' | 'external';
  action: string;
  notes: string;
  duration: number; // in minutes
  cost?: number; // for external technicians
}

interface RepairLogProps {
  jobId: string;
  jobTitle: string;
}

export const RepairLog = ({ jobId, jobTitle }: RepairLogProps) => {
  const [logEntries, setLogEntries] = useState<RepairLogEntry[]>([
    {
      id: '1',
      timestamp: new Date('2023-06-10T10:30:00'),
      technician: 'Mike Johnson',
      technicianRole: 'internal',
      action: 'Initial diagnosis',
      notes: 'Checked device, found issues with the motherboard and power supply unit.',
      duration: 45
    },
    {
      id: '2',
      timestamp: new Date('2023-06-11T14:15:00'),
      technician: 'Amy Lee',
      technicianRole: 'internal',
      action: 'Ordered replacement parts',
      notes: 'Ordered new motherboard and power supply.',
      duration: 20
    },
    {
      id: '3',
      timestamp: new Date('2023-06-15T11:00:00'),
      technician: 'ElectroPro Services',
      technicianRole: 'external',
      action: 'Specialized motherboard repair',
      notes: 'Sent to external technician for specialized repair of main processor connection.',
      duration: 120,
      cost: 180
    }
  ]);
  
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<RepairLogEntry, 'id'>>({
    timestamp: new Date(),
    technician: '',
    technicianRole: 'internal',
    action: '',
    notes: '',
    duration: 0,
    cost: 0
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'duration' | 'cost') => {
    const value = parseInt(e.target.value) || 0;
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRoleChange = (value: string) => {
    setNewEntry(prev => ({ 
      ...prev, 
      technicianRole: value as 'internal' | 'external' 
    }));
  };
  
  const handleAddEntry = () => {
    const entry: RepairLogEntry = {
      id: (logEntries.length + 1).toString(),
      timestamp: new Date(),
      ...newEntry
    };
    
    setLogEntries(prev => [...prev, entry]);
    setIsAddEntryOpen(false);
    setNewEntry({
      timestamp: new Date(),
      technician: '',
      technicianRole: 'internal',
      action: '',
      notes: '',
      duration: 0,
      cost: 0
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <CardTitle className="flex items-center">
              <Clipboard className="mr-2 h-5 w-5" />
              Repair Log: {jobTitle}
            </CardTitle>
            <CardDescription>
              Track all technician activities related to this repair job
            </CardDescription>
          </div>
          <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
            <DialogTrigger asChild>
              <Button className="bg-repairam hover:bg-repairam-dark">
                <Plus className="mr-2 h-4 w-4" />
                Add Log Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Repair Log Entry</DialogTitle>
                <DialogDescription>
                  Record a new action or note for this repair job
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Technician Role</Label>
                  <Select defaultValue="internal" onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Technician</SelectItem>
                      <SelectItem value="external">External Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="technician">
                    {newEntry.technicianRole === 'internal' ? 'Technician Name' : 'External Service Provider'}
                  </Label>
                  <Input
                    id="technician"
                    name="technician"
                    placeholder={newEntry.technicianRole === 'internal' ? 'John Doe' : 'Company XYZ'}
                    value={newEntry.technician}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="action">Action Performed</Label>
                  <Input
                    id="action"
                    name="action"
                    placeholder="Diagnosed issue"
                    value={newEntry.action}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Detailed description of the work done"
                    value={newEntry.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={newEntry.duration.toString()}
                    onChange={(e) => handleNumberInput(e, 'duration')}
                  />
                </div>
                
                {newEntry.technicianRole === 'external' && (
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Service Cost ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.cost?.toString() || '0'}
                      onChange={(e) => handleNumberInput(e, 'cost')}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEntryOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-repairam hover:bg-repairam-dark" onClick={handleAddEntry}>
                  Add Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {logEntries.map((entry, index) => (
            <AccordionItem 
              key={entry.id} 
              value={entry.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                <div className="flex flex-1 items-center justify-between pr-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={entry.technicianRole === 'external' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                        {entry.technicianRole === 'external' ? <ExternalLink className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(entry.timestamp, 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(entry.timestamp, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.technicianRole === 'external' ? 'outline' : 'default'}>
                      {entry.technicianRole === 'external' ? 'External' : 'Internal'}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-0 pb-3">
                <div className="pt-2 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium w-24">Technician:</span>
                    <span>{entry.technician}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium w-24">Duration:</span>
                    <span>{entry.duration} minutes</span>
                  </div>
                  {entry.technicianRole === 'external' && entry.cost !== undefined && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium w-24">Service Cost:</span>
                      <span>${entry.cost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="font-medium w-24">Notes:</span>
                    <span className="text-gray-700">{entry.notes}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {logEntries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Clipboard className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No repair logs have been added yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddEntryOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default RepairLog;
