const mongoose = require("mongoose");

const recipeShareSchema = mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["chef", "sous-chef", "co-executive-chef"],
      default: chef,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

recipeShareSchema.index({ recipe: 1, user: 1 }, { unique: true });

const RecipeShare = mongoose.model("RecipeShare", recipeShareSchema);

module.exports = RecipeShare;
