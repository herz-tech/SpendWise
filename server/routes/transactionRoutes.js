const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add a transaction
router.post("/", protect, async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type.",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      note,
    });

    res.status(201).json({
      message: "Transaction added successfully!",
      transaction,
    });
  } catch (error) {
    console.error("Add transaction error:", error.message);

    res.status(500).json({
      message: "Failed to add transaction.",
    });
  }
});

// Get logged-in user's transactions
router.get("/", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions.",
    });
  }
});
// Update an existing transaction
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !["income", "expense"].includes(type)
    ) {
      return res.status(400).json({
        message: "Invalid amount or transaction type.",
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        title,
        amount: Number(amount),
        type,
        category,
        date: date || Date.now(),
        note,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      message: "Transaction updated successfully!",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error.message);

    res.status(500).json({
      message: "Failed to update transaction.",
    });
  }
});
// Delete a transaction
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction.",
    });
  }
});

module.exports = router;