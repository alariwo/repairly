import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Package, Archive, Database, Filter } from 'lucide-react';

interface InventoryItem {
  _id?: string;
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  lastOrdered: string;
}

interface PartUsage {
  id: string;
  jobId: string;
  partId: string;
  partName: string;
  technician: string;
  quantityUsed: number;
  date: string;
}

interface InventoryLog {
  id: string;
  action: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  user: string;
  notes: string;
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [partUsages, setPartUsages] = useState<PartUsage[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [additionalStock, setAdditionalStock] = useState('1');

  const { toast } = useToast();

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/inventory ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data = await response.json();

      const formattedData = data.map(item => ({
        ...item,
        id: item._id || item.id,
      }));

      setInventory(formattedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inventory.',
        variant: 'destructive',
      });
    }
  };

  // Load inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Add new item
  const [newItem, setNewItem] = useState<Omit<InventoryItem, '_id'>>({
    id: '',
    name: '',
    category: 'Laptop Screens',
    quantity: 0,
    price: 0,
    supplier: '',
    lastOrdered: new Date().toISOString().split('T')[0],
  });

  const handleAddItem = async () => {
    if (
      !newItem.name ||
      !newItem.category ||
      isNaN(newItem.quantity) ||
      newItem.price < 0 ||
      !newItem.supplier
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const finalNewItemId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        ...newItem,
        id: finalNewItemId,
        lastOrdered: newItem.lastOrdered || new Date().toISOString().split('T')[0],
      };

      const response = await fetch('https://repairly-backend.onrender.com/api/inventory ', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to add item');

      const createdItem = await response.json();

      setInventory([createdItem, ...inventory]);
      setIsAddDialogOpen(false);

      // Reset form
      setNewItem({
        id: '',
        name: '',
        category: 'Laptop Screens',
        quantity: 0,
        price: 0,
        supplier: '',
        lastOrdered: new Date().toISOString().split('T')[0],
      });

      // Log activity
      const log = {
        id: Date.now().toString(),
        action: 'added',
        itemId: createdItem.id || finalNewItemId,
        itemName: createdItem.name,
        quantity: createdItem.quantity,
        date: new Date().toISOString(),
        user: 'Admin',
        notes: `${createdItem.name} added to inventory`,
      };
      setInventoryLogs([...inventoryLogs, log]);

      toast({ title: 'Item Added', description: `${createdItem.name} has been successfully added.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Update item
  const handleUpdateItem = async () => {
    if (!currentItem) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/inventory/${currentItem.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItem),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const updatedItem = await response.json();

      setInventory(inventory.map(item => (item.id === currentItem.id ? updatedItem : item)));
      setIsEditDialogOpen(false);
      setCurrentItem(null);

      toast({ title: 'Item Updated', description: `${updatedItem.name} has been updated.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item.',
        variant: 'destructive',
      });
    }
  };

  const handleAddStock = async () => {
  if (!currentItem) return;

  const quantityToAdd = parseInt(additionalStock);
  if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
    toast({
      title: 'Invalid Quantity',
      description: 'Please enter a valid quantity greater than zero.',
      variant: 'destructive',
    });
    return;
  }

  try {
    const authToken = getAuthToken();
    if (!authToken) throw new Error('Authentication token is missing');

    // Ensure we use `currentItem.id`
    const response = await fetch(`https://repairly-backend.onrender.com/api/inventory/${currentItem.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quantity: currentItem.quantity + quantityToAdd,
        lastOrdered: new Date().toISOString().split('T')[0],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to restock item.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
      } catch {
        errorMessage += ` Raw response: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const updatedItem = await response.json();

    // Update local state
    setInventory(inventory.map(item =>
      item.id === currentItem.id ? updatedItem : item
    ));

    // Add to logs
    const log = {
      id: Date.now().toString(),
      action: 'restocked',
      itemId: currentItem.id,
      itemName: currentItem.name,
      quantity: quantityToAdd,
      date: new Date().toISOString(),
      user: 'Admin',
      notes: `Restocked ${quantityToAdd} units of ${currentItem.name}`,
    };
    setInventoryLogs([...inventoryLogs, log]);

    setIsAddStockDialogOpen(false);
    setAdditionalStock('1');
    setCurrentItem(null);

    toast({ title: 'Stock Updated', description: `${quantityToAdd} units added to ${updatedItem.name}` });
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to update stock.',
      variant: 'destructive',
    });
  }
};

  // Delete item
  const handleDeleteItem = async () => {
    if (!currentItem) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/inventory/${currentItem.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete item');

      const result = await response.json();

      if (result.message?.toLowerCase().includes('success')) {
        setInventory(inventory.filter(item => item.id !== currentItem.id));
        toast({ title: 'Item Removed', description: `${currentItem.name} has been removed.` });
      } else {
        throw new Error('Unexpected server response.');
      }

      setIsDeleteDialogOpen(false);
      setCurrentItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item.',
        variant: 'destructive',
      });
    }
  };

  // Categories for dropdown
  const categories = [
    'Laptop Screens',
    'Phone Screens',
    'Batteries',
    'Chargers',
    'Casing',
    'Keyboards',
    'Cameras',
    'Motherboards',
    'RAM',
    'Storage',
    'Others',
  ];

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInventory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.reduce((total, item) => total + item.quantity, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{inventory.reduce((total, item) => total + item.quantity * item.price, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="report">Usage Report</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-[300px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Last Ordered</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">₦{item.price.toLocaleString()}</td>
                        <td className="px-4 py-3">{item.supplier}</td>
                        <td className="px-4 py-3">{new Date(item.lastOrdered).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setCurrentItem(item);
                            setIsEditDialogOpen(true);
                          }}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setCurrentItem(item);
                            setIsAddStockDialogOpen(true);
                          }}>
                            Restock
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setCurrentItem(item);
                            setIsDeleteDialogOpen(true);
                          }}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Usage Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="border p-3 rounded-md">
                    <div className="flex justify-between">
                      <h4>{item.name}</h4>
                      <p className="font-semibold">{item.quantity} units</p>
                    </div>
                    <p className="text-sm text-gray-500">Category: {item.category}</p>
                    <p className="text-sm text-gray-500">Supplier: {item.supplier}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 capitalize">{log.action}</td>
                        <td className="px-4 py-3">{log.itemName}</td>
                        <td className="px-4 py-3">{log.quantity}</td>
                        <td className="px-4 py-3">{new Date(log.date).toLocaleString()}</td>
                        <td className="px-4 py-3">{log.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Enter the details for the new inventory item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={newItem.category} onValueChange={(value) =>
                setNewItem({ ...newItem, category: value })
              }>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Input
                id="supplier"
                value={newItem.supplier}
                onChange={(e) =>
                  setNewItem({ ...newItem, supplier: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastOrdered" className="text-right">Last Ordered</Label>
              <Input
                id="lastOrdered"
                type="date"
                value={newItem.lastOrdered}
                onChange={(e) =>
                  setNewItem({ ...newItem, lastOrdered: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
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
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <Select value={currentItem.category} onValueChange={(value) =>
                  setCurrentItem({ ...currentItem, category: value })
                }>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
                <Input
                  id="edit-supplier"
                  value={currentItem.supplier}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, supplier: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={currentItem.price}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Enter how many units to add to {currentItem?.name}.
            </DialogDescription>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="mb-4">
                <h3 className="font-medium">{currentItem.name}</h3>
                <p className="text-sm text-gray-500">Current stock: {currentItem.quantity} units</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-quantity" className="text-right">Quantity to Add</Label>
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
            <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Item Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <strong>{currentItem?.name}</strong> from inventory?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;