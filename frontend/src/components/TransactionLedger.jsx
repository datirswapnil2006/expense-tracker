// src/components/TransactionLedger.jsx
import React, { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { styles } from "../styles.js";
import { categoryMeta, fmtMoney, fmtDate } from "../categories.js";

export default function TransactionLedger({ transactions, filterType, setFilterType, onDelete, highlightedId }) {
  const rowRefs = useRef({});

  // When a new (or just-modified) row is highlighted, scroll it into view.
  // This matters most for backdated entries: they can land far down the
  // date-sorted list, outside the currently visible/scrolled area of the
  // ledger's own scroll container — without this, the highlight itself
  // would be invisible until the user manually scrolls to find it.
  useEffect(() => {
    if (highlightedId && rowRefs.current[highlightedId]) {
      rowRefs.current[highlightedId].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedId]);

  return (
    <div style={styles.panel}>
      <style>{`
        @keyframes row-highlight {
          0% { background: #FCEEDB; }
          100% { background: transparent; }
        }
        .ledger-row-highlighted {
          animation: row-highlight 2.2s ease-out;
        }
      `}</style>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>Transaction History</h2>
        <div style={styles.filterTabs}>
          {["all", "income", "expense"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                ...styles.filterTab,
                ...(filterType === f ? styles.filterTabActive : {}),
              }}
            >
              {f === "all" ? "All" : f === "income" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.ledgerColumnLabels}>
        <span style={{ flex: "0 0 64px" }}>Date</span>
        <span style={{ flex: 1 }}>Description</span>
        <span className="ledger-category" style={{ flex: "0 0 110px" }}>Category</span>
        <span style={{ flex: "0 0 90px", textAlign: "right" }}>Amount</span>
        <span className="ledger-balance" style={{ flex: "0 0 100px", textAlign: "right" }}>Balance</span>
        <span style={{ flex: "0 0 28px" }} />
      </div>

      <div style={styles.ledgerList}>
        {transactions.length === 0 ? (
          <div style={styles.emptyState}>
            No entries here yet. Add your first transaction to start the ledger.
          </div>
        ) : (
          transactions.map((t) => {
            const meta = categoryMeta(t.category);
            const isIncome = t.type === "income";
            const id = t._id || t.id;
            const isHighlighted = id === highlightedId;
            return (
              <div
                key={id}
                ref={(el) => { rowRefs.current[id] = el; }}
                style={styles.ledgerRow}
                className={`ledger-row${isHighlighted ? " ledger-row-highlighted" : ""}`}
              >
                <span style={styles.ledgerDate}>{fmtDate(t.date)}</span>
                <span className="ledger-note" style={styles.ledgerNote}>{t.note || "—"}</span>
                <span className="ledger-category" style={styles.ledgerCategory}>
                  <span style={{ ...styles.dot, background: meta.color }} />
                  {meta.label}
                </span>
                <span
                  style={{
                    ...styles.ledgerAmount,
                    color: isIncome ? "#1F6F64" : "#C45D3F",
                  }}
                >
                  {isIncome ? "+" : "−"}
                  {fmtMoney(t.amount)}
                </span>
                <span className="ledger-balance" style={styles.ledgerBalance}>
                  {typeof t.runningBalance === "number" ? fmtMoney(t.runningBalance) : "—"}
                </span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => {
                    const label = t.note ? `"${t.note}"` : "this entry";
                    if (window.confirm(`Delete ${label} (${fmtMoney(t.amount)})? This can't be undone.`)) {
                      onDelete(id);
                    }
                  }}
                  aria-label="Delete entry"
                  title="Delete entry"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
