import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { formatDate } from '@/lib/utils';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface TestCase {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: number;
  assigneeName?: string;
  last_run?: string;
  folder?: string;
}

interface TestCaseTableProps {
  testCases: TestCase[];
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}

export function TestCaseTable({ testCases, onEdit, onView }: TestCaseTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Calculate pagination
  const totalPages = Math.ceil(testCases.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedTestCases = testCases.slice(start, end);

  // Delete test case mutation
  const deleteTestCaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/testcases/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Test case deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testcases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete test case: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Delete selected test cases
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedIds.length} test cases?`)) {
      try {
        for (const id of selectedIds) {
          await deleteTestCaseMutation.mutateAsync(id);
        }
        setSelectedIds([]);
      } catch (error) {
        console.error('Error deleting test cases:', error);
      }
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedTestCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTestCases.map(tc => tc.id));
    }
  };

  // Toggle select single test case
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-neutral-50 p-2 rounded-md flex items-center justify-between dark:bg-neutral-800">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {selectedIds.length} test case{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={deleteSelected}
            disabled={deleteTestCaseMutation.isPending}
          >
            {deleteTestCaseMutation.isPending ? 'Deleting...' : 'Delete Selected'}
          </Button>
        </div>
      )}

      <div className="rounded-md border border-neutral-200 dark:border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 dark:bg-neutral-800">
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={paginatedTestCases.length > 0 && selectedIds.length === paginatedTestCases.length} 
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTestCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-neutral-500 dark:text-neutral-400">
                  No test cases found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTestCases.map((testCase) => (
                <TableRow 
                  key={testCase.id} 
                  className="hover:bg-neutral-50 cursor-pointer dark:hover:bg-neutral-800/50"
                  onClick={() => onView(testCase.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(testCase.id)} 
                      onCheckedChange={() => toggleSelect(testCase.id)}
                      aria-label={`Select ${testCase.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-neutral-700 dark:text-neutral-300">{testCase.title}</div>
                        <div className="text-sm text-neutral-400 dark:text-neutral-500">{testCase.description}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this test case?')) {
                            deleteTestCaseMutation.mutate(testCase.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={testCase.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={testCase.priority} />
                  </TableCell>
                  <TableCell>
                    <div 
  className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer" 
  onClick={() => onView(testCase.id)}
>{testCase.assigneeName || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-400 dark:text-neutral-500">{formatDate(testCase.last_run ?? null)}</div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(testCase.id);
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Edit size={16} />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this test case?')) {
                            deleteTestCaseMutation.mutate(testCase.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300"
                          >
                            <MoreVertical size={16} />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView(testCase.id)}>View details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(testCase.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this test case?')) {
                                deleteTestCaseMutation.mutate(testCase.id);
                              }
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  is_active={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}