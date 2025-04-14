
import React, { useState, useMemo } from 'react';
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Plus, MoreHorizontal, Eye, Printer, Send, Check, X, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
  jobId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'paid':
      return "bg-green-100 text-green-800";
    case 'sent':
      return "bg-blue-100 text-blue-800";
    case 'overdue':
      return "bg-red-100 text-red-800";
    case 'draft':
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Invoices = () => {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      customer: {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        address: '123 Main St, Anytown, ST 12345'
      },
      jobId: '1',
      amount: 550.00,
      status: 'paid',
      issueDate: '2025-03-15',
      dueDate: '2025-04-15',
      items: [
        {
          id: '1-1',
          description: 'Oil Change',
          quantity: 1,
          rate: 50.00,
          amount: 50.00
        },
        {
          id: '1-2',
          description: 'Brake Replacement',
          quantity: 1,
          rate: 500.00,
          amount: 500.00
        }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      customer: {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        address: '456 Oak Ave, Anytown, ST 12345'
      },
      jobId: '2',
      amount: 220.00,
      status: 'sent',
      issueDate: '2025-04-01',
      dueDate: '2025-05-01',
      items: [
        {
          id: '2-1',
          description: 'Diagnostic Fee',
          quantity: 1,
          rate: 120.00,
          amount: 120.00
        },
        {
          id: '2-2',
          description: 'Air Filter Replacement',
          quantity: 1,
          rate: 100.00,
          amount: 100.00
        }
      ]
    },
    {
      id: '3',
      invoiceNumber: 'INV-2025-003',
      customer: {
        id: '3',
        name: 'Mike Rodriguez',
        email: 'mike@example.com',
        address: '789 Pine St, Anytown, ST 12345'
      },
      jobId: '3',
      amount: 890.00,
      status: 'overdue',
      issueDate: '2025-03-10',
      dueDate: '2025-04-10',
      items: [
        {
          id: '3-1',
          description: 'Transmission Service',
          quantity: 1,
          rate: 750.00,
          amount: 750.00
        },
        {
          id: '3-2',
          description: 'Coolant Flush',
          quantity: 1,
          rate: 140.00,
          amount: 140.00
        }
      ]
    },
    {
      id: '4',
      invoiceNumber: 'INV-2025-004',
      customer: {
        id: '4',
        name: 'Emily Chen',
        email: 'emily@example.com',
        address: '321 Elm St, Anytown, ST 12345'
      },
      jobId: '4',
      amount: 310.00,
      status: 'draft',
      issueDate: '2025-04-12',
      dueDate: '2025-05-12',
      items: [
        {
          id: '4-1',
          description: 'Battery Replacement',
          quantity: 1,
          rate: 150.00,
          amount: 150.00
        },
        {
          id: '4-2',
          description: 'Spark Plug Replacement',
          quantity: 4,
          rate: 40.00,
          amount: 160.00
        }
      ]
    }
  ]);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { toast } = useToast();
  
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Search filter
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateRange.from) {
        const invoiceDate = new Date(invoice.issueDate);
        matchesDate = invoiceDate >= dateRange.from;
        
        if (dateRange.to) {
          matchesDate = matchesDate && invoiceDate <= dateRange.to;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchTerm, statusFilter, dateRange]);
  
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueTotalAmount = filteredInvoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const handleStatusChange = (id: string, newStatus: 'draft' | 'sent' | 'paid' | 'overdue') => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === id ? { ...invoice, status: newStatus } : invoice
    );
    setInvoices(updatedInvoices);
    
    const invoice = invoices.find(inv => inv.id === id);
    toast({
      title: "Invoice Updated",
      description: `Invoice ${invoice?.invoiceNumber} marked as ${newStatus}.`
    });
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ from: undefined, to: undefined });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${overdueTotalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-[180px] justify-start text-left font-normal"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <FileText className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                ) : (
                  `From ${dateRange.from.toLocaleDateString()}`
                )
              ) : (
                "Select date range"
              )}
            </Button>
            {isDatePickerOpen && (
              <div className="absolute z-10 mt-2 p-4 bg-white rounded-md shadow-md border">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    if (range?.from) {
                      setIsDatePickerOpen(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('sent')}>Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>Overdue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchTerm || statusFilter !== 'all' || dateRange.from) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customer.name}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn("font-normal", getStatusColor(invoice.status))}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'draft')}>
                            <span className="mr-2">📝</span> Mark as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'sent')}>
                            <Send className="mr-2 h-4 w-4" />
                            Mark as Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'overdue')}>
                            <X className="mr-2 h-4 w-4" />
                            Mark as Overdue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No invoices found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Invoice View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-repairam">RepairAM</h2>
                  <p className="text-sm text-muted-foreground">123 Auto Street</p>
                  <p className="text-sm text-muted-foreground">Repair City, ST 12345</p>
                  <p className="text-sm text-muted-foreground">info@repairam.com</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold">Invoice #{selectedInvoice.invoiceNumber}</h3>
                  <div className="flex space-x-2 items-center justify-end mt-1">
                    <p className="text-sm">Status:</p>
                    <Badge className={cn("font-normal", getStatusColor(selectedInvoice.status))}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                  <p className="text-sm">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-1">Bill To:</h3>
                  <p>{selectedInvoice.customer.name}</p>
                  <p>{selectedInvoice.customer.email}</p>
                  <p className="whitespace-pre-line">{selectedInvoice.customer.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Job Reference:</h3>
                  <p>Job #{selectedInvoice.jobId}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Items:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Description</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">Total:</TableCell>
                      <TableCell className="text-right font-semibold">${selectedInvoice.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-1">Payment Terms:</h3>
                <p className="text-sm text-muted-foreground">
                  Payment is due within 30 days. Please make checks payable to RepairAM or use our online payment system.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
