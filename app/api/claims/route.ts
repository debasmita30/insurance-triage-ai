export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeClaim } from "@/lib/analyzer";

export async function POST(req: NextRequest) {
  try {
    const { rawText } = await req.json();
    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json({ error: "Claim text too short" }, { status: 400 });
    }
    const start = Date.now();
    const result = await analyzeClaim(rawText);
    const processingTime = Date.now() - start;

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
      },
      include: { feedbacks: true },
    });

    return NextResponse.json({ claim, analysis: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const classification = searchParams.get("classification");
  const needsHumanReview = searchParams.get("needsHumanReview");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (classification && classification !== "all") where.classification = classification;
  if (needsHumanReview === "true") where.needsHumanReview = true;
  if (search) {
    where.OR = [
      { policyNumber: { contains: search, mode: "insensitive" } },
      { claimantName: { contains: search, mode: "insensitive" } },
      { rawText: { contains: search, mode: "insensitive" } },
    ];
  }

  const [claims, total] = await Promise.all([
    prisma.claim.findMany({
      where,
      include: { feedbacks: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.claim.count({ where }),
  ]);

  return NextResponse.json({ claims, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}
