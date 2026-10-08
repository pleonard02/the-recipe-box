const mongoose = require("mongoose");

const shoppingListItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name for the item."],
      trim: true,
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
    weeklyBuy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyBuy",
      default: null,
    },
    kitchenItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KitchenItem",
      default: null,
    },
    status: {
      type: String,
      enum: ["planned", "in-cart", "purchased"],
      default: "planned",
    },
  },
  {
    timestamps: true,
  },
);

const ShoppingListItem = mongoose.model(
  "ShoppingListItem",
  shoppingListItemSchema,
);

module.exports = ShoppingListItem;
