import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Eye, Download } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState } from "react";

export interface TestRun {
  id: number;
  name: string;
  description?: string;
  status: string;
  started_at: string;
  complete_at?: string;
  executed_by: number;
  executed_byName?: string;
  duration?: number;
}

interface TestRunTableProps {
  testRuns: TestRun[];
  isLoading?: boolean;
  isError?: boolean;
  onView: (id: number) => void;
  onDownload?: (id: number) => void;
}

export function TestRunTable({ 
  testRuns, 
  isLoading = false, 
  isError = false, 
  onView,
  onDownload
}: TestRunTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil((testRuns?.length || 0) / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = testRuns?.slice(start, end) || [];
  
  const renderSkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell>
        <div>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
    </TableRow>
  );
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-neutral-200 dark:border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 dark:bg-neutral-800">
              <TableHead>Run ID</TableHead>
              <TableHead>Test Set</TableHead>
              <TableHead>Executed By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              Array(5).fill(0).map((_, i) => renderSkeletonRow())
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-neutral-500 dark:text-neutral-400">
                  Failed to load test runs
                </TableCell>
              </TableRow>
            ) : !paginatedData.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-neutral-500 dark:text-neutral-400">
                  No test runs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((run) => (
                <TableRow key={run.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <TableCell className="font-medium text-primary-600 dark:text-primary-400">
                    #{run.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-neutral-700 dark:text-neutral-300">{run.name}</div>
                      {run.description && (
                        <div className="text-sm text-neutral-400 dark:text-neutral-500 truncate max-w-xs">
                          {run.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">
                    {run.executed_byName || `User #${run.executed_by}`}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={run.status} />
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400 dark:text-neutral-500">
                    {formatDateTime(run.started_at)}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400 dark:text-neutral-500">
                    {formatDuration(run.duration ?? null)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(run.id)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Eye size={16} />
                        <span className="sr-only">View</span>
                      </Button>
                      
                      {onDownload && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDownload(run.id)}
                          className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300"
                        >
                          <Download size={16} />
                          <span className="sr-only">Download</span>
                        </Button>
                      )}
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
