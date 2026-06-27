// src/components/SpendingChart.jsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { styles } from "../styles.js";
import { fmtMoney } from "../categories.js";

export default function SpendingChart({ pieData, totalExpense }) {
  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Spending by Category</h2>
      {pieData.length === 0 ? (
        <div style={styles.emptyState}>No expenses logged yet.</div>
      ) : (
        <>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => fmtMoney(value)}
                  contentStyle={{
                    background: "#1B2A3A",
                    border: "none",
                    borderRadius: 8,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                  }}
                  labelStyle={{ color: "#F4F1EA" }}
                  itemStyle={{ color: "#F4F1EA" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.legendGrid}>
            {pieData.map((entry) => (
              <div key={entry.category} style={styles.legendItem}>
                <span style={{ ...styles.dot, background: entry.color }} />
                <span style={styles.legendLabel}>{entry.label}</span>
                <span style={styles.legendPct}>
                  {((entry.value / totalExpense) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
