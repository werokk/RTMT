import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, AlertTriangle, Clock, Plus, Edit, Trash, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: any;
  timestamp: string;
  user: {
    username: string;
    full_name: string;
  };
}

export function RecentActivity() {
  // Fetch recent activities
  const { data: activities, isLoading, isError } = useQuery({
    queryKey: ['/api/stats/recent-activities'],
  });
  
  const getActivityIcon = (action: string, status?: string) => {
    switch (action) {
      case 'record_test_result':
        if (status === 'passed') return <CheckCircle className="h-6 w-6 text-green-500" />;
        if (status === 'failed') return <XCircle className="h-6 w-6 text-red-500" />;
        if (status === 'blocked') return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        return <Clock className="h-6 w-6 text-neutral-400" />;
      case 'create_test_case':
        return <Plus className="h-6 w-6 text-primary-500" />;
      case 'update_test_case':
        return <Edit className="h-6 w-6 text-primary-500" />;
      case 'delete_test_case':
        return <Trash className="h-6 w-6 text-red-500" />;
      case 'user_login':
      case 'user_logout':
        return <User className="h-6 w-6 text-primary-500" />;
      default:
        return <Clock className="h-6 w-6 text-neutral-400" />;
    }
  };
  
  const getActivityColor = (action: string, status?: string) => {
    if (action === 'record_test_result') {
      if (status === 'passed') return 'bg-green-100 text-green-500 dark:bg-green-900/30';
      if (status === 'failed') return 'bg-red-100 text-red-500 dark:bg-red-900/30';
      if (status === 'blocked') return 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30';
      return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800';
    }
    
    switch (action) {
      case 'create_test_case':
      case 'create_folder':
      case 'create_test_run':
        return 'bg-primary-100 text-primary-500 dark:bg-primary-900/30';
      case 'update_test_case':
      case 'update_folder':
      case 'update_test_run':
        return 'bg-blue-100 text-blue-500 dark:bg-blue-900/30';
      case 'delete_test_case':
      case 'delete_folder':
        return 'bg-red-100 text-red-500 dark:bg-red-900/30';
      default:
        return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800';
    }
  };
  
  const getActivityDescription = (activity: ActivityItem) => {
    const { action, entityType, details } = activity;
    
    switch (action) {
      case 'record_test_result':
        return `${details?.status === 'passed' ? 'Passed' : details?.status === 'failed' ? 'Failed' : 'Blocked'} "${details?.testCaseTitle || entityType}" test`;
      case 'create_test_case':
        return `Added new test case "${details?.title || ''}"`;
      case 'update_test_case':
        return `Updated test case "${details?.title || ''}"`;
      case 'delete_test_case':
        return `Deleted test case "${details?.title || ''}"`;
      case 'user_login':
        return 'Logged in';
      case 'user_logout':
        return 'Logged out';
      case 'create_folder':
        return `Created folder "${details?.name || ''}"`;
      case 'update_folder':
        return `Updated folder "${details?.name || ''}"`;
      case 'create_test_run':
        return `Started test run "${details?.name || ''}"`;
      case 'complete_test_run':
        return `Completed test run "${details?.name || ''}"`;
      default:
        return `${action.replace(/_/g, ' ')} ${entityType.replace(/_/g, ' ')}`;
    }
  };
  
  const renderSkeletonActivity = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start">
          <Skeleton className="h-8 w-8 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <Card className="shadow-sm border dark:border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-300">Recent Activity</CardTitle>
        <CardDescription className="text-neutral-400 dark:text-neutral-500">Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderSkeletonActivity()
        ) : isError ? (
          <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
            Failed to load recent activities
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
            No recent activities
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 4).map((activity: ActivityItem) => (
              <div key={activity.id} className="flex items-start">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getActivityColor(activity.action, activity.details?.status)}`}>
                  {getActivityIcon(activity.action, activity.details?.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-300">{getActivityDescription(activity)}</p>
                  <p className="text-xs text-neutral-400 mt-1 dark:text-neutral-500">
                    {activity.user.full_name} • {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Link href="/reports">
          <Button 
            variant="link" 
            className="mt-6 text-primary-600 text-sm font-medium hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 p-0"
          >
            View all activity →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
