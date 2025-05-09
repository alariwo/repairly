import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Customer {
  _id: string; // Use `_id` as per the API response
  name: string;
  email: string;
  phone: string;
  location: string;
  jobsCompleted: number;
  totalSpent: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isCustomerDetailsDialogOpen, setIsCustomerDetailsDialogOpen] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [customersPerPage] = useState(10); // Number of customers per page

  // Helper function to get the auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Fetch all customers from the backend API
  const fetchCustomers = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(
        "https://repairly-backend.onrender.com/api/customers/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data); // Update state with fetched customers
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load customers. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Listen for the `user-logged-in` event
  useEffect(() => {
    const handleUserLoggedIn = () => {
      fetchCustomers();
    };

    window.addEventListener("user-logged-in", handleUserLoggedIn);
    return () => {
      window.removeEventListener("user-logged-in", handleUserLoggedIn);
    };
  }, []);

  const handleAddCustomer = () => {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      location: "",
    });
    setIsAddCustomerDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer); // Set the selected customer
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
    }); // Pre-fill the form fields
    setIsAddCustomerDialogOpen(true); // Open the modal
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a name and email.",
        variant: "destructive",
      });
      return;
    }

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      let method = "POST";
      let url = "https://repairly-backend.onrender.com/api/customers";

      // If editing an existing customer, update the URL and method
      if (selectedCustomer) {
        method = "PUT";
        url = `https://repairly-backend.onrender.com/api/customers/${selectedCustomer._id}`;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        throw new Error(selectedCustomer ? "Failed to update customer" : "Failed to create customer");
      }

      const result = await response.json();

      if (selectedCustomer) {
        // Update the existing customer in the list
        setCustomers((prevCustomers) =>
          prevCustomers.map((c) => (c._id === result._id ? result : c))
        );
        toast({
          title: "Customer Updated",
          description: `${result.name}'s information has been updated.`,
        });
      } else {
        // Add the new customer to the list
        setCustomers([result, ...customers]);
        toast({
          title: "Customer Added",
          description: `${result.name} has been added to your customers.`,
        });
      }

      // Reset the form and close the modal
      setIsAddCustomerDialogOpen(false);
      setSelectedCustomer(null);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        location: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to process the request. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(
        `https://repairly-backend.onrender.com/api/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers((prevCustomers) =>
        prevCustomers.filter((c) => c._id !== customerId)
      ); // Remove deleted customer
      toast({
        title: "Customer Deleted",
        description: "The customer has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Pagination Logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  // Change Page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsDialogOpen(true);
  };

  const handleMessageCustomer = (customer: Customer) => {
    toast({
      title: "Message Sent",
      description: `A message has been sent to ${customer.name} (${customer.email}).`,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center p-6 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <Button onClick={handleAddCustomer} className="bg-repairam hover:bg-repairam-dark">
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Customer Directory</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Jobs Completed</th>
                    <th className="px-6 py-3">Total Spent</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((customer) => (
                      <tr key={customer._id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{customer.name}</td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4">{customer.phone}</td>
                        <td className="px-6 py-4">{customer.location}</td>
                        <td className="px-6 py-4">{customer.jobsCompleted}</td>
                        <td className="px-6 py-4">₦{customer.totalSpent}</td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteCustomer(customer._id)}>
                                Delete Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMessageCustomer(customer)}>
                                Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-500">
                        No customers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <Button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            className="mr-2"
          >
            Previous
          </Button>
          <span className="self-center">
            Page {currentPage} of {Math.ceil(filteredCustomers.length / customersPerPage)}
          </span>
          <Button
            disabled={indexOfLastCustomer >= filteredCustomers.length}
            onClick={() => paginate(currentPage + 1)}
            className="ml-2"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog
        open={isAddCustomerDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddCustomerDialogOpen(false);
            setSelectedCustomer(null);
            setNewCustomer({
              name: "",
              email: "",
              phone: "",
              location: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {selectedCustomer
                ? "Update customer information below."
                : "Enter the details for the new customer. Name and email are required."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newCustomer.location}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, location: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>
              {selectedCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog
        open={isCustomerDetailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCustomerDetailsDialogOpen(false);
            setSelectedCustomer(null);
          }
        }}
      >
        {selectedCustomer && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Name</h4>
                <p>{selectedCustomer.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Email</h4>
                <p>{selectedCustomer.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Phone</h4>
                <p>{selectedCustomer.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Location</h4>
                <p>{selectedCustomer.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Jobs Completed</h4>
                <p>{selectedCustomer.jobsCompleted}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Total Spent</h4>
                <p>₦{(Number(selectedCustomer.totalSpent) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
  </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCustomerDetailsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Customers;