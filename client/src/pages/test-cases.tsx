import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Plus, FolderInput, Download, Bot } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestCaseTable } from '@/components/test-cases/test-case-table';
import { CreateTestModal } from '@/components/test-cases/create-test-modal';
import { ImportModal } from '@/components/test-cases/import-modal';
import { AIGenerateModal } from '@/components/test-cases/ai-generate-modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { exportTestCasesToExcel } from '@/lib/excel';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ClipboardCheckIcon, Trash2 } from 'lucide-react';

export default function TestCases() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFolder, setFilterFolder] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [aiGenerateModalOpen, setAIGenerateModalOpen] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch test cases
  const { data: testCases, isLoading: testCasesLoading } = useQuery({
    queryKey: ['/api/testcases', { status: filterStatus !== 'all' ? filterStatus : undefined, folderId: filterFolder !== 'all' ? parseInt(filterFolder) : undefined }],
  });

  // Fetch folders
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['/api/folders'],
  });

  // Fetch users for assignee information
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Handle export test cases
  const handleExport = () => {
    if (!testCases || testCases.length === 0) return;

    const testCasesToExport = testCases.map((testCase: any) => {
      const assigneeName = users?.find((user: any) => user.id === testCase.assigned_to)?.full_name;
      const folderName = testCase.folderId ? folders?.find((folder: any) => folder.id === testCase.folderId)?.name : undefined;

      return {
        title: testCase.title,
        description: testCase.description,
        status: testCase.status,
        priority: testCase.priority,
        type: testCase.type,
        assigned_to: assigneeName,
        expected_result: testCase.expected_result,
        steps: testCase.steps || [],
        folder: folderName
      };
    });

    exportTestCasesToExcel(testCasesToExport);
  };

  // Handle navigating to edit page
  const handleEdit = (id: number) => {
    navigate(`/test-cases/${id}/edit`);
  };

  // Handle navigating to view page
  const handleView = (id: number) => {
    navigate(`/test-cases/${id}/details`);
  };

  // Handle AI-generated test case import
  const handleImportAITestCase = (testCase: any) => {
    setCreateModalOpen(true);
    // The form will be pre-filled with the AI-generated test case data
  };

  const renderEmptyState = () => (
    <Card className="flex flex-col items-center justify-center p-10 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center dark:bg-primary-900 dark:text-primary-400">
        <ClipboardCheckIcon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">No Test Cases Found</h3>
      <p className="text-neutral-500 max-w-md dark:text-neutral-400">
        Get started by creating your first test case or importing existing ones.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Test Case
        </Button>
        <Button variant="outline" onClick={() => setImportModalOpen(true)}>
          <FolderInput className="h-4 w-4 mr-2" /> Import Test Cases
        </Button>
        <Button variant="outline" onClick={() => setAIGenerateModalOpen(true)}>
          <Bot className="h-4 w-4 mr-2" /> Generate with AI
        </Button>
      </div>
    </Card>
  );

  const TestCaseRow = ({ testCase }: any) => (
    <div
      key={testCase.id}
      className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
      onClick={() => navigate(`/test-cases/${testCase.id}/details`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{testCase.title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this test case?')) {
                  fetch(`/api/testcases/${testCase.id}`, { method: 'DELETE' })
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/testcases'] });
                    });
                }
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-600">{testCase.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Add more details here if needed */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Test Cases" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Test Case
                </Button>
                <Button
                  onClick={() => setImportModalOpen(true)}
                  variant="outline"
                  className="border-neutral-200 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                >
                  <FolderInput className="h-4 w-4 mr-2" /> Import
                </Button>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="border-neutral-200 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                  disabled={!testCases || testCases.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
                <Button
                  onClick={() => setAIGenerateModalOpen(true)}
                  className="bg-accent-500 hover:bg-accent-600 text-white dark:bg-accent-600 dark:hover:bg-accent-500"
                >
                  <Bot className="h-4 w-4 mr-2" /> AI Generate
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-full min-w-[140px] dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterFolder}
                  onValueChange={setFilterFolder}
                >
                  <SelectTrigger className="w-full min-w-[140px] dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                    <SelectValue placeholder="All Folders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    {folders?.map((folder: any) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Test Cases List */}
            {testCasesLoading || foldersLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : testCases && testCases.length > 0 ? (
              <div>
                {testCases.map((testCase: any) => (
                  <TestCaseRow
                    key={testCase.id}
                    testCase={testCase}
                  />
                ))}
              </div>
            ) : (
              renderEmptyState()
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateTestModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialFolder={filterFolder !== 'all' ? parseInt(filterFolder) : undefined}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />

      <AIGenerateModal
        isOpen={aiGenerateModalOpen}
        onClose={() => setAIGenerateModalOpen(false)}
        onImport={handleImportAITestCase}
      />
    </div>
  );
}