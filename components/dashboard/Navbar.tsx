"use client";

import { motion } from "framer-motion";
import {
  Shield,
  BarChart3,
  History,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

interface NavbarProps {
  analytics: AnalyticsData | null;
  activeTab: "triage" | "history" | "analytics";
  onTabChange: (tab: "triage" | "history" | "analytics") => void;
}

export function Navbar({ analytics, activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: "triage" as const, label: "Triage", icon: Zap },
    { id: "history" as const, label: "Claims", icon: History },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(20px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Claims Copilot
            </span>
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-subtle)" }}
              >
                AI TRIAGE SYSTEM
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-white"
                    : "hover:text-white"
                )}
                style={{
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {analytics && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--valid)" }} />
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {analytics.autoResolvedPct.toFixed(0)}% auto
                </span>
              </div>
              {analytics.flagged > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                  style={{ background: "var(--review-bg)", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--review)" }} />
                  <span className="text-xs font-mono font-medium" style={{ color: "var(--review)" }}>
                    {analytics.flagged} pending review
                  </span>
                </div>
              )}
            </>
          )}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{ background: "var(--valid-bg)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "var(--valid)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--valid)" }}>
              AI ONLINE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
