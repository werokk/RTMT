import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  iconClassName?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, icon, iconClassName, trend }: StatsCardProps) {
  return (
    <Card className="shadow-sm border dark:border-neutral-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-sm font-medium dark:text-neutral-500">{title}</div>
            <div className="text-2xl font-semibold text-neutral-500 mt-1 dark:text-neutral-300">{value}</div>
            {description && (
              <div className="text-xs text-neutral-400 mt-1 dark:text-neutral-500">{description}</div>
            )}
            {trend && (
              <div className={cn(
                "text-xs font-medium mt-1 flex items-center",
                trend.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
              )}>
                {trend.isPositive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {trend.value}% {trend.isPositive ? 'increase' : 'decrease'} from last month
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            iconClassName || "bg-primary-50 text-primary-500 dark:bg-primary-900 dark:text-primary-400"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
