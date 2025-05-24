import { useEffect } from 'react';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define form schema
const testCaseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  type: z.string(),
  assigned_to: z.number().optional().nullable(),
  expected_result: z.string().optional(),
  steps: z.array(
    z.object({
      description: z.string().min(1, { message: 'Step description is required' }),
      expected_result: z.string().optional()
    })
  ).min(1, { message: 'At least one step is required' })
});

type TestCaseFormValues = z.infer<typeof testCaseSchema> & {
  created_by?: number;
};

interface TestCaseFormProps {
  test_case_id?: number;
  onSaved?: () => void;
}

interface UserItem {
  id: number;
  full_name: string;
}

interface StepItem {
  description: string;
  expected_result?: string;
}

interface TestCaseDetails {
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  assigned_to?: number | null;
  expected_result?: string;
}

interface TestCaseData {
  testCase: TestCaseDetails;
  steps: StepItem[];
}

export function TestCaseForm({ test_case_id, onSaved }: TestCaseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get users for assignee dropdown
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery<UserItem[]>({
    queryKey: ['/api/users'],
  });
  
  // Get test case details if editing
  const { data: testCaseData, isLoading } = useQuery<TestCaseData>({
    queryKey: ['/api/testcases', test_case_id],
    enabled: !!test_case_id,
  });
  
  // Form setup
  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      type: 'functional',
      assigned_to: null,
      expected_result: '',
      created_by: 1, // Default user ID for development
      steps: [{ description: '', expected_result: '' }]
    },
  });
  
  // Fill form with test case data when loaded
  useEffect(() => {
    if (testCaseData && test_case_id) {
      const { testCase, steps } = testCaseData;
      
      form.reset({
        title: testCase.title,
        description: testCase.description || '',
        status: testCase.status,
        priority: testCase.priority,
        type: testCase.type,
        assigned_to: testCase.assigned_to || null,
        expected_result: testCase.expected_result || '',
        steps: testCaseData.steps && testCaseData.steps.length > 0 ? testCaseData.steps.map((step: StepItem) => ({
          description: step.description,
          expected_result: step.expected_result || ''
        })) : [{ description: '', expected_result: '' }]
      });
    }
  }, [testCaseData, test_case_id, form]);
  
  // Steps field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps'
  });
  
  // Update test case mutation
  const updateTestCaseMutation = useMutation({
    mutationFn: async (data: TestCaseFormValues) => {
      if (test_case_id) {
        // Update existing test case
        const response = await apiRequest('PUT', `/api/testcases/${test_case_id}`, data);
        return response.json();
      } else {
        // Create new test case
        const response = await apiRequest('POST', '/api/testcases', data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Test case ${test_case_id ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testcases'] });
      if (test_case_id) {
        queryClient.invalidateQueries({ queryKey: ['/api/testcases', test_case_id] });
      }
      if (onSaved) onSaved();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${test_case_id ? 'update' : 'create'} test case: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit: SubmitHandler<TestCaseFormValues> = (data) => {
    updateTestCaseMutation.mutate(data);
  };
  
  if (isLoading && test_case_id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <div className="h-6 w-52 animate-pulse bg-neutral-200 rounded dark:bg-neutral-700"></div>
            <div className="h-4 w-full animate-pulse bg-neutral-200 rounded dark:bg-neutral-700"></div>
            <div className="h-4 w-3/4 animate-pulse bg-neutral-200 rounded dark:bg-neutral-700"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm border dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">
          {test_case_id ? 'Edit Test Case' : 'Create New Test Case'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Test case title" {...field} 
                      className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
                    />
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
                    <Textarea placeholder="Describe the test case" rows={3} {...field} 
                      className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
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
                        <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
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
                        <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
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
                        <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
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
              <div className="border border-neutral-200 rounded-md p-3 space-y-3 dark:border-neutral-700">
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
                              <Input placeholder="Enter step description..." {...field} 
                                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                              />
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
                              <Input placeholder="Expected result for this step (optional)" {...field} 
                                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                              />
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
                    <Textarea placeholder="Overall expected result of the test case" rows={2} {...field} 
                      className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-end gap-2 px-0">
              <Button
                type="submit"
                disabled={updateTestCaseMutation.isPending}
                className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                {updateTestCaseMutation.isPending 
                  ? `${test_case_id ? 'Updating' : 'Creating'}...` 
                  : `${test_case_id ? 'Update' : 'Create'} Test Case`
                }
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
