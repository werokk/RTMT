import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';

interface TestCoverageGaugeProps {
  value: number;
  target: number;
  loading?: boolean;
}

export function TestCoverageGauge({ value, target, loading = false }: TestCoverageGaugeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Calculate percentage (capped at 100%)
  const percentage = Math.min(100, (value / target) * 100);
  
  // Determine color based on percentage
  let color;
  if (percentage >= 75) {
    color = isDark ? '#22c55e' : '#16a34a'; // Green
  } else if (percentage >= 50) {
    color = isDark ? '#eab308' : '#ca8a04'; // Yellow
  } else {
    color = isDark ? '#ef4444' : '#dc2626'; // Red
  }
  
  // Data for the chart
  const data = [
    {
      name: 'Coverage',
      value: percentage,
      fill: color
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Coverage</CardTitle>
          <CardDescription>Overall test coverage across all features</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Coverage</CardTitle>
        <CardDescription>Overall test coverage across all features</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <div className="flex flex-col items-center justify-center h-full">
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              barSize={10}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                fill={color}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="text-center -mt-20">
            <span className="text-3xl font-bold" style={{ color }}>
              {percentage.toFixed(0)}%
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {value} of {target} features covered
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}