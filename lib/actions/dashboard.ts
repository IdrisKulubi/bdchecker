"use server";

import db from "@/db/drizzle";
import { opportunities } from "@/db/schema";
import { sql } from "drizzle-orm";

export interface TrendDataPoint {
  month: string;
  go: number;
  noGo: number;
  pending: number;
  total: number;
}

export type TimeFilter = "today" | "week" | "month" | "quarter" | "year" | "all";

/**
 * Fetches historical opportunity data grouped by month and decision status
 * @param months - Number of months to include in the trends (default: 6)
 * @returns Array of trend data points
 */
export async function getOpportunityTrends(months: number = 6): Promise<TrendDataPoint[]> {
  try {
    // Calculate the date range (last N months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1); // Start from the 1st day of the month
    
    // Format for SQL date comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Query to get opportunity counts by month and decision
    const results = await db.execute(sql`
      WITH date_series AS (
        SELECT 
          date_trunc('month', series::date) as month_start
        FROM 
          generate_series(
            ${startDateStr}::date, 
            date_trunc('month', now())::date, 
            '1 month'::interval
          ) as series
      )
      SELECT 
        to_char(ds.month_start, 'Mon YYYY') as month,
        COALESCE(SUM(CASE WHEN o.ai_decision = 'go' THEN 1 ELSE 0 END), 0) as go,
        COALESCE(SUM(CASE WHEN o.ai_decision = 'no_go' THEN 1 ELSE 0 END), 0) as "noGo",
        COALESCE(SUM(CASE WHEN o.ai_decision IS NULL THEN 1 ELSE 0 END), 0) as pending,
        COUNT(o.id) as total
      FROM 
        date_series ds
      LEFT JOIN 
        ${opportunities} o ON date_trunc('month', o.created_at) = ds.month_start
      GROUP BY 
        ds.month_start
      ORDER BY 
        ds.month_start ASC
    `);
    
    // Transform the results into the expected format
    // Check if results is an array, if not, handle it appropriately
    if (!Array.isArray(results)) {
      console.log('Query results is not an array, converting from:', typeof results);
      return [];
    }
    
    const trendData: TrendDataPoint[] = results.map(row => ({
      month: String(row.month || ''),
      go: Number(row.go || 0),
      noGo: Number(row.noGo || 0),
      pending: Number(row.pending || 0),
      total: Number(row.total || 0)
    }));
    
    return trendData;
  } catch (error) {
    console.error("Error fetching opportunity trends:", error);
    return [];
  }
}

/**
 * Fetches opportunity breakdown data based on a time filter
 * @param timeFilter - The time period to filter by (today, week, month, quarter, year, all)
 * @returns Array of trend data points with appropriate time granularity
 */
export async function getOpportunityBreakdown(timeFilter: TimeFilter = "month"): Promise<TrendDataPoint[]> {
  try {
    // Define time intervals and grouping based on the filter
    const startDate = new Date();
    let intervalUnit: string;
    let displayFormat: string;
    
    // Configure query parameters based on the selected time filter
    switch (timeFilter) {
      case "today":
        // For today, group by hour
        displayFormat = "HH24:00";
        intervalUnit = "1 hour";
        // Set to start of today
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case "week":
        // For week, group by day
        displayFormat = "Dy";
        intervalUnit = "1 day";
        // Set to start of current week (Sunday)
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case "month":
        // For month, group by day
        displayFormat = "Mon DD";
        intervalUnit = "1 day";
        // Set to start of current month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case "quarter":
        // For quarter, group by month
        displayFormat = "Mon YYYY";
        intervalUnit = "1 month";
        // Set to start of current quarter
        const currentMonth = startDate.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate.setMonth(quarterStartMonth, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case "year":
        // For year, group by month
        displayFormat = "Mon YYYY";
        intervalUnit = "1 month";
        // Set to start of current year
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case "all":
      default:
        // For all time, group by month
        displayFormat = "Mon YYYY";
        intervalUnit = "1 month";
        // Set to 2 years ago as a reasonable default
        startDate.setFullYear(startDate.getFullYear() - 2);
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    // Format for SQL date comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Query to get opportunity counts with appropriate time grouping
    const results = await db.execute(sql`
      WITH date_series AS (
        SELECT 
          series as time_point
        FROM 
          generate_series(
            ${startDateStr}::timestamp, 
            now()::timestamp, 
            ${intervalUnit}::interval
          ) as series
      )
      SELECT 
        to_char(ds.time_point, ${displayFormat}) as month,
        COALESCE(SUM(CASE WHEN o.ai_decision = 'go' THEN 1 ELSE 0 END), 0) as go,
        COALESCE(SUM(CASE WHEN o.ai_decision = 'no_go' THEN 1 ELSE 0 END), 0) as "noGo",
        COALESCE(SUM(CASE WHEN o.ai_decision IS NULL THEN 1 ELSE 0 END), 0) as pending,
        COUNT(o.id) as total
      FROM 
        date_series ds
      LEFT JOIN 
        ${opportunities} o ON 
        CASE 
          WHEN ${timeFilter} = 'today' THEN date_trunc('hour', o.created_at) = date_trunc('hour', ds.time_point)
          WHEN ${timeFilter} = 'week' THEN date_trunc('day', o.created_at) = date_trunc('day', ds.time_point)
          WHEN ${timeFilter} = 'month' THEN date_trunc('day', o.created_at) = date_trunc('day', ds.time_point)
          ELSE date_trunc('month', o.created_at) = date_trunc('month', ds.time_point)
        END
      GROUP BY 
        ds.time_point
      ORDER BY 
        ds.time_point ASC
    `);
    
    
    // Handle different result formats
    let rows = [];
    
    // Check if results is already an array
    if (Array.isArray(results)) {
      rows = results;
    } 
    // Check if results has a rows property (common in some DB clients)
    else if (results && typeof results === 'object' && 'rows' in results && Array.isArray(results.rows)) {
      rows = results.rows;
    }
    // For Drizzle's QueryResult type
    else if (results && typeof results === 'object') {
      // Try to convert the object to an array if possible
      try {
        rows = Object.values(results);
        // If the first item isn't an object with our expected properties, this isn't the right structure
        if (rows.length > 0 && (!rows[0] || typeof rows[0] !== 'object' || !('month' in rows[0]))) {
          console.log('Results object does not contain expected row objects');
          rows = [];
        }
      } catch (e) {
        console.error('Error converting results to array:', e);
        rows = [];
      }
    }
    
    console.log('Processed rows count:', rows.length);
    
    // Transform the rows into the expected format
    const trendData: TrendDataPoint[] = rows.map(row => ({
      month: String(row.month || ''),
      go: Number(row.go || 0),
      noGo: Number(row.noGo || 0),
      pending: Number(row.pending || 0),
      total: Number(row.total || 0)
    }));
    
    return trendData;
  } catch (error) {
    console.error("Error fetching opportunity breakdown:", error);
    return [];
  }
} 