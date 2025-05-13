import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Clock, CheckCircle, AlertCircle, Clock4 } from 'lucide-react';

// Types
interface TechnicianPerformance {
  technician: string;
  weeklyData: Array<{ week: string; completed: number; inProgress: number; pending: number }>;
  avgTurnaround: number;
  totalCompleted: number;
  totalInProgress: number;
  totalPending: number;
}

interface TurnaroundTime {
  month: string;
  turnaround: number;
}

const config = {
  completed: { label: 'Completed', color: '#86efac' },
  inProgress: { label: 'In Progress', color: '#93c5fd' },
  pending: { label: 'Pending', color: '#fcd34d' },
};

const TechnicianAnalytics = () => {
  const [performanceData, setPerformanceData] = useState<TechnicianPerformance | null>(null);
  const [turnaroundData, setTurnaroundData] = useState<TurnaroundTime[]>([]);
  const [currentTechnician, setCurrentTechnician] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Get logged-in technician name
  const getLoggedInTechnicianName = () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    try {
      const user = JSON.parse(userString);
      return {
        name: user.name || user.email,
        role: user.role,
      };
    } catch (err) {
      console.error('Failed to parse user data:', err);
      return null;
    }
  };

  // Fetch performance data
  const fetchPerformanceData = async (technicianName: string) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/technicians/${encodeURIComponent(technicianName)}/performance`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch performance data');

      const data = await response.json();

      const formattedData = {
        technician: technicianName,
        weeklyData: data.weeklyData || [],
        avgTurnaround: data.avgTurnaround || 0,
        totalCompleted: data.totalCompleted || 0,
        totalInProgress: data.totalInProgress || 0,
        totalPending: data.totalPending || 0,
      };

      setPerformanceData(formattedData);
    } catch (err: any) {
      setError(err.message || 'Could not load performance data');
    }
  };

  // Fetch turnaround trend data
  const fetchTurnaroundTrend = async (technicianName: string) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/technicians/${encodeURIComponent(technicianName)}/turnaround-time`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch turnaround time data');

      const data = await response.json();
      setTurnaroundData(data);
    } catch (err: any) {
      setError(err.message || 'Could not load turnaround time data');
    }
  };

  // Load data on mount
  useEffect(() => {
    const technician = getLoggedInTechnicianName();
    if (!technician) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    setCurrentTechnician(technician);
    Promise.all([
      fetchPerformanceData(technician.name),
      fetchTurnaroundTrend(technician.name)
    ]).finally(() => setLoading(false));
  }, []);

  const currentTechData = performanceData || {
    technician: '',
    weeklyData: [],
    avgTurnaround: 0,
    totalCompleted: 0,
    totalInProgress: 0,
    totalPending: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Technician Analytics</h1>
          <div className="text-sm text-gray-500 mt-2">
            Logged in as{' '}
            <span className="font-semibold">{currentTechnician?.name || 'Unknown'}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Turnaround Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentTechData.avgTurnaround.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average time from pickup to completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Jobs
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTechData.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Total jobs completed to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Workload
            </CardTitle>
            <Clock4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentTechData.totalInProgress}{' '}
              <span className="text-base font-normal text-muted-foreground">in progress</span>
            </div>
            <div className="text-sm">
              {currentTechData.totalPending}{' '}
              <span className="text-xs text-muted-foreground">pending</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currentTechData.weeklyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#86efac" />
                  <Bar dataKey="inProgress" name="In Progress" fill="#93c5fd" />
                  <Bar dataKey="pending" name="Pending" fill="#fcd34d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Turnaround Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Turnaround Time Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={turnaroundData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="turnaround"
                  name="Avg Turnaround (days)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianAnalytics;