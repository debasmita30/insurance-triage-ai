export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    totalClaims: 0,
    autoResolved: 0,
    flagged: 0,
    rejected: 0,
    needsDocs: 0,
    valid: 0,
    autoResolvedPct: 0,
    flaggedPct: 0,
    rejectedPct: 0,
    avgConfidence: 0,
    avgProcessingMs: 0,
    feedbackCount: 0,
    classificationBreakdown: [],
    confidenceDistribution: [],
    dailyVolume: [],
  })
}
