
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, MoreHorizontal, Clipboard } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

// Demo data
const jobs = [
  {
    id: 'JOB-1001',
    customer: 'John Smith',
    device: 'iPhone 12',
    issue: 'Cracked Screen',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-04-10',
    dueDate: '2025-04-15',
    assignedTo: 'Mike Technician'
  },
  {
    id: 'JOB-1002',
    customer: 'Sarah Johnson',
    device: 'MacBook Pro',
    issue: 'Battery Replacement',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2025-04-09',
    dueDate: '2025-04-16',
    assignedTo: 'Lisa Technician'
  },
  {
    id: 'JOB-1003',
    customer: 'Michael Brown',
    device: 'Samsung Galaxy S21',
    issue: 'Charging Port',
    status: 'parts-ordered',
    priority: 'medium',
    createdAt: '2025-04-08',
    dueDate: '2025-04-18',
    assignedTo: 'Mike Technician'
  },
  {
    id: 'JOB-1004',
    customer: 'Emily Davis',
    device: 'Dell XPS 13',
    issue: 'Virus Removal',
    status: 'completed',
    priority: 'low',
    createdAt: '2025-04-07',
    dueDate: '2025-04-11',
    assignedTo: 'Lisa Technician'
  },
  {
    id: 'JOB-1005',
    customer: 'David Wilson',
    device: 'iPad Pro',
    issue: 'Broken Home Button',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2025-04-06',
    dueDate: '2025-04-13',
    assignedTo: 'Mike Technician'
  },
];

const Jobs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleNewJob = () => {
    toast({
      title: "Create Job",
      description: "New job form would open here.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'parts-ordered':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Parts Ordered</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{priority}</Badge>;
    }
  };

  const filteredJobs = jobs.filter(job => {
    // Apply status filter
    if (statusFilter !== 'all' && job.status !== statusFilter) {
      return false;
    }
    
    // Apply search term filter
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Repair Jobs</h1>
        <Button onClick={handleNewJob} className="bg-repairam hover:bg-repairam-dark">
          <PlusCircle className="mr-2 h-4 w-4" /> New Job
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Job Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Select 
                defaultValue="all"
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="parts-ordered">Parts Ordered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-10 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Job ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Device/Issue</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{job.id}</td>
                      <td className="px-6 py-4">{job.customer}</td>
                      <td className="px-6 py-4">
                        <div>{job.device}</div>
                        <div className="text-gray-500">{job.issue}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(job.priority)}
                      </td>
                      <td className="px-6 py-4">{job.dueDate}</td>
                      <td className="px-6 py-4">{job.assignedTo}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Add Parts</DropdownMenuItem>
                            <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                            <DropdownMenuItem>Message Customer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredJobs.length === 0 && (
              <div className="py-10 text-center text-gray-500">
                <p>No jobs found matching your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;
