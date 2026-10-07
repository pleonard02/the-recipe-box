const mongoose = require("mongoose");

const recipeNoteSchema = mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const RecipeNote = mongoose.model("RecipeNote", recipeNoteSchema);

module.exports = RecipeNote;
