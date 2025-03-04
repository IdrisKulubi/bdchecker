import { OpenAI } from 'openai';
import { ScoringRequest, ScoringResult } from './scoring.types';
import { AI_SCORING_PROMPT, DEFAULT_SCORING_CRITERIA, DEFAULT_SCORING_THRESHOLDS } from './scoring.constants';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Score an opportunity using AI
 * @param opportunity The opportunity to score
 * @returns The scoring result
 */
export async function scoreOpportunity(opportunity: ScoringRequest): Promise<ScoringResult> {
  try {
    // Replace placeholders in the prompt template
    const prompt = AI_SCORING_PROMPT
      .replace('{title}', opportunity.title)
      .replace('{description}', opportunity.description)
      .replace('{clientName}', opportunity.clientName)
      .replace('{timeline}', opportunity.timeline)
      .replace('{budget}', opportunity.budget || 'Not specified')
      .replace('{leadTimeCheck.description}', DEFAULT_SCORING_CRITERIA.leadTimeCheck.description)
      .replace('{projectInsight.description}', DEFAULT_SCORING_CRITERIA.projectInsight.description)
      .replace('{clientRelationship.description}', DEFAULT_SCORING_CRITERIA.clientRelationship.description)
      .replace('{expertiseAlignment.description}', DEFAULT_SCORING_CRITERIA.expertiseAlignment.description)
      .replace('{commercialViability.description}', DEFAULT_SCORING_CRITERIA.commercialViability.description)
      .replace('{strategicValue.description}', DEFAULT_SCORING_CRITERIA.strategicValue.description)
      .replace('{resources.description}', DEFAULT_SCORING_CRITERIA.resources.description);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant that evaluates business opportunities.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Parse the JSON
    const result = JSON.parse(jsonMatch[0]) as ScoringResult;

    // Calculate the weighted average score
    let totalWeight = 0;
    let weightedScore = 0;

    for (const [criterion, score] of Object.entries(result.scores)) {
      const weight = DEFAULT_SCORING_CRITERIA[criterion]?.weight || 1;
      totalWeight += weight;
      weightedScore += score * weight;
    }

    result.overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    // Determine the recommendation based on thresholds
    if (result.overallScore >= DEFAULT_SCORING_THRESHOLDS.go) {
      result.recommendation = 'GO';
    } else if (result.overallScore >= DEFAULT_SCORING_THRESHOLDS.review) {
      result.recommendation = 'REVIEW';
    } else {
      result.recommendation = 'NO_GO';
    }

    return result;
  } catch (error) {
    console.error('Error scoring opportunity:', error);
    throw error;
  }
}

/**
 * Override the AI scoring with a manager's assessment
 * @param aiScore The original AI scoring result
 * @param managerScores The manager's scores
 * @param managerComments The manager's comments
 * @returns The updated scoring result
 */
export function overrideScoring(
  aiScore: ScoringResult,
  managerScores: Record<string, number>,
  managerComments: string
): ScoringResult {
  // Create a new scoring result with the manager's scores
  const result: ScoringResult = {
    scores: { ...aiScore.scores, ...managerScores },
    overallScore: 0,
    recommendation: aiScore.recommendation,
    comments: managerComments || aiScore.comments,
  };

  // Calculate the weighted average score
  let totalWeight = 0;
  let weightedScore = 0;

  for (const [criterion, score] of Object.entries(result.scores)) {
    const weight = DEFAULT_SCORING_CRITERIA[criterion]?.weight || 1;
    totalWeight += weight;
    weightedScore += score * weight;
  }

  result.overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  // Determine the recommendation based on thresholds
  if (result.overallScore >= DEFAULT_SCORING_THRESHOLDS.go) {
    result.recommendation = 'GO';
  } else if (result.overallScore >= DEFAULT_SCORING_THRESHOLDS.review) {
    result.recommendation = 'REVIEW';
  } else {
    result.recommendation = 'NO_GO';
  }

  return result;
} 