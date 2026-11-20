
const express = require("express");
const CategoryBudget = require("../models/CategoryBudget");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Save or update a category budget
router.post("/", protect, async (req, res) => {
  try {
    const { month, category, amount } = req.body;

    if (!month || !/^\d{4}-\d{2}$/.test(month) || !category) {
      return res.status(400).json({
        message: "Please provide a valid month and category.",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Enter a valid budget amount.",
      });
    }

    const budget = await CategoryBudget.findOneAndUpdate(
      {
        user: req.user._id,
        month,
        category,
      },
      { amount: Number(amount) },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Category budget saved successfully!",
      budget,
    });
  } catch (error) {
    console.error("Category budget save error:", error);
    res.status(500).json({
      message: "Could not save category budget.",
    });
  }
});

// Get all category budgets for a selected month
router.get("/:month", protect, async (req, res) => {
  try {
    const budgets = await CategoryBudget.find({
      user: req.user._id,
      month: req.params.month,
    });

    res.status(200).json({ budgets });
  } catch (error) {
    console.error("Category budget fetch error:", error);
    res.status(500).json({
      message: "Could not load category budgets.",
    });
  }
});

module.exports = router;
