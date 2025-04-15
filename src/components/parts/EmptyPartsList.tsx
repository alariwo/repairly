
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface EmptyPartsListProps {
  onAddParts: () => void;
}

export const EmptyPartsList = ({ onAddParts }: EmptyPartsListProps) => {
  return (
    <div className="border rounded-md p-8 text-center text-gray-500">
      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <p>No parts added to this job yet</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onAddParts}
      >
        <Plus size={16} className="mr-2" /> Add Parts
      </Button>
    </div>
  );
};
