
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileImage, Plus, PlusCircle, DollarSign, Send, Paperclip } from "lucide-react";

interface ExternalTechnicianWorkFormProps {
  jobId: string;
  onSubmit: (notes: string, totalCost: number, lineItems: LineItem[]) => void;
}

interface LineItem {
  description: string;
  cost: number;
}

export const ExternalTechnicianWorkForm = ({ 
  jobId, 
  onSubmit 
}: ExternalTechnicianWorkFormProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', cost: 0 }]);
  const [totalCost, setTotalCost] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', cost: 0 }]);
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems];
    
    if (field === 'cost' && typeof value === 'string') {
      // Convert string to number for cost field
      newLineItems[index][field] = parseFloat(value) || 0;
    } else {
      // @ts-ignore - we know this is safe because we're checking field type
      newLineItems[index][field] = value;
    }
    
    setLineItems(newLineItems);
    
    // Recalculate total
    const newTotal = newLineItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    setTotalCost(newTotal);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      setLineItems([{ description: '', cost: 0 }]);
    } else {
      const newLineItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newLineItems);
      
      // Recalculate total
      const newTotal = newLineItems.reduce((sum, item) => sum + (item.cost || 0), 0);
      setTotalCost(newTotal);
    }
  };

  const handleSubmit = () => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide notes about the repair work performed.",
        variant: "destructive"
      });
      return;
    }

    // Validate line items
    const invalidLineItems = lineItems.filter(
      item => !item.description.trim() || item.cost <= 0
    );
    
    if (invalidLineItems.length > 0) {
      toast({
        title: "Invalid Line Items",
        description: "Please ensure all services/parts have descriptions and valid costs.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(notes, totalCost, lineItems);
    
    // Reset form
    setNotes('');
    setLineItems([{ description: '', cost: 0 }]);
    setTotalCost(0);
    setFiles([]);
    
    toast({
      title: "Work Report Submitted",
      description: "Your notes and billing information have been recorded.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">External Technician Work Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Work Performed</Label>
          <Textarea
            id="notes"
            placeholder="Describe the repairs or services performed..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Parts & Services</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddLineItem}
              className="flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
          
          {lineItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Part/Service description"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                />
              </div>
              <div className="w-28">
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    value={item.cost || ''}
                    onChange={(e) => handleLineItemChange(index, 'cost', e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveLineItem(index)}
                className="h-10 w-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-red-500"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          ))}
          
          <div className="pt-2 flex justify-between items-center font-medium text-lg">
            <span>Total:</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Attach Photos (Optional)</Label>
          <div className="grid gap-2">
            <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 border-gray-300 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center text-sm text-gray-500">
                <FileImage className="h-8 w-8 mb-2 text-gray-400" />
                <p>Drop photos or click to upload</p>
                <p className="text-xs">Upload any repair before/after photos</p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="relative border rounded-md p-2 flex items-center text-sm"
                  >
                    <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1"
                      onClick={() => removeFile(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 text-red-500"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit Work Report
        </Button>
      </CardContent>
    </Card>
  );
};
