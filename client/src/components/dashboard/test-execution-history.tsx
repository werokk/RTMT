import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useTheme } from 'next-themes';

interface TestExecutionHistoryProps {
  data: {
    date: string;
    executed: number;
    automated: number;
  }[];
  loading?: boolean;
}

export function TestExecutionHistory({ data, loading = false }: TestExecutionHistoryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Define chart colors based on theme
  const colors = {
    executed: isDark ? '#3b82f6' : '#3b82f6',
    automated: isDark ? '#8b5cf6' : '#8b5cf6',
    text: isDark ? '#f5f5f5' : '#171717',
    grid: isDark ? '#404040' : '#e5e5e5',
  };

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Test Execution History</CardTitle>
          <CardDescription>Number of tests executed over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
            <div className="h-48 w-full bg-neutral-100 dark:bg-neutral-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Test Execution History</CardTitle>
          <CardDescription>Number of tests executed over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">No execution history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Test Execution History</CardTitle>
        <CardDescription>Number of tests executed over time</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="date" stroke={colors.text} />
            <YAxis stroke={colors.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#262626' : '#ffffff',
                borderColor: colors.grid,
                color: colors.text
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="executed" 
              name="Manual Tests" 
              stroke={colors.executed} 
              fill={colors.executed}
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="automated" 
              name="Automated Tests" 
              stroke={colors.automated} 
              fill={colors.automated}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}