import { ScoringCriteria, ScoringThresholds } from "./scoring.types";

// Define the default scoring criteria
export const DEFAULT_SCORING_CRITERIA: Record<string, ScoringCriteria> = {
  leadTimeCheck: {
    name: "Lead Time Check",
    description: "Evaluates if the project timeline is realistic and achievable",
    weight: 8,
  },
  projectInsight: {
    name: "Project Insight",
    description: "Evaluates the clarity and completeness of the project description",
    weight: 7,
  },
  clientRelationship: {
    name: "Client Relationship",
    description: "Evaluates the existing relationship with the client",
    weight: 6,
  },
  expertiseAlignment: {
    name: "Expertise Alignment",
    description: "Evaluates how well the project aligns with our expertise",
    weight: 9,
  },
  commercialViability: {
    name: "Commercial Viability",
    description: "Evaluates the commercial potential of the project",
    weight: 10,
  },
  strategicValue: {
    name: "Strategic Value",
    description: "Evaluates the strategic importance of the project",
    weight: 8,
  },
  resources: {
    name: "Resources",
    description: "Evaluates the availability of resources for the project",
    weight: 7,
  },
};

// Define the default scoring thresholds
export const DEFAULT_SCORING_THRESHOLDS: ScoringThresholds = {
  go: 3.0, // Minimum overall score to recommend "GO"
  review: 2.5, // Minimum overall score to recommend "REVIEW"
};

// Define the AI prompt template
export const AI_SCORING_PROMPT = `
You are an assistant that scores business opportunities based on the following criteria:

1) Lead Time Check (1-4): {leadTimeCheck.description}
2) Project Insight (1-4): {projectInsight.description}
3) Client Relationship (1-4): {clientRelationship.description}
4) Expertise Alignment (1-4): {expertiseAlignment.description}
5) Commercial Viability (1-4): {commercialViability.description}
6) Strategic Value (1-4): {strategicValue.description}
7) Resources (1-4): {resources.description}

Rate each criterion on a scale of 1-4 where:
1 = Poor/High Risk
2 = Fair/Moderate Risk
3 = Good/Low Risk
4 = Excellent/Very Low Risk

Then provide an overall recommendation of "GO", "NO_GO", or "REVIEW" based on the weighted average of all scores.

Opportunity details:
Title: {title}
Description: {description}
Client: {clientName}
Timeline: {timeline}
Budget: {budget}

Provide your response in JSON format with the following structure:
{
  "scores": {
    "leadTimeCheck": number,
    "projectInsight": number,
    "clientRelationship": number,
    "expertiseAlignment": number,
    "commercialViability": number,
    "strategicValue": number,
    "resources": number
  },
  "overallScore": number,
  "recommendation": "GO" | "NO_GO" | "REVIEW",
  "comments": "string"
}
`; 