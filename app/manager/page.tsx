import { getOpportunities } from "@/app/actions/opportunities";
import { formatDate, truncateText } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";
import ManagerAuthWrapper from "@/components/manager-auth-wrapper";

export default async function ManagerPage() {
  const { success, opportunities, error } = await getOpportunities();
  
  // Filter opportunities that need review (status is "open")
  const pendingOpportunities = opportunities?.filter(
    (opportunity) => opportunity.status === "open"
  ) || [];
  
  // Filter opportunities that have been reviewed
  const reviewedOpportunities = opportunities?.filter(
    (opportunity) => opportunity.status === "go" || opportunity.status === "no_go"
  ) || [];
  
  return (
    <ManagerAuthWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          </div>
          
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Statistics
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Review"
            value={pendingOpportunities.length}
            icon={<Clock className="h-5 w-5 text-yellow-500" />}
            variant="warning"
          />
          
          <StatCard
            title="Approved (Go)"
            value={reviewedOpportunities.filter(o => o.status === "go").length}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            variant="success"
          />
          
          <StatCard
            title="Rejected (No Go)"
            value={reviewedOpportunities.filter(o => o.status === "no_go").length}
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            variant="destructive"
          />
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities Pending Review</CardTitle>
              <CardDescription>
                These opportunities need your review and decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOpportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No opportunities pending review
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>AI Recommendation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/opportunities/${opportunity.id}`}
                            className="hover:underline"
                          >
                            {truncateText(opportunity.title, 30)}
                          </Link>
                        </TableCell>
                        <TableCell>{opportunity.submitter?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDate(opportunity.createdAt)}</TableCell>
                        <TableCell>
                          {opportunity.aiDecision ? (
                            <DecisionBadge decision={opportunity.aiDecision} />
                          ) : (
                            "Pending"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" asChild>
                            <Link href={`/opportunities/${opportunity.id}`}>
                              Review
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recently Reviewed Opportunities</CardTitle>
              <CardDescription>
                Opportunities you have already reviewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewedOpportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reviewed opportunities yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Your Decision</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewedOpportunities.slice(0, 5).map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/opportunities/${opportunity.id}`}
                            className="hover:underline"
                          >
                            {truncateText(opportunity.title, 30)}
                          </Link>
                        </TableCell>
                        <TableCell>{opportunity.submitter?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDate(opportunity.createdAt)}</TableCell>
                        <TableCell>
                          <DecisionBadge decision={opportunity.managerDecision || opportunity.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/opportunities/${opportunity.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {reviewedOpportunities.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/opportunities">
                      View All Opportunities
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerAuthWrapper>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "destructive" | "warning";
}

function StatCard({ title, value, icon, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "bg-card",
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    destructive: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  };
  
  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  switch (decision) {
    case "go":
      return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Go</Badge>;
    case "no_go":
      return <Badge variant="destructive">No Go</Badge>;
    default:
      return <Badge variant="outline">{decision}</Badge>;
  }
} 