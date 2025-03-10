"use server";

import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { opportunities, opportunityScores, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { analyzeOpportunity, type AIScoringResult } from "@/lib/ai";

// Type for opportunity submission
interface OpportunitySubmission {
  title: string;
  description: string;
  timeline: string;
  submitterName: string;
}

// Type for manager review
interface ManagerReview {
  opportunityId: string;
  decision: "go" | "no_go";
  comment: string;
  managerName: string;
}

/**
 * Submit a new opportunity and analyze it with AI
 */
export async function submitOpportunity(data: OpportunitySubmission) {
  try {
    // Find or create the submitter
    let submitter = await db.query.users.findFirst({
      where: eq(users.name, data.submitterName),
    });

    if (!submitter) {
      const [newUser] = await db
        .insert(users)
        .values({
          name: data.submitterName,
          role: "worker",
        })
        .returning();
      submitter = newUser;
    }

    // Create the opportunity first with a pending status
    const [opportunity] = await db
      .insert(opportunities)
      .values({
        title: data.title,
        description: data.description,
        timeline: data.timeline,
        submittedById: submitter.id,
        status: "open",
        // Initially set to null, will be updated after analysis
        aiDecision: null,
      })
      .returning();

    // Start the AI analysis in the background without awaiting it
    // This prevents the Vercel function from timing out
    analyzeOpportunityAndUpdateDB(
      opportunity.id,
      data.title,
      data.description,
      data.timeline
    ).catch(error => {
      console.error("Background AI analysis failed:", error);
    });

    revalidatePath("/opportunities");
    return { success: true, opportunity };
  } catch (error) {
    console.error("Error submitting opportunity:", error);
    return { success: false, error: "Failed to submit opportunity" };
  }
}

/**
 * Background process to analyze an opportunity and update the database
 * This function runs asynchronously and doesn't block the response
 */
async function analyzeOpportunityAndUpdateDB(
  opportunityId: string,
  title: string,
  description: string,
  timeline: string
) {
  try {
    // Analyze the opportunity with AI
    const aiAnalysis = await analyzeOpportunity(
      title,
      description,
      timeline
    );

    // Update the opportunity with the AI decision
    await db
      .update(opportunities)
      .set({
        aiDecision: aiAnalysis.decision,
      })
      .where(eq(opportunities.id, opportunityId));

    // Insert the scores
    await Promise.all(
      aiAnalysis.scores.map((score: AIScoringResult) =>
        db.insert(opportunityScores).values({
          opportunityId: opportunityId,
          criterion: score.criterion,
          score: score.score,
          explanation: score.explanation,
        })
      )
    );

    // Revalidate the opportunities page to show the updated data
    revalidatePath("/opportunities");
    return { success: true };
  } catch (error) {
    console.error("Error in background AI analysis:", error);
    return { success: false, error: "Failed to analyze opportunity" };
  }
}

/**
 * Get all opportunities with their scores
 */
export async function getOpportunities() {
  try {
    const results = await db.query.opportunities.findMany({
      orderBy: [desc(opportunities.createdAt)],
      with: {
        submitter: true,
        reviewer: true,
        scores: true,
      },
    });

    return { success: true, opportunities: results };
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return { success: false, error: "Failed to fetch opportunities" };
  }
}

/**
 * Get a single opportunity by ID with its scores
 */
export async function getOpportunity(id: string) {
  try {
    const opportunity = await db.query.opportunities.findFirst({
      where: eq(opportunities.id, id),
      with: {
        submitter: true,
        reviewer: true,
        scores: true,
      },
    });

    if (!opportunity) {
      return { success: false, error: "Opportunity not found" };
    }

    return { success: true, opportunity };
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return { success: false, error: "Failed to fetch opportunity" };
  }
}

/**
 * Review an opportunity as a manager
 */
export async function reviewOpportunity(data: ManagerReview) {
  try {
    // Find or create the manager
    let manager = await db.query.users.findFirst({
      where: eq(users.name, data.managerName),
    });

    if (!manager) {
      const [newUser] = await db
        .insert(users)
        .values({
          name: data.managerName,
          role: "manager",
        })
        .returning();
      manager = newUser;
    }

    // Update the opportunity
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        status: data.decision === "go" ? "go" : "no_go",
        managerDecision: data.decision,
        managerComment: data.comment,
        reviewedById: manager.id,
      })
      .where(eq(opportunities.id, data.opportunityId))
      .returning();

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${data.opportunityId}`);
    
    return { success: true, opportunity: updatedOpportunity };
  } catch (error) {
    console.error("Error reviewing opportunity:", error);
    return { success: false, error: "Failed to review opportunity" };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const allOpportunities = await db.query.opportunities.findMany();
    
    const totalOpportunities = allOpportunities.length;
    const goOpportunities = allOpportunities.filter(o => o.status === "go").length;
    const noGoOpportunities = allOpportunities.filter(o => o.status === "no_go").length;
    const pendingOpportunities = allOpportunities.filter(o => ["open", "in_review"].includes(o.status)).length;
    
    // Calculate AI accuracy (when manager agrees with AI)
    const reviewedOpportunities = allOpportunities.filter(o => o.managerDecision && o.aiDecision);
    const aiAccuracy = reviewedOpportunities.length > 0
      ? reviewedOpportunities.filter(o => o.managerDecision === o.aiDecision).length / reviewedOpportunities.length
      : 0;
    
    return {
      success: true,
      stats: {
        totalOpportunities,
        goOpportunities,
        noGoOpportunities,
        pendingOpportunities,
        aiAccuracy,
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
} 