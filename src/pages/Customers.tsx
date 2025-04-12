import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, ChevronDown, MoreHorizontal, UserPlus, Mail } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from '@/hooks/use-local-storage';

// Demo data
const initialCustomers = [
  { 
    id: 1, 
    name: 'John Smith', 
    email: 'john.smith@example.com', 
    phone: '(555) 123-4567',
    location: 'New York, NY', 
    jobsCompleted: 3,
    totalSpent: 450,
    lastJob: '2025-03-15'
  },
  { 
    id: 2, 
    name: 'Sarah Johnson', 
    email: 'sarah.j@example.com', 
    phone: '(555) 234-5678',
    location: 'Chicago, IL', 
    jobsCompleted: 1,
    totalSpent: 180,
    lastJob: '2025-04-02'
  },
  { 
    id: 3, 
    name: 'Michael Brown', 
    email: 'michael.b@example.com', 
    phone: '(555) 345-6789',
    location: 'Los Angeles, CA', 
    jobsCompleted: 5,
    totalSpent: 790,
    lastJob: '2025-04-08'
  },
  { 
    id: 4, 
    name: 'Emily Davis', 
    email: 'emily.davis@example.com', 
    phone: '(555) 456-7890',
    location: 'Boston, MA', 
    jobsCompleted: 2,
    totalSpent: 350,
    lastJob: '2025-03-25'
  },
  { 
    id: 5, 
    name: 'David Wilson', 
    email: 'david.w@example.com', 
    phone: '(555) 567-8901',
    location: 'Austin, TX', 
    jobsCompleted: 4,
    totalSpent: 620,
    lastJob: '2025-04-01'
  },
];

const Customers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isCustomerDetailsDialogOpen, setIsCustomerDetailsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof initialCustomers[0] | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [localCustomers, setLocalCustomers] = useLocalStorage('repair-app-customers', initialCustomers);
  const dialogRef = useRef<HTMLDivElement>(null);

  const safeCloseDetailsDialog = useCallback(() => {
    setTimeout(() => {
      setIsCustomerDetailsDialogOpen(false);
      setSelectedCustomer(null);
    }, 10);
  }, []);

  const safeCloseAddDialog = useCallback(() => {
    setTimeout(() => {
      setIsAddCustomerDialogOpen(false);
      setSelectedCustomer(null);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        location: '',
      });
    }, 10);
  }, []);

  useEffect(() => {
    // Listen for custom event to open add customer dialog
    const handleOpenAddCustomerDialog = () => {
      setIsAddCustomerDialogOpen(true);
    };
    
    window.addEventListener('open-add-customer-dialog', handleOpenAddCustomerDialog);
    
    return () => {
      window.removeEventListener('open-add-customer-dialog', handleOpenAddCustomerDialog);
    };
  }, []);

  const handleAddCustomer = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      location: '',
    });
    setIsAddCustomerDialogOpen(true);
  };

  const handleCreateCustomer = () => {
    // Validate form
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a name and email.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this is an edit or new customer
    if (selectedCustomer) {
      // Update existing customer
      const updatedCustomers = localCustomers.map(c => 
        c.id === selectedCustomer.id 
          ? { 
              ...c, 
              name: newCustomer.name, 
              email: newCustomer.email, 
              phone: newCustomer.phone, 
              location: newCustomer.location 
            } 
          : c
      );
      
      setLocalCustomers(updatedCustomers);
      toast({
        title: "Customer Updated",
        description: `${newCustomer.name}'s information has been updated.`,
      });
    } else {
      // Add the new customer
      const newId = Math.max(...localCustomers.map(c => c.id)) + 1;
      const customer = {
        ...newCustomer,
        id: newId,
        jobsCompleted: 0,
        totalSpent: 0,
        lastJob: 'N/A'
      };
      
      setLocalCustomers([customer, ...localCustomers]);
      toast({
        title: "Customer Added",
        description: `${customer.name} has been added to your customers.`,
      });
    }
    
    // Reset form and close dialog
    safeCloseAddDialog();
  };

  const filteredCustomers = localCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleViewDetails = useCallback((customer: typeof initialCustomers[0]) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsDialogOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer: typeof initialCustomers[0]) => {
    setSelectedCustomer(customer);
    // Pre-fill the form with customer data
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
    });
    setIsAddCustomerDialogOpen(true);
  }, []);

  const handleCreateJobForCustomer = useCallback((customer: typeof initialCustomers[0]) => {
    // Navigate to jobs page and dispatch event to open new job dialog
    navigate('/jobs');
    // Use a timeout to ensure navigation completes first
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-new-job-dialog', { 
        detail: { customer: customer.name, email: customer.email, phone: customer.phone } 
      }));
    }, 100);
    
    // Close the dialog if open
    if (isCustomerDetailsDialogOpen) {
      safeCloseDetailsDialog();
    }
  }, [navigate, isCustomerDetailsDialogOpen, safeCloseDetailsDialog]);

  const handleMessageCustomer = useCallback((customer: typeof initialCustomers[0]) => {
    toast({
      title: "Message Sent",
      description: `A message has been sent to ${customer.name}.`,
    });
  }, [toast]);

  const handleFilterClick = useCallback(() => {
    toast({
      title: "Filter Options",
      description: "Advanced filtering options would appear here.",
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <Button onClick={handleAddCustomer} className="bg-repairam hover:bg-repairam-dark">
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Customer Directory</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleFilterClick}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Jobs</th>
                    <th className="px-6 py-3">Total Spent</th>
                    <th className="px-6 py-3">Last Job</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4">
                        <div>{customer.email}</div>
                        <div className="text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4">{customer.location}</td>
                      <td className="px-6 py-4">{customer.jobsCompleted}</td>
                      <td className="px-6 py-4">${customer.totalSpent}</td>
                      <td className="px-6 py-4">{customer.lastJob}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateJobForCustomer(customer)}>
                              Create Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMessageCustomer(customer)}>
                              Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredCustomers.length === 0 && (
              <div className="py-10 text-center text-gray-500">
                <p>No customers found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog 
        open={isAddCustomerDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            safeCloseAddDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]" ref={dialogRef}>
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {selectedCustomer 
                ? 'Update customer information below.' 
                : 'Enter the details for the new customer. Name and email are required.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-email" className="text-right">
                Email
              </Label>
              <Input
                id="customer-email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newCustomer.location}
                onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={safeCloseAddDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>
              {selectedCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog 
        open={isCustomerDetailsDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            safeCloseDetailsDialog();
          }
        }}
      >
        {selectedCustomer && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Name</h4>
                <p>{selectedCustomer.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Email</h4>
                <p>{selectedCustomer.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Phone</h4>
                <p>{selectedCustomer.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Location</h4>
                <p>{selectedCustomer.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Jobs Completed</h4>
                <p>{selectedCustomer.jobsCompleted}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Total Spent</h4>
                <p>${selectedCustomer.totalSpent}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Last Job</h4>
                <p>{selectedCustomer.lastJob}</p>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => {
                  handleMessageCustomer(selectedCustomer);
                  safeCloseDetailsDialog();
                }}
              >
                <Mail className="h-4 w-4" /> Send Message
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    handleEditCustomer(selectedCustomer);
                    safeCloseDetailsDialog();
                  }}
                >
                  Edit Customer
                </Button>
                <Button
                  onClick={() => {
                    handleCreateJobForCustomer(selectedCustomer);
                  }}
                >
                  Create Job
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Customers;
