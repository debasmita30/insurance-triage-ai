import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const classification = searchParams.get("classification");
  const needsHumanReview = searchParams.get("needsHumanReview");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (classification && classification !== "all") {
    where.classification = classification;
  }

  if (needsHumanReview === "true") {
    where.needsHumanReview = true;
  }

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

  return NextResponse.json({
    claims,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}
