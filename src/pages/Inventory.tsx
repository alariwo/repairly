
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  lastOrdered: string;
}

const Inventory = () => {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', [
    {
      id: '1',
      name: 'Alternator - Toyota Camry',
      category: 'Electrical',
      quantity: 5,
      price: 129.99,
      supplier: 'AutoZone',
      lastOrdered: '2025-03-15'
    },
    {
      id: '2',
      name: 'Brake Pads - Honda Civic',
      category: 'Brakes',
      quantity: 12,
      price: 49.99,
      supplier: 'NAPA Auto Parts',
      lastOrdered: '2025-04-01'
    },
    {
      id: '3',
      name: 'Oil Filter - Universal',
      category: 'Maintenance',
      quantity: 30,
      price: 8.99,
      supplier: 'O\'Reilly Auto Parts',
      lastOrdered: '2025-04-05'
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: '',
    lastOrdered: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();
  
  const handleAddItem = () => {
    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name || '',
      category: newItem.category || '',
      quantity: newItem.quantity || 0,
      price: newItem.price || 0,
      supplier: newItem.supplier || '',
      lastOrdered: newItem.lastOrdered || new Date().toISOString().split('T')[0]
    };
    
    setInventory([...inventory, item]);
    setIsAddDialogOpen(false);
    setNewItem({
      name: '',
      category: '',
      quantity: 0,
      price: 0,
      supplier: '',
      lastOrdered: new Date().toISOString().split('T')[0]
    });
    
    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory.`
    });
  };
  
  const handleUpdateItem = () => {
    if (!currentItem) return;
    
    const updatedInventory = inventory.map(item => 
      item.id === currentItem.id ? currentItem : item
    );
    
    setInventory(updatedInventory);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Item Updated",
      description: `${currentItem.name} has been updated.`
    });
  };
  
  const handleDeleteItem = () => {
    if (!currentItem) return;
    
    const updatedInventory = inventory.filter(item => item.id !== currentItem.id);
    setInventory(updatedInventory);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Item Removed",
      description: `${currentItem.name} has been removed from inventory.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.filter(item => item.quantity < 5).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventory.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Last Ordered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className={item.quantity < 5 ? "text-red-500 font-medium" : ""}>
                    {item.quantity}
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.lastOrdered}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setCurrentItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setCurrentItem(item);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Supplier
              </Label>
              <Input
                id="supplier"
                value={newItem.supplier}
                onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastOrdered" className="text-right">
                Last Ordered
              </Label>
              <Input
                id="lastOrdered"
                type="date"
                value={newItem.lastOrdered}
                onChange={(e) => setNewItem({...newItem, lastOrdered: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Input
                  id="edit-category"
                  value={currentItem.category}
                  onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({...currentItem, price: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">
                  Supplier
                </Label>
                <Input
                  id="edit-supplier"
                  value={currentItem.supplier}
                  onChange={(e) => setCurrentItem({...currentItem, supplier: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastOrdered" className="text-right">
                  Last Ordered
                </Label>
                <Input
                  id="edit-lastOrdered"
                  type="date"
                  value={currentItem.lastOrdered}
                  onChange={(e) => setCurrentItem({...currentItem, lastOrdered: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete {currentItem?.name}? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
