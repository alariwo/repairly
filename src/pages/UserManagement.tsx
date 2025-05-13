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
import { TabsTrigger, Tabs, TabsList, } from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, UserPlus, UserCog, Trash2, Edit, X, ExternalLink, MoreHorizontal} from 'lucide-react';

// Types
type UserRole = 'super-admin' | 'admin' | 'technician';
interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  active: boolean;
  company?: string;
  phone?: string;
  specialties?: string;
  canLogin?: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, '_id'>>({
    id: '',
    name: '',
    email: '',
    role: 'technician',
    createdAt: new Date().toISOString(),
    active: true,
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchUsers = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');
  
      const response = await fetch('https://repairly-backend.onrender.com/api/user ', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to load users');
  
      const result = await response.json();
  
      const fetchedUsers = result.users.map(user => ({
        ...user,
        id: user._id || user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'technician',
        company: user.company || '',
      }));
  
      setUsers(fetchedUsers);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users.',
        variant: 'destructive',
      });
    }
  };
  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = typeof user.name === 'string' ? user.name : '';
    const email = typeof user.email === 'string' ? user.email : '';
    const company = typeof user.company === 'string' ? user.company : '';
  
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
   

  // Handle create user
  const handleCreateUser = async () => {
    const { name, email, password, role } = newUser;

    if (!name || !email || !password || !role) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const payload = {
        name,
        email,
        password,
        role,
        active: true,
      };

      const response = await fetch('https://repairly-backend.onrender.com/api/user ', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create user.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const createdUser = await response.json();
      setUsers([createdUser, ...users]);

      setNewUser({
        id: '',
        name: '',
        email: '',
        role: 'technician',
        createdAt: new Date().toISOString(),
        active: true,
        company: '',
        phone: '',
      });

      toast({ title: 'User Created', description: `${name} has been successfully added.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setNewUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      active: user.active,
      company: user.company || '',
      phone: user.phone || '',
      specialties: user.specialties || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!currentUser) return;

    const { name, email, role } = newUser;

    if (!name || !email || !role) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/user/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          active: currentUser.active,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to update user.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      setIsEditDialogOpen(false);
      toast({ title: 'User Updated', description: `${updatedUser.name} has been updated.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('Authentication token is missing');

      const response = await fetch(`https://repairly-backend.onrender.com/api/user/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to delete user.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Server said: ${errorJson.message || errorJson.error}`;
        } catch {
          errorMessage += ` Raw response: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setUsers(users.filter(user => user.id !== userId));
      toast({ title: 'User Deleted', description: `User has been removed.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  // Status badge
  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
    );
  };

  // Role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Admin</Badge>;
      case 'technician':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Technician</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{role}</Badge>;
    }
  };

  // Filter by tab
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsCreateUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <p className="text-xl font-bold">{filteredUsers.length}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <p className="text-xl font-bold">
              {filteredUsers.filter(u => u.role === 'technician').length}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <p className="text-xl font-bold">
              {filteredUsers.filter(u => u.role === 'admin' || u.role === 'super-admin').length}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" onClick={() => handleTabChange('all')}>
              All Users
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.active)}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Fill in the details below to add a new user.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
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
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={newUser.password || ''}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value as UserRole })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;