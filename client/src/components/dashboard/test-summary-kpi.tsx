import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { formatPercentage } from '@/lib/utils';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  AlertTriangleIcon, 
  BugIcon,
  TimerIcon 
} from 'lucide-react';

interface KpiData {
  value: number;
  previousValue: number;
  target?: number;
  unit?: string;
}

interface TestSummaryKpiProps {
  data: {
    passRate: KpiData;
    avgExecutionTime: KpiData;
    bugDetectionRate: KpiData;
    flakiness: KpiData;
  };
  loading?: boolean;
}

export function TestSummaryKpi({ data, loading = false }: TestSummaryKpiProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Suite Performance</CardTitle>
          <CardDescription>Key performance indicators for your test suite</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-7 w-16 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTrend = (current: number, previous: number) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
    
    // No significant change (less than 1%)
    if (Math.abs(percentChange) < 1) {
      return (
        <div className="flex items-center text-neutral-500">
          <MinusIcon className="h-3 w-3 mr-1" />
          <span className="text-xs">No change</span>
        </div>
      );
    }
    
    // Improvement or decline - based on context
    const isImprovement = diff > 0;
    
    return (
      <div className={`flex items-center ${isImprovement ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isImprovement ? (
          <ArrowUpIcon className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDownIcon className="h-3 w-3 mr-1" />
        )}
        <span className="text-xs">{formatPercentage(Math.abs(percentChange))} {isImprovement ? 'increase' : 'decrease'}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Suite Performance</CardTitle>
        <CardDescription>Key performance indicators for your test suite</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pass Rate */}
          <div className="space-y-1">
            <div className="flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">Pass Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {formatPercentage(data.passRate.value)}
            </div>
            {renderTrend(data.passRate.value, data.passRate.previousValue)}
            {data.passRate.target && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Target: {formatPercentage(data.passRate.target)}
              </div>
            )}
          </div>
          
          {/* Average Execution Time */}
          <div className="space-y-1">
            <div className="flex items-center">
              <TimerIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Avg Execution Time</span>
            </div>
            <div className="text-2xl font-bold">
              {data.avgExecutionTime.value}{data.avgExecutionTime.unit || 's'}
            </div>
            {renderTrend(
              -data.avgExecutionTime.value, 
              -data.avgExecutionTime.previousValue
            )}
            {data.avgExecutionTime.target && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Target: {data.avgExecutionTime.target}{data.avgExecutionTime.unit || 's'}
              </div>
            )}
          </div>
          
          {/* Bug Detection Rate */}
          <div className="space-y-1">
            <div className="flex items-center">
              <BugIcon className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">Bug Detection Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {data.bugDetectionRate.value}{data.bugDetectionRate.unit || '%'}
            </div>
            {renderTrend(
              data.bugDetectionRate.value, 
              data.bugDetectionRate.previousValue
            )}
            {data.bugDetectionRate.target && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Target: {data.bugDetectionRate.target}{data.bugDetectionRate.unit || '%'}
              </div>
            )}
          </div>
          
          {/* Test Flakiness */}
          <div className="space-y-1">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium">Test Flakiness</span>
            </div>
            <div className="text-2xl font-bold">
              {formatPercentage(data.flakiness.value)}
            </div>
            {renderTrend(
              -data.flakiness.value, 
              -data.flakiness.previousValue
            )}
            {data.flakiness.target && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Target: {formatPercentage(data.flakiness.target)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}