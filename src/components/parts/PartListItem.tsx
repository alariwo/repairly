
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { InventoryItem } from './PartsSelector';

interface PartListItemProps {
  inventoryItem: InventoryItem;
  quantity: number;
  onRemove: (partId: string) => void;
}

export const PartListItem = ({ inventoryItem, quantity, onRemove }: PartListItemProps) => {
  return (
    <TableRow>
      <TableCell>{inventoryItem.name}</TableCell>
      <TableCell>{quantity}</TableCell>
      <TableCell>${inventoryItem.price.toFixed(2)}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(inventoryItem.id)}
        >
          <X size={16} className="text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
