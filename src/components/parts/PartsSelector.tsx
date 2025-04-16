
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <TableRow key={part.partId}>
                    <TableCell>{inventoryItem.name}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>${inventoryItem.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePart(part.partId)}
                      >
                        <X size={16} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No parts added to this job yet</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus size={16} className="mr-2" /> Add Parts
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Parts from Inventory</DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search parts by name or category..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="border rounded-md overflow-hidden max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className={item.quantity < 5 ? "text-red-500" : ""}>
                        {item.quantity}
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addPart(item)}
                          disabled={item.quantity < 1}
                        >
                          {item.quantity < 1 ? "Out of Stock" : "Add"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No parts found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartsSelector;
