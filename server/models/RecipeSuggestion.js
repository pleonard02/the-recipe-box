const mongoose = require('mongoose');

const recipeSuggestionSchema = mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    field: {
        type: String,
        required: true,
        enum: [
            "name",
            "description",
            "ingredients",
            "instructions",
            "prepTime",
            "cookTime",
            "servings",
            "category",
            "cuisine",
        ],
    },
    originalValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    suggestedValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    note: {
        type: String,
        trim: true,
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, {
    timestamps: true,
});

const RecipeSuggestion = mongoose.model(
    "RecipeSuggestion",
    recipeSuggestionSchema,
);

module.exports = RecipeSuggestion;