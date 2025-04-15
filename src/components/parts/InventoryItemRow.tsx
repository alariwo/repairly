
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { InventoryItem } from './PartsSelector';

interface InventoryItemRowProps {
  item: InventoryItem;
  onAdd: (item: InventoryItem) => void;
}

export const InventoryItemRow = ({ item, onAdd }: InventoryItemRowProps) => {
  return (
    <TableRow>
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
          onClick={() => onAdd(item)}
          disabled={item.quantity < 1}
        >
          {item.quantity < 1 ? "Out of Stock" : "Add"}
        </Button>
      </TableCell>
    </TableRow>
  );
};
