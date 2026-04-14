export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [claims, feedbacks] = await Promise.all([
    prisma.claim.findMany({
      select: {
        classification: true,
        confidence: true,
        needsHumanReview: true,
        processingTime: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.feedback.count(),
  ]);

  const totalClaims = claims.length;
  const valid = claims.filter((c) => c.classification === "valid").length;
  const needsDocs = claims.filter(
    (c) => c.classification === "needs_docs"
  ).length;
  const rejected = claims.filter((c) => c.classification === "reject").length;
  const flagged = claims.filter((c) => c.needsHumanReview).length;
  const autoResolved = claims.filter(
    (c) => !c.needsHumanReview && c.classification !== "reject"
  ).length;

  const avgConfidence =
    totalClaims > 0
      ? claims.reduce((sum, c) => sum + c.confidence, 0) / totalClaims
      : 0;

  const processingTimes = claims
    .map((c) => c.processingTime)
    .filter(Boolean) as number[];
  const avgProcessingMs =
    processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

  const confidenceRanges = [
    { range: "0-50%", min: 0, max: 0.5 },
    { range: "50-65%", min: 0.5, max: 0.65 },
    { range: "65-75%", min: 0.65, max: 0.75 },
    { range: "75-85%", min: 0.75, max: 0.85 },
    { range: "85-100%", min: 0.85, max: 1.01 },
  ];

  const confidenceDistribution = confidenceRanges.map(({ range, min, max }) => ({
    range,
    count: claims.filter((c) => c.confidence >= min && c.confidence < max)
      .length,
  }));

  const last30Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayClaims = claims.filter(
      (c) => c.createdAt.toISOString().split("T")[0] === dateStr
    );
    return {
      date: date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      claims: dayClaims.length,
      flagged: dayClaims.filter((c) => c.needsHumanReview).length,
    };
  });

  return NextResponse.json({
    totalClaims,
    autoResolved,
    flagged,
    rejected,
    needsDocs,
    valid,
    autoResolvedPct: totalClaims > 0 ? (autoResolved / totalClaims) * 100 : 0,
    flaggedPct: totalClaims > 0 ? (flagged / totalClaims) * 100 : 0,
    rejectedPct: totalClaims > 0 ? (rejected / totalClaims) * 100 : 0,
    avgConfidence,
    avgProcessingMs,
    feedbackCount: feedbacks,
    classificationBreakdown: [
      { name: "Valid", value: valid, color: "#10b981" },
      { name: "Needs Docs", value: needsDocs, color: "#f59e0b" },
      { name: "Rejected", value: rejected, color: "#ef4444" },
    ],
    confidenceDistribution,
    dailyVolume: last30Days,
  });
}
