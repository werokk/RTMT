import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";
import { useTheme } from "@/lib/themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface StatusChartProps {
  data: any[];
  title?: string;
  description?: string;
  showLegend?: boolean;
}

export function StatusChart({ 
  data, 
  title = "Test Status Over Time", 
  description = "Weekly test execution results", 
  showLegend = true
}: StatusChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get colors for the different status types
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return isDark ? "#4caf50" : "#4caf50";
      case 'failed':
        return isDark ? "#f44336" : "#f44336";
      case 'blocked':
        return isDark ? "#ff9800" : "#ff9800";
      case 'pending':
      case 'skipped':
        return isDark ? "#9aa5b1" : "#9aa5b1";
      default:
        return isDark ? "#9aa5b1" : "#9aa5b1";
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded shadow-lg dark:bg-neutral-800 dark:border-neutral-700">
          <p className="font-medium text-neutral-700 mb-1 dark:text-neutral-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center mb-1">
              <div 
                className="w-3 h-3 mr-2 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-neutral-600 mr-2 dark:text-neutral-400">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
          <div className="mt-1 pt-1 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="shadow-sm border dark:border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-neutral-400 dark:text-neutral-500">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              stackOffset="expand"
              barCategoryGap={8}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={isDark ? "#374151" : "#e5e7eb"} 
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                axisLine={{ stroke: isDark ? "#374151" : "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis 
                hide={false}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                axisLine={{ stroke: isDark ? "#374151" : "#e5e7eb" }}
                tickLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
              />
              {showLegend && (
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  iconSize={8}
                />
              )}
              <Bar 
                dataKey="passed" 
                stackId="a" 
                fill={getStatusColor('passed')} 
                name="Passed"
              />
              <Bar 
                dataKey="failed" 
                stackId="a" 
                fill={getStatusColor('failed')} 
                name="Failed"
              />
              <Bar 
                dataKey="blocked" 
                stackId="a" 
                fill={getStatusColor('blocked')} 
                name="Blocked"
              />
              <Bar 
                dataKey="pending" 
                stackId="a" 
                fill={getStatusColor('pending')} 
                name="Pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
