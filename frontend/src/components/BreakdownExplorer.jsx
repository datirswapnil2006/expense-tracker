// src/components/BreakdownExplorer.jsx
//
// Lets the user answer questions like "how much did I spend on health
// this week / month / year." Fetches from GET /transactions/breakdown
// whenever the period, category, or type filter changes.

import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import { styles } from "../styles.js";
import { CATEGORIES, ALL_CATEGORIES, categoryMeta, fmtMoney, fmtBucket } from "../categories.js";
import * as api from "../api.js";

const PERIODS = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export default function BreakdownExplorer() {
  const [period, setPeriod] = useState("week");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(""); // "" = all categories
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryOptions = type === "income" ? CATEGORIES.income : CATEGORIES.expense;

  // Reset category filter when switching income/expense, since the
  // category lists don't overlap (e.g. "health" isn't an income category).
  useEffect(() => {
    setCategory("");
  }, [type]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = { period, type };
        if (category) params.category = category;
        const { rows } = await api.fetchBreakdown(params);
        if (!cancelled) setRows(rows);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [period, type, category]);

  // Group flat rows by bucket, so each time period renders as one block
  // with its categories listed underneath (and a bucket total).
  const grouped = useMemo(() => {
    const byBucket = new Map();
    rows.forEach((row) => {
      if (!byBucket.has(row.bucket)) byBucket.set(row.bucket, { bucket: row.bucket, total: 0, items: [] });
      const entry = byBucket.get(row.bucket);
      entry.total += row.total;
      entry.items.push(row);
    });
    // Most recent period first.
    return Array.from(byBucket.values()).sort((a, b) => (a.bucket < b.bucket ? 1 : -1));
  }, [rows]);

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>
          <Calendar size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: "-2px" }} />
          Spending Breakdown
        </h2>
      </div>

      {/* Period switcher */}
      <div style={localStyles.periodRow}>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            style={{
              ...localStyles.periodBtn,
              ...(period === p.id ? localStyles.periodBtnActive : {}),
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Type + category filters */}
      <div style={localStyles.filterRow}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={localStyles.select}>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={localStyles.select}>
          <option value="">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading && <div style={styles.emptyState}>Loading breakdown…</div>}
      {error && !loading && <div style={styles.errorText}>{error}</div>}

      {!loading && !error && grouped.length === 0 && (
        <div style={styles.emptyState}>
          No {type === "income" ? "income" : "expenses"}{category ? ` in ${categoryMeta(category).label}` : ""} for this {period}.
        </div>
      )}

      {!loading && !error && grouped.length > 0 && (
        <div style={localStyles.bucketList}>
          {grouped.map((g) => (
            <div key={g.bucket} style={localStyles.bucketCard}>
              <div style={localStyles.bucketHeader}>
                <span style={localStyles.bucketLabel}>{fmtBucket(g.bucket, period)}</span>
                <span
                  style={{
                    ...localStyles.bucketTotal,
                    color: type === "income" ? "#1F6F64" : "#C45D3F",
                  }}
                >
                  {fmtMoney(g.total)}
                </span>
              </div>
              {/* Only show the per-category split when not already filtered to one category */}
              {!category && (
                <div style={localStyles.itemList}>
                  {g.items.map((item) => {
                    const meta = categoryMeta(item.category);
                    return (
                      <div key={item.category} style={localStyles.itemRow}>
                        <span style={{ ...styles.dot, background: meta.color }} />
                        <span style={localStyles.itemLabel}>{meta.label}</span>
                        <span style={localStyles.itemCount}>
                          {item.count} {item.count === 1 ? "entry" : "entries"}
                        </span>
                        <span style={localStyles.itemAmount}>{fmtMoney(item.total)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const localStyles = {
  periodRow: {
    display: "flex",
    gap: 6,
    marginBottom: 14,
    background: "#F4F1EA",
    borderRadius: 8,
    padding: 3,
  },
  periodBtn: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: 13,
    fontWeight: 600,
    color: "#7A7368",
    padding: "8px 0",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  periodBtnActive: {
    background: "#1B2A3A",
    color: "#F4F1EA",
  },
  filterRow: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  select: {
    flex: 1,
    minWidth: 140,
    border: "1px solid #E5E0D6",
    borderRadius: 8,
    padding: "9px 10px",
    fontSize: 13.5,
    fontFamily: "'Inter', sans-serif",
    background: "#fff",
    color: "#1B2A3A",
  },
  bucketList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 420,
    overflowY: "auto",
  },
  bucketCard: {
    border: "1px solid #EDE8DD",
    borderRadius: 10,
    padding: "12px 14px",
    background: "#FCFBF8",
  },
  bucketHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  bucketLabel: {
    fontFamily: "'Fraunces', serif",
    fontSize: 15.5,
    fontWeight: 600,
    color: "#1B2A3A",
  },
  bucketTotal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 16,
    fontWeight: 700,
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 6,
    paddingTop: 8,
    borderTop: "1px solid #EDE8DD",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    padding: "3px 0",
  },
  itemLabel: {
    flex: 1,
    color: "#3A332B",
  },
  itemCount: {
    fontSize: 11.5,
    color: "#9B8F7A",
  },
  itemAmount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    fontWeight: 600,
    color: "#5C5448",
    minWidth: 80,
    textAlign: "right",
  },
};
