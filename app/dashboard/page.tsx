"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { ClaimInput } from "@/components/dashboard/ClaimInput";
import { ClaimResult } from "@/components/dashboard/ClaimResult";
import { ClaimsTable } from "@/components/dashboard/ClaimsTable";
import { Navbar } from "@/components/dashboard/Navbar";
import type { ClaimRecord, AnalyticsData } from "@/types";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"triage" | "history" | "analytics">("triage");
  const [latestClaim, setLatestClaim] = useState<ClaimRecord | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey]);

  const handleClaimAnalyzed = (claim: ClaimRecord) => {
    setLatestClaim(claim);
    setRefreshKey((k) => k + 1);
  };

  const handleFeedbackSubmitted = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      <Navbar
        analytics={analytics}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "triage" && (
            <motion.div
              key="triage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <ClaimInput onClaimAnalyzed={handleClaimAnalyzed} />
              <ClaimResult
                claim={latestClaim}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ClaimsTable
                key={refreshKey}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <AnalyticsPanel
                data={analytics}
                loading={analyticsLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
