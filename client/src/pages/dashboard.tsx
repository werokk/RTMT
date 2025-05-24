import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TestProgressChart } from '@/components/dashboard/test-progress-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentTestCases } from '@/components/dashboard/recent-test-cases';
import { TestMetricsChart } from '@/components/dashboard/test-metrics-chart';
import { TestExecutionHistory } from '@/components/dashboard/test-execution-history';
import { TestQualityMetrics } from '@/components/dashboard/test-quality-metrics';
import { PriorityDistribution } from '@/components/dashboard/priority-distribution';
import { TestCoverageGauge } from '@/components/dashboard/test-coverage-gauge';
import { TestSummaryKpi } from '@/components/dashboard/test-summary-kpi';
import { 
  ClipboardCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  BugIcon 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatPercentage } from '@/lib/utils';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

interface TestStatusStat {
  status: string;
  count: number;
}

interface TestRunStat {
  bugCount?: number; // Assuming bugCount is optional
  // Add other properties if testRunStats has more
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  
  // Fetch test status statistics
  const { data: testStatusStats, isLoading: statsLoading } = useQuery<TestStatusStat[]>({
    queryKey: ['/api/stats/test-status'],
  });
  
  // Fetch test run statistics
  const { data: testRunStats, isLoading: runStatsLoading } = useQuery<TestRunStat>({
    queryKey: ['/api/stats/test-runs'],
  });
  
  // Fetch test metrics statistics (new)
  const { data: testMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/stats/test-metrics', timeRange],
  });
  
  // Calculate total tests and percentages for progress chart
  const totalTests = testStatusStats?.reduce((sum: number, stat: any) => sum + stat.count, 0) || 0;
  const progressChartData = testStatusStats?.map((stat: any) => ({
    ...stat,
    percentage: totalTests > 0 ? (stat.count / totalTests) * 100 : 0
  })) || [];
  
  // Prepare test status counts
  const passedTests = testStatusStats?.find((stat: any) => stat.status === 'passed')?.count || 0;
  const failedTests = testStatusStats?.find((stat: any) => stat.status === 'failed')?.count || 0;
  const pendingTests = testStatusStats?.find((stat: any) => stat.status === 'pending')?.count || 0;
  const blockedTests = testStatusStats?.find((stat: any) => stat.status === 'blocked')?.count || 0;
  
  // Sample data for new metrics components (would be replaced with real data from API)
  // Test metrics trend data 
  const testMetricsData = [
    { name: 'Jan', passCount: 45, failCount: 12, pendingCount: 8 },
    { name: 'Feb', passCount: 50, failCount: 10, pendingCount: 15 },
    { name: 'Mar', passCount: 60, failCount: 8, pendingCount: 12 },
    { name: 'Apr', passCount: 70, failCount: 15, pendingCount: 5 },
    { name: 'May', passCount: 65, failCount: 20, pendingCount: 10 },
    { name: 'Jun', passCount: 80, failCount: 10, pendingCount: 5 },
  ];
  
  // Test execution history data
  const executionHistoryData = [
    { date: 'Jan', executed: 25, automated: 40 },
    { date: 'Feb', executed: 30, automated: 45 },
    { date: 'Mar', executed: 35, automated: 50 },
    { date: 'Apr', executed: 40, automated: 45 },
    { date: 'May', executed: 30, automated: 55 },
    { date: 'Jun', executed: 45, automated: 60 },
  ];
  
  // Test quality metrics data
  const qualityMetricsData = [
    { 
      name: 'Requirements Coverage', 
      value: 85, 
      target: 90, 
      description: 'Percentage of requirements covered by tests',
      color: 'bg-blue-500'
    },
    { 
      name: 'Critical Test Pass Rate', 
      value: 92, 
      target: 95, 
      description: 'Pass percentage for critical path tests',
      color: 'bg-green-500'
    },
    { 
      name: 'Test Execution Rate', 
      value: 75, 
      target: 85, 
      description: 'Percentage of tests executed regularly',
      color: 'bg-amber-500'
    },
    { 
      name: 'Bug Detection Rate', 
      value: 65, 
      target: 80, 
      description: 'Percentage of bugs caught by tests',
      color: 'bg-red-500'
    },
  ];
  
  // Priority distribution data
  const priorityData = [
    { name: 'Critical', value: 25, color: '#dc2626' },
    { name: 'High', value: 35, color: '#ea580c' },
    { name: 'Medium', value: 30, color: '#eab308' },
    { name: 'Low', value: 10, color: '#22c55e' },
  ];
  
  // Test KPI summary data
  const kpiData = {
    passRate: {
      value: 85,
      previousValue: 80,
      target: 90
    },
    avgExecutionTime: {
      value: 2.5,
      previousValue: 3.2,
      target: 2.0,
      unit: 'm'
    },
    bugDetectionRate: {
      value: 70,
      previousValue: 65,
      target: 80,
      unit: '%'
    },
    flakiness: {
      value: 4.2,
      previousValue: 5.8,
      target: 3.0
    }
  };
  
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Dashboard" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Advanced Metrics</TabsTrigger>
                <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <select 
                  className="px-3 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Total Test Cases */}
                <StatsCard
                  title="Total Test Cases"
                  value={totalTests}
                  icon={<ClipboardCheckIcon className="h-6 w-6" />}
                  iconClassName="bg-primary-50 text-primary-500 dark:bg-primary-900 dark:text-primary-400"
                />
                
                {/* Passed Tests */}
                <StatsCard
                  title="Passed Tests"
                  value={passedTests}
                  description={totalTests > 0 ? `${formatPercentage(passedTests / totalTests * 100)} of total` : undefined}
                  icon={<CheckCircleIcon className="h-6 w-6" />}
                  iconClassName="bg-green-50 text-green-500 dark:bg-green-900 dark:text-green-400"
                />
                
                {/* Failed Tests */}
                <StatsCard
                  title="Failed Tests"
                  value={failedTests}
                  description={totalTests > 0 ? `${formatPercentage(failedTests / totalTests * 100)} of total` : undefined}
                  icon={<XCircleIcon className="h-6 w-6" />}
                  iconClassName="bg-red-50 text-red-500 dark:bg-red-900 dark:text-red-400"
                />
                
                {/* Pending Tests */}
                <StatsCard
                  title="Pending Tests"
                  value={pendingTests}
                  description={totalTests > 0 ? `${formatPercentage(pendingTests / totalTests * 100)} of total` : undefined}
                  icon={<ClockIcon className="h-6 w-6" />}
                  iconClassName="bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                />
                
                {/* Blocked Tests */}
                <StatsCard
                  title="Blocked Tests"
                  value={blockedTests}
                  description={totalTests > 0 ? `${formatPercentage(blockedTests / totalTests * 100)} of total` : undefined}
                  icon={<AlertTriangleIcon className="h-6 w-6" />}
                  iconClassName="bg-amber-50 text-amber-500 dark:bg-amber-900 dark:text-amber-400"
                />
                
                {/* Bug Count */}
                <StatsCard
                  title="Open Bugs"
                  value={runStatsLoading ? "-" : (testRunStats?.bugCount || 0)}
                  icon={<BugIcon className="h-6 w-6" />}
                  iconClassName="bg-purple-50 text-purple-500 dark:bg-purple-900 dark:text-purple-400"
                />
              </div>
              
              {/* Test Progress Chart and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TestProgressChart data={progressChartData} />
                <RecentActivity />
              </div>
              
              {/* Test Metrics Chart and Test Execution History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TestMetricsChart data={testMetricsData} />
                <TestExecutionHistory data={executionHistoryData} />
              </div>
              
              {/* Recent Test Cases */}
              <RecentTestCases />
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-6 mt-6">
              {/* KPI Summary */}
              <TestSummaryKpi data={kpiData} />
              
              {/* Priority Distribution and Coverage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriorityDistribution data={priorityData} />
                <TestCoverageGauge value={75} target={100} />
              </div>
              
              {/* Test Metrics Chart and Test Execution History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TestMetricsChart data={testMetricsData} />
                <TestExecutionHistory data={executionHistoryData} />
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-6 mt-6">
              {/* Quality Metrics */}
              <TestQualityMetrics metrics={qualityMetricsData} />
              
              {/* Test Progress and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TestProgressChart data={progressChartData} />
                <TestCoverageGauge value={75} target={100} />
              </div>
              
              {/* Recent Test Cases */}
              <RecentTestCases />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
