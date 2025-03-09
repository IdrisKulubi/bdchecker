"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { CalendarIcon, ChevronDown, FilterX, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

interface FiltersState {
  search: string;
  status: string[];
  aiDecision: string[];
  managerDecision: string[];
  dateRange: DateRange | undefined;
  submitter: string;
}

const initialFilters: FiltersState = {
  search: "",
  status: [],
  aiDecision: [],
  managerDecision: [],
  dateRange: undefined,
  submitter: "all",
};

export function OpportunitiesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<FiltersState>(() => {
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status")?.split(",").filter(Boolean) || [];
    const aiDecision = searchParams.get("aiDecision")?.split(",").filter(Boolean) || [];
    const managerDecision = searchParams.get("managerDecision")?.split(",").filter(Boolean) || [];
    const submitter = searchParams.get("submitter") || "all";
    
    // Parse date range if present
    let dateRange: DateRange | undefined = undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    
    if (from || to) {
      dateRange = {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      };
    }
    
    return {
      search,
      status,
      aiDecision,
      managerDecision,
      dateRange,
      submitter,
    };
  });
  
  // Count active filters
  const activeFiltersCount = [
    filters.status.length > 0,
    filters.aiDecision.length > 0,
    filters.managerDecision.length > 0,
    !!filters.dateRange,
    !!(filters.submitter && filters.submitter !== "all"),
  ].filter(Boolean).length;
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set("search", filters.search);
    if (filters.status.length > 0) params.set("status", filters.status.join(","));
    if (filters.aiDecision.length > 0) params.set("aiDecision", filters.aiDecision.join(","));
    if (filters.managerDecision.length > 0) params.set("managerDecision", filters.managerDecision.join(","));
    if (filters.submitter && filters.submitter !== "all") params.set("submitter", filters.submitter);
    
    if (filters.dateRange?.from) {
      params.set("from", format(filters.dateRange.from, "yyyy-MM-dd"));
    }
    
    if (filters.dateRange?.to) {
      params.set("to", format(filters.dateRange.to, "yyyy-MM-dd"));
    }
    
    // Update the URL with the new params
    router.push(`/opportunities?${params.toString()}`);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters(initialFilters);
    router.push("/opportunities");
  };
  
  // Toggle filter value in array
  const toggleFilter = (key: keyof FiltersState, value: string) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      
      if (current.includes(value)) {
        return {
          ...prev,
          [key]: current.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [key]: [...current, value],
        };
      }
    });
  };
  
  return (
    <div className="bg-background sticky top-0 z-10 pb-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("open")}
                  onCheckedChange={() => toggleFilter("status", "open")}
                >
                  Open
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("in_review")}
                  onCheckedChange={() => toggleFilter("status", "in_review")}
                >
                  In Review
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("go")}
                  onCheckedChange={() => toggleFilter("status", "go")}
                >
                  Go
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("no_go")}
                  onCheckedChange={() => toggleFilter("status", "no_go")}
                >
                  No Go
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>AI Decision</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.aiDecision.includes("go")}
                  onCheckedChange={() => toggleFilter("aiDecision", "go")}
                >
                  Go
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.aiDecision.includes("no_go")}
                  onCheckedChange={() => toggleFilter("aiDecision", "no_go")}
                >
                  No Go
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Manager Decision</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.managerDecision.includes("go")}
                  onCheckedChange={() => toggleFilter("managerDecision", "go")}
                >
                  Go
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.managerDecision.includes("no_go")}
                  onCheckedChange={() => toggleFilter("managerDecision", "no_go")}
                >
                  No Go
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select
              value={filters.submitter}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, submitter: value }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Submitter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submitters</SelectItem>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
                <SelectItem value="bob">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
            
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(range) => setFilters((prev) => ({ ...prev, dateRange: range }))}
            />
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {filters.status.map((status) => (
                <Badge key={status} variant="secondary" className="px-2 py-1">
                  Status: {status.replace("_", " ")}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => toggleFilter("status", status)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {filters.aiDecision.map((decision) => (
                <Badge key={decision} variant="secondary" className="px-2 py-1">
                  AI: {decision.replace("_", " ")}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => toggleFilter("aiDecision", decision)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {filters.managerDecision.map((decision) => (
                <Badge key={decision} variant="secondary" className="px-2 py-1">
                  Manager: {decision.replace("_", " ")}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => toggleFilter("managerDecision", decision)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {filters.submitter && (
                <Badge variant="secondary" className="px-2 py-1">
                  Submitter: {filters.submitter}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => setFilters((prev) => ({ ...prev, submitter: "" }))}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.dateRange && (filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="px-2 py-1">
                  Date Range: {filters.dateRange.from ? format(filters.dateRange.from, "MMM d, yyyy") : "Start"} - {filters.dateRange.to ? format(filters.dateRange.to, "MMM d, yyyy") : "End"}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => setFilters((prev) => ({ ...prev, dateRange: undefined }))}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground"
              onClick={resetFilters}
            >
              <FilterX className="h-3 w-3" />
              Clear all
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
} 