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
  id: string;
  customer: string;
  deviceType: string;
  issueDescription: string;
  serialNumber: string;
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
    case 'in-progress':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
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
      return <Badge className="bg-yellow-101 text-yellow-800 border-yellow-200">Medium</Badge>;
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
  const [revenueChartData, setRevenueChartData] = useState<
    Array<{ name: string; revenue: number }>
  >([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Format date safely
  const formatDueDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

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

      const formattedJobs = data.map((job: any) => ({
        ...job,
        id: job.id || job._id,
        dueDate: formatDueDate(job.dueDate),
        createdAt: job.createdAt ? formatDueDate(job.createdAt) : 'N/A'
      }));

      const completed = formattedJobs.filter(j =>
        ['repair-completed', 'delivered'].includes(j.status)
      ).length;

      const overdue = formattedJobs.filter(
        j => !['repair-completed', 'delivered'].includes(j.status) && new Date(j.dueDate) < new Date()
      ).length;

      const pending = formattedJobs.length - completed - overdue;

      setRecentJobs(formattedJobs);
      setStats(prev => ({
        ...prev,
        completedJobs: completed,
        overdueJobs: overdue,
        pendingJobs: pending,
      }));
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

      const filteredData = data
        .filter(job => !['repair-completed', 'delivered'].includes(job.status))
        .map(job => ({
          ...job,
          id: job.id || job._id,
          dueDate: formatDueDate(job.dueDate),
        }));

      setOverdueJobs(filteredData);
      setStats(prev => ({ ...prev, overdueJobs: filteredData.length }));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load overdue jobs.',
        variant: 'destructive',
      });
    }
  };

  // Fetch dashboard stats
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

      // Ensure data matches Recharts format: { name: "Jan", revenue: 4500 }
      const chartReadyData = data.map(item => ({
        name: item.month || item.name,
        revenue: item.totalValue || item.revenue || 0,
      }));

      setRevenueChartData(chartReadyData);
    } catch (error) {
      console.error('Revenue trend fetch failed:', error);
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

      if (!response.ok) throw new Error('Failed to fetch revenue this month');
      const result = await response.json();

      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      const currentMonthValue = revenueChartData.find(d => d.name === currentMonth)?.revenue || 0;

      setStats(prev => ({
        ...prev,
        revenueThisMonth: currentMonthValue,
        revenueLastMonth: result.totalValue || 0
      }));
    } catch (error) {
      console.error(error);
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

  // Filter users based on search term
  const filteredRecentJobs = useMemo(() => {
    return recentJobs.filter((job) =>
      job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentJobs, searchTerm]);

  const filteredOverdueJobs = useMemo(() => {
    return overdueJobs.filter((job) =>
      job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.issueDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [overdueJobs, searchTerm]);

  // Hardcoded repair jobs data — keep as-is
  const repairJobsData = [
    { name: 'Phone Repairs', value: 65 },
    { name: 'Computer Repairs', value: 25 },
    { name: 'Tablet Repairs', value: 10 },
  ];

  // Helper: Get percentage change
  const usePercentageChange = (current: number, previous: number) => {
    if (!previous) return { label: '+100%', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      label: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isPositive: change >= 0,
    };
  };

  const revenueChange = usePercentageChange(stats.revenueThisMonth, stats.revenueLastMonth);

  const statCards = [
    {
      title: 'Pending Jobs',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      value: stats.pendingJobs.toString(),
      subtitle: 'Need attention',
    },
    {
      title: 'Completed Jobs',
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      value: stats.completedJobs.toString(),
      subtitle: 'This month',
    },
    {
      title: 'Active Customers',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      value: stats.activeCustomers.toString(),
      subtitle: '+12% from last month',
    },
    {
      title: 'Overdue Repairs',
      icon: <Calendar className="h-4 w-4 text-red-500" />,
      value: stats.overdueJobs.toString(),
      subtitle: 'Need immediate attention',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
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
                    <TableHead>Issue</TableHead>
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
              <Button variant="link" className="p-0 h-auto" onClick={() => handleViewJobDetails('all')}>
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
                    <TableHead>Issue</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOverdueJobs.length > 0 ? (
                    filteredOverdueJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>{job.customer || 'Unknown'}</TableCell>
                        <TableCell>{job.issueDescription || 'N/A'}</TableCell>
                        <TableCell>{new Date(job.dueDate).toLocaleDateString()|| 'Date Not Known'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewJobDetails(job.id)}>
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

      {/* ✅ Fixed: Revenue Trend Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="#00A651"
                  radius={[4, 4, 0, 0]}
                  background={{ fill: '#E0E0E0' }} // Faded bars for empty months
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Repair Jobs Card */}
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