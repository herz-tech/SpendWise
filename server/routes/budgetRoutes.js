
const express = require("express");
const Budget = require("../models/Budget");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

// Save or update a monthly budget
router.post("/", protect, async (req, res) => {
  try {
    const { month, amount } = req.body;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid month." });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Enter a valid budget amount." });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Budget saved successfully!",
      budget,
    });
  } catch (error) {
    console.error("Save budget error:", error);
    res.status(500).json({ message: "Could not save budget." });
  }
});

// Get the logged-in user's budget for a month
router.get("/:month", protect, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      user: req.user._id,
      month: req.params.month,
    });

    res.status(200).json({ budget });
  } catch (error) {
    console.error("Get budget error:", error);
    res.status(500).json({ message: "Could not load budget." });
  }
});

module.exports = router;
