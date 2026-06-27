// src/components/TransactionLedger.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import { styles } from "../styles.js";
import { categoryMeta, fmtMoney, fmtDate } from "../categories.js";

export default function TransactionLedger({ transactions, filterType, setFilterType, onDelete }) {
  return (
    <div style={styles.panel}>
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
        <span style={{ flex: "0 0 110px" }}>Category</span>
        <span style={{ flex: "0 0 90px", textAlign: "right" }}>Amount</span>
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
            return (
              <div key={t._id || t.id} style={styles.ledgerRow} className="ledger-row">
                <span style={styles.ledgerDate}>{fmtDate(t.date)}</span>
                <span style={styles.ledgerNote}>{t.note || "—"}</span>
                <span style={styles.ledgerCategory}>
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
                <button
                  style={styles.deleteBtn}
                  onClick={() => onDelete(t._id || t.id)}
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
