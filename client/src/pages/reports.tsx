import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { FileText, Filter } from 'lucide-react';
import { StatusChart } from '@/components/reports/status-chart';
import { TestRunTable } from '@/components/reports/test-run-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formatPercentage, formatDuration } from '@/lib/utils';
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import type { TestRun } from '@/components/reports/test-run-table'; // Import TestRun

interface TestRunReportStats {
  passRate?: number;
  avgDuration?: number;
  totalRuns?: number;
}

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();
  
  // Fetch test runs
  const { data: testRuns, isLoading: runsLoading } = useQuery<TestRun[]>({
    queryKey: ['/api/runs'],
  });
  
  // Fetch test status statistics
  // Assuming testStatusStats is not directly used in this file's errors,
  // but if it were, it would need a type too.
  const { data: testStatusStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/test-status'],
  });
  
  // Fetch test run statistics
  const { data: testRunStats, isLoading: runStatsLoading } = useQuery<TestRunReportStats>({
    queryKey: ['/api/stats/test-runs'],
  });
  
  // Generate fake week data for status chart (should be replaced with real data from API)
  const generateWeeklyData = () => {
    // Example data structure for weekly status
    return [
      { name: 'Mon', passed: 40, failed: 25, blocked: 15, pending: 20 },
      { name: 'Tue', passed: 45, failed: 20, blocked: 15, pending: 20 },
      { name: 'Wed', passed: 55, failed: 15, blocked: 15, pending: 15 },
      { name: 'Thu', passed: 60, failed: 15, blocked: 10, pending: 15 },
      { name: 'Fri', passed: 70, failed: 10, blocked: 10, pending: 10 },
      { name: 'Sat', passed: 75, failed: 10, blocked: 5, pending: 10 },
      { name: 'Sun', passed: 76, failed: 12, blocked: 6, pending: 6 },
    ];
  };
  
  // Handle view test run
  const handleViewTestRun = (id: number) => {
    navigate(`/reports/runs/${id}`);
  };
  
  // Handle download test run report
  const handleDownloadReport = (id: number) => {
    // Implementation will depend on how you want to handle reports
    console.log('Download report for test run:', id);
  };
  
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Reports" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Test Execution Reports</h2>
                <p className="text-sm text-neutral-400 mt-1 dark:text-neutral-500">Generate and view test execution reports</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  <FileText className="h-4 w-4 mr-2" /> Generate Report
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-200 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                >
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>
            </div>
            
            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test Pass Rate */}
              <Card className="shadow-sm border dark:border-neutral-800">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center">
                    <div className="text-center">
                      <div className="text-neutral-400 text-sm font-medium dark:text-neutral-500">Test Pass Rate</div>
                      <div className="text-4xl font-bold text-success mt-2 dark:text-green-400">
                        {runStatsLoading ? (
                          <Skeleton className="h-10 w-24 mx-auto" />
                        ) : (
                          formatPercentage(testRunStats?.passRate || 0)
                        )}
                      </div>
                    </div>
                    <div className="w-full mt-4 bg-neutral-100 rounded-full h-2.5 dark:bg-neutral-700">
                      <div 
                        className="bg-success h-2.5 rounded-full dark:bg-green-500" 
                        style={{ width: `${testRunStats?.passRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Test Execution Time */}
              <Card className="shadow-sm border dark:border-neutral-800">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center">
                    <div className="text-center">
                      <div className="text-neutral-400 text-sm font-medium dark:text-neutral-500">Avg Test Execution Time</div>
                      <div className="text-4xl font-bold text-primary-600 mt-2 dark:text-primary-400">
                        {runStatsLoading ? (
                          <Skeleton className="h-10 w-24 mx-auto" />
                        ) : (
                          formatDuration(testRunStats?.avgDuration || 0)
                        )}
                      </div>
                    </div>
                    <div className="w-full mt-4 bg-neutral-100 rounded-full h-2.5 dark:bg-neutral-700">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full dark:bg-primary-500" 
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Total Test Runs */}
              <Card className="shadow-sm border dark:border-neutral-800">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center">
                    <div className="text-center">
                      <div className="text-neutral-400 text-sm font-medium dark:text-neutral-500">Total Test Runs</div>
                      <div className="text-4xl font-bold text-warning mt-2 dark:text-yellow-400">
                        {runStatsLoading ? (
                          <Skeleton className="h-10 w-24 mx-auto" />
                        ) : (
                          testRunStats?.totalRuns || 0
                        )}
                      </div>
                    </div>
                    <div className="w-full mt-4 bg-neutral-100 rounded-full h-2.5 dark:bg-neutral-700">
                      <div 
                        className="bg-warning h-2.5 rounded-full dark:bg-yellow-500" 
                        style={{ width: `${Math.min((testRunStats?.totalRuns || 0) * 5, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Test Status Over Time */}
            <StatusChart data={generateWeeklyData()} />
            
            {/* Recent Test Runs */}
            <Card className="shadow-sm border dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Recent Test Runs</CardTitle>
                <CardDescription className="text-neutral-400 dark:text-neutral-500">
                  View details of recent test execution runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestRunTable 
                  testRuns={testRuns || []} 
                  isLoading={runsLoading}
                  onView={handleViewTestRun} 
                  onDownload={handleDownloadReport}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
