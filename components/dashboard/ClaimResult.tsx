"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  FileQuestion,
  AlertTriangle,
  User,
  Hash,
  IndianRupee,
  Calendar,
  Tag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { cn, formatCurrency, formatConfidence, getConfidenceLevel } from "@/lib/utils";
import type { ClaimRecord } from "@/types";

interface ClaimResultProps {
  claim: ClaimRecord | null;
  onFeedbackSubmitted: () => void;
}

const CLASSIFICATION_CONFIG = {
  valid: {
    label: "Valid",
    icon: CheckCircle2,
    color: "var(--valid)",
    bg: "var(--valid-bg)",
    border: "rgba(16,185,129,0.25)",
    description: "Claim meets all criteria and can be processed",
  },
  needs_docs: {
    label: "Needs Documents",
    icon: FileQuestion,
    color: "var(--needs-docs)",
    bg: "var(--needs-docs-bg)",
    border: "rgba(245,158,11,0.25)",
    description: "Additional documentation required before processing",
  },
  reject: {
    label: "Reject",
    icon: XCircle,
    color: "var(--reject)",
    bg: "var(--reject-bg)",
    border: "rgba(239,68,68,0.25)",
    description: "Claim has issues that prevent processing",
  },
};

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const level = getConfidenceLevel(confidence);
  const color =
    level === "high"
      ? "var(--valid)"
      : level === "medium"
      ? "var(--needs-docs)"
      : "var(--reject)";

  const segments = Array.from({ length: 20 }, (_, i) => {
    const threshold = (i + 1) / 20;
    return { filled: confidence >= threshold, color };
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Confidence Score
        </span>
        <span className="text-sm font-bold font-mono" style={{ color }}>
          {formatConfidence(confidence)}
        </span>
      </div>
      <div className="flex gap-0.5">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.02, duration: 0.15 }}
            className="flex-1 rounded-sm"
            style={{
              height: "8px",
              background: seg.filled ? seg.color : "var(--surface-3)",
              opacity: seg.filled ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
          0%
        </span>
        <div className="flex items-center gap-1">
          {confidence < 0.75 && (
            <span
              className="text-xs font-mono font-medium px-2 py-0.5 rounded"
              style={{
                color: "var(--review)",
                background: "var(--review-bg)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              ⚠ NEEDS HUMAN REVIEW
            </span>
          )}
        </div>
        <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
          100%
        </span>
      </div>
    </div>
  );
}

function DataField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--surface-3)" }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>
          {label}
        </p>
        <p className="text-sm font-medium font-mono" style={{ color: "var(--text)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ClaimResult({ claim, onFeedbackSubmitted }: ClaimResultProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackClassification, setFeedbackClassification] = useState<string>("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [agentId, setAgentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  if (!claim) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col items-center justify-center min-h-[500px] gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <ShieldAlert className="w-8 h-8" style={{ color: "var(--text-subtle)" }} />
        </div>
        <div className="text-center">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            No claim analyzed yet
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            Submit a claim to see AI triage results
          </p>
        </div>
      </div>
    );
  }

  const config = CLASSIFICATION_CONFIG[claim.classification as keyof typeof CLASSIFICATION_CONFIG];
  const Icon = config?.icon || AlertTriangle;
  const isHumanReview = claim.needsHumanReview;

  const handleFeedbackSubmit = async () => {
    if (!feedbackClassification) return;
    setSubmitting(true);

    try {
      await fetch("/api/feedback", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: claim.id,
          correctedClassification: feedbackClassification,
          agentId: agentId || null,
          notes: feedbackNotes || null,
        }),
      });

      setFeedbackDone(true);
      setShowFeedback(false);
      onFeedbackSubmitted();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
          >
            <Icon className="w-4 h-4" style={{ color: config?.color }} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight uppercase" style={{ color: "var(--text)" }}>
              Triage Result
            </h2>
            <p className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
              {claim.id}
            </p>
          </div>
        </div>
        {claim.processingTime && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <Clock className="w-3 h-3" style={{ color: "var(--text-subtle)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {(claim.processingTime / 1000).toFixed(1)}s
            </span>
          </div>
        )}
      </div>

      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{
          background: config?.bg,
          border: `1px solid ${config?.border}`,
        }}
      >
        <Icon className="w-8 h-8 flex-shrink-0" style={{ color: config?.color }} />
        <div>
          <p className="text-lg font-bold" style={{ color: config?.color }}>
            {config?.label}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {config?.description}
          </p>
        </div>
        {isHumanReview && (
          <div
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg flex-shrink-0"
            style={{
              background: "var(--review-bg)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--review)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--review)" }}>
              HUMAN REVIEW
            </span>
          </div>
        )}
      </div>

      <ConfidenceMeter confidence={claim.confidence} />

      <div className="grid grid-cols-2 gap-3">
        <DataField icon={Hash} label="Policy Number" value={claim.policyNumber} />
        <DataField icon={User} label="Claimant" value={claim.claimantName} />
        <DataField icon={Tag} label="Claim Type" value={claim.claimType?.toUpperCase()} />
        <DataField
          icon={IndianRupee}
          label="Claimed Amount"
          value={formatCurrency(claim.amount)}
        />
        <DataField icon={Calendar} label="Incident Date" value={claim.incidentDate} />
      </div>

      {claim.description && (
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-subtle)" }}>
            DESCRIPTION
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {claim.description}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowReasoning((v) => !v)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          AI Reasoning
        </button>
        {!feedbackDone ? (
          <button
            onClick={() => setShowFeedback((v) => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: showFeedback ? "var(--accent)" : "var(--surface-2)",
              border: `1px solid ${showFeedback ? "transparent" : "var(--border)"}`,
              color: showFeedback ? "white" : "var(--text-muted)",
            }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Correct AI
          </button>
        ) : (
          <div
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium"
            style={{
              background: "var(--valid-bg)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "var(--valid)",
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Feedback Saved
          </div>
        )}
      </div>

      <AnimatePresence>
        {showReasoning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-subtle)" }}>
                AI REASONING
              </p>
              <p className="text-xs leading-relaxed font-mono" style={{ color: "var(--text-muted)" }}>
                {(claim as any).analysis?.reasoning || "Reasoning not available"}
              </p>
            </div>
          </motion.div>
        )}

        {showFeedback && !feedbackDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Correction Feedback
              </p>
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--text-subtle)" }}>
                  Correct Classification
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["valid", "needs_docs", "reject"] as const).map((cls) => {
                    const cfg = CLASSIFICATION_CONFIG[cls];
                    return (
                      <button
                        key={cls}
                        onClick={() => setFeedbackClassification(cls)}
                        className="py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background:
                            feedbackClassification === cls ? cfg.bg : "var(--surface-3)",
                          border: `1px solid ${feedbackClassification === cls ? cfg.border : "var(--border)"}`,
                          color: feedbackClassification === cls ? cfg.color : "var(--text-muted)",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Agent ID (optional)"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
              <textarea
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Notes about why AI was incorrect..."
                className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                rows={2}
                style={{
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackClassification || submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                style={{
                  background: "var(--accent)",
                  color: "white",
                }}
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Saving..." : "Submit to Eval Dataset"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
