import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPercentage } from '@/lib/utils';

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  description: string;
  color: string;
}

interface TestQualityMetricsProps {
  metrics: QualityMetric[];
  loading?: boolean;
}

export function TestQualityMetrics({ metrics, loading = false }: TestQualityMetricsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Quality Metrics</CardTitle>
          <CardDescription>Key quality indicators for your testing process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mt-2 ml-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Quality Metrics</CardTitle>
          <CardDescription>Key quality indicators for your testing process</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-neutral-500 dark:text-neutral-400">No quality metrics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Quality Metrics</CardTitle>
        <CardDescription>Key quality indicators for your testing process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => {
            const percentage = (metric.value / metric.target) * 100;
            const displayPercentage = Math.min(percentage, 100);
            const status = percentage >= 100 ? 'success' : percentage >= 75 ? 'warning' : 'danger';
            
            return (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">{metric.name}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{metric.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${status === 'success' ? 'text-green-600 dark:text-green-400' : status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metric.value} / {metric.target}
                    </span>
                  </div>
                </div>
                
                <Progress 
                  value={displayPercentage} 
                  className={`h-2 ${metric.color}`} 
                />
                
                <div className="flex justify-end">
                  <span className={`text-xs ${status === 'success' ? 'text-green-600 dark:text-green-400' : status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercentage(percentage)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}