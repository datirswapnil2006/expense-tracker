// routes/transactions.js
//
// Express routes for the expense tracker. Mount with:
//   app.use("/api/transactions", require("./routes/transactions"));
//
// Assumes an `authMiddleware` that sets `req.userId` from a verified
// session/JWT — every query below is scoped to that user. Never let a
// client pass userId directly in the body/query and trust it.

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/transactions
// List a user's transactions, optionally filtered by type/date range.
// Supports simple pagination so the ledger list doesn't load unbounded.
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { type, from, to, page = 1, limit = 50 } = req.query;

    const filter = { userId: req.userId };
    if (type === "income" || type === "expense") filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({ transactions, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/transactions
// Create a new income/expense entry.
// ---------------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { type, category, amount, note, date } = req.body;

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      category,
      amount,
      note,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({ transaction });
  } catch (err) {
    // Mongoose validation errors (bad enum, amount <= 0, etc.) land here.
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create transaction." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/transactions/:id
// Delete a transaction. Scoped to userId so you can't delete someone
// else's entry just by guessing an ObjectId.
// ---------------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deleted) return res.status(404).json({ error: "Transaction not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete transaction." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/transactions/summary
// The dashboard's core numbers: total income, total expense, balance.
// This is the kind of aggregation MongoDB is built for — do the math in
// the database, not by pulling every document into Node and summing in JS.
// ---------------------------------------------------------------------------
router.get("/summary", async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // result looks like: [{ _id: "income", total: 5010 }, { _id: "expense", total: 1972.5 }]
    const totals = { income: 0, expense: 0 };
    result.forEach((r) => { totals[r._id] = r.total; });

    res.json({
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute summary." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/transactions/by-category
// Powers the pie chart: total spent per expense category.
// ---------------------------------------------------------------------------
router.get("/by-category", async (req, res) => {
  try {
    const { type = "expense" } = req.query;

    const breakdown = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), type } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
          count: 1,
        },
      },
    ]);

    res.json({ breakdown });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute category breakdown." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/transactions/trend
// Powers the bar chart: income vs. expense totals bucketed by day
// (swap $dateToString's format to "%Y-%m" for a monthly view instead).
// ---------------------------------------------------------------------------
router.get("/trend", async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { userId: new mongoose.Types.ObjectId(req.userId) };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const trend = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.day",
          income: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: { _id: 0, date: "$_id", income: 1, expense: 1 },
      },
    ]);

    res.json({ trend });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute trend." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/transactions/breakdown
// Spending broken down by time period AND category together — answers
// questions like "how much did I spend on health this week/month/year."
//
// Query params:
//   period   = "day" | "week" | "month" | "year"  (default: "month")
//   type     = "income" | "expense"                (default: "expense")
//   category = optional — filter to a single category (e.g. "health")
//   from/to  = optional ISO date strings to bound the range
//
// Response shape:
//   { period: "week", rows: [ { bucket: "2026-W26", category: "health", total: 100, count: 2 }, ... ] }
//
// "bucket" is a period label (e.g. "2026-06-23" for a day, "2026-W26" for
// an ISO week, "2026-06" for a month, "2026" for a year) — the frontend
// groups/sorts on this directly without re-deriving it from raw dates.
// ---------------------------------------------------------------------------
const PERIOD_FORMATS = {
  day: "%Y-%m-%d",
  week: "%G-W%V", // ISO 8601 week-numbering year + week number
  month: "%Y-%m",
  year: "%Y",
};

router.get("/breakdown", async (req, res) => {
  try {
    const { period = "month", type = "expense", category, from, to } = req.query;

    if (!PERIOD_FORMATS[period]) {
      return res.status(400).json({ error: "period must be one of: day, week, month, year." });
    }

    const match = { userId: new mongoose.Types.ObjectId(req.userId), type };
    if (category) match.category = category;
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const rows = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            bucket: { $dateToString: { format: PERIOD_FORMATS[period], date: "$date" } },
            category: "$category",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.bucket": 1, total: -1 } },
      {
        $project: {
          _id: 0,
          bucket: "$_id.bucket",
          category: "$_id.category",
          total: 1,
          count: 1,
        },
      },
    ]);

    res.json({ period, rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute breakdown." });
  }
});

module.exports = router;
