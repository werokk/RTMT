import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { XIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define form schema
const testCaseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  priority: z.string(),
  type: z.string(),
  assigned_to: z.number().optional().nullable(),
  expected_result: z.string().optional(),
  folderId: z.number().optional().nullable(),
  steps: z.array(
    z.object({
      description: z.string().min(1, { message: 'Step description is required' }),
      expected_result: z.string().optional()
    })
  ).min(1, { message: 'At least one step is required' })
});

type TestCaseFormValues = z.infer<typeof testCaseSchema>;

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFolder?: number;
}

interface FolderItem {
  id: number; // Assuming id is a number based on parseInt usage
  name: string;
}

interface UserItem {
  id: number; // Assuming id is a number
  full_name: string;
}

export function CreateTestModal({ isOpen, onClose, initialFolder }: CreateTestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get users for assignee dropdown
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery<UserItem[]>({
    queryKey: ['/api/users'],
    enabled: isOpen
  });
  
  // Get folders for folder dropdown
  const { data: folders, isLoading: foldersLoading, isError: foldersError } = useQuery<FolderItem[]>({
    queryKey: ['/api/folders'],
    enabled: isOpen
  });
  
  // Form setup
  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      type: 'functional',
      assigned_to: null,
      expected_result: '',
      folderId: initialFolder || null,
      steps: [{ description: '', expected_result: '' }]
    },
  });
  
  // Steps field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps'
  });
  
  // Create test case mutation
  const createTestCaseMutation = useMutation({
    mutationFn: async (data: TestCaseFormValues) => {
      // Extract folder ID from the data to handle separately
      const { folderId, ...testCaseData } = data;
      
      // Create test case
      const response = await apiRequest('POST', '/api/testcases', testCaseData);
      const testCase = await response.json();
      
      // If folder ID is provided, assign test case to folder
      if (folderId) {
        await apiRequest('POST', `/api/testcases/${testCase.id}/folders`, { folderId });
      }
      
      return testCase;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Test case created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testcases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create test case: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit: SubmitHandler<TestCaseFormValues> = (data) => {
    createTestCaseMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Create New Test Case</DialogTitle>
          <DialogDescription className="text-neutral-400 dark:text-neutral-500">
            Add a new test case to your test suite
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Test case title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the test case" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder</FormLabel>
                    <Select 
                      onValueChange={val => field.onChange(val ? parseInt(val) : null)} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select folder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foldersLoading && <SelectItem value="loading_folders" disabled>Loading folders...</SelectItem>}
                        {foldersError && <SelectItem value="error_folders" disabled>Error loading folders</SelectItem>}
                        {folders && folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id.toString()}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="usability">Usability</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select 
                      onValueChange={val => field.onChange(val ? parseInt(val) : null)} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersLoading && <SelectItem value="loading_users" disabled>Loading users...</SelectItem>}
                        {usersError && <SelectItem value="error_users" disabled>Error loading users</SelectItem>}
                        {users && users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Test Steps</FormLabel>
              <div className="border border-neutral-200 rounded-md p-3 space-y-3 dark:border-neutral-800">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start">
                    <div className="flex-shrink-0 mt-2">
                      <span className="bg-primary-50 text-primary-600 h-5 w-5 rounded-full flex items-center justify-center text-xs dark:bg-primary-900 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3 flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`steps.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Enter step description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`steps.${index}.expected_result`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Expected result for this step (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="ml-2 mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ description: '', expected_result: '' })}
                  className="flex items-center text-primary-600 text-sm font-medium hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </div>
              {form.formState.errors.steps && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {form.formState.errors.steps.message}
                </p>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="expected_result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Result</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Overall expected result of the test case" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-3 sm:mt-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTestCaseMutation.isPending}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                {createTestCaseMutation.isPending ? 'Creating...' : 'Create Test Case'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
