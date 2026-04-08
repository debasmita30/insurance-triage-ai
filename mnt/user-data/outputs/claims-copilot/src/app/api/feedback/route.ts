import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FeedbackSchema = z.object({
  claimId: z.string(),
  correctedClassification: z.enum(["valid", "needs_docs", "reject"]),
  correctedPolicyNumber: z.string().optional().nullable(),
  correctedAmount: z.number().optional().nullable(),
  correctedClaimType: z.string().optional().nullable(),
  agentId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = FeedbackSchema.parse(body);

    const claim = await prisma.claim.findUnique({
      where: { id: data.claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        claimId: data.claimId,
        originalClassification: claim.classification,
        correctedClassification: data.correctedClassification,
        correctedPolicyNumber: data.correctedPolicyNumber,
        correctedAmount: data.correctedAmount,
        correctedClaimType: data.correctedClaimType,
        agentId: data.agentId,
        notes: data.notes,
      },
    });

    await prisma.claim.update({
      where: { id: data.claimId },
      data: {
        classification: data.correctedClassification,
        status:
          data.correctedClassification === "reject"
            ? "rejected"
            : data.correctedClassification === "valid"
            ? "approved"
            : "pending",
      },
    });

    return NextResponse.json({ feedback });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Feedback error:", err);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claimId = searchParams.get("claimId");

  const where = claimId ? { claimId } : {};

  const feedbacks = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ feedbacks });
}
