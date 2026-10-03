const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
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
    ingredients: [
        {
        name: String,
        quantity: Number,
        unit: String,
        },
    ],
    instructions: {
        type: String,
        required: [true, "Please enter instructions for the recipe."],
    },
    prepTime: [Number],
    CookTime: [Number],
    servings: [Number],
    isPublic: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;