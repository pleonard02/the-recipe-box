const mongoose = require("mongoose");
const weeklyBuySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Please enter a quantity."],
      min: [0.01, "Quantity must be greater than zero."],
    },
    unit: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("WeeklyBuy", weeklyBuySchema);
