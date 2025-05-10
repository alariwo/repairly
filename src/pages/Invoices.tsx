import React, { useState, useEffect } from 'react';
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
  TableFooter,
  TableHeader,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, MoreHorizontal, Eye, Printer, Download, Send, Check, X, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Job {
  id: string;
  customer: string;
  device: string;
  issue: string;
  status: string;
  assignedTo: string;
  customerEmail?: string;
  phoneNumber?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  _id?: string;
  id: string;
  invoiceNumber: string;
  sender: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  recipient: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  jobId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, '_id'>>({
    id: '',
    invoiceNumber: '',
    sender: {
      name: 'RepairAM',
      email: 'info@repairam.com',
      phone: '+23412914182',
      address: '20 Bisi Ogabi Street, Off Toyin Street, Ikeja, Lagos',
    },
    recipient: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    jobId: '',
    amount: 0,
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [lastMonthValue, setLastMonthValue] = useState(0);
  const [overdueValue, setOverdueValue] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const { toast } = useToast();

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch all invoices
  const fetchInvoices = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/invoices ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();

      const formattedInvoices = data.map(inv => ({
        ...inv,
        id: inv._id || inv.id,
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoices.',
        variant: 'destructive',
      });
    }
  };

  // Fetch total count
  const fetchTotalCount = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/invoices/total-count ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoice count');

      const result = await response.json();
      setTotalCount(result.totalInvoices || 0);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch last month value
  const fetchLastMonthValue = async () => {
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
      setLastMonthValue(result.totalValueLastMonth || 0);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch overdue value
  const fetchOverdueValue = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch('https://repairly-backend.onrender.com/api/invoices/total-overdue-value ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch overdue value');

      const result = await response.json();
      setOverdueValue(result.overdueValue || 0);
    } catch (error) {
      console.error(error);
    }
  };

  // Load all data on mount
  useEffect(() => {
    fetchInvoices();
    fetchTotalCount();
    fetchLastMonthValue();
    fetchOverdueValue();
    fetchJobs();
    fetchCustomers();
  }, []);

  // Update balance due and overdue when invoices change
  useEffect(() => {
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
    setOverdueValue(overdueAmount);

    const sentAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.amount, 0);
    setBalanceDue(sentAmount);
  }, [invoices]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const res = await fetch('https://repairly-backend.onrender.com/api/jobs ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch jobs');

      const data = await res.json();
      setJobs(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load jobs.',
        variant: 'destructive',
      });
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const res = await fetch('https://repairly-backend.onrender.com/api/customers ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch customers');

      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load customers.',
        variant: 'destructive',
      });
    }
  };

  // Handle creating a new invoice
  const handleCreateInvoice = async () => {
    if (
      !newInvoice.recipient.name ||
      !newInvoice.jobId ||
      newInvoice.items.length === 0
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in required fields: job ID and at least one item.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        ...newInvoice,
        invoiceNumber: invoiceId,
        amount: newInvoice.items.reduce((sum, item) => sum + item.amount, 0),
      };

      const response = await fetch('https://repairly-backend.onrender.com/api/invoices ', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create invoice.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const createdInvoice = await response.json();
      setInvoices([createdInvoice, ...invoices]);
      setIsAddDialogOpen(false);

      setNewInvoice({
        id: '',
        invoiceNumber: '',
        sender: {
          name: 'RepairAM',
          email: 'info@repairam.com',
          phone: '+23412914182',
          address: '20 Bisi Ogabi Street, Off Toyin Street, Ikeja, Lagos',
        },
        recipient: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
        jobId: '',
        amount: 0,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [],
      });

      toast({ title: 'Invoice Created', description: `Invoice #${invoiceId} has been created.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice.',
        variant: 'destructive',
      });
    }
  };

  // Handle updating invoice status
  const handleUpdateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to update status.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedInvoice = await response.json();
      setInvoices(invoices.map(inv => (inv.id === invoiceId ? updatedInvoice : inv)));
      toast({ title: 'Status Updated', description: `Marked invoice #${invoiceId} as ${newStatus}` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update invoice status.',
        variant: 'destructive',
      });
    }
  };

  // Open view dialog
  const openInvoiceView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  // Add item
  const addItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${prev.items.length + 1}`,
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  // Handle item changes
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index][field] = value;

    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setNewInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sent</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    if (!invoice) return false;

    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    if (dateRange.from && dateRange.to) {
      const invoiceDate = new Date(invoice.issueDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      return matchesSearch && matchesStatus && invoiceDate >= fromDate && invoiceDate <= toDate;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate total
  const calculateTotal = () => {
    return newInvoice.items.reduce((total, item) => total + item.amount, 0);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({});
  };

  // Handle job selection
  const handleJobSelect = (jobId: string) => {
    const selectedJob = jobs.find(job => job.id === jobId);
    if (!selectedJob) return;

    const recipient = customers.find(cust => cust.name === selectedJob.customer) || {
      name: selectedJob.customer,
      email: selectedJob.customerEmail || '',
      phone: selectedJob.phoneNumber || '',
      address: '',
    };

    setNewInvoice(prev => ({
      ...prev,
      jobId,
      recipient: {
        name: recipient.name,
        email: recipient.email || '',
        phone: recipient.phone || '',
        address: recipient.address || ''
      },
      items: prev.items,
    }));
  };

  // Generate PDF
  const handleDownloadPdf = () => {
    const element = document.getElementById("invoice-printable");

    if (!element) {
      toast({
        title: "Error",
        description: "Could not find printable content.",
        variant: "destructive"
      });
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.style.padding = "20px";
    wrapper.style.backgroundColor = "#ffffff";
    wrapper.innerHTML = element.innerHTML;

    document.body.appendChild(wrapper);

    const options = {
      margin: [10, 10],
      filename: `${selectedInvoice?.invoiceNumber}_invoice.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: [297, 210], orientation: "landscape" },
    };

    try {
      window.html2pdf(wrapper, options).save();
      toast({ title: "PDF Generated", description: `The invoice has been downloaded.` });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "An error occurred while generating the PDF.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  // Print invoice
  const handlePrintClick = () => {
    const printElement = document.getElementById("invoice-printable");

    if (!printElement) {
      toast({
        title: "Error",
        description: "Could not find content to print.",
        variant: "destructive",
      });
      return;
    }

    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to print this document.",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            @media print {
              @page { size: landscape; margin: 5mm; }
              body { zoom: 0.8; }
            }
          </style>
        </head>
        <body>${printElement.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <p className="text-xl font-bold">{totalCount}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Last Month Value</CardTitle>
            <p className="text-xl font-bold">₦{lastMonthValue.toLocaleString()}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <p className="text-xl font-bold text-red-600">₦{overdueValue.toLocaleString()}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <p className="text-xl font-bold">₦{balanceDue.toLocaleString()}</p>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search invoices..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters}>Clear</Button>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.recipient.name}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>₦{invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openInvoiceView(invoice)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateInvoiceStatus(invoice.id, 'sent')}>
                              <Send className="mr-2 h-4 w-4" /> Mark as Sent
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}>
                              <Check className="mr-2 h-4 w-4" /> Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateInvoiceStatus(invoice.id, 'overdue')}>
                              <X className="mr-2 h-4 w-4" /> Mark as Overdue
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
          </div>
        </CardContent>
      </Card>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Select a job and add line items below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Job Selection */}
            <div className="grid gap-2">
              <Label htmlFor="job">Select Job</Label>
              <Select onValueChange={handleJobSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.id}: {job.device} - {job.customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Info */}
            <div className="grid gap-2">
              <Label>Recipient</Label>
              <Input
                placeholder="Name"
                value={newInvoice.recipient.name}
                onChange={(e) =>
                  setNewInvoice(prev => ({
                    ...prev,
                    recipient: {
                      ...prev.recipient,
                      name: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="Email"
                value={newInvoice.recipient.email}
                onChange={(e) =>
                  setNewInvoice(prev => ({
                    ...prev,
                    recipient: {
                      ...prev.recipient,
                      email: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="Phone"
                value={newInvoice.recipient.phone}
                onChange={(e) =>
                  setNewInvoice(prev => ({
                    ...prev,
                    recipient: {
                      ...prev.recipient,
                      phone: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="Address"
                value={newInvoice.recipient.address}
                onChange={(e) =>
                  setNewInvoice(prev => ({
                    ...prev,
                    recipient: {
                      ...prev.recipient,
                      address: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* Items Table */}
            <div className="mt-4">
              <Label>Invoice Items</Label>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left">Description</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Rate</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newInvoice.items.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-2">
                          <Input
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, 'description', e.target.value)
                            }
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value))
                            }
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(index, 'rate', parseFloat(e.target.value))
                            }
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-semibold">
                          ₦{(item.amount || item.quantity * item.rate).toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button variant="outline" size="sm" onClick={addItem} className="mt-4">
                  Add Item
                </Button>
              </div>
            </div>

            {/* Issue & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={newInvoice.issueDate}
                  onChange={(e) =>
                    setNewInvoice(prev => ({ ...prev, issueDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) =>
                    setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <>
              {/* Visible Preview */}
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-repairam">RepairAM</h2>
                    <p className="text-sm text-muted-foreground">20 Bisi Ogabi Street, Off Toyin Street, Ikeja, Lagos</p>
                    <p className="text-sm text-muted-foreground">info@repairam.com</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold">INVOICE #{selectedInvoice.invoiceNumber}</h3>
                    <p className="text-sm mt-2">
                      Status: {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold mb-2">Bill To:</h4>
                    <p>{selectedInvoice.recipient.name}</p>
                    <p>{selectedInvoice.recipient.email}</p>
                    <p>{selectedInvoice.recipient.phone}</p>
                    <p className="whitespace-pre-line">{selectedInvoice.recipient.address}</p>
                  </div>
                  <div>
                    <p><strong>Issue Date:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">₦{item.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₦{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₦{selectedInvoice.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {/* Hidden Printable Content */}
              <div id="invoice-printable" className="hidden">
                <div className="p-6 bg-white shadow-none" style={{ width: '900px' }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">RepairAM</h2>
                      <p className="text-sm text-gray-500">20 Bisi Ogabi Street, Off Toyin Street, Ikeja, Lagos</p>
                      <p className="text-sm text-gray-500">info@repairam.com</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-bold">INVOICE #{selectedInvoice.invoiceNumber}</h3>
                      <p className="text-sm mt-2">Status: {selectedInvoice.status}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Bill To:</h4>
                      <p>{selectedInvoice.recipient.name}</p>
                      <p>{selectedInvoice.recipient.email}</p>
                      <p>{selectedInvoice.recipient.phone}</p>
                      <p className="whitespace-pre-line">{selectedInvoice.recipient.address}</p>
                    </div>
                    <div>
                      <p><strong>Issue Date:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                      <p><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">₦{item.rate.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₦{item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₦{selectedInvoice.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>

              {/* Buttons */}
              <DialogFooter className="flex flex-wrap gap-2 justify-end mt-6">
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintClick}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;