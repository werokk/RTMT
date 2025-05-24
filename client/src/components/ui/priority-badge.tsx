import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  // Format the priority for display
  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  // Get the appropriate CSS classes based on priority
  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
      case 'medium':
        return 'bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
      case 'low':
        return 'bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400';
      default:
        return 'bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(getPriorityClass(priority), className)}
    >
      {formatPriority(priority)}
    </Badge>
  );
}
