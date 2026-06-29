// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header.jsx";
import SummaryRow from "./components/SummaryRow.jsx";
import TransactionLedger from "./components/TransactionLedger.jsx";
import SpendingChart from "./components/SpendingChart.jsx";
import TrendChart from "./components/TrendChart.jsx";
import AddTransactionModal from "./components/AddTransactionModal.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import BreakdownExplorer from "./components/BreakdownExplorer.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { LogOut } from "lucide-react";
import { fontImports, styles } from "./styles.js";
import { categoryMeta } from "./categories.js";
import * as api from "./api.js";

export default function App() {
  // null = not logged in yet (shows AuthScreen). Checked once on mount in
  // case a token from a previous session is still in localStorage.
  const [user, setUser] = useState(undefined); // undefined = "still checking"
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- On mount: is there already a token saved from a previous login? ----
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null); // not logged in -> show AuthScreen
    }
  }, []);

  const handleAuthenticated = (authedUser) => {
    localStorage.setItem("user", JSON.stringify(authedUser));
    setUser(authedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTransactions([]);
  };

  // ---- Initial load from the backend (only once a user is present) ----
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const { transactions } = await api.fetchTransactions({ limit: 200 });
        if (!cancelled) setTransactions(transactions);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // ---- Create ----
  // Errors are intentionally re-thrown, not swallowed here — the modal's
  // own handleSubmit catches them and displays them inline next to the
  // form field they relate to (e.g. a validation message), which reads
  // better than a generic toast for something the user needs to go fix.
  const addTransaction = useCallback(async (tx) => {
    const { transaction } = await api.createTransaction(tx);
    setTransactions((prev) => [transaction, ...prev]);
    setModalOpen(false);
    showToast("Entry created successfully.");

    // Highlight the new row wherever it lands after the list re-sorts by
    // date — matters most for backdated entries, which don't land at the
    // top and could otherwise feel like they "disappeared."
    const newId = transaction._id || transaction.id;
    setHighlightedId(newId);
    setTimeout(() => setHighlightedId((current) => (current === newId ? null : current)), 2200);
  }, [showToast]);

  // ---- Delete ----
  const deleteTransaction = useCallback(async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== id));
      showToast("Entry deleted successfully.");
    } catch (err) {
      showToast(err.message || "Could not delete entry.", "error");
    }
  }, [showToast]);

  // ---- Derived state (same shape as the prototype, now fed by real data) ----
  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const pieData = useMemo(() => {
    const byCategory = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });
    return Object.entries(byCategory)
      .map(([category, value]) => ({
        category,
        value,
        label: categoryMeta(category).label,
        color: categoryMeta(category).color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const barData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const byDate = {};
    sorted.forEach((t) => {
      const day = t.date.slice(0, 10);
      if (!byDate[day]) byDate[day] = { date: day, income: 0, expense: 0 };
      byDate[day][t.type] += t.amount;
    });
    return Object.values(byDate).slice(-10);
  }, [transactions]);

  // Running balance, computed like a real bank statement: oldest entry
  // first, each one's balance = previous balance + income - expense.
  // Same-day entries are ordered by createdAt (when they were actually
  // saved) so the running total stays stable and doesn't reshuffle
  // between renders when multiple transactions share a date.
  const transactionsWithBalance = useMemo(() => {
    const chronological = [...transactions].sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    let runningBalance = 0;
    const balanceById = new Map();
    chronological.forEach((t) => {
      runningBalance += t.type === "income" ? t.amount : -t.amount;
      balanceById.set(t._id || t.id, runningBalance);
    });

    return transactions.map((t) => ({
      ...t,
      runningBalance: balanceById.get(t._id || t.id),
    }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactionsWithBalance].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filterType === "all") return sorted;
    return sorted.filter((t) => t.type === filterType);
  }, [transactionsWithBalance, filterType]);

  // Still checking localStorage for an existing session — avoid a flash
  // of the login screen if we're about to find a valid token.
  if (user === undefined) {
    return <div style={styles.page} />;
  }

  if (user === null) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div style={styles.page}>
      <style>{fontImports}</style>
      <div style={styles.shell} className="page-shell">
        <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Header onAdd={() => setModalOpen(true)} />
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "1px solid #E5E0D6",
              borderRadius: 8, padding: "8px 14px", fontSize: 13,
              fontWeight: 600, color: "#7A7368", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", flexShrink: 0,
            }}
          >
            <LogOut size={14} strokeWidth={2} />
            Log Out
          </button>
        </div>

        {loading && <div style={styles.emptyState}>Loading your ledger…</div>}

        {loadError && !loading && (
          <div style={{ ...styles.errorText, marginBottom: 20 }}>
            Couldn't reach the server: {loadError}. Is the backend running on port 4000?
          </div>
        )}

        {!loading && !loadError && (
          <>
            <SummaryRow totals={totals} />
            <div style={styles.mainGrid} className="main-grid">
              <div style={styles.leftCol}>
                <TransactionLedger
                  transactions={filteredTransactions}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  onDelete={deleteTransaction}
                  highlightedId={highlightedId}
                />
                <BreakdownExplorer />
              </div>
              <div style={styles.rightCol}>
                <SpendingChart pieData={pieData} totalExpense={totals.expense} />
                <TrendChart barData={barData} />
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <AddTransactionModal onClose={() => setModalOpen(false)} onAdd={addTransaction} />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
