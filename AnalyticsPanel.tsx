"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Brain,
  Clock,
  MessageSquare,
  Zap,
} from "lucide-react";
import { formatConfidence } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
  delay?: number;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        {sub && (
          <span
            className="text-xs font-mono px-2 py-1 rounded-md"
            style={{
              background: bg,
              color,
              border: `1px solid ${color}33`,
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p
          className="text-2xl font-bold font-mono"
          style={{ color: "var(--text)" }}
        >
          {value}
        </p>
        <p
          className="text-xs mt-1 font-medium uppercase tracking-wide"
          style={{ color: "var(--text-subtle)" }}
        >
          {label}
        </p>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      <p className="font-medium mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

interface AnalyticsPanelProps {
  data: AnalyticsData | null;
  loading: boolean;
}

export function AnalyticsPanel({ data, loading }: AnalyticsPanelProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl h-32 animate-shimmer"
            style={{ border: "1px solid var(--border)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
          Operations Analytics
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
          Real-time metrics across all AI triage activity
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingUp}
          label="Total Claims"
          value={data.totalClaims}
          color="var(--accent)"
          bg="var(--accent-glow)"
          delay={0}
        />
        <MetricCard
          icon={Zap}
          label="Auto-Resolved"
          value={`${data.autoResolvedPct.toFixed(1)}%`}
          sub={`${data.autoResolved} claims`}
          color="var(--valid)"
          bg="var(--valid-bg)"
          delay={0.05}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Flagged for Review"
          value={`${data.flaggedPct.toFixed(1)}%`}
          sub={`${data.flagged} claims`}
          color="var(--review)"
          bg="var(--review-bg)"
          delay={0.1}
        />
        <MetricCard
          icon={XCircle}
          label="Rejected"
          value={`${data.rejectedPct.toFixed(1)}%`}
          sub={`${data.rejected} claims`}
          color="var(--reject)"
          bg="var(--reject-bg)"
          delay={0.15}
        />
        <MetricCard
          icon={Brain}
          label="Avg Confidence"
          value={formatConfidence(data.avgConfidence)}
          color="var(--needs-docs)"
          bg="var(--needs-docs-bg)"
          delay={0.2}
        />
        <MetricCard
          icon={Clock}
          label="Avg Processing"
          value={`${(data.avgProcessingMs / 1000).toFixed(1)}s`}
          color="var(--accent)"
          bg="var(--accent-glow)"
          delay={0.25}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Valid Claims"
          value={data.valid}
          color="var(--valid)"
          bg="var(--valid-bg)"
          delay={0.3}
        />
        <MetricCard
          icon={MessageSquare}
          label="Feedback Entries"
          value={data.feedbackCount}
          sub="eval dataset"
          color="var(--accent)"
          bg="var(--accent-glow)"
          delay={0.35}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wide mb-5"
            style={{ color: "var(--text-muted)" }}
          >
            Classification Breakdown
          </h3>
          {data.totalClaims === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                No data yet
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={data.classificationBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.classificationBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div
                          className="px-3 py-2 rounded-xl text-xs"
                          style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <p style={{ color: d.color }}>{d.name}</p>
                          <p style={{ color: "var(--text)" }}>{d.value} claims</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {data.classificationBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wide mb-5"
            style={{ color: "var(--text-muted)" }}
          >
            Confidence Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data.confidenceDistribution}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="range"
                tick={{ fill: "var(--text-subtle)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-subtle)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Claims" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wide mb-5"
            style={{ color: "var(--text-muted)" }}
          >
            7-Day Volume
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={data.dailyVolume}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-subtle)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-subtle)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="claims"
                name="Claims"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: "var(--accent)", r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="flagged"
                name="Flagged"
                stroke="var(--review)"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ fill: "var(--review)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-6 border-t-2" style={{ borderColor: "var(--accent)" }} />
              <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                All Claims
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-6 border-t-2 border-dashed"
                style={{ borderColor: "var(--review)" }}
              />
              <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                Flagged
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wide mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          System Health
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Auto-Resolution Rate",
              value: data.autoResolvedPct,
              max: 100,
              color: "var(--valid)",
              unit: "%",
              description: "Claims resolved without human review",
            },
            {
              label: "Human Review Rate",
              value: data.flaggedPct,
              max: 100,
              color: "var(--review)",
              unit: "%",
              description: "Claims needing ops team attention",
            },
            {
              label: "AI Confidence",
              value: data.avgConfidence * 100,
              max: 100,
              color:
                data.avgConfidence >= 0.85
                  ? "var(--valid)"
                  : data.avgConfidence >= 0.75
                  ? "var(--needs-docs)"
                  : "var(--reject)",
              unit: "%",
              description: "Average model confidence across all claims",
            },
          ].map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {metric.label}
                </span>
                <span
                  className="text-sm font-bold font-mono"
                  style={{ color: metric.color }}
                >
                  {metric.value.toFixed(1)}
                  {metric.unit}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: "var(--surface-3)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: metric.color }}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
