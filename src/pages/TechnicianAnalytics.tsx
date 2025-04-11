
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Clock, CheckCircle, AlertCircle, Clock4 } from 'lucide-react';

// Demo data - in a real app, this would come from an API call
const technicianPerformance = [
  {
    technician: 'Mike Technician',
    weeklyData: [
      { week: 'Week 1', completed: 12, inProgress: 5, pending: 3 },
      { week: 'Week 2', completed: 15, inProgress: 4, pending: 2 },
      { week: 'Week 3', completed: 10, inProgress: 6, pending: 4 },
      { week: 'Week 4', completed: 14, inProgress: 3, pending: 1 },
    ],
    avgTurnaround: 2.5, // in days
    totalCompleted: 51,
    totalInProgress: 18,
    totalPending: 10,
  },
  {
    technician: 'Lisa Technician',
    weeklyData: [
      { week: 'Week 1', completed: 10, inProgress: 4, pending: 2 },
      { week: 'Week 2', completed: 13, inProgress: 3, pending: 3 },
      { week: 'Week 3', completed: 11, inProgress: 5, pending: 1 },
      { week: 'Week 4', completed: 15, inProgress: 2, pending: 2 },
    ],
    avgTurnaround: 2.2, // in days
    totalCompleted: 49,
    totalInProgress: 14,
    totalPending: 8,
  },
];

const config = {
  completed: { label: 'Completed', color: '#86efac' },
  inProgress: { label: 'In Progress', color: '#93c5fd' },
  pending: { label: 'Pending', color: '#fcd34d' },
};

const TechnicianAnalytics = () => {
  const [selectedTechnician, setSelectedTechnician] = useState(technicianPerformance[0].technician);

  const currentTechData = technicianPerformance.find(
    tech => tech.technician === selectedTechnician
  ) || technicianPerformance[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Technician Analytics</h1>
        <Select 
          value={selectedTechnician} 
          onValueChange={setSelectedTechnician}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select technician" />
          </SelectTrigger>
          <SelectContent>
            {technicianPerformance.map(tech => (
              <SelectItem key={tech.technician} value={tech.technician}>
                {tech.technician}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <div className="text-2xl font-bold">{currentTechData.avgTurnaround} days</div>
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
              {currentTechData.totalInProgress} <span className="text-base font-normal text-muted-foreground">in progress</span>
            </div>
            <div className="text-sm">
              {currentTechData.totalPending} <span className="text-xs text-muted-foreground">pending</span>
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
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              {payload.map((entry) => (
                                <div key={entry.name} className="flex flex-col">
                                  <span className="text-sm font-medium">{entry.name}</span>
                                  <span className="text-xs">{entry.value} jobs</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
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
                data={[
                  { month: 'Jan', turnaround: 3.2 },
                  { month: 'Feb', turnaround: 2.9 },
                  { month: 'Mar', turnaround: 2.7 },
                  { month: 'Apr', turnaround: 2.5 },
                ]}
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
