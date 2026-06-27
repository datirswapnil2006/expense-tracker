// src/components/SummaryRow.jsx
import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { styles } from "../styles.js";
import { fmtMoney } from "../categories.js";

export default function SummaryRow({ totals }) {
  const isPositive = totals.balance >= 0;
  return (
    <div style={styles.summaryRow}>
      <div style={{ ...styles.summaryCard, ...styles.balanceCard }}>
        <div style={styles.summaryLabelRow}>
          <Wallet size={15} strokeWidth={2} />
          <span style={styles.summaryLabel}>CURRENT BALANCE</span>
        </div>
        <div
          style={{
            ...styles.balanceFigure,
            color: isPositive ? "#F4F1EA" : "#FFD8C7",
          }}
        >
          {fmtMoney(totals.balance)}
        </div>
        <div style={styles.balanceUnderline} />
      </div>

      <div style={styles.summaryCard}>
        <div style={styles.summaryLabelRow}>
          <TrendingUp size={15} strokeWidth={2} color="#2A9D8F" />
          <span style={styles.summaryLabel}>TOTAL INCOME</span>
        </div>
        <div style={{ ...styles.summaryFigure, color: "#1F6F64" }}>
          {fmtMoney(totals.income)}
        </div>
      </div>

      <div style={styles.summaryCard}>
        <div style={styles.summaryLabelRow}>
          <TrendingDown size={15} strokeWidth={2} color="#C45D3F" />
          <span style={styles.summaryLabel}>TOTAL EXPENSES</span>
        </div>
        <div style={{ ...styles.summaryFigure, color: "#C45D3F" }}>
          {fmtMoney(totals.expense)}
        </div>
      </div>
    </div>
  );
}
