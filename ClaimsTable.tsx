"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  FileQuestion,
  AlertTriangle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  X,
  Loader2,
} from "lucide-react";
import {
  cn,
  formatCurrency,
  formatConfidence,
  formatRelativeTime,
  getConfidenceLevel,
} from "@/lib/utils";
import type { ClaimRecord } from "@/types";

const CLASSIFICATION_CONFIG = {
  valid: {
    label: "Valid",
    icon: CheckCircle2,
    color: "var(--valid)",
    bg: "var(--valid-bg)",
    border: "rgba(16,185,129,0.25)",
  },
  needs_docs: {
    label: "Needs Docs",
    icon: FileQuestion,
    color: "var(--needs-docs)",
    bg: "var(--needs-docs-bg)",
    border: "rgba(245,158,11,0.25)",
  },
  reject: {
    label: "Reject",
    icon: XCircle,
    color: "var(--reject)",
    bg: "var(--reject-bg)",
    border: "rgba(239,68,68,0.25)",
  },
};

interface FeedbackModalProps {
  claim: ClaimRecord;
  onClose: () => void;
  onSubmit: () => void;
}

function FeedbackModal({ claim, onClose, onSubmit }: FeedbackModalProps) {
  const [classification, setClassification] = useState("");
  const [notes, setNotes] = useState("");
  const [agentId, setAgentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!classification) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: claim.id,
          correctedClassification: classification,
          agentId: agentId || null,
          notes: notes || null,
        }),
      });
      onSubmit();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
              Correction Feedback
            </h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-subtle)" }}>
              {claim.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: "var(--text-subtle)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            AI classified as:{" "}
            <span
              className="font-bold"
              style={{
                color: CLASSIFICATION_CONFIG[
                  claim.classification as keyof typeof CLASSIFICATION_CONFIG
                ]?.color,
              }}
            >
              {CLASSIFICATION_CONFIG[claim.classification as keyof typeof CLASSIFICATION_CONFIG]?.label}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs mb-2 font-medium" style={{ color: "var(--text-muted)" }}>
            Correct Classification
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["valid", "needs_docs", "reject"] as const).map((cls) => {
              const cfg = CLASSIFICATION_CONFIG[cls];
              return (
                <button
                  key={cls}
                  onClick={() => setClassification(cls)}
                  className="py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: classification === cls ? cfg.bg : "var(--surface-2)",
                    border: `1px solid ${classification === cls ? cfg.border : "var(--border)"}`,
                    color: classification === cls ? cfg.color : "var(--text-muted)",
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
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why was the AI wrong? This helps improve the model."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!classification || submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? "Saving..." : "Save to Eval Dataset"}
        </button>
      </motion.div>
    </motion.div>
  );
}

interface ClaimsTableProps {
  onFeedbackSubmitted: () => void;
}

export function ClaimsTable({ onFeedbackSubmitted }: ClaimsTableProps) {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [classification, setClassification] = useState("all");
  const [needsReview, setNeedsReview] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [feedbackClaim, setFeedbackClaim] = useState<ClaimRecord | null>(null);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      classification,
      ...(needsReview && { needsHumanReview: "true" }),
      ...(search && { search }),
    });
    try {
      const res = await fetch(`/api/claims?${params}`);
      const data = await res.json();
      setClaims(data.claims);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, classification, needsReview, search]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = (cls: string) => {
    setClassification(cls);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
            Claims History
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
            {total} total claims
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: "var(--text-subtle)" }} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search claims..."
              className="text-sm outline-none bg-transparent w-48"
              style={{ color: "var(--text)" }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
              >
                <X className="w-3.5 h-3.5" style={{ color: "var(--text-subtle)" }} />
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {[
              { value: "all", label: "All" },
              { value: "valid", label: "Valid" },
              { value: "needs_docs", label: "Needs Docs" },
              { value: "reject", label: "Reject" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    classification === opt.value
                      ? "var(--surface-3)"
                      : "transparent",
                  color:
                    classification === opt.value
                      ? "var(--text)"
                      : "var(--text-muted)",
                  border:
                    classification === opt.value
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setNeedsReview((v) => !v);
              setPage(1);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: needsReview ? "var(--review-bg)" : "var(--surface)",
              border: `1px solid ${needsReview ? "rgba(139,92,246,0.3)" : "var(--border)"}`,
              color: needsReview ? "var(--review)" : "var(--text-muted)",
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Review
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="grid text-xs font-bold uppercase tracking-wide px-5 py-3"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr auto",
            background: "var(--surface-2)",
            color: "var(--text-subtle)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span>Policy</span>
          <span>Claimant</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Classification</span>
          <span>Confidence</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ background: "var(--surface)" }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-subtle)" }} />
          </div>
        ) : claims.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            style={{ background: "var(--surface)" }}
          >
            <Filter className="w-8 h-8" style={{ color: "var(--text-subtle)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No claims found
            </p>
          </div>
        ) : (
          <div style={{ background: "var(--surface)" }}>
            {claims.map((claim, i) => {
              const cfg =
                CLASSIFICATION_CONFIG[
                  claim.classification as keyof typeof CLASSIFICATION_CONFIG
                ];
              const Icon = cfg?.icon || AlertTriangle;
              const confidenceLevel = getConfidenceLevel(claim.confidence);
              const confidenceColor =
                confidenceLevel === "high"
                  ? "var(--valid)"
                  : confidenceLevel === "medium"
                  ? "var(--needs-docs)"
                  : "var(--reject)";
              const hasFeedback = claim.feedbacks && claim.feedbacks.length > 0;

              return (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid items-center px-5 py-4 transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr auto",
                    borderBottom:
                      i < claims.length - 1
                        ? "1px solid var(--border-subtle)"
                        : "none",
                  }}
                >
                  <div>
                    <p
                      className="text-xs font-mono font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {claim.policyNumber || "—"}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {formatRelativeTime(claim.createdAt)}
                    </p>
                  </div>

                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {claim.claimantName || "—"}
                  </p>

                  <p
                    className="text-xs uppercase font-mono"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {claim.claimType || "—"}
                  </p>

                  <p
                    className="text-xs font-mono font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {formatCurrency(claim.amount)}
                  </p>

                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                      style={{
                        background: cfg?.bg,
                        border: `1px solid ${cfg?.border}`,
                      }}
                    >
                      <Icon className="w-3 h-3" style={{ color: cfg?.color }} />
                      <span
                        className="text-xs font-medium"
                        style={{ color: cfg?.color }}
                      >
                        {cfg?.label}
                      </span>
                    </div>
                    {claim.needsHumanReview && (
                      <AlertTriangle
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--review)" }}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: confidenceColor }}
                    >
                      {formatConfidence(claim.confidence)}
                    </span>
                    <div
                      className="flex-1 max-w-[60px] h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--surface-3)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${claim.confidence * 100}%`,
                          background: confidenceColor,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasFeedback ? (
                      <span
                        className="text-xs px-2 py-1 rounded-md font-medium"
                        style={{
                          background: "var(--valid-bg)",
                          color: "var(--valid)",
                          border: "1px solid rgba(16,185,129,0.2)",
                        }}
                      >
                        Corrected
                      </span>
                    ) : (
                      <button
                        onClick={() => setFeedbackClaim(claim)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <MessageSquare className="w-3 h-3" />
                        Correct
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {feedbackClaim && (
          <FeedbackModal
            claim={feedbackClaim}
            onClose={() => setFeedbackClaim(null)}
            onSubmit={() => {
              fetchClaims();
              onFeedbackSubmitted();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
