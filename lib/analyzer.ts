import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CONFIDENCE_THRESHOLD = 0.75;

const SYSTEM_PROMPT = `You are an expert insurance claims analyst AI. Your job is to triage insurance claims submitted by policyholders.

Analyze the claim text and return a JSON object with this exact structure:
{
  "classification": "valid" | "needs_docs" | "reject",
  "confidence": <number between 0 and 1>,
  "extractedData": {
    "policyNumber": <string or null>,
    "claimantName": <string or null>,
    "claimType": <"motor" | "health" | "property" | "travel" | "life" | "other" | null>,
    "amount": <number in INR or null>,
    "incidentDate": <ISO date string or null>,
    "description": <brief summary string or null>
  },
  "reasoning": <string explaining your decision>,
  "missingDocuments": [<list of missing documents if any>],
  "riskFlags": [<list of fraud/risk indicators if any>]
}

Classification rules:
- "valid": Claim has all necessary information, plausible, and should be processed
- "needs_docs": Claim is plausible but missing required documentation (FIR, discharge summary, photos, receipts, etc.)
- "reject": Claim has fraud indicators, inconsistencies, policy violations, or is invalid

Confidence scoring:
- Above 0.85: High confidence
- 0.75-0.85: Medium confidence
- Below 0.75: Low confidence — should be flagged for human review

Return ONLY the JSON object, no other text.`;

export async function analyzeClaim(rawText: string): Promise<AnalysisResult> {
  const startTime = Date.now();

  const message = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this insurance claim:\n\n${rawText}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Failed to parse AI response: " + responseText);
  }

  parsed.needsHumanReview = parsed.confidence < CONFIDENCE_THRESHOLD;

  return parsed;
}
