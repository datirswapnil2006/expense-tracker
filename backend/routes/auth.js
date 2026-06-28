// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, name });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    if (err.name === "ValidationError") {
      // Pull out the first validation message (e.g. "Please enter a valid
      // email address." or the name-plausibility message) so the user
      // sees exactly what was wrong, not a generic failure.
      const firstError = Object.values(err.errors)[0];
      return res.status(400).json({ error: firstError ? firstError.message : "Invalid input." });
    }
    if (err.code === 11000) {
      // Duplicate key error from the unique email index — a rare race
      // condition where two signups for the same email happen at almost
      // the exact same moment, slipping past the findOne check above.
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    res.status(500).json({ error: "Failed to create account." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // .select("+passwordHash") because the schema excludes it by default
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+passwordHash");
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in." });
  }
});

module.exports = router;
