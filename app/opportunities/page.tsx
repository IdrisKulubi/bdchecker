import { getOpportunities } from "@/app/actions/opportunities";
import { OpportunitiesTable } from "@/components/opportunities-table";
import { OpportunitiesFilter } from "@/components/opportunities-filter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Plus, ArrowLeft, DownloadCloud } from "lucide-react";

interface OpportunitiesPageProps {
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const { success, opportunities, error } = await getOpportunities();
  
  // Convert date strings to Date objects for the opportunities
  const processedOpportunities = success && opportunities
    ? opportunities.map(opportunity => ({
        ...opportunity,
        createdAt: new Date(opportunity.createdAt),
        updatedAt: new Date(opportunity.updatedAt),
      }))
    : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <p className="text-muted-foreground">
              Manage and track all submitted opportunities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild size="sm">
            <Link href="/">
              <Plus className="h-4 w-4 mr-2" />
              New Opportunity
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <OpportunitiesFilter />
        
        <Separator className="my-6" />

        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>{error}</p>
          </div>
        ) : (
          <OpportunitiesTable 
            opportunities={processedOpportunities} 
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  );
} 