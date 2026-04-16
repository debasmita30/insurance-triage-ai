export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzeClaim } from "@/lib/analyzer"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawText = body.rawText

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Claim text too short" },
        { status: 400 }
      )
    }

    const start = Date.now()
    const result = await analyzeClaim(rawText)
    const processingTime = Date.now() - start

    const claim = await prisma.claim.create({
      data: {
        rawText,
        policyNumber: result.extractedData?.policyNumber,
        claimantName: result.extractedData?.claimantName,
        claimType: result.extractedData?.claimType,
        amount: result.extractedData?.amount,
        incidentDate: result.extractedData?.incidentDate,
        description: result.extractedData?.description,
        classification: result.classification,
        confidence: result.confidence,
        needsHumanReview: result.needsHumanReview,
        processingTime,
      },
      include: { feedbacks: true },
    })

    return NextResponse.json({ claim, analysis: result })

  } catch (error) {
    console.error("Analyze error:", error)
    return NextResponse.json(
      { error: "Failed to analyze claim", details: String(error) },
      { status: 500 }
    )
  }
}
