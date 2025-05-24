import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface TestCaseItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeName?: string;
  last_run: string | null;
}

export function RecentTestCases() {
  // Fetch recent test cases
  const { data: testCases, isLoading, isError } = useQuery<TestCaseItem[]>({
    queryKey: ['/api/stats/recent-test-cases'],
  });
  
  const renderSkeletonRow = () => (
    <TableRow>
      <TableCell>
        <div>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );
  
  return (
    <Card className="shadow-sm border dark:border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Recent Test Cases</CardTitle>
        <CardDescription className="text-neutral-400 dark:text-neutral-500">Latest test cases created or updated</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 dark:bg-neutral-800">
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Last Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                Array(5).fill(0).map((_, i) => renderSkeletonRow())
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-neutral-500 dark:text-neutral-400">
                    Failed to load test cases
                  </TableCell>
                </TableRow>
              ) : !testCases || testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-neutral-500 dark:text-neutral-400">
                    No test cases found
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((testCase: any) => (
                  <TableRow 
                    key={testCase.id} 
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-neutral-700 dark:text-neutral-300">{testCase.title}</div>
                        {testCase.description && (
                          <div className="text-sm text-neutral-400 dark:text-neutral-500 truncate max-w-xs">
                            {testCase.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={testCase.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={testCase.priority} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {testCase.assigneeName || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-400 dark:text-neutral-500">
                        {formatDate(testCase.last_run)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <Link href="/test-cases">
            <Button 
              variant="link" 
              className="text-primary-600 text-sm font-medium hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 p-0"
            >
              View all test cases →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
