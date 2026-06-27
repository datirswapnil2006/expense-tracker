// src/components/TrendChart.jsx
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { styles } from "../styles.js";
import { fmtMoney, fmtDate } from "../categories.js";

export default function TrendChart({ barData }) {
  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Income vs. Expenses</h2>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={barData} barGap={2} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 11, fill: "#7A7368", fontFamily: "Inter" }}
              axisLine={{ stroke: "#E5E0D6" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#7A7368", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => fmtMoney(value)}
              labelFormatter={fmtDate}
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
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: "Inter", paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="income" fill="#2A9D8F" radius={[3, 3, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="#E07856" radius={[3, 3, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
