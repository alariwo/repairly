import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader, 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import {
  Clock,
  CheckCircle,
  Users,
  Calendar,
  FileText,
  Package,
  Bell,
  Search,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';


import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';


interface Job {
  _id?: string;
  id: string;
  customerId: string;
  deviceType: string;
  issueDescription: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  dueDate: string;
  assignedTo: string;
  customerEmail: string;
  phoneNumber?: string;
  createdAt: string;
}

interface DashboardStats {
  pendingJobs: number;
  completedJobs: number;
  overdueJobs: number;
  activeCustomers: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'picked-up':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Picked Up</Badge>;
    case 'received':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Received</Badge>;
    case 'diagnosis':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Diagnosis</Badge>;
    case 'repair-completed':
    case 'delivered': 
      return <Badge className="bg-green-100 text-green-800 border-green-200">Repair Completed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
    case 'low':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

const Dashboard = () => {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [overdueJobs, setOverdueJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingJobs: 0,
    completedJobs: 0,
    overdueJobs: 0,
    activeCustomers: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch recent jobs
  const fetchRecentJobs = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/dashboard/recent-jobs ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch recent jobs');
      const data = await response.json();

      const formattedJobs = data.map(job => ({
        ...job,
        id: job.id || job.id,
        dueDate: job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A',
        createdAt: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'
      }));

      setRecentJobs(formattedJobs);


      const totalCompleted = [...formattedJobs].filter(j =>
        j.status === 'repair-completed' || j.status === 'delivered'
      ).length;

      setStats(prev => ({ ...prev, completedJobs: totalCompleted }));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load recent jobs.',
        variant: 'destructive',
      });
    }
  };

  // Fetch overdue jobs
  const fetchOverdueJobs = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/dashboard/overdue-jobs ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch overdue jobs');
      const data = await response.json();

      const formattedOverdueJobs = data.slice(0, 3).map(job => ({
        ...job,
        id: job.id || job.id,
        dueDate: job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A',
        createdAt: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'
      }));

      setOverdueJobs(formattedOverdueJobs);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load overdue jobs.',
        variant: 'destructive',
      });
    }
  };


  const fetchDashboardStats = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/dashboard/stats ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const result = await response.json();

      setStats(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch customer count
  const fetchCustomerCount = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/customers ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();

      setStats(prev => ({
        ...prev,
        activeCustomers: Array.isArray(data) ? data.length : 0
      }));
    } catch (error) {
      console.error(error);
    }
  };


  const fetchRevenueStats = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/invoices/total-value-last-month ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch last month value');
      const result = await response.json();

 
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      const currentMonthValue = revenueData.find(d => d.name === currentMonth)?.revenue || 0;

      setStats(prev => ({
        ...prev,
        revenueThisMonth: currentMonthValue,
        revenueLastMonth: result.totalValue || 0
      }));
    } catch (error) {
      console.error(error);
    }
  };


  const [revenueData, setRevenueData] = useState<
    Array<{ name: string; revenue: number }>
  >([
    { name: 'Jan', revenue: 0 },
    { name: 'Feb', revenue: 0 },
    { name: 'Mar', revenue: 0 },
    { name: 'Apr', revenue: 0 },
    { name: 'May', revenue: 0 },
    { name: 'Jun', revenue: 0 },
    { name: 'Jul', revenue: 0 },
    { name: 'Aug', revenue: 0 },
    { name: 'Sep', revenue: 0 },
    { name: 'Oct', revenue: 0 },
    { name: 'Nov', revenue: 0 },
    { name: 'Dec', revenue: 0 },
  ]);

  const fetchRevenueTrendData = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/dashboard/revenue-trend ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch revenue trend');
      const data = await response.json();

     
      setRevenueData(data);
    } catch (error) {
      console.error('Revenue trend fetch failed:', error);
    }
  };

  useEffect(() => {
    fetchRecentJobs();
    fetchOverdueJobs();
    fetchDashboardStats();
    fetchCustomerCount();
    fetchRevenueTrendData();     
    fetchRevenueStats();        
  }, []);

  // Handle view job details
  const handleViewAllJobs = useCallback(() => {
    navigate('/jobs');
  }, [navigate]);

  const handleViewJobDetails = useCallback((jobId: string) => {
    navigate(`/jobs?jobId=${jobId}`);
  }, [navigate]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'add-customer':
        navigate('/customers');
        setTimeout(() => {
          window.dispatchEvent(new Event('open-add-customer-dialog'));
        }, 100);
        break;
      case 'update-inventory':
        navigate('/inventory');
        break;
      case 'create-invoice':
        navigate('/invoices');
        break;
      case 'view-overdue-jobs':
        navigate('/jobs?filter=overdue');
        break;
      default:
        break;
    }
  }, [navigate]);

  // Filter recent jobs based on search term
  const filteredRecentJobs = recentJobs.filter((job) =>
    job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.issueDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOverdueJobs = overdueJobs.filter((job) =>
    job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.issueDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const usePercentageChange = (current: number, previous: number) => {
    if (!previous) return {
      label: current > 0 ? '+100%' : '0%',
      isPositive: current > 0
    };
    const change = ((current - previous) / previous) * 100;
    return {
      label: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isPositive: change >= 0
    };
  };

  const revenueChange = usePercentageChange(stats.revenueThisMonth, stats.revenueLastMonth);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueChange.isPositive ? (
                <span className="text-green-500 inline-flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" /> {revenueChange.label}
                </span>
              ) : (
                <span className="text-red-500 inline-flex items-center">
                  <TrendingDown className="mr-1 h-3 w-3" /> {revenueChange.label}
                </span>
              )}
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue Repairs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-500">{stats.overdueJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs & Overdue Repairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Jobs</CardTitle>
              <Button variant="link" className="p-0 h-auto" onClick={handleViewAllJobs}>
                View All Jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecentJobs.length > 0 ? (
                    filteredRecentJobs.slice(0, 4).map((job) => (
                      <TableRow key={job.id} className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewJobDetails(job.id)}>
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>{job.customer || 'Unknown Customer'}</TableCell>
                        <TableCell>{job.issue || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>{new Date(job.dueDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No recent jobs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Repairs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Overdue Repairs</CardTitle>
              <Button variant="link" className="p-0 h-auto" onClick={() => handleViewOverdueJob('all')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOverdueJobs.length > 0 ? (
                    filteredOverdueJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-gray-50 cursor-pointer">
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>{job.customer || 'Unknown'}</TableCell>
                        <TableCell>{job.issue || 'N/A'}</TableCell>
                        <TableCell>{new Date(job.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewOverdueJob(job.id)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No overdue repairs.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="#00A651"
                  radius={[4, 4, 0, 0]}
                  background={{ fill: '#E0E0E0' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

  
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Repair Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Phone Repairs</span>
              <span className="font-medium">65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Computer Repairs</span>
              <span className="font-medium">25%</span>
            </div>
            <Progress value={25} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tablet Repairs</span>
              <span className="font-medium">10%</span>
            </div>
            <Progress value={10} className="h-2" />
          </div>
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full border-repairam text-repairam hover:bg-repairam-50 hover:text-repairam-dark"
              onClick={handleViewAllJobs}
            >
              View Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleQuickAction('add-customer')}>
              <Users className="mr-2 h-4 w-4" /> Add Customer
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleQuickAction('update-inventory')}>
              <Package className="mr-2 h-4 w-4" /> Update Inventory
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleQuickAction('create-invoice')}>
              <FileText className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleQuickAction('view-overdue-jobs')}>
              <Calendar className="mr-2 h-4 w-4" /> View Overdue Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;