import { getOpportunity } from "@/lib/actions/opportunities";
import { formatDate, formatDateTime, getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import ManagerReviewForm from "@/components/manager-review-form";

interface OpportunityDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  // Ensure params is properly awaited before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const opportunityId = resolvedParams.id;
  
  const { success, opportunity } = await getOpportunity(opportunityId);
  
  if (!success || !opportunity) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/opportunities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Link>
        </Button>
        <h1 className="text-3xl font-bold truncate max-w-full">
          {opportunity.title.length > 50 
            ? `${opportunity.title.substring(0, 50)}...` 
            : opportunity.title}
        </h1>
        <StatusBadge status={opportunity.status} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
              <CardDescription>
                Submitted by {opportunity.submitter?.name || "Unknown"} on {formatDate(opportunity.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                <p className="whitespace-pre-wrap">{opportunity.timeline}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                AI-generated scores and recommendation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {opportunity.scores.map((score) => (
                  <div key={score.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">
                        {score.criterion.replace(/_/g, " ")}
                      </h4>
                      <div className={`${getScoreColor(score.score)} text-white font-bold rounded-full w-8 h-8 flex items-center justify-center`}>
                        {score.score}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {score.explanation}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">AI Recommendation</h3>
                  <DecisionBadge decision={opportunity.aiDecision || "pending"} />
                </div>
                <p className="text-sm">
                  Based on the analysis of all criteria, the AI recommends this opportunity as a {opportunity.aiDecision?.toUpperCase() || "PENDING"}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manager Review</CardTitle>
              <CardDescription>
                Final decision by management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.managerDecision ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Decision</h3>
                    <DecisionBadge decision={opportunity.managerDecision} />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Comments</h3>
                    <p className="whitespace-pre-wrap">{opportunity.managerComment || "No comments provided."}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Reviewed By</h3>
                    <p>{opportunity.reviewer?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.updatedAt && formatDateTime(opportunity.updatedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    This opportunity has not been reviewed by a manager yet.
                  </p>
                  <ManagerReviewForm opportunityId={opportunity.id} />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-muted-foreground/20 ml-3 space-y-6">
                <TimelineItem
                  title="Opportunity Submitted"
                  description={`By ${opportunity.submitter?.name || "Unknown"}`}
                  date={formatDateTime(opportunity.createdAt)}
                />
                
                <TimelineItem
                  title="AI Analysis Completed"
                  description={`Recommendation: ${opportunity.aiDecision?.toUpperCase() || "PENDING"}`}
                  date={formatDateTime(opportunity.createdAt)}
                />
                
                {opportunity.managerDecision && (
                  <TimelineItem
                    title="Manager Review Completed"
                    description={`Decision: ${opportunity.managerDecision.toUpperCase()}`}
                    date={formatDateTime(opportunity.updatedAt)}
                  />
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "open":
      return <Badge variant="outline">Open</Badge>;
    case "in_review":
      return <Badge variant="secondary">In Review</Badge>;
    case "go":
      return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Go</Badge>;
    case "no_go":
      return <Badge variant="destructive">No Go</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function DecisionBadge({ decision }: { decision: string }) {
  switch (decision) {
    case "go":
      return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Go</Badge>;
    case "no_go":
      return <Badge variant="destructive">No Go</Badge>;
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    default:
      return <Badge variant="outline">{decision}</Badge>;
  }
}

function TimelineItem({ title, description, date }: { title: string; description: string; date: string }) {
  return (
    <li className="ml-6">
      <span className="absolute flex items-center justify-center w-6 h-6 bg-primary rounded-full -left-3">
        <div className="w-2 h-2 bg-background rounded-full"></div>
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm">{description}</p>
      <time className="text-xs text-muted-foreground">{date}</time>
    </li>
  );
} 