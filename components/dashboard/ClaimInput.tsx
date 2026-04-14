"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClaimRecord } from "@/types";

const SAMPLE_CLAIMS = [
  {
    label: "Motor Accident",
    text: "Policy POL-2024-001234. Claimant: Raj Mehta. Vehicle collision on 15 Dec 2024 near Connaught Place, Delhi. Estimated damage to vehicle: INR 85,000. Third-party vehicle involved. FIR No. 1234/2024 attached. Repair estimate from authorized service center enclosed.",
  },
  {
    label: "Health – Missing Docs",
    text: "Claim for hospitalization. Patient: Priya Singh. Policy: MED-567890. Admitted 10 Jan 2025, discharged 14 Jan 2025, Apollo Hospitals Bangalore. Total bill: INR 1,20,000. Diagnosis: Appendicitis, laparoscopic surgery. No discharge summary or doctor's certificate provided yet.",
  },
  {
    label: "Suspicious Fire",
    text: "Fire claim for property at 12 MG Road, Bangalore. Policy PROP-2023-00456. Fire occurred on 20 Nov 2024 at 2 AM. Loss estimated at INR 5,00,000. No fire brigade report available. Neighbors report no fire was seen. Policy renewed 3 weeks before incident.",
  },
  {
    label: "Travel Cancellation",
    text: "Travel insurance claim. Ananya Krishnan. Policy TRVL-2024-7788. IndiGo flight 6E-441 cancelled on 5 Feb 2025 due to fog. Expenses: hotel stay INR 12,000, flight rebooking INR 8,500. All receipts and boarding passes attached.",
  },
];

interface ClaimInputProps {
  onClaimAnalyzed: (claim: ClaimRecord) => void;
}

export function ClaimInput({ onClaimAnalyzed }: ClaimInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (value: string) => {
    setText(value);
    setCharCount(value.length);
    if (error) setError(null);
  };

  const handleAnalyze = async () => {
    if (!text.trim() || text.length < 10) {
      setError("Please enter a valid claim description (minimum 10 characters)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      onClaimAnalyzed(data.claim);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleSample = (sampleText: string) => {
    setText(sampleText);
    setCharCount(sampleText.length);
    setError(null);
  };

  const handleClear = () => {
    setText("");
    setCharCount(0);
    setError(null);
  };

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
          >
            <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h2
              className="text-sm font-bold tracking-tight uppercase"
              style={{ color: "var(--text)" }}
            >
              Claim Intake
            </h2>
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
              Paste raw claim text for AI triage
            </p>
          </div>
        </div>
        {text && (
          <button
            onClick={handleClear}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-subtle)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_CLAIMS.map((sample) => (
          <button
            key={sample.label}
            onClick={() => handleSample(sample.text)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 hover:scale-105"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste claim text here... include policy number, claimant details, incident description, and any supporting documents mentioned."
          className="w-full min-h-[260px] resize-none rounded-xl p-4 text-sm leading-relaxed outline-none transition-all duration-200 font-mono placeholder:font-sans"
          style={{
            background: "var(--surface-2)",
            border: `1px solid ${error ? "var(--reject)" : "var(--border)"}`,
            color: "var(--text)",
            caretColor: "var(--accent)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "var(--reject)" : "var(--border)";
            e.target.style.boxShadow = "none";
          }}
          disabled={loading}
        />
        <div
          className="absolute bottom-3 right-3 text-xs font-mono"
          style={{ color: charCount > 4500 ? "var(--reject)" : "var(--text-subtle)" }}
        >
          {charCount}/5000
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs px-3 py-2 rounded-lg"
          style={{
            color: "var(--reject)",
            background: "var(--reject-bg)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className={cn(
          "flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          !loading && text.trim() && "hover:scale-[1.02] hover:shadow-lg"
        )}
        style={{
          background: loading || !text.trim() ? "var(--surface-3)" : "var(--accent)",
          color: loading || !text.trim() ? "var(--text-muted)" : "white",
          boxShadow: !loading && text.trim() ? "0 0 30px rgba(99,102,241,0.3)" : "none",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing with Claude...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Analyze Claim</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </>
        )}
      </button>
    </div>
  );
}
