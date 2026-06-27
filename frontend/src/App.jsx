// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header.jsx";
import SummaryRow from "./components/SummaryRow.jsx";
import TransactionLedger from "./components/TransactionLedger.jsx";
import SpendingChart from "./components/SpendingChart.jsx";
import TrendChart from "./components/TrendChart.jsx";
import AddTransactionModal from "./components/AddTransactionModal.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
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
  const addTransaction = useCallback(async (tx) => {
    const { transaction } = await api.createTransaction(tx);
    setTransactions((prev) => [transaction, ...prev]);
    setModalOpen(false);
  }, []);

  // ---- Delete ----
  const deleteTransaction = useCallback(async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== id));
    } catch (err) {
      // In a fuller app, surface this in a toast instead of an alert.
      alert(`Could not delete entry: ${err.message}`);
    }
  }, []);

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

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filterType === "all") return sorted;
    return sorted.filter((t) => t.type === filterType);
  }, [transactions, filterType]);

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
                />
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
    </div>
  );
}
