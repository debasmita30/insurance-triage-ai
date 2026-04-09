import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const claims = [
    {
      rawText:
        "Policy POL-2024-001234. Claimant: Raj Mehta. Vehicle collision on 15 Dec 2024. Estimated damage: INR 85,000. Third-party involved. FIR attached.",
      policyNumber: "POL-2024-001234",
      claimantName: "Raj Mehta",
      claimType: "motor",
      amount: 85000,
      incidentDate: "2024-12-15",
      description: "Vehicle collision with third-party. FIR attached.",
      classification: "valid",
      confidence: 0.92,
      needsHumanReview: false,
      status: "approved",
      processingTime: 1240,
    },
    {
      rawText:
        "Claim for hospitalization. Patient: Priya Singh. Policy: MED-567890. Admitted 10 Jan 2025, discharged 14 Jan 2025. Total bill: INR 1,20,000. No discharge summary provided.",
      policyNumber: "MED-567890",
      claimantName: "Priya Singh",
      claimType: "health",
      amount: 120000,
      incidentDate: "2025-01-10",
      description: "Hospitalization claim missing discharge summary.",
      classification: "needs_docs",
      confidence: 0.78,
      needsHumanReview: false,
      status: "pending",
      processingTime: 980,
    },
    {
      rawText:
        "Fire claim. Property at 12 MG Road, Bangalore. Policy PROP-2023-00456. Fire on 20 Nov 2024. Loss estimated at INR 5,00,000. No fire brigade report. Suspicious timing.",
      policyNumber: "PROP-2023-00456",
      claimantName: "Unknown",
      claimType: "property",
      amount: 500000,
      incidentDate: "2024-11-20",
      description: "Suspicious fire claim without fire brigade report.",
      classification: "reject",
      confidence: 0.88,
      needsHumanReview: false,
      status: "rejected",
      processingTime: 1560,
    },
    {
      rawText:
        "Travel insurance claim. Ananya Krishnan. Policy TRVL-2024-7788. Flight cancelled on 5 Feb 2025. Expenses: hotel INR 12,000, rebooking INR 8,500. Receipts attached.",
      policyNumber: "TRVL-2024-7788",
      claimantName: "Ananya Krishnan",
      claimType: "travel",
      amount: 20500,
      incidentDate: "2025-02-05",
      description: "Flight cancellation with hotel and rebooking expenses.",
      classification: "valid",
      confidence: 0.61,
      needsHumanReview: true,
      status: "pending",
      processingTime: 1100,
    },
  ];

  for (const claim of claims) {
    await prisma.claim.create({ data: claim });
  }

  console.log("Seeded", claims.length, "claims");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
