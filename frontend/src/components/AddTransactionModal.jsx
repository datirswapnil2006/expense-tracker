// src/components/AddTransactionModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { styles } from "../styles.js";
import { CATEGORIES } from "../categories.js";

export default function AddTransactionModal({ onClose, onAdd }) {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(CATEGORIES.expense[0].id);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = CATEGORIES[type];

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0].id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!date) {
      setError("Pick a date for this entry.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      // onAdd is async — it calls the backend, then closes the modal
      // once the server confirms the entry was saved.
      await onAdd({ type, category, amount: numAmount, note: note.trim(), date });
    } catch (err) {
      // Surfaces backend validation errors too, e.g. a Mongoose
      // ValidationError message from the /transactions POST route.
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>New Ledger Entry</h3>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.typeToggle}>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              style={{
                ...styles.typeToggleBtn,
                ...(type === "expense" ? styles.typeToggleBtnExpenseActive : {}),
              }}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              style={{
                ...styles.typeToggleBtn,
                ...(type === "income" ? styles.typeToggleBtnIncomeActive : {}),
              }}
            >
              Income
            </button>
          </div>

          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Amount</span>
              <div style={styles.amountInputWrap}>
                <span style={styles.currencyPrefix}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.amountInput}
                  autoFocus
                />
              </div>
            </label>

            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
                max={new Date().toISOString().slice(0, 10)}
              />
            </label>
          </div>

          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.input}
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Note (optional)</span>
            <input
              type="text"
              placeholder="e.g. Weekly grocery run"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.input}
              maxLength={80}
            />
          </label>

          {error && <div style={styles.errorText}>{error}</div>}

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? "Saving…" : `Add ${type === "income" ? "Income" : "Expense"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
