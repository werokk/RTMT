import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useTheme } from 'next-themes';

interface TestMetricsProps {
  data: {
    name: string;
    passCount: number;
    failCount: number;
    pendingCount: number;
  }[];
  loading?: boolean;
}

export function TestMetricsChart({ data, loading = false }: TestMetricsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Define chart colors based on theme
  const colors = {
    pass: isDark ? '#22c55e' : '#22c55e',
    fail: isDark ? '#ef4444' : '#ef4444',
    pending: isDark ? '#a3a3a3' : '#a3a3a3',
    text: isDark ? '#f5f5f5' : '#171717',
    grid: isDark ? '#404040' : '#e5e5e5',
  };

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Test Metrics Trend</CardTitle>
          <CardDescription>Test results by category over time</CardDescription>
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
          <CardTitle>Test Metrics Trend</CardTitle>
          <CardDescription>Test results by category over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Test Metrics Trend</CardTitle>
        <CardDescription>Test results by category over time</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="name" stroke={colors.text} />
            <YAxis stroke={colors.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#262626' : '#ffffff',
                borderColor: colors.grid,
                color: colors.text
              }}
            />
            <Legend />
            <Bar 
              dataKey="passCount" 
              name="Passed" 
              stackId="a" 
              fill={colors.pass}
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="failCount" 
              name="Failed" 
              stackId="a" 
              fill={colors.fail}
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="pendingCount" 
              name="Pending" 
              stackId="a" 
              fill={colors.pending}
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}