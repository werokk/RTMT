import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Define types for better type safety
interface TestStep {
  description: string;
  expected_result?: string;
}

interface TestCase {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  steps: TestStep[];
}

export default function TestCaseDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Always call hooks at the top level - never conditionally
  const testCaseId = id ? parseInt(id, 10) : 0;

  const { data: testCase, isLoading, error } = useQuery<TestCase>({
    queryKey: ['testCase', testCaseId],
    queryFn: async (): Promise<TestCase> => {
      const response = await fetch(`/api/testcases/${testCaseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test case');
      }
      return response.json();
    },
    enabled: Boolean(id && testCaseId > 0)
  });

  const updateStepMutation = useMutation<TestCase, Error, TestCase>({
    mutationFn: async (data: TestCase): Promise<TestCase> => {
      const response = await fetch(`/api/testcases/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update test case');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] });
      toast({
        title: 'Success',
        description: 'Test case updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStepUpdate = (stepIndex: number, field: keyof TestStep, value: string) => {
    if (!testCase || !testCase.steps || stepIndex >= testCase.steps.length) return;

    const updatedSteps = [...testCase.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      [field]: value,
    };

    updateStepMutation.mutate({
      ...testCase,
      steps: updatedSteps,
    });
  };

  // Handle invalid ID case
  if (!id || testCaseId <= 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/test-cases">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Cases
            </Button>
          </Link>
        </div>
        <div className="text-red-600">Invalid test case ID</div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/test-cases">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Cases
            </Button>
          </Link>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/test-cases">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Cases
            </Button>
          </Link>
        </div>
        <div className="text-red-600">{error.message}</div>
      </div>
    );
  }

  // Handle case where test case is not found
  if (!testCase) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/test-cases">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Cases
            </Button>
          </Link>
        </div>
        <div>Test case not found</div>
      </div>
    );
  }

  // Render the main component
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/test-cases">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Cases
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{testCase.title}</h1>
            <p className="text-gray-600">{testCase.description}</p>
          </div>
          <div className="flex space-x-2">
            <StatusBadge status={testCase.status} />
            <PriorityBadge priority={testCase.priority} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Steps</h2>
          <div className="space-y-4">
            {testCase.steps && testCase.steps.length > 0 ? testCase.steps.map((step: TestStep, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-grow space-y-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => handleStepUpdate(index, 'description', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor={`expected-${index}`} className="block text-sm font-medium mb-1">
                        Expected Result
                      </label>
                      <Textarea
                        id={`expected-${index}`}
                        value={step.expected_result || ''}
                        onChange={(e) => handleStepUpdate(index, 'expected_result', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-gray-500 text-center py-4">
                No test steps available
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
