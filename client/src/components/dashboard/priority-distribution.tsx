import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme } from 'next-themes';

interface PriorityDistributionProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  loading?: boolean;
}

export function PriorityDistribution({ data, loading = false }: PriorityDistributionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Case Priority</CardTitle>
          <CardDescription>Distribution of test cases by priority</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mt-4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Case Priority</CardTitle>
          <CardDescription>Distribution of test cases by priority</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">No priority data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Case Priority</CardTitle>
        <CardDescription>Distribution of test cases by priority</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#262626' : '#ffffff',
                borderColor: isDark ? '#404040' : '#e5e5e5',
                color: isDark ? '#f5f5f5' : '#171717'
              }}
              formatter={(value: number) => [`${value} tests`, 'Count']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}