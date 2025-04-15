
import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, Plus, Edit, Trash2, Search, 
  FileText, Archive, Database, Filter 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { InventoryItem, PartUsage } from "@/components/parts/PartsSelector";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryLogs } from "@/components/inventory/InventoryLogs";
import { InventoryReport } from "@/components/inventory/InventoryReport";

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
  
  const [partUsages, setPartUsages] = useLocalStorage<PartUsage[]>('part-usages', []);
  const [inventoryLogs, setInventoryLogs] = useLocalStorage('inventory-logs', []);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [additionalStock, setAdditionalStock] = useState('1');
  
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: '',
    lastOrdered: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();
  
  // Extract unique categories for filtering
  const categories = ['all', ...new Set(inventory.map(item => item.category))];
  
  // Filter inventory based on search term and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
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
    
    // Add to inventory logs
    const log = {
      id: Date.now().toString(),
      action: 'added',
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      date: new Date().toISOString(),
      user: 'Admin', // In a real app, use the logged-in user
      notes: 'Initial inventory entry'
    };
    setInventoryLogs([...inventoryLogs, log]);
    
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
    
    const originalItem = inventory.find(item => item.id === currentItem.id);
    const updatedInventory = inventory.map(item => 
      item.id === currentItem.id ? currentItem : item
    );
    
    setInventory(updatedInventory);
    
    // Add to inventory logs if quantity changed
    if (originalItem && originalItem.quantity !== currentItem.quantity) {
      const quantityDifference = currentItem.quantity - originalItem.quantity;
      const log = {
        id: Date.now().toString(),
        action: quantityDifference > 0 ? 'restocked' : 'adjusted',
        itemId: currentItem.id,
        itemName: currentItem.name,
        quantity: Math.abs(quantityDifference),
        date: new Date().toISOString(),
        user: 'Admin', // In a real app, use the logged-in user
        notes: quantityDifference > 0 
          ? `Restocked ${Math.abs(quantityDifference)} units`
          : `Adjusted inventory by ${Math.abs(quantityDifference)} units`
      };
      setInventoryLogs([...inventoryLogs, log]);
    }
    
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
    
    // Add to inventory logs
    const log = {
      id: Date.now().toString(),
      action: 'removed',
      itemId: currentItem.id,
      itemName: currentItem.name,
      quantity: currentItem.quantity,
      date: new Date().toISOString(),
      user: 'Admin', // In a real app, use the logged-in user
      notes: 'Item removed from inventory'
    };
    setInventoryLogs([...inventoryLogs, log]);
    
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Item Removed",
      description: `${currentItem.name} has been removed from inventory.`
    });
  };
  
  const handleAddStock = () => {
    if (!currentItem) return;
    
    const quantity = parseInt(additionalStock);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedInventory = inventory.map(item => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          quantity: item.quantity + quantity,
          lastOrdered: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    
    // Add to inventory logs
    const log = {
      id: Date.now().toString(),
      action: 'restocked',
      itemId: currentItem.id,
      itemName: currentItem.name,
      quantity: quantity,
      date: new Date().toISOString(),
      user: 'Admin', // In a real app, use the logged-in user
      notes: `Restocked ${quantity} units`
    };
    setInventoryLogs([...inventoryLogs, log]);
    
    setIsAddStockDialogOpen(false);
    setAdditionalStock('1');
    
    toast({
      title: "Stock Added",
      description: `Added ${quantity} units of ${currentItem.name} to inventory.`
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
      
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="report">Usage Report</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <Select
                    defaultValue="all"
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search inventory..."
                      className="pl-10 w-full sm:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
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
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setCurrentItem(item);
                                setIsAddStockDialogOpen(true);
                              }}
                              title="Add Stock"
                            >
                              <Database className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setCurrentItem(item);
                                setIsEditDialogOpen(true);
                              }}
                              title="Edit Item"
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
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No inventory items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="report">
          <InventoryReport inventory={inventory} partUsages={partUsages} />
        </TabsContent>
        
        <TabsContent value="logs">
          <InventoryLogs logs={inventoryLogs} partUsages={partUsages} inventory={inventory} />
        </TabsContent>
      </Tabs>
      
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
      
      {/* Add Stock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="mb-4">
                <h3 className="font-medium">{currentItem.name}</h3>
                <p className="text-sm text-gray-500">Current stock: {currentItem.quantity} units</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-quantity" className="text-right">
                  Quantity to Add
                </Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min="1"
                  value={additionalStock}
                  onChange={(e) => setAdditionalStock(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
