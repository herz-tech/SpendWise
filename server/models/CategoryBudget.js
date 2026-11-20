
const mongoose = require("mongoose");

const categoryBudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

categoryBudgetSchema.index(
  { user: 1, month: 1, category: 1 },
  { unique: true }
);

const CategoryBudget = mongoose.model(
  "CategoryBudget",
  categoryBudgetSchema
);

module.exports = CategoryBudget;
