
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, ChevronDown, MoreHorizontal, UserPlus } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

// Demo data
const customers = [
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
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCustomer = () => {
    toast({
      title: "Add Customer",
      description: "Customer form would open here.",
    });
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

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
              <Button variant="outline" size="icon">
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                            <DropdownMenuItem>Create Job</DropdownMenuItem>
                            <DropdownMenuItem>Message</DropdownMenuItem>
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
    </div>
  );
};

export default Customers;
