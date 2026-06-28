// src/categories.js
// Must mirror the enums in backend/models/Transaction.js exactly, since the
// backend will reject anything outside these lists.

export const CATEGORIES = {
  income: [
    { id: "salary", label: "Salary", color: "#2A9D8F" },
    { id: "freelance", label: "Freelance", color: "#52B9AC" },
    { id: "investment", label: "Investment", color: "#7FCFC3" },
    { id: "gift", label: "Gift", color: "#A8DED5" },
    { id: "other_income", label: "Other", color: "#CBEAE3" },
  ],
  expense: [
    { id: "groceries", label: "Groceries", color: "#E07856" },
    { id: "rent", label: "Rent", color: "#C45D3F" },
    { id: "entertainment", label: "Entertainment", color: "#D4A24C" },
    { id: "transport", label: "Transport", color: "#B07A9E" },
    { id: "utilities", label: "Utilities", color: "#6B8CAE" },
    { id: "health", label: "Health", color: "#8C7A6B" },
    { id: "other_expense", label: "Other", color: "#A89A8C" },
  ],
};

export const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense];

export const categoryMeta = (id) =>
  ALL_CATEGORIES.find((c) => c.id === id) || { label: id, color: "#999" };

export const fmtMoney = (n) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export const fmtDate = (iso) => {
  const d = new Date(iso.slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Formats a "bucket" string from the /transactions/breakdown endpoint into
// a human-readable label. Bucket shape depends on the period:
//   day   -> "2026-06-09"  ->  "Jun 9, 2026"
//   week  -> "2026-W24"    ->  "Week 24, 2026"
//   month -> "2026-06"     ->  "June 2026"
//   year  -> "2026"        ->  "2026"
export const fmtBucket = (bucket, period) => {
  if (period === "week") {
    const [year, week] = bucket.split("-W");
    return `Week ${week}, ${year}`;
  }
  if (period === "year") {
    return bucket;
  }
  if (period === "month") {
    const [year, month] = bucket.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  // day
  const d = new Date(bucket + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
