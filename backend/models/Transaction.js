// models/Transaction.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const INCOME_CATEGORIES = ["salary", "freelance", "investment", "gift", "other_income"];
const EXPENSE_CATEGORIES = ["groceries", "rent", "entertainment", "transport", "utilities", "health", "other_expense"];

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (this.type === "income") return INCOME_CATEGORIES.includes(value);
          if (this.type === "expense") return EXPENSE_CATEGORIES.includes(value);
          return false;
        },
        message: (props) => `"${props.value}" is not a valid category for this transaction type.`,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero."],
      set: (v) => Math.round(v * 100) / 100,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 140,
      default: "",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

transactionSchema.virtual("signedAmount").get(function () {
  return this.type === "expense" ? -this.amount : this.amount;
});

transactionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Transaction", transactionSchema);
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;