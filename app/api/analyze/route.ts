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
        policyNumber: result.extractedData?.policyNumber || null,
        claimantName: result.extractedData?.claimantName || null,
        claimType: result.extractedData?.claimType || null,
        amount: result.extractedData?.amount || null,
        incidentDate: result.extractedData?.incidentDate || null,
        description: result.extractedData?.description || null,
        classification: result.classification,
        confidence: result.confidence,
        needsHumanReview: result.needsHumanReview,
        processingTime,
      },
      include: {
        feedbacks: true,
      },
    })

    return NextResponse.json({
      claim,
      analysis: result,
    })

  } catch (error: any) {
    console.error("Analyze error FULL:", error)

    return NextResponse.json(
      {
        error: "Failed to analyze claim",
        details: error?.message || String(error),
        stack: error?.stack || null,
      },
      { status: 500 }
    )
  }
}
