
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

type ProfitData = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
};

export const ProfitCalculator = () => {
  // Sample data - in a real app this would come from an API
  const [profitData] = useState<ProfitData[]>([
    { 
      month: 'Jan', 
      revenue: 12500, 
      expenses: 7200, 
      profit: 5300, 
      profitMargin: 42.4 
    },
    { 
      month: 'Feb', 
      revenue: 14200, 
      expenses: 8100, 
      profit: 6100, 
      profitMargin: 42.9 
    },
    { 
      month: 'Mar', 
      revenue: 15800, 
      expenses: 8700, 
      profit: 7100, 
      profitMargin: 44.9 
    },
    { 
      month: 'Apr', 
      revenue: 17200, 
      expenses: 9200, 
      profit: 8000, 
      profitMargin: 46.5 
    },
    { 
      month: 'May', 
      revenue: 19500, 
      expenses: 10400, 
      profit: 9100, 
      profitMargin: 46.7 
    },
    { 
      month: 'Jun', 
      revenue: 21800, 
      expenses: 11500, 
      profit: 10300, 
      profitMargin: 47.2 
    },
  ]);

  const chartData = profitData.map(item => ({
    name: item.month,
    Revenue: item.revenue,
    Expenses: item.expenses,
    Profit: item.profit
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis</CardTitle>
          <CardDescription>
            Detailed profit analysis for management use only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="Revenue" fill="#22c55e" />
                <Bar dataKey="Expenses" fill="#ef4444" />
                <Bar dataKey="Profit" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Profit Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitData.map((item) => (
                <TableRow key={item.month}>
                  <TableCell className="font-medium">{item.month}</TableCell>
                  <TableCell>${item.revenue.toLocaleString()}</TableCell>
                  <TableCell>${item.expenses.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">${item.profit.toLocaleString()}</TableCell>
                  <TableCell>{item.profitMargin}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
