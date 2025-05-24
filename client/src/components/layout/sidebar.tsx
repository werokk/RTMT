import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  ChartPieIcon, 
  ClipboardCheckIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CogIcon, 
  FolderIcon,
  XIcon,
  MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  
  // Query to fetch folders
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['/api/folders'],
    enabled: true,
  });

  // Get the current page (used for active nav highlighting)
  const currentPage = location.split('/')[1] || 'dashboard';

  // Close sidebar when navigating on mobile
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform md:relative dark:bg-neutral-900 dark:border-r dark:border-neutral-800",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 flex flex-col h-full"
        )}
      >
        {/* Logo and Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center text-white font-bold">
              TS
            </div>
            <h1 className="text-xl font-semibold text-neutral-500 dark:text-neutral-300">TestSphere</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard">
                <a
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400",
                    currentPage === 'dashboard' ? "bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  <ChartPieIcon className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/test-cases">
                <a
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400",
                    currentPage === 'test-cases' ? "bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  <ClipboardCheckIcon className="w-5 h-5 mr-3" />
                  <span>Test Cases</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/reports">
                <a
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400",
                    currentPage === 'reports' ? "bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  <ChartBarIcon className="w-5 h-5 mr-3" />
                  <span>Reports</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/users">
                <a
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400",
                    currentPage === 'users' ? "bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  <UsersIcon className="w-5 h-5 mr-3" />
                  <span>User Management</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <a
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400",
                    currentPage === 'settings' ? "bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  <CogIcon className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </a>
              </Link>
            </li>
          </ul>
          
          {/* Test Folders */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider dark:text-neutral-500">
              Test Folders
            </h3>
            <div className="mt-2 space-y-1">
              {foldersLoading ? (
                // Skeleton loaders for folders
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="px-3 py-2">
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))
              ) : folders && folders.length > 0 ? (
                // Render actual folders
                folders.map((folder: any) => (
                  <div 
                    key={folder.id}
                    className="flex items-center px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-primary-50 hover:text-primary-600 rounded-md cursor-pointer dark:text-neutral-400 dark:hover:bg-primary-900 dark:hover:text-primary-400"
                    onClick={() => {
                      setExpandedFolder(expandedFolder === folder.id ? null : folder.id);
                    }}
                  >
                    <FolderIcon className="w-5 h-5 mr-3 text-neutral-400 dark:text-neutral-500" />
                    <span className="truncate flex-1">{folder.name}</span>
                    <span className="ml-auto bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full text-xs dark:bg-neutral-800 dark:text-neutral-400">
                      {folder.testCount}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-neutral-400 dark:text-neutral-500">
                  No folders found
                </div>
              )}
            </div>
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="px-3 py-3 border-t border-neutral-100 dark:border-neutral-800">
          <Link href="/settings">
            <a 
              onClick={closeSidebarOnMobile}
              className="flex items-center space-x-3 hover:bg-neutral-50 p-2 rounded-md transition-colors dark:hover:bg-neutral-800"
            >
              <div className="h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-300">John Doe</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">System Owner</p>
              </div>
            </a>
          </Link>
        </div>
      </div>
      
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 md:hidden z-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon className="h-6 w-6" />
      </Button>
    </>
  );
}
