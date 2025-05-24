import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchField?: string;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  noDataMessage?: string;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  isLoading = false,
  searchable = false,
  searchField = '',
  pageSize = 10,
  sortField,
  sortDirection = 'asc',
  onSort,
  noDataMessage = 'No data found',
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [currentSortField, setCurrentSortField] = useState(sortField);
  const [currentSortDirection, setCurrentSortDirection] = useState(sortDirection);
  
  // Filter data by search term if searchable
  const filteredData = searchable && search
    ? data.filter(item => 
        searchField
          ? String(item[searchField as keyof T]).toLowerCase().includes(search.toLowerCase())
          : Object.values(item).some(
              val => String(val).toLowerCase().includes(search.toLowerCase())
            )
      )
    : data;
  
  // Sort data if sortable
  const sortedData = currentSortField
    ? [...filteredData].sort((a, b) => {
        const valueA = a[currentSortField as keyof T];
        const valueB = b[currentSortField as keyof T];
        
        if (valueA === valueB) return 0;
        
        const result = valueA < valueB ? -1 : 1;
        return currentSortDirection === 'asc' ? result : -result;
      })
    : filteredData;
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = sortedData.slice(start, end);
  
  // Handle sort
  const handleSort = (field: string) => {
    const isSameField = field === currentSortField;
    const newDirection = isSameField && currentSortDirection === 'asc' ? 'desc' : 'asc';
    
    setCurrentSortField(field);
    setCurrentSortDirection(newDirection);
    
    if (onSort) {
      onSort(field, newDirection);
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (field !== currentSortField) {
      return <span className="ml-1 text-neutral-300 dark:text-neutral-600">↕</span>;
    }
    
    return (
      <span className="ml-1 text-neutral-500 dark:text-neutral-400">
        {currentSortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {Array(pageSize).fill(0).map((_, i) => (
        <TableRow key={i}>
          {columns.map((column, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
  
  return (
    <div className="space-y-4">
      {/* Search bar */}
      {searchable && (
        <div className="relative">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="pl-10 dark:bg-neutral-800 dark:border-neutral-700"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-md border border-neutral-200 dark:border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 dark:bg-neutral-800">
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={column.sortable ? 'cursor-pointer' : ''}
                  onClick={() => {
                    if (column.sortable) {
                      handleSort(column.key);
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && renderSortIndicator(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center text-neutral-500 dark:text-neutral-400"
                >
                  {search ? 'No results found' : noDataMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow 
                  key={row.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  is_active={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
