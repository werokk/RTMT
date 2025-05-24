import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";
import { useTheme } from "@/lib/themes";

interface TestStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface TestProgressChartProps {
  data: TestStatusData[];
}

export function TestProgressChart({ data }: TestProgressChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return { bg: isDark ? 'bg-green-500/20' : 'bg-green-100', bar: 'bg-green-500', text: 'text-green-600 dark:text-green-500' };
      case 'failed':
        return { bg: isDark ? 'bg-red-500/20' : 'bg-red-100', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-500' };
      case 'blocked':
        return { bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-500' };
      case 'pending':
        return { bg: isDark ? 'bg-neutral-500/20' : 'bg-neutral-100', bar: 'bg-neutral-400', text: 'text-neutral-500 dark:text-neutral-400' };
      default:
        return { bg: isDark ? 'bg-neutral-500/20' : 'bg-neutral-100', bar: 'bg-neutral-400', text: 'text-neutral-500 dark:text-neutral-400' };
    }
  };
  
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <Card className="shadow-sm border dark:border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">
          Test Execution Progress
        </CardTitle>
        <CardDescription className="text-neutral-400 dark:text-neutral-500">
          Status distribution of all test cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full">
            {data.map((item) => (
              <div key={item.status} className="relative pt-1 mb-4">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getStatusColor(item.status).bg} ${getStatusColor(item.status).text}`}>
                      {formatStatus(item.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold inline-block ${getStatusColor(item.status).text}`}>
                      {formatPercentage(item.percentage)}
                    </span>
                  </div>
                </div>
                <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${getStatusColor(item.status).bg}`}>
                  <div 
                    style={{ width: `${item.percentage}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusColor(item.status).bar}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          {data.map((item) => (
            <div key={item.status} className="flex items-center">
              <div className={`w-3 h-3 rounded-sm mr-2 ${getStatusColor(item.status).bar}`}></div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatStatus(item.status)}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
