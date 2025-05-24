import React from "react";
import { Badge } from "@/components/ui/badge";

// Export the StatusType for use in other components
export type { StatusType };
import { cn } from "@/lib/utils";

// Define allowed status types for better type safety
type StatusType = 
  | 'passed' 
  | 'failed' 
  | 'blocked' 
  | 'pending' 
  | 'in_progress' 
  | 'in progress'
  | 'skipped' 
  | 'completed' 
  | 'aborted' 
  | 'open' 
  | 'fixed' 
  | 'closed'
  | string; // Allow other strings for flexibility

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Get size-specific classes
const getSizeClass = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-0.5';
    case 'lg':
      return 'text-sm px-3 py-1';
    case 'md':
    default:
      return 'text-xs px-2.5 py-0.5';
  }
};

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  // Handle null/undefined status
  if (!status) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
          getSizeClass(size),
          className
        )}
      >
        Unknown
      </Badge>
    );
  }

  // Format the status for display
  const formatStatus = (status: string): string => {
    // Handle underscores and convert to proper case
    const formatted = status
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return formatted;
  };
  
  // Get the appropriate CSS classes based on status
  const getStatusClass = (status: string): string => {
    const normalizedStatus = status.toLowerCase().replace(/[\s_]/g, '_');
    
    switch (normalizedStatus) {
      case 'passed':
      case 'pass':
      case 'success':
      case 'successful':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      
      case 'failed':
      case 'fail':
      case 'failure':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      
      case 'blocked':
      case 'warning':
      case 'blocked_by_dependency':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      
      case 'pending':
      case 'waiting':
      case 'queued':
      case 'scheduled':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
      
      case 'in_progress':
      case 'in_progress_':
      case 'running':
      case 'active':
      case 'executing':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      
      case 'skipped':
      case 'skip':
      case 'ignored':
      case 'not_applicable':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      
      case 'completed':
      case 'complete':
      case 'done':
      case 'finished':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      
      case 'aborted':
      case 'cancelled':
      case 'canceled':
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      
      case 'open':
      case 'new':
      case 'created':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      
      case 'fixed':
      case 'resolved':
      case 'closed_fixed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      
      case 'closed':
      case 'closed_not_fixed':
      case 'wont_fix':
      case 'duplicate':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
      
      case 'draft':
      case 'not_started':
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        getStatusClass(status),
        getSizeClass(size),
        'font-medium transition-colors',
        className
      )}
    >
      {formatStatus(status)}
    </Badge>
  );
}
