"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Filter,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  role: "worker" | "manager" | "admin";
  email?: string;
};

export type OpportunityStatus = "open" | "in_review" | "go" | "no_go";
export type Decision = "go" | "no_go" | null;

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  timeline: string;
  status: OpportunityStatus;
  aiDecision: Decision;
  managerDecision: Decision;
  managerComment?: string;
  createdAt: Date;
  updatedAt: Date;
  submitter?: User;
  reviewer?: User;
  scores: {
    id: string;
    criterion: string;
    score: number;
    explanation: string;
  }[];
}

export function getStatusBadgeColor(status: OpportunityStatus) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "in_review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "go":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "no_go":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

export function getDecisionBadgeColor(decision: Decision) {
  if (decision === "go") {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  } else if (decision === "no_go") {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  } else {
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

export const columns: ColumnDef<Opportunity>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="font-medium">
          <Link
            href={`/opportunities/${row.original.id}`}
            className="text-primary hover:underline"
          >
            {title.length > 50 ? `${title.substring(0, 50)}...` : title}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "submitter",
    header: "Submitted By",
    cell: ({ row }) => {
      const submitter = row.original.submitter;
      const initials = submitter?.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return submitter ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>{submitter.name}</span>
        </div>
      ) : (
        <span>Unknown</span>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const submitter = row.original.submitter;
      if (!submitter) return false;
      return submitter.name.toLowerCase().includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OpportunityStatus;
      return (
        <Badge className={getStatusBadgeColor(status)}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (Array.isArray(filterValue) && filterValue.length === 0) return true;
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId));
      }
      return true;
    },
  },
  {
    accessorKey: "aiDecision",
    header: "AI Decision",
    cell: ({ row }) => {
      const decision = row.getValue("aiDecision") as Decision;
      return decision ? (
        <Badge className={getDecisionBadgeColor(decision)}>
          {decision.replace("_", " ")}
        </Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (Array.isArray(filterValue) && filterValue.length === 0) return true;
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId));
      }
      return true;
    },
  },
  {
    accessorKey: "managerDecision",
    header: "Manager Decision",
    cell: ({ row }) => {
      const decision = row.getValue("managerDecision") as Decision;
      return decision ? (
        <Badge className={getDecisionBadgeColor(decision)}>
          {decision.replace("_", " ")}
        </Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (Array.isArray(filterValue) && filterValue.length === 0) return true;
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId));
      }
      return true;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const opportunity = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/opportunities/${opportunity.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/opportunities/${opportunity.id}#review`}>
                <BarChart2 className="mr-2 h-4 w-4" />
                View Scores
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  searchParams?: { [key: string]: string | string[] | undefined };
}

export function OpportunitiesTable({
  opportunities,
  searchParams,
}: OpportunitiesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Apply URL filters to the table state
  React.useEffect(() => {
    if (!searchParams) return;

    const newFilters: ColumnFiltersState = [];

    if (searchParams.status) {
      const statusFilters = Array.isArray(searchParams.status)
        ? searchParams.status[0].split(",")
        : searchParams.status.split(",");
      if (statusFilters.length > 0) {
        newFilters.push({
          id: "status",
          value: statusFilters,
        });
      }
    }

    if (searchParams.aiDecision) {
      const aiDecisionFilters = Array.isArray(searchParams.aiDecision)
        ? searchParams.aiDecision[0].split(",")
        : searchParams.aiDecision.split(",");
      if (aiDecisionFilters.length > 0) {
        newFilters.push({
          id: "aiDecision",
          value: aiDecisionFilters,
        });
      }
    }

    if (searchParams.managerDecision) {
      const managerDecisionFilters = Array.isArray(searchParams.managerDecision)
        ? searchParams.managerDecision[0].split(",")
        : searchParams.managerDecision.split(",");
      if (managerDecisionFilters.length > 0) {
        newFilters.push({
          id: "managerDecision",
          value: managerDecisionFilters,
        });
      }
    }

    if (searchParams.submitter) {
      const submitter = Array.isArray(searchParams.submitter)
        ? searchParams.submitter[0]
        : searchParams.submitter;
      if (submitter) {
        newFilters.push({
          id: "submitter",
          value: submitter,
        });
      }
    }

    setColumnFilters(newFilters);
  }, [searchParams]);

  const table = useReactTable({
    data: opportunities,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 gap-1"
                  disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    {table.getFilteredSelectedRowModel().rows.length} selected
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select items to perform batch actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto gap-1">
                Columns <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No opportunities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {opportunities.length} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 