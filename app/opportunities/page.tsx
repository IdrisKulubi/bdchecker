import { getOpportunities } from "@/lib/actions/opportunities";
import { OpportunitiesTable, type Opportunity } from "@/components/opportunities-table";
import { OpportunitiesFilter } from "@/components/opportunities-filter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Plus, ArrowLeft, DownloadCloud } from "lucide-react";
import { OpportunitiesLoadingSkeleton } from "@/components/opportunities-loading-skeleton";
import { OpportunitiesAutoRefresh } from "@/components/opportunities-auto-refresh";
import { OpportunitiesNotification } from "@/components/opportunities-notification";
import { Suspense } from "react";

// Updated interface to match Next.js 15 expectations
interface OpportunitiesPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  // Ensure searchParams is properly awaited
  const params = await searchParams;
  
  // Check if we're coming from a submission (pendingSubmission in searchParams)
  const isPendingSubmission = params.pendingSubmission === "true";
  
  return (
    <div className="container mx-auto py-8 px-4">
      <OpportunitiesAutoRefresh />
      <OpportunitiesNotification />
      
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

        {isPendingSubmission ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-4 rounded-md flex items-center">
              <div className="mr-3 flex-shrink-0">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
              </div>
              <p>
                Your opportunity is being analyzed by our AI system. This may take a few moments. 
                The page will automatically update when the analysis is complete.
              </p>
            </div>
            <OpportunitiesLoadingSkeleton />
          </div>
        ) : (
          <Suspense fallback={<OpportunitiesLoadingSkeleton />}>
            <OpportunitiesContent searchParams={params} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

// Separate component for the opportunities content to enable suspense
async function OpportunitiesContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { success, opportunities, error } = await getOpportunities();
  
  // Convert date strings to Date objects for the opportunities
  const processedOpportunities = success && opportunities
    ? opportunities.map(opportunity => {
        // Only accept valid decision values
        const aiDecision = (opportunity.aiDecision === "go" || opportunity.aiDecision === "no_go") 
          ? opportunity.aiDecision as "go" | "no_go"
          : null;
        
        return {
          ...opportunity,
          createdAt: new Date(opportunity.createdAt),
          updatedAt: new Date(opportunity.updatedAt),
          aiDecision,
          managerDecision: (opportunity.managerDecision === "go" || opportunity.managerDecision === "no_go")
            ? opportunity.managerDecision as "go" | "no_go"
            : null
        };
      }) as unknown as Opportunity[]
    : [];

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <OpportunitiesTable 
      opportunities={processedOpportunities} 
      searchParams={searchParams}
    />
  );
} 