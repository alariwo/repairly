import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Clock, CheckCircle, AlertTriangle, PlusCircle, 
  ArrowUpRight, Package, FileText, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Demo data for charts and stats
const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
];

const recentJobs = [
  { id: 'JOB-1234', customer: 'John Smith', service: 'Phone Screen Repair', date: '2025-04-10', status: 'completed' },
  { id: 'JOB-1235', customer: 'Sarah Johnson', service: 'Laptop Battery Replacement', date: '2025-04-09', status: 'in-progress' },
  { id: 'JOB-1236', customer: 'Michael Brown', service: 'Tablet Charging Port Fix', date: '2025-04-08', status: 'pending' },
  { id: 'JOB-1237', customer: 'Emily Davis', service: 'PC Virus Removal', date: '2025-04-07', status: 'completed' },
];

// Define overdue jobs
const overdueJobs = [
  { id: 'JOB-1230', customer: 'Robert Wilson', service: 'MacBook Logic Board', dueDate: '2025-04-05', daysOverdue: 9 },
  { id: 'JOB-1231', customer: 'Jennifer Adams', service: 'iPhone Battery Replacement', dueDate: '2025-04-08', daysOverdue: 6 },
  { id: 'JOB-1232', customer: 'Thomas Lee', service: 'Dell Laptop Screen', dueDate: '2025-04-10', daysOverdue: 4 },
];

// Define proper type interfaces to fix TypeScript errors
interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
}

interface RepairJobsCardProps {
  onViewFullReport: () => void;
}

interface JobsTableProps {
  jobs: Array<{
    id: string;
    customer: string;
    service: string;
    date: string;
    status: string;
  }>;
  onViewJobDetails: (jobId: string) => void;
}

interface OverdueJobsCardProps {
  jobs: Array<{
    id: string;
    customer: string;
    service: string;
    dueDate: string;
    daysOverdue: number;
  }>;
  onViewJob: (jobId: string) => void;
}

interface QuickActionsCardProps {
  onQuickAction: (action: string) => void;
}

// Memoized components to prevent unnecessary re-renders
const StatCard = React.memo(({ title, icon, value, subtitle }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
));

const RevenueChart = React.memo(() => (
  <Card>
    <CardHeader>
      <CardTitle>Revenue Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#00A651" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

const RepairJobsCard = React.memo(({ onViewFullReport }: RepairJobsCardProps) => (
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
          onClick={onViewFullReport}
        >
          View Full Report <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
));

const JobsTable = React.memo(({ jobs, onViewJobDetails }: JobsTableProps) => (
  <div className="rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-6 py-3">Job ID</th>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Service</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{job.id}</td>
              <td className="px-6 py-4">{job.customer}</td>
              <td className="px-6 py-4">{job.service}</td>
              <td className="px-6 py-4">{job.date}</td>
              <td className="px-6 py-4">
                <span 
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : job.status === 'in-progress' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {job.status === 'completed' 
                    ? 'Completed' 
                    : job.status === 'in-progress' 
                      ? 'In Progress' 
                      : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-gray-500"
                  onClick={() => onViewJobDetails(job.id)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

const OverdueJobsCard = React.memo(({ jobs, onViewJob }: OverdueJobsCardProps) => (
  <Card className="border-red-200">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center">
        <Calendar className="h-5 w-5 text-red-500 mr-2" />
        Overdue Repairs
      </CardTitle>
    </CardHeader>
    <CardContent>
      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{job.service}</h4>
                  <p className="text-sm text-gray-500">{job.customer}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {job.daysOverdue} days overdue
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-2 items-center">
                <span className="text-xs text-gray-500">Due: {job.dueDate}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={() => onViewJob(job.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          <p>No overdue repairs</p>
        </div>
      )}
      <Button 
        variant="outline" 
        className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => onViewJob('all')}
      >
        View All Overdue Jobs
      </Button>
    </CardContent>
  </Card>
));

const QuickActionsCard = React.memo(({ onQuickAction }: QuickActionsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 pt-2">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => onQuickAction('add-customer')}
      >
        <Users className="mr-2 h-4 w-4" /> Add New Customer
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => onQuickAction('update-inventory')}
      >
        <Package className="mr-2 h-4 w-4" /> Update Inventory
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => onQuickAction('create-invoice')}
      >
        <FileText className="mr-2 h-4 w-4" /> Create Invoice
      </Button>
    </CardContent>
  </Card>
));

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Memoize callback functions to prevent unnecessary re-renders
  const handleNewJobClick = useCallback(() => {
    navigate('/jobs');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-new-job-dialog'));
    }, 100);
  }, [navigate]);

  const handleViewAllJobs = useCallback(() => {
    navigate('/jobs');
  }, [navigate]);

  const handleViewFullReport = useCallback(() => {
    toast({
      title: "Report Generation",
      description: "Generating full repair report...",
    });
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your full repair report is ready to download.",
      });
    }, 1500);
  }, [toast]);

  const handleQuickAction = useCallback((action: string) => {
    switch(action) {
      case 'add-customer':
        navigate('/customers');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-customer-dialog'));
        }, 100);
        break;
      case 'update-inventory':
        navigate('/inventory');
        break;
      case 'create-invoice':
        navigate('/invoices');
        break;
      default:
        break;
    }
  }, [navigate]);

  const handleViewJobDetails = useCallback((jobId: string) => {
    navigate(`/jobs?jobId=${jobId}`);
  }, [navigate]);

  const handleViewOverdueJob = useCallback((jobId: string) => {
    if (jobId === 'all') {
      navigate('/jobs?filter=overdue');
    } else {
      navigate(`/jobs?jobId=${jobId}`);
    }
  }, [navigate]);

  // Memoize stats to prevent unnecessary re-calculations
  const stats = useMemo(() => [
    { title: 'Pending Jobs', icon: <Clock className="h-4 w-4 text-repairam" />, value: '12', subtitle: '3 need attention' },
    { title: 'Completed Jobs', icon: <CheckCircle className="h-4 w-4 text-repairam" />, value: '142', subtitle: 'This month' },
    { title: 'Active Customers', icon: <Users className="h-4 w-4 text-repairam" />, value: '89', subtitle: '+12% from last month' },
    { title: 'Overdue Repairs', icon: <Calendar className="h-4 w-4 text-red-500" />, value: overdueJobs.length.toString(), subtitle: 'Need immediate attention' }
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleNewJobClick} className="bg-repairam hover:bg-repairam-dark">
          <PlusCircle className="mr-2 h-4 w-4" /> New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title} 
            icon={stat.icon} 
            value={stat.value} 
            subtitle={stat.subtitle} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <RepairJobsCard onViewFullReport={handleViewFullReport} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <Button variant="link" className="text-repairam hover:text-repairam-dark p-0" onClick={handleViewAllJobs}>
                View All Jobs
              </Button>
            </div>

            <JobsTable jobs={recentJobs} onViewJobDetails={handleViewJobDetails} />
          </div>
        </div>
        
        <div>
          <OverdueJobsCard jobs={overdueJobs} onViewJob={handleViewOverdueJob} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionsCard onQuickAction={handleQuickAction} />
      </div>
    </div>
  );
};

export default Dashboard;
