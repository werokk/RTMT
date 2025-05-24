import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// Combine class names using clsx and twMerge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date using date-fns
export function formatDate(date: Date | string | number | null): string {
  if (!date) return 'Never';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return format(dateObj, 'MMM d, yyyy');
}

// Format date with time
export function formatDateTime(date: Date | string | number | null): string {
  if (!date) return 'Never';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

// Format date as relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string | number | null): string {
  if (!date) return 'Never';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Format number as percentage
export function formatPercentage(value: number | null): string {
  if (value === null || value === undefined) return '0%';
  return `${Math.round(value)}%`;
}

// Format duration in seconds to human-readable format
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '0s';
  
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`;
  }
}

// Convert camelCase to Title Case
export function formatCamelCase(text: string): string {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate initials from full name
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Parse error message from API response
export function parseErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.response?.data?.message) return error.response.data.message;
  
  return 'An unknown error occurred';
}

// Create a function to generate color based on string (for consistent colors)
export function stringToColor(str: string): string {
  if (!str) return 'hsl(0, 0%, 75%)';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = hash % 360;
  return `hsl(${h}, 65%, 40%)`;
}

// Create a function to get status colors based on status string
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'passed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'blocked':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-neutral-100 text-neutral-500';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'skipped':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'aborted':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-neutral-100 text-neutral-500';
  }
};

// Create a function to get priority colors
export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical':
      return 'bg-red-50 text-red-800';
    case 'high':
      return 'bg-primary-50 text-primary-800';
    case 'medium':
      return 'bg-neutral-50 text-neutral-800';
    case 'low':
      return 'bg-neutral-50 text-neutral-500';
    default:
      return 'bg-neutral-50 text-neutral-500';
  }
};

// Deep copy an object
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
