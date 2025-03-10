import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function OpportunitiesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className={`h-5 w-${[20, 32, 16, 12, 16, 10][cellIndex % 6]}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function OpportunityDetailLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>

          {/* Timeline skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Analysis skeleton */}
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Manager review skeleton */}
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 