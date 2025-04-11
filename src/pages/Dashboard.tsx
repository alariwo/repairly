
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Clock, CheckCircle, AlertTriangle, PlusCircle, 
  ArrowUpRight, Package, FileText 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNewJobClick = () => {
    navigate('/jobs');
    // Give time for navigation then show the dialog
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-new-job-dialog'));
    }, 100);
  };

  const handleViewAllJobs = () => {
    navigate('/jobs');
  };

  const handleViewFullReport = () => {
    toast({
      title: "Report Generation",
      description: "Generating full repair report...",
    });
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your full repair report is ready to download.",
      });
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
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
  };

  const handleViewJobDetails = (jobId: string) => {
    navigate(`/jobs?jobId=${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleNewJobClick} className="bg-repairam hover:bg-repairam-dark">
          <PlusCircle className="mr-2 h-4 w-4" /> New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-repairam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500 mt-1">3 need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-repairam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-repairam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inventory Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-500 mt-1">Items low in stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                onClick={handleViewFullReport}
              >
                View Full Report <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Jobs</h2>
          <Button variant="link" className="text-repairam hover:text-repairam-dark p-0" onClick={handleViewAllJobs}>
            View All Jobs
          </Button>
        </div>

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
                {recentJobs.map((job) => (
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
                        onClick={() => handleViewJobDetails(job.id)}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('add-customer')}
            >
              <Users className="mr-2 h-4 w-4" /> Add New Customer
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('update-inventory')}
            >
              <Package className="mr-2 h-4 w-4" /> Update Inventory
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('create-invoice')}
            >
              <FileText className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
