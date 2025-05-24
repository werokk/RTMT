import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { UserPlus, Filter } from 'lucide-react';
import { UserTable } from '@/components/users/user-table';
import { RoleTable } from '@/components/users/role-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Define permissions data
const permissionsData = [
  { name: 'Create Test Cases', systemOwner: true, admin: true, tester: true, viewer: false },
  { name: 'Edit Test Cases', systemOwner: true, admin: true, tester: true, viewer: false },
  { name: 'Delete Test Cases', systemOwner: true, admin: true, tester: false, viewer: false },
  { name: 'Execute Tests', systemOwner: true, admin: true, tester: true, viewer: false },
  { name: 'Generate Reports', systemOwner: true, admin: true, tester: true, viewer: true },
  { name: 'Manage Users', systemOwner: true, admin: true, tester: false, viewer: false },
  { name: 'System Configuration', systemOwner: true, admin: false, tester: false, viewer: false },
];

// User form schema
const userFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  role: z.string(),
  is_active: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Fetch user to edit
  const { data: userToEdit } = useQuery({
    queryKey: ['/api/users', editUserId],
    enabled: !!editUserId,
  });
  
  // User form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      full_name: '',
      password: '',
      role: 'tester',
      is_active: true,
    },
  });
  
  // Reset form when dialog closes
  const resetForm = () => {
    form.reset({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role: 'tester',
      is_active: true,
    });
    setEditUserId(null);
  };
  
  // Create/Update user mutation
  const userMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      if (editUserId) {
        // Update existing user
        const { password, ...updated_ata } = data;
        // Only include password if it's changed (not empty)
        const dataToSend = password ? data : updated_ata;
        
        const response = await apiRequest('PUT', `/api/users/${editUserId}`, dataToSend);
        return response.json();
      } else {
        // Create new user
        const response = await apiRequest('POST', '/api/users', data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `User ${editUserId ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setAddUserDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${editUserId ? 'update' : 'create'} user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle edit user
  const handleEditUser = (id: number) => {
    setEditUserId(id);
    setAddUserDialogOpen(true);
  };
  
  // Reset password
  const handleResetPassword = (id: number) => {
    // In a real application, you would implement a password reset functionality here
    // For now, we'll just show a toast
    toast({
      title: 'Password Reset',
      description: 'Password reset email has been sent.',
    });
  };
  
  // Update form values when editing a user
  React.useEffect(() => {
    if (userToEdit) {
      form.reset({
        username: userToEdit.username,
        email: userToEdit.email,
        full_name: userToEdit.full_name,
        password: '', // Don't pre-fill password
        role: userToEdit.role,
        is_active: userToEdit.is_active,
      });
    }
  }, [userToEdit, form]);
  
  // Form submission handler
  const onSubmit = (data: UserFormValues) => {
    userMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="User Management" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-neutral-500 dark:text-neutral-300">User Management</h2>
                <p className="text-sm text-neutral-400 mt-1 dark:text-neutral-500">Manage users and their access permissions</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => {
                    resetForm();
                    setAddUserDialogOpen(true);
                  }} 
                  className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Add User
                </Button>
                <Button 
                  variant="outline"
                  className="border-neutral-200 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                >
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>
            </div>
            
            {/* Users List */}
            <Card className="shadow-sm border dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Users</CardTitle>
                <CardDescription className="text-neutral-400 dark:text-neutral-500">
                  All users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-60 w-full" />
                  </div>
                ) : (
                  <UserTable 
                    users={users || []} 
                    onEdit={handleEditUser} 
                    onResetPassword={handleResetPassword} 
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Role and Permission Management */}
            <Card className="shadow-sm border dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Role and Permission Management</CardTitle>
                <CardDescription className="text-neutral-400 dark:text-neutral-500">
                  Configure permissions for each role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleTable permissions={permissionsData} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Add/Edit User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setAddUserDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neutral-700 dark:text-neutral-300">
              {editUserId ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription className="text-neutral-500 dark:text-neutral-400">
              {editUserId 
                ? 'Edit the user details below' 
                : 'Fill out the form below to create a new user'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        {...field} 
                        disabled={!!editUserId}
                        className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        {...field} 
                        className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full Name" 
                        {...field} 
                        className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editUserId ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={editUserId ? "New password (optional)" : "Password"} 
                        {...field} 
                        className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="system_owner">System Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="tester">Tester</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setAddUserDialogOpen(false);
                    resetForm();
                  }}
                  className="dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={userMutation.isPending}
                  className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  {userMutation.isPending 
                    ? (editUserId ? 'Updating...' : 'Creating...') 
                    : (editUserId ? 'Update User' : 'Create User')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
