// src/styles.js
// Shared style tokens and the inline style objects used across components.

const fontImports = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .ledger-row {
    border-bottom: 1px solid #EDE8DD;
    transition: background 0.15s ease;
  }
  .ledger-row:last-child {
    border-bottom: none;
  }
  .ledger-row:hover {
    background: #F7F4ED;
  }
  .ledger-row button[aria-label="Delete entry"] {
    opacity: 0.55;
  }
  .ledger-row:hover button[aria-label="Delete entry"] {
    opacity: 1;
    background: #FCEEE7;
  }
  .ledger-row button[aria-label="Delete entry"]:active {
    opacity: 1;
    background: #FCEEE7;
  }

  /* ---------------------------------------------------------------------
     Responsive overrides. Inline styles can't use media queries, so the
     layout-shifting rules (grid columns, font sizes, column visibility)
     live here and target the same classNames assigned in styles.js.
     Breakpoints: 1024px (laptop/tablet), 640px (mobile).
  --------------------------------------------------------------------- */

  /* Laptop / tablet: stack the two-column main grid, keep summary cards in a row */
  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr !important;
    }
  }

  /* Mobile: stack everything, shrink type, collapse the ledger's category column */
  @media (max-width: 640px) {
    .page-shell {
      padding: 20px 14px !important;
    }
    .app-title {
      font-size: 26px !important;
    }
    .summary-row {
      grid-template-columns: 1fr !important;
    }
    .balance-figure {
      font-size: 30px !important;
    }
    .summary-figure {
      font-size: 22px !important;
    }
    .header-row {
      align-items: flex-start !important;
    }
    .add-btn span {
      display: none;
    }
    .add-btn {
      padding: 11px !important;
    }
    .ledger-category {
      display: none !important;
    }
    .ledger-note {
      white-space: normal !important;
    }
    .legend-grid {
      grid-template-columns: 1fr !important;
    }
    .modal-card {
      max-width: 100% !important;
    }
    .field-row {
      flex-direction: column !important;
    }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F4F1EA",
    fontFamily: "'Inter', sans-serif",
    color: "#1B2A3A",
    padding: "32px 20px",
    boxSizing: "border-box",
  },
  shell: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    color: "#9B8F7A",
    marginBottom: 6,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 34,
    fontWeight: 600,
    margin: 0,
    color: "#1B2A3A",
    letterSpacing: "-0.01em",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1B2A3A",
    color: "#F4F1EA",
    border: "none",
    borderRadius: 8,
    padding: "11px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 2px 8px rgba(27,42,58,0.18)",
  },

  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr",
    gap: 14,
    marginBottom: 24,
  },
  summaryCard: {
    background: "#FFFFFF",
    borderRadius: 12,
    padding: "20px 22px",
    border: "1px solid #EDE8DD",
  },
  balanceCard: {
    background: "linear-gradient(135deg, #1B2A3A 0%, #243B52 100%)",
    border: "none",
    position: "relative",
    overflow: "hidden",
  },
  summaryLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#9B8F7A",
  },
  balanceFigure: {
    fontFamily: "'Fraunces', serif",
    fontSize: 38,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  balanceUnderline: {
    width: 46,
    height: 3,
    borderRadius: 2,
    background: "#D4A24C",
    marginTop: 10,
  },
  summaryFigure: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 26,
    fontWeight: 600,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 20,
    alignItems: "start",
  },
  leftCol: { display: "flex", flexDirection: "column", gap: 20 },
  rightCol: { display: "flex", flexDirection: "column", gap: 20 },

  panel: {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid #EDE8DD",
    padding: "20px 22px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 10,
  },
  panelTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    color: "#1B2A3A",
  },
  filterTabs: {
    display: "flex",
    gap: 4,
    background: "#F4F1EA",
    borderRadius: 8,
    padding: 3,
  },
  filterTab: {
    border: "none",
    background: "transparent",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#7A7368",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  filterTabActive: {
    background: "#1B2A3A",
    color: "#F4F1EA",
  },

  ledgerColumnLabels: {
    display: "flex",
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#B3A88F",
    padding: "0 4px 8px 4px",
    borderBottom: "2px solid #1B2A3A",
  },
  ledgerList: {
    maxHeight: 480,
    overflowY: "auto",
  },
  ledgerRow: {
    display: "flex",
    alignItems: "center",
    padding: "11px 4px",
  },
  ledgerDate: {
    flex: "0 0 64px",
    fontSize: 12.5,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#9B8F7A",
  },
  ledgerNote: {
    flex: 1,
    fontSize: 14,
    color: "#1B2A3A",
    paddingRight: 8,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ledgerCategory: {
    flex: "0 0 110px",
    fontSize: 12.5,
    color: "#5C5448",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  ledgerAmount: {
    flex: "0 0 90px",
    textAlign: "right",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  deleteBtn: {
    flex: "0 0 28px",
    display: "flex",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    color: "#C45D3F",
    cursor: "pointer",
    opacity: 0.55,
    transition: "opacity 0.15s ease, background 0.15s ease",
    padding: 4,
    borderRadius: 6,
  },
  emptyState: {
    padding: "32px 8px",
    textAlign: "center",
    color: "#9B8F7A",
    fontSize: 13.5,
  },

  legendGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px 16px",
    marginTop: 14,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12.5,
  },
  legendLabel: {
    flex: 1,
    color: "#5C5448",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  legendPct: {
    fontFamily: "'JetBrains Mono', monospace",
    color: "#9B8F7A",
    fontSize: 11.5,
  },

  // Modal
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(27,42,58,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 20,
    boxSizing: "border-box",
  },
  modal: {
    background: "#FAF8F4",
    borderRadius: 14,
    width: "100%",
    maxWidth: 420,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#7A7368",
    padding: 4,
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },

  typeToggle: {
    display: "flex",
    gap: 8,
  },
  typeToggleBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    border: "1px solid #E5E0D6",
    background: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    color: "#7A7368",
    fontFamily: "'Inter', sans-serif",
  },
  typeToggleBtnExpenseActive: {
    background: "#FCEEE7",
    borderColor: "#E07856",
    color: "#C45D3F",
  },
  typeToggleBtnIncomeActive: {
    background: "#E6F4F1",
    borderColor: "#2A9D8F",
    color: "#1F6F64",
  },

  fieldRow: {
    display: "flex",
    gap: 12,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#7A7368",
  },
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
  amountInputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #E5E0D6",
    borderRadius: 8,
    background: "#fff",
    paddingLeft: 12,
  },
  currencyPrefix: {
    color: "#9B8F7A",
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
  },
  amountInput: {
    border: "none",
    outline: "none",
    padding: "10px 12px 10px 4px",
    fontSize: 15,
    fontFamily: "'JetBrains Mono', monospace",
    width: "100%",
    background: "transparent",
    color: "#1B2A3A",
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
};

export { fontImports, styles };
