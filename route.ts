import { NextRequest, NextResponse } from "next/server";
import { analyzeClaim } from "@/lib/analyzer";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RequestSchema = z.object({
  rawText: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText } = RequestSchema.parse(body);

    const startTime = Date.now();
    const result = await analyzeClaim(rawText);
    const processingTime = Date.now() - startTime;

    const claim = await prisma.claim.create({
      data: {
        rawText,
        policyNumber: result.extractedData.policyNumber,
        claimantName: result.extractedData.claimantName,
        claimType: result.extractedData.claimType,
        amount: result.extractedData.amount,
        incidentDate: result.extractedData.incidentDate,
        description: result.extractedData.description,
        classification: result.classification,
        confidence: result.confidence,
        needsHumanReview: result.needsHumanReview,
        processingTime,
        status: result.classification === "reject" ? "rejected" : "pending",
      },
      include: { feedbacks: true },
    });

    return NextResponse.json({
      claim,
      analysis: result,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
