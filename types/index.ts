export type Classification = "valid" | "needs_docs" | "reject";
export type ClaimStatus = "pending" | "approved" | "rejected" | "under_review";

export interface ExtractedData {
  policyNumber: string | null;
  claimantName: string | null;
  claimType: string | null;
  amount: number | null;
  incidentDate: string | null;
  description: string | null;
}

export interface AnalysisResult {
  classification: Classification;
  confidence: number;
  needsHumanReview: boolean;
  extractedData: ExtractedData;
  reasoning: string;
  missingDocuments: string[];
  riskFlags: string[];
}

export interface ClaimRecord {
  id: string;
  rawText: string;
  policyNumber: string | null;
  claimantName: string | null;
  claimType: string | null;
  amount: number | null;
  incidentDate: string | null;
  description: string | null;
  classification: string;
  confidence: number;
  needsHumanReview: boolean;
  status: string;
  processingTime: number | null;
  createdAt: string;
  updatedAt: string;
  feedbacks: FeedbackRecord[];
}

export interface FeedbackRecord {
  id: string;
  claimId: string;
  originalClassification: string;
  correctedClassification: string;
  correctedPolicyNumber: string | null;
  correctedAmount: number | null;
  correctedClaimType: string | null;
  agentId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface AnalyticsData {
  totalClaims: number;
  autoResolved: number;
  flagged: number;
  rejected: number;
  needsDocs: number;
  valid: number;
  autoResolvedPct: number;
  flaggedPct: number;
  rejectedPct: number;
  avgConfidence: number;
  avgProcessingMs: number;
  feedbackCount: number;
  classificationBreakdown: { name: string; value: number; color: string }[];
  confidenceDistribution: { range: string; count: number }[];
  dailyVolume: { date: string; claims: number; flagged: number }[];
}
