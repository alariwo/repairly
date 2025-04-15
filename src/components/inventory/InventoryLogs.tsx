
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  Download, 
  Search, 
  Calendar,
  Filter
} from 'lucide-react';
import { InventoryItem, PartUsage } from "@/components/parts/PartsSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

interface InventoryLog {
  id: string;
  action: 'added' | 'removed' | 'restocked' | 'adjusted' | 'used';
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  user: string;
  notes: string;
  jobId?: string;
  customerName?: string;
}

interface InventoryLogsProps {
  logs: InventoryLog[];
  partUsages: PartUsage[];
  inventory: InventoryItem[];
}

export const InventoryLogs = ({ logs, partUsages, inventory }: InventoryLogsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Convert part usages to logs format
  const usageLogs: InventoryLog[] = partUsages.map(usage => ({
    id: `usage-${usage.partId}-${usage.jobId}-${Date.now()}`,
    action: 'used',
    itemId: usage.partId,
    itemName: usage.partName,
    quantity: usage.quantity,
    date: new Date(usage.dateUsed).toISOString(),
    user: usage.technicianName || 'Unknown',
    notes: `Used in job ${usage.jobId}`,
    jobId: usage.jobId,
    customerName: usage.customerName
  }));
  
  // Combine all logs
  const allLogs = [...logs, ...usageLogs];
  
  // Filter logs based on search term, action filter, and time filter
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = 
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.customerName && log.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    // Time filter
    const logDate = new Date(log.date);
    const now = new Date();
    const isToday = logDate.toDateString() === now.toDateString();
    const isThisWeek = () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return logDate >= oneWeekAgo;
    };
    const isThisMonth = () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return logDate >= oneMonthAgo;
    };
    
    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = isToday;
    } else if (timeFilter === 'week') {
      matchesTime = isThisWeek();
    } else if (timeFilter === 'month') {
      matchesTime = isThisMonth();
    }
    
    return matchesSearch && matchesAction && matchesTime;
  });
  
  // Sort logs by date, newest first
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'added':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Added</Badge>;
      case 'removed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Removed</Badge>;
      case 'restocked':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Restocked</Badge>;
      case 'adjusted':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Adjusted</Badge>;
      case 'used':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Used</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{action}</Badge>;
    }
  };
  
  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Part Name', 'Action', 'Quantity', 'User', 'Notes', 'Customer'];
    const rows = sortedLogs.map(log => [
      new Date(log.date).toLocaleString(),
      log.itemName,
      log.action,
      log.quantity.toString(),
      log.user,
      log.notes,
      log.customerName || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-activity-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <CardTitle className="flex items-center">
            <Archive className="mr-2 h-5 w-5" />
            Inventory Activity Logs
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              defaultValue="all"
              onValueChange={setActionFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="added">Added</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
                <SelectItem value="restocked">Restocked</SelectItem>
                <SelectItem value="adjusted">Adjusted</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              defaultValue="all"
              onValueChange={setTimeFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search logs..."
                className="pl-10 w-full sm:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.length > 0 ? (
              sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.date), 'MMM dd, yyyy hh:mm a')}
                  </TableCell>
                  <TableCell className="font-medium">{log.itemName}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{log.quantity}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] overflow-hidden text-ellipsis">
                      {log.notes}
                      {log.customerName && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {log.customerName}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm || actionFilter !== 'all' || timeFilter !== 'all' ? 
                    "No matching logs found." : 
                    "No activity logs available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventoryLogs;
