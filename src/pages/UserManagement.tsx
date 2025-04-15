
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, UserPlus, UserCog, Users, Trash2, Edit, X, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Types for user management
type UserRole = 'super-admin' | 'admin' | 'technician' | 'external-technician';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  active: boolean;
  company?: string; // Optional company field for external technicians
  phone?: string;   // Optional phone field
  specialties?: string[]; // Optional specialties field
  canLogin?: boolean; // Whether the user can login to the system
}

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('internal');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'technician' as UserRole,
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    specialties: '',
    canLogin: true
  });
  
  // Sample users data - in a real app would come from API/database
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@repairam.com',
      role: 'super-admin',
      createdAt: new Date('2023-01-10'),
      active: true,
      canLogin: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@repairam.com',
      role: 'admin',
      createdAt: new Date('2023-02-15'),
      active: true,
      canLogin: true
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@repairam.com',
      role: 'technician',
      createdAt: new Date('2023-03-20'),
      active: true,
      canLogin: true
    },
    {
      id: '4',
      name: 'Sara Williams',
      email: 'sara@repairam.com',
      role: 'technician',
      createdAt: new Date('2023-04-05'),
      active: true,
      canLogin: true
    },
    {
      id: '5',
      name: 'Express Repair Shop',
      email: 'service@expressrepair.com',
      role: 'external-technician',
      createdAt: new Date('2023-06-10'),
      active: true,
      company: 'Express Repair',
      phone: '555-789-0123',
      specialties: ['Display Repair', 'Water Damage'],
      canLogin: false
    }
  ]);
  
  const filteredUsers = users.filter(user => {
    // First filter by tab (internal vs external)
    if (activeTab === 'internal' && user.role === 'external-technician') return false;
    if (activeTab === 'external' && user.role !== 'external-technician') return false;
    
    // Then filter by search term
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value: string) => {
    const isExternalTech = value === 'external-technician';
    setNewUser(prev => ({ 
      ...prev, 
      role: value as UserRole,
      canLogin: !isExternalTech // External technicians don't login by default
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      canLogin: checked
    }));
  };
  
  const handleCreateUser = () => {
    // Validation would go here in a real app
    const specialtiesArray = newUser.specialties 
      ? newUser.specialties.split(',').map(s => s.trim()) 
      : undefined;
      
    const newUserData: User = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date(),
      active: true,
      company: newUser.role === 'external-technician' ? newUser.company : undefined,
      phone: newUser.phone || undefined,
      specialties: specialtiesArray,
      canLogin: newUser.canLogin
    };
    
    setUsers(prev => [...prev, newUserData]);
    setIsCreateUserOpen(false);
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'technician',
      password: '',
      confirmPassword: '',
      company: '',
      phone: '',
      specialties: '',
      canLogin: true
    });
    
    toast({
      title: newUserData.role === 'external-technician' 
        ? "External Technician Added" 
        : "User Created",
      description: `${newUserData.name} has been added successfully.`,
    });
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case 'super-admin': return 'bg-red-500';
      case 'admin': return 'bg-blue-500';
      case 'technician': return 'bg-green-500';
      case 'external-technician': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatRoleName = (role: UserRole) => {
    switch(role) {
      case 'super-admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'technician': return 'Technician';
      case 'external-technician': return 'External Technician';
      default: return role;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Manage Users & Technicians
              </CardTitle>
              <CardDescription>
                Create and manage internal staff, technicians, and external service providers
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-repairam hover:bg-repairam-dark">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new team member or external service provider
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">User Type</Label>
                      <Select value={newUser.role} onValueChange={handleRoleChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super-admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="external-technician">External Technician</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="name">
                        {newUser.role === 'external-technician' ? 'Business/Technician Name' : 'Full Name'}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder={newUser.role === 'external-technician' ? "ABC Repair Shop" : "John Doe"}
                        value={newUser.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    {newUser.role === 'external-technician' && (
                      <div className="grid gap-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Company Name (optional)"
                          value={newUser.company}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={newUser.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="555-123-4567"
                        value={newUser.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    {newUser.role === 'external-technician' && (
                      <div className="grid gap-2">
                        <Label htmlFor="specialties">Specialties</Label>
                        <Input
                          id="specialties"
                          name="specialties"
                          placeholder="Screen Repair, Water Damage, etc. (comma separated)"
                          value={newUser.specialties}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="canLogin" 
                        checked={newUser.canLogin}
                        onCheckedChange={handleSwitchChange}
                        disabled={newUser.role === 'super-admin' || newUser.role === 'admin'}
                      />
                      <Label htmlFor="canLogin">Can log in to the system</Label>
                    </div>
                    
                    {newUser.canLogin && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={newUser.password}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={newUser.confirmPassword}
                            onChange={handleInputChange}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-repairam hover:bg-repairam-dark" onClick={handleCreateUser}>
                      {newUser.role === 'external-technician' ? 'Add External Technician' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="internal" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Internal Staff</span>
              </TabsTrigger>
              <TabsTrigger value="external" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>External Technicians</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {activeTab === 'external' && <TableHead>Company</TableHead>}
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                {activeTab === 'external' && <TableHead>Specialties</TableHead>}
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    {activeTab === 'external' && <TableCell>{user.company || 'N/A'}</TableCell>}
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {formatRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    {activeTab === 'external' && (
                      <TableCell>
                        {user.specialties?.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {specialty}
                          </Badge>
                        )) || 'None'}
                      </TableCell>
                    )}
                    <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "default" : "outline"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={activeTab === 'external' ? 9 : 7} className="h-24 text-center">
                    No {activeTab === 'external' ? 'external technicians' : 'users'} found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
