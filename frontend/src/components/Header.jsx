// src/components/Header.jsx
import React from "react";
import { Plus } from "lucide-react";
import { styles } from "../styles.js";

export default function Header({ onAdd }) {
  return (
    <div style={styles.header}>
      <div>
        <div style={styles.eyebrow}>LEDGER · PERSONAL FINANCE</div>
        <h1 style={styles.title} className="app-title">Your Balance Sheet</h1>
      </div>
      <button style={styles.addBtn} className="add-btn" onClick={onAdd}>
        <Plus size={18} strokeWidth={2.5} />
        <span>New Entry</span>
      </button>
    </div>
  );
}
