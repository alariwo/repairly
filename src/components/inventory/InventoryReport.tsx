
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
import { FileText, Printer, Download, Search } from 'lucide-react';
import { InventoryItem, PartUsage } from "@/components/parts/PartsSelector";

interface InventoryReportProps {
  inventory: InventoryItem[];
  partUsages: PartUsage[];
}

export const InventoryReport = ({ inventory, partUsages }: InventoryReportProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Process data to create a usage report
  const usageReport = inventory.map(item => {
    // Find all usages for this part
    const usages = partUsages.filter(usage => usage.partId === item.id);
    
    // Get unique jobs that used this part
    const uniqueJobs = [...new Set(usages.map(usage => usage.jobId))];
    
    // Calculate total quantity used
    const totalUsed = usages.reduce((sum, usage) => sum + usage.quantity, 0);
    
    // Group by customer
    const customerUsage = usages.reduce((acc, usage) => {
      if (!acc[usage.customerName]) {
        acc[usage.customerName] = 0;
      }
      acc[usage.customerName] += usage.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      ...item,
      usageCount: totalUsed,
      jobCount: uniqueJobs.length,
      customerUsage
    };
  });
  
  // Filter based on search term
  const filteredReport = usageReport.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort by most used
  const sortedReport = [...filteredReport].sort((a, b) => b.usageCount - a.usageCount);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Part Name', 'Category', 'Current Stock', 'Total Used', 'Job Count', 'Customers'];
    const rows = sortedReport.map(item => [
      item.name,
      item.category,
      item.quantity.toString(),
      item.usageCount.toString(),
      item.jobCount.toString(),
      Object.entries(item.customerUsage)
        .map(([customer, count]) => `${customer} (${count})`)
        .join('; ')
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
    link.setAttribute('download', `inventory-usage-report-${new Date().toISOString().split('T')[0]}.csv`);
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
            <FileText className="mr-2 h-5 w-5" />
            Inventory Usage Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search parts..."
                className="pl-10 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
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
              <TableHead>Part Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Total Used</TableHead>
              <TableHead>Job Count</TableHead>
              <TableHead>Customer Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReport.length > 0 ? (
              sortedReport.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className={item.quantity < 5 ? "text-red-500 font-medium" : ""}>
                    {item.quantity}
                  </TableCell>
                  <TableCell>
                    {item.usageCount > 0 ? (
                      <Badge variant="secondary" className="font-normal">
                        {item.usageCount} units
                      </Badge>
                    ) : (
                      <span className="text-gray-500">No usage</span>
                    )}
                  </TableCell>
                  <TableCell>{item.jobCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Object.entries(item.customerUsage).map(([customer, count], idx) => (
                        <Badge key={idx} variant="outline" className="font-normal text-xs">
                          {customer} ({count})
                        </Badge>
                      ))}
                      {Object.keys(item.customerUsage).length === 0 && (
                        <span className="text-gray-500">No customers</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? "No matching parts found." : "No usage data available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventoryReport;
