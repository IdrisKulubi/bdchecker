"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getOpportunityBreakdown, TrendDataPoint, TimeFilter } from "@/lib/actions/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardStats {
  totalOpportunities: number;
  goOpportunities: number;
  noGoOpportunities: number;
  pendingOpportunities: number;
  aiAccuracy: number;
}

interface UserStats {
  totalUsers: number;
  workerCount: number;
  managerCount: number;
  adminCount: number;
}

interface OpportunityChartsProps {
  stats: DashboardStats;
  userStats: UserStats;
}

export function OpportunityCharts({ stats, userStats }: OpportunityChartsProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  
  // Fetch trend data when the component mounts or when the trends tab is selected
  useEffect(() => {
    if (activeTab === "trends") {
      const fetchTrendData = async () => {
        setIsLoading(true);
        try {
          // Use the breakdown function with the selected time filter
          const data = await getOpportunityBreakdown(timeFilter);
          setTrendData(data);
        } catch (error) {
          console.error("Failed to fetch trend data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTrendData();
    }
  }, [activeTab, timeFilter]);
  
  // Prepare data for charts
  const statusData = [
    { name: "Go", value: stats.goOpportunities, color: "#10b981" },
    { name: "No Go", value: stats.noGoOpportunities, color: "#ef4444" },
    { name: "Pending", value: stats.pendingOpportunities, color: "#f59e0b" },
  ];
  
  const userRolesData = [
    { name: "Workers", value: userStats.workerCount, color: "#3b82f6" },
    { name: "Managers", value: userStats.managerCount, color: "#10b981" },
    { name: "Admins", value: userStats.adminCount, color: "#8b5cf6" },
  ];
  
  const aiAccuracyPercentage = Math.round(stats.aiAccuracy * 100);
  
  // Get appropriate label for time filter
  const getTimeLabel = () => {
    switch (timeFilter) {
      case "today": return "Today (Hourly)";
      case "week": return "This Week (Daily)";
      case "month": return "This Month (Daily)";
      case "quarter": return "This Quarter (Monthly)";
      case "year": return "This Year (Monthly)";
      case "all": return "All Time (Monthly)";
      default: return "Time Period";
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="overview" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="ai">AI Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Status Distribution</CardTitle>
                <CardDescription>
                  Current distribution of opportunities by status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} opportunities`,
                          "",
                        ]}
                      />
                      <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-4 mt-2">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>
                  Distribution of users by role
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userRolesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value: number) => [`${value} users`, "Count"]} />
                      <Bar dataKey="value" name="Users">
                        {userRolesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
              <CardDescription>
                How well the AI recommendations align with manager decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="10"
                      />
                      {/* Progress circle - stroke-dasharray is based on the circumference */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        strokeDasharray={`${aiAccuracyPercentage * 2.83} 283`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                      {/* Text in the middle */}
                      <text
                        x="50"
                        y="50"
                        fontSize="20"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                      >
                        {aiAccuracyPercentage}%
                      </text>
                    </svg>
                  </div>
                  <span className="text-sm font-medium mt-2">AI Accuracy</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Agreement Rate</span>
                        <span className="text-sm font-medium">{aiAccuracyPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${aiAccuracyPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                          <span className="text-sm font-medium">AI Correct</span>
                        </div>
                        <span className="text-2xl font-bold">
                          {Math.round((stats.goOpportunities + stats.noGoOpportunities) * stats.aiAccuracy)}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                          <span className="text-sm font-medium">AI Incorrect</span>
                        </div>
                        <span className="text-2xl font-bold">
                          {Math.round((stats.goOpportunities + stats.noGoOpportunities) * (1 - stats.aiAccuracy))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Select
              value={timeFilter}
              onValueChange={(value) => setTimeFilter(value as TimeFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Trends</CardTitle>
              <CardDescription>
                {getTimeLabel()} breakdown of opportunities by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {isLoading ? (
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[350px] w-full rounded-xl" />
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No trend data available for this time period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trendData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        interval={timeFilter === "month" || timeFilter === "quarter" ? 2 : 0}
                        angle={timeFilter === "month" ? -45 : 0}
                        textAnchor={timeFilter === "month" ? "end" : "middle"}
                        height={timeFilter === "month" ? 60 : 30}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="go" stackId="a" name="Go" fill="#10b981" />
                      <Bar dataKey="noGo" stackId="a" name="No Go" fill="#ef4444" />
                      <Bar dataKey="pending" stackId="a" name="Pending" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Success Rate Trend</CardTitle>
              <CardDescription>
                Percentage of Go decisions over {timeFilter === "today" ? "hours" : timeFilter === "week" || timeFilter === "month" ? "days" : "months"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No trend data available for this time period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData.map((item) => ({
                        ...item,
                        successRate: item.total > 0 ? (item.go / item.total) * 100 : 0,
                      }))}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        interval={timeFilter === "month" || timeFilter === "quarter" ? 2 : 0}
                        angle={timeFilter === "month" ? -45 : 0}
                        textAnchor={timeFilter === "month" ? "end" : "middle"}
                        height={timeFilter === "month" ? 60 : 30}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Success Rate"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="successRate"
                        name="Success Rate"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Recommendation Accuracy
                <Badge variant="outline" className="ml-2">
                  {aiAccuracyPercentage}% Accuracy
                </Badge>
              </CardTitle>
              <CardDescription>
                How often AI recommendations match the final manager decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Go",
                        correct: Math.round(stats.goOpportunities * stats.aiAccuracy),
                        incorrect: Math.round(stats.goOpportunities * (1 - stats.aiAccuracy)),
                      },
                      {
                        name: "No Go",
                        correct: Math.round(stats.noGoOpportunities * stats.aiAccuracy),
                        incorrect: Math.round(stats.noGoOpportunities * (1 - stats.aiAccuracy)),
                      },
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="correct" name="Correct" fill="#10b981" />
                    <Bar dataKey="incorrect" name="Incorrect" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium">AI Performance by Criteria</h4>
                
                {/* These would be actual metrics from your AI system */}
                {[
                  { name: "Lead Time Check", accuracy: 92 },
                  { name: "Project Insight", accuracy: 85 },
                  { name: "Client Relationship", accuracy: 78 },
                  { name: "Expertise Alignment", accuracy: 88 },
                  { name: "Commercial Viability", accuracy: 82 },
                  { name: "Strategic Value", accuracy: 76 },
                  { name: "Resources", accuracy: 90 },
                ].map((criterion) => (
                  <div key={criterion.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{criterion.name}</span>
                      <span className="text-sm font-medium">{criterion.accuracy}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${criterion.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 