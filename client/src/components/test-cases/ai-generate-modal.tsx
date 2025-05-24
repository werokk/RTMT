import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateTestCases, GeneratedTestCase } from '@/lib/groq';
import { Loader2Icon, Bot, ImportIcon, Edit2Icon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (testCase: GeneratedTestCase) => void;
}

export function AIGenerateModal({ isOpen, onClose, onImport }: AIGenerateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [prompt, setPrompt] = useState('');
  const [testType, setTestType] = useState('functional');
  const [count, setCount] = useState(5);
  const [generatedTestCases, setGeneratedTestCases] = useState<GeneratedTestCase[]>([]);
  
  // AI test case generation mutation
  const generateTestCasesMutation = useMutation({
    mutationFn: async () => {
      // Call Groq API to generate test cases
      return await generateTestCases(prompt, testType, count);
    },
    onSuccess: (data) => {
      setGeneratedTestCases(data);
      
      // Save AI response to database
      saveAIResponseMutation.mutate({
        prompt,
        response: { generatedCases: data },
      });
      
      toast({
        title: 'Success',
        description: `Generated ${data.length} test cases`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate test cases: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Save AI response mutation
  const saveAIResponseMutation = useMutation({
    mutationFn: async (data: { prompt: string, response: any }) => {
      const response = await apiRequest('POST', '/api/ai/generate', {
        prompt: data.prompt,
        testType,
        count,
      });
      return await response.json();
    },
    onError: (error) => {
      console.error('Failed to save AI response:', error);
    },
  });
  
  // Import all generated test cases
  const importAllTestCasesMutation = useMutation({
    mutationFn: async () => {
      // Mark AI test case as imported
      if (saveAIResponseMutation.data?.id) {
        await apiRequest('POST', `/api/ai/${saveAIResponseMutation.data.id}/import`, {
          testCases: generatedTestCases.map(tc => tc.title),
        });
      }
      
      // Create test cases one by one
      for (const testCase of generatedTestCases) {
        onImport(testCase);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'All test cases imported successfully',
      });
      onClose();
      setGeneratedTestCases([]);
      setPrompt('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to import test cases: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleGenerate = () => {
    if (!prompt) {
      toast({
        title: 'Warning',
        description: 'Please enter requirements or user story',
        variant: 'destructive',
      });
      return;
    }
    
    generateTestCasesMutation.mutate();
  };
  
  const handleImportAll = () => {
    if (generatedTestCases.length === 0) {
      toast({
        title: 'Warning',
        description: 'No test cases to import',
        variant: 'destructive',
      });
      return;
    }
    
    importAllTestCasesMutation.mutate();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-neutral-500 flex items-center gap-2 dark:text-neutral-300">
            <Bot className="h-5 w-5 text-accent-500" />
            AI Test Case Generator
          </DialogTitle>
          <DialogDescription className="text-neutral-400 dark:text-neutral-500">
            Generate test cases based on user stories or requirements
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div>
            <Label htmlFor="ai-input" className="block text-sm font-medium text-neutral-500 mb-1 dark:text-neutral-400">
              User Story or Requirements
            </Label>
            <Textarea 
              id="ai-input" 
              rows={6} 
              placeholder="Enter user story, requirements, or describe the feature you want to test..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ai-test-type" className="block text-sm font-medium text-neutral-500 mb-1 dark:text-neutral-400">
                Test Type
              </Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger id="ai-test-type" className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Functional Tests</SelectItem>
                  <SelectItem value="regression">Regression Tests</SelectItem>
                  <SelectItem value="exploratory">Exploratory Tests</SelectItem>
                  <SelectItem value="security">Security Tests</SelectItem>
                  <SelectItem value="performance">Performance Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ai-test-count" className="block text-sm font-medium text-neutral-500 mb-1 dark:text-neutral-400">
                Number of Test Cases
              </Label>
              <Select value={count.toString()} onValueChange={(value) => setCount(parseInt(value))}>
                <SelectTrigger id="ai-test-count" className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={!prompt || generateTestCasesMutation.isPending}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white dark:bg-accent-600 dark:hover:bg-accent-500"
          >
            {generateTestCasesMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Generating Test Cases...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Generate Test Cases
              </>
            )}
          </Button>
          
          {(generatedTestCases.length > 0 || generateTestCasesMutation.isPending) && (
            <div className="mt-4 border border-neutral-200 rounded-md p-4 flex-1 overflow-hidden flex flex-col dark:border-neutral-700">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-300">Generated Test Cases</h4>
                {generatedTestCases.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImportAll}
                    disabled={importAllTestCasesMutation.isPending}
                    className="text-primary-600 text-xs font-medium hover:text-primary-500 border-primary-200 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-900"
                  >
                    <ImportIcon className="h-3 w-3 mr-1" />
                    Import All
                  </Button>
                )}
              </div>
              
              {generateTestCasesMutation.isPending ? (
                <div className="flex items-center justify-center flex-1">
                  <Loader2Icon className="h-8 w-8 animate-spin text-primary-500 dark:text-primary-400" />
                </div>
              ) : (
                <ScrollArea className="flex-1 overflow-auto max-h-64 pr-4">
                  <div className="space-y-3">
                    {generatedTestCases.map((testCase, index) => (
                      <div key={index} className="p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{testCase.title}</h5>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => onImport(testCase)} 
                              className="text-primary-600 text-xs hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/30"
                            >
                              <ImportIcon className="h-3 w-3 mr-1" />
                              Import
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 dark:text-neutral-400">{testCase.description}</p>
                        <div className="mt-2 text-xs">
                          <p className="font-medium text-neutral-600 dark:text-neutral-300">Steps:</p>
                          <ul className="list-disc pl-5 text-neutral-500 space-y-1 mt-1 dark:text-neutral-400">
                            {testCase.steps.map((step, stepIndex) => (
                              <li key={stepIndex}>
                                {step.description}
                                {step.expected_result && (
                                  <span className="text-neutral-400 dark:text-neutral-500"> → {step.expected_result}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2">
                            <span className="font-medium text-neutral-600 dark:text-neutral-300">Expected:</span>{' '}
                            <span className="text-neutral-500 dark:text-neutral-400">{testCase.expected_result}</span>
                          </p>
                          {testCase.priority && (
                            <p className="mt-1">
                              <span className="font-medium text-neutral-600 dark:text-neutral-300">Priority:</span>{' '}
                              <span className="text-neutral-500 dark:text-neutral-400">{testCase.priority}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            variant="outline"
            className="dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
