
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PartListItem } from './PartListItem';
import { EmptyPartsList } from './EmptyPartsList';
import { PartsInventoryDialog } from './PartsInventoryDialog';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  lastOrdered: string;
}

export interface PartUsage {
  partId: string;
  partName: string;
  quantity: number;
  price: number;
  jobId: string;
  customerName: string;
  dateUsed: string;
  technicianId?: string;
  technicianName?: string;
}

interface PartsUsed {
  partId: string;
  quantity: number;
}

interface PartsSelectorProps {
  jobId: string;
  customerName: string;
  onChange?: (parts: PartsUsed[]) => void;
  technicianId?: string;
  technicianName?: string;
  initialParts?: PartsUsed[];
}

export const PartsSelector = ({ 
  jobId, 
  customerName, 
  onChange,
  technicianId,
  technicianName,
  initialParts = []
}: PartsSelectorProps) => {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', []);
  const [partUsages, setPartUsages] = useLocalStorage<PartUsage[]>('part-usages', []);
  const [selectedParts, setSelectedParts] = useState<PartsUsed[]>(initialParts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (onChange) {
      onChange(selectedParts);
    }
  }, [selectedParts, onChange]);

  const addPart = (part: InventoryItem) => {
    // Check if we already have this part
    const existingPartIndex = selectedParts.findIndex(p => p.partId === part.id);
    
    if (existingPartIndex >= 0) {
      // Update quantity of existing part
      const updatedParts = [...selectedParts];
      updatedParts[existingPartIndex].quantity += 1;
      setSelectedParts(updatedParts);
    } else {
      // Add new part
      setSelectedParts([...selectedParts, { partId: part.id, quantity: 1 }]);
    }

    // Log part usage
    const newUsage: PartUsage = {
      partId: part.id,
      partName: part.name,
      quantity: 1,
      price: part.price,
      jobId,
      customerName,
      dateUsed: new Date().toISOString().split('T')[0],
      technicianId,
      technicianName
    };
    setPartUsages([...partUsages, newUsage]);

    // Update inventory quantity
    const updatedInventory = inventory.map(item => {
      if (item.id === part.id && item.quantity > 0) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setInventory(updatedInventory);

    toast({
      title: "Part Added",
      description: `Added ${part.name} to job ${jobId}`,
    });

    setIsDialogOpen(false);
  };

  const removePart = (partId: string) => {
    // Find the part in selectedParts to get the current quantity
    const partToRemove = selectedParts.find(p => p.partId === partId);
    if (!partToRemove) return;

    // Find the part in inventory to get its details
    const inventoryPart = inventory.find(item => item.id === partId);
    if (!inventoryPart) return;

    // Remove part from selection
    setSelectedParts(selectedParts.filter(p => p.partId !== partId));

    // Update inventory by returning the quantity
    const updatedInventory = inventory.map(item => {
      if (item.id === partId) {
        return { ...item, quantity: item.quantity + partToRemove.quantity };
      }
      return item;
    });
    setInventory(updatedInventory);

    // Remove usage logs for this part in this job
    const updatedUsages = partUsages.filter(u => !(u.partId === partId && u.jobId === jobId));
    setPartUsages(updatedUsages);

    toast({
      title: "Part Removed",
      description: `Removed ${inventoryPart.name} from job ${jobId}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Parts Used</h3>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus size={16} /> Add Parts
        </Button>
      </div>

      {selectedParts.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedParts.map(part => {
                const inventoryItem = inventory.find(i => i.id === part.partId);
                if (!inventoryItem) return null;
                
                return (
                  <PartListItem
                    key={part.partId}
                    inventoryItem={inventoryItem}
                    quantity={part.quantity}
                    onRemove={removePart}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyPartsList onAddParts={() => setIsDialogOpen(true)} />
      )}

      <PartsInventoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddPart={addPart}
        inventory={inventory}
      />
    </div>
  );
};

export default PartsSelector;
