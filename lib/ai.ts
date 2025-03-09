import { criterionEnum } from "@/db/schema";

// Define the scoring criteria types
export type CriterionType = typeof criterionEnum.enumValues[number];

// Define the structure for AI scoring results
export interface AIScoringResult {
  criterion: CriterionType;
  score: number;
  explanation: string;
}

// Define the structure for the overall AI decision
export interface AIDecision {
  decision: "go" | "no_go";
  confidence: number;
  reasoning: string;
  scores: AIScoringResult[];
}

/**
 * Analyzes an opportunity using the Deepseek R1 model
 * @param title - The opportunity title
 * @param description - The opportunity description
 * @param timeline - The opportunity timeline
 * @returns A promise that resolves to the AI decision
 */
export async function analyzeOpportunity(
  title: string,
  description: string,
  timeline: string
): Promise<AIDecision> {
  console.log('Starting opportunity analysis with inputs:', { title, description, timeline });
  
  try {
    // Construct the prompt for the AI model
    const prompt = `
      You are an expert business analyst tasked with evaluating business opportunities. 
      Please analyze the following opportunity and provide a detailed Go/No Go recommendation:
      
      Title: ${title}
      Description: ${description}
      Timeline: ${timeline}
      
      Score each of the following criteria on a scale of 1-5 (where 1 is poor and 5 is excellent):
      
      1. Lead Time Check (1-5)
         - Evaluate if the timeline is realistic and feasible
         - Consider if there's sufficient time for planning, execution, and quality assurance
         - Assess if the deadline aligns with our current workload and capacity
         - Score 5 if timeline is very comfortable, 3 if reasonable but tight, 1 if unrealistic
      
      2. Project Insight (1-5)
         - Assess how well we understand the project requirements and scope
         - Consider if requirements are clear, detailed, and well-documented
         - Evaluate if there are any ambiguities or unknowns that could pose risks
         - Score 5 if requirements are crystal clear, 3 if mostly clear with some questions, 1 if very vague
      
      3. Client Relationship (1-5)
         - Evaluate our existing relationship with the client
         - Consider past project history, communication quality, and payment reliability
         - Assess strategic importance of maintaining/developing this client relationship
         - Score 5 for excellent existing relationships, 3 for neutral/new clients, 1 for difficult clients
      
      4. Expertise Alignment (1-5)
         - Assess if we have the necessary skills and expertise for this project
         - Consider if the project aligns with our core competencies
         - Evaluate if we would need to acquire new skills or hire specialists
         - Score 5 if perfectly aligned with our expertise, 3 if moderate alignment, 1 if completely outside our domain
      
      5. Commercial Viability (1-5)
         - Evaluate the financial aspects of the opportunity
         - Consider potential revenue, profit margins, and ROI
         - Assess payment terms, budget constraints, and financial risks
         - Score 5 if highly profitable with minimal risk, 3 if moderately profitable, 1 if likely unprofitable
      
      6. Strategic Value (1-5)
         - Assess how well the opportunity aligns with our strategic goals
         - Consider if it opens doors to new markets, technologies, or client segments
         - Evaluate long-term benefits beyond immediate financial gains
         - Score 5 if strongly aligned with strategy, 3 if neutral alignment, 1 if contradicts our strategy
      
      7. Resources (1-5)
         - Evaluate if we have sufficient resources to deliver the project successfully
         - Consider human resources, equipment, technology, and infrastructure needs
         - Assess if resource allocation would impact other ongoing projects
         - Score 5 if resources are readily available, 3 if manageable with some adjustments, 1 if severe resource constraints
      
      For each criterion, provide:
      - A numerical score (1-5)
      - A detailed explanation justifying the score based on the information provided
      
      Then, provide an overall Go/No Go recommendation with:
      - A clear decision (Go or No Go)
      - Your confidence level (percentage)
      - Comprehensive reasoning that weighs the various criteria
    `;

    console.log('Sending request to Deepseek API...');
    
    // Call the Deepseek R1 API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 0.95,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API request failed:', errorData);
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received API response:', data);
    
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response to extract scores and reasoning
    const result = parseAIResponse(aiResponse);
    console.log('Parsed AI response:', result);
    return result;
    
  } catch (error) {
    console.error("Error analyzing opportunity:", error);
    throw new Error("Failed to analyze opportunity with AI");
  }
}

/**
 * Parses the AI response to extract scores and reasoning
 * @param aiResponse - The raw text response from the AI model
 * @returns The parsed AI decision
 */
function parseAIResponse(aiResponse: string): AIDecision {
  console.log('Starting to parse AI response:', aiResponse);
  
  try {
    // Initialize scores array
    const scores: AIScoringResult[] = [];
    
    // Regular expressions to extract information
    const scoreRegex = /(\d+)\.\s+([\w\s]+)\s+\((\d+)\)/gi;
    const decisionRegex = /(go|no go)/i;
    const confidenceRegex = /confidence.*?(\d+)%/i;
    
    // Extract scores and explanations
    const criteriaMap: Record<string, CriterionType> = {
      "lead time check": "lead_time_check",
      "project insight": "project_insight",
      "client relationship": "client_relationship",
      "expertise alignment": "expertise_alignment",
      "commercial viability": "commercial_viability",
      "strategic value": "strategic_value",
      "resources": "resources"
    };
    
    // Split the response by criteria sections
    const sections = aiResponse.split(/\d+\.\s+[\w\s]+\s+\(\d+\)/i).slice(1);
    console.log('Split sections:', sections);
    
    let matches;
    let index = 0;
    
    // Reset regex lastIndex
    scoreRegex.lastIndex = 0;
    
    // Extract each criterion score and explanation
    while ((matches = scoreRegex.exec(aiResponse)) !== null && index < sections.length) {
      const criterionName = matches[2].trim().toLowerCase();
      const criterionKey = criteriaMap[criterionName] as CriterionType;
      
      if (criterionKey) {
        const score = parseInt(matches[3], 10);
        const explanation = sections[index].trim();
        
        console.log('Extracted criterion:', {
          name: criterionName,
          key: criterionKey,
          score,
          explanation
        });
        
        scores.push({
          criterion: criterionKey,
          score: score,
          explanation: explanation
        });
      }
      
      index++;
    }
    
    // Extract decision
    const decisionMatch = aiResponse.match(decisionRegex);
    const decision = decisionMatch ? 
      (decisionMatch[1].toLowerCase() === "go" ? "go" : "no_go") : 
      "no_go";
    console.log('Extracted decision:', decision);
    
    // Extract confidence
    const confidenceMatch = aiResponse.match(confidenceRegex);
    const confidence = confidenceMatch ? 
      Math.min(parseInt(confidenceMatch[1], 10), 100) : 
      70;
    console.log('Extracted confidence:', confidence);
    
    // Extract reasoning (everything after the last criterion)
    const reasoningStartIndex = aiResponse.toLowerCase().indexOf("recommendation");
    const reasoning = reasoningStartIndex > -1 ? 
      aiResponse.substring(reasoningStartIndex).trim() : 
      "Based on the analysis of the provided information, this is the recommendation.";
    console.log('Extracted reasoning:', reasoning);
    
    // Calculate average score if no scores were extracted
    if (scores.length === 0) {
      console.log('No scores extracted, using default scores');
      // Fallback to default scores based on decision
      const defaultScore = decision === "go" ? 4 : 2;
      
      Object.keys(criteriaMap).forEach(key => {
        scores.push({
          criterion: criteriaMap[key] as CriterionType,
          score: defaultScore,
          explanation: "Score derived from overall decision due to parsing limitations."
        });
      });
    }

    const result = {
      decision,
      confidence,
      reasoning,
      scores
    };
    
    console.log('Final parsed result:', result);
    return result as AIDecision ;
    
  } catch (error) {
    console.error("Error parsing AI response:", error);
    
    // Fallback to a default response
    const defaultResponse = {
      decision: "no_go" as const,
      confidence: 50,
      reasoning: "Unable to parse AI response. Defaulting to a cautious recommendation.",
      scores: Object.values(criterionEnum.enumValues).map(criterion => ({
        criterion: criterion as CriterionType,
        score: 3,
        explanation: "Default score due to parsing error."
      }))
    };
    
    console.log('Returning default response due to error:', defaultResponse);
    return defaultResponse;
  }
}

/**
 * In a production environment, you would implement the actual Deepseek R1 API integration
 * This would include proper error handling, rate limiting, and response parsing
 */ 