const mongoose = require("mongoose");
const recipeNumber = require("../utils/recipeNumber");

const recipeSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please enter the recipe name."],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    cuisine: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      enum: ["user", "mealdb"],
      default: "user",
    },

    externalId: {
      type: String,
      default: null,
    },
    ingredients: {
      type: [{
        name: { type: String, required: [true, "Each ingredient needs a name."], trim: true },
        quantity: { type: Number, min: [0, "Ingredient quantity cannot be negative."], validate: { validator: (value) => value == null || Number.isFinite(value), message: "Enter a finite ingredient quantity." } },
        unit: { type: String, trim: true, default: "" },
      }],
      validate: { validator: (value) => value.length > 0, message: "Add at least one ingredient." },
    },
    instructions: {
      type: String,
      required: [true, "Please enter instructions for the recipe."],
      trim: true,
    },
    prepTime: { type: Number, cast: recipeNumber, min: [0, "Prep time cannot be negative."] },
    cookTime: { type: Number, cast: recipeNumber, min: [0, "Cook time cannot be negative."] },
    servings: { type: Number, cast: (value) => recipeNumber(Array.isArray(value) && value.length === 1 && value[0] === 0 ? null : value), min: [1, "Servings must be at least one."] },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
