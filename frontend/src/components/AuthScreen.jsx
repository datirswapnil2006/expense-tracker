// src/components/AuthScreen.jsx
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import * as api from "../api.js";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await api.login(email, password)
          : await api.signup(email, password, name);

      localStorage.setItem("token", result.token);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.iconBadge}>
            <Wallet size={20} strokeWidth={2} color="#F4F1EA" />
          </div>
          <div>
            <div style={styles.eyebrow}>LEDGER · PERSONAL FINANCE</div>
            <h1 style={styles.title}>{mode === "login" ? "Welcome back" : "Create your ledger"}</h1>
          </div>
        </div>

        <div style={styles.tabRow}>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); }}
            style={{ ...styles.tab, ...(mode === "signup" ? styles.tabActive : {}) }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "signup" && (
            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </label>
          )}

          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoFocus
            />
          </label>

          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Password</span>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              minLength={6}
            />
          </label>

          {error && <div style={styles.errorText}>{error}</div>}

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting
              ? "Please wait…"
              : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button type="button" style={styles.linkBtn} onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button type="button" style={styles.linkBtn} onClick={() => setMode("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F4F1EA",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    boxSizing: "border-box",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #EDE8DD",
    padding: "32px 28px",
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 8px 30px rgba(27,42,58,0.08)",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#1B2A3A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#9B8F7A",
    marginBottom: 3,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
    color: "#1B2A3A",
  },
  tabRow: {
    display: "flex",
    gap: 4,
    background: "#F4F1EA",
    borderRadius: 8,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
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
  tabActive: {
    background: "#1B2A3A",
    color: "#F4F1EA",
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#7A7368" },
  input: {
    border: "1px solid #E5E0D6",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    background: "#fff",
    color: "#1B2A3A",
    outline: "none",
  },
  errorText: {
    fontSize: 12.5,
    color: "#C45D3F",
    background: "#FCEEE7",
    padding: "8px 10px",
    borderRadius: 6,
  },
  submitBtn: {
    background: "#1B2A3A",
    color: "#F4F1EA",
    border: "none",
    borderRadius: 8,
    padding: "12px 0",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
    fontFamily: "'Inter', sans-serif",
  },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: "#7A7368",
    marginTop: 18,
    marginBottom: 0,
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#1B2A3A",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
  },
};
