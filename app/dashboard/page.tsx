import { getDashboardStats } from "@/lib/actions/opportunities";
import { getUserStats } from "@/lib/actions/users";
import { OpportunityCharts } from "@/components/dashboard/opportunity-charts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const { success: statsSuccess, stats } = await getDashboardStats();
  const { success: userStatsSuccess, stats: userStats } = await getUserStats();
  
  // Default values if stats are not available
  const defaultStats = {
    totalOpportunities: 0,
    goOpportunities: 0,
    noGoOpportunities: 0,
    pendingOpportunities: 0,
    aiAccuracy: 0,
  };

  const defaultUserStats = {
    totalUsers: 0,
    workerCount: 0,
    managerCount: 0,
    adminCount: 0,
  };

  // Use actual stats or defaults
  const safeStats = statsSuccess && stats ? stats : defaultStats;
  const safeUserStats = userStatsSuccess && userStats ? userStats : defaultUserStats;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Analytics and insights for opportunity management
            </p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/opportunities">
            <BarChart3 className="h-4 w-4 mr-2" />
            View All Opportunities
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Opportunities"
          value={safeStats.totalOpportunities}
          description="Total opportunities submitted"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        
        <StatCard
          title="Go Decisions"
          value={safeStats.goOpportunities}
          description="Opportunities approved"
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        />
        
        <StatCard
          title="No Go Decisions"
          value={safeStats.noGoOpportunities}
          description="Opportunities rejected"
          icon={<XCircle className="h-5 w-5 text-red-500" />}
        />
        
        <StatCard
          title="Pending Review"
          value={safeStats.pendingOpportunities}
          description="Awaiting manager review"
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
        />
      </div>
      
      <OpportunityCharts stats={safeStats} userStats={safeUserStats} />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 