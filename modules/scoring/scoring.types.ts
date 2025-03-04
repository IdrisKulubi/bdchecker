// Define the scoring criteria
export interface ScoringCriteria {
  name: string;
  description: string;
  weight: number; // Weight factor for this criterion (1-10)
}

// Define the scoring thresholds
export interface ScoringThresholds {
  go: number; // Minimum overall score to recommend "GO"
  review: number; // Minimum overall score to recommend "REVIEW"
}

// Define the scoring result
export interface ScoringResult {
  scores: Record<string, number>; // Individual scores for each criterion
  overallScore: number; // Weighted average of all scores
  recommendation: "GO" | "NO_GO" | "REVIEW"; // Final recommendation
  comments: string; // AI-generated comments or reasoning
}

// Define the scoring request
export interface ScoringRequest {
  title: string;
  description: string;
  clientName: string;
  timeline: string;
  budget?: string;
} 