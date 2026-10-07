const RecipeSuggestion = require("../models/RecipeSuggestion");

async function getRecipeSuggestions(req, res) {
  try {
    const suggestions = await RecipeSuggestion.find({
      recipe: req.params.recipeId,
    })

      .populate("author", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Get recipe suggestions error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong getting recipe suggestions." });
  }
}

async function createRecipeSuggestion(req, res) {
  try {
    const { field, suggestedValue, note } = req.body;

    if (req.recipeRole === "chef") {
      return res
        .status(403)
        .json({ message: "Chefs cannot suggest changes to this recipe." });
    }

    if (!field || suggestedValue === undefined) {
      return res
        .status(400)
        .json({ message: "Field and suggested value are required." });
    }

    const allowedFields = [
      "name",
      "description",
      "ingredients",
      "instructions",
      "prepTime",
      "cookTime",
      "servings",
      "category",
      "cuisine",
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        message: "That recipe field cannot be changed through a suggestion.",
      });
    }

    const originalValue = req.recipe[field];

    const suggestion = await RecipeSuggestion.create({
      recipe: req.recipe._id,
      author: req.user._id,
      field,
      originalValue,
      suggestedValue,
      note: note || "",
    });

    await suggestion.populate("author", "username email");

    return res.status(201).json({
      message: "Recipe suggestion submitted successfully.",
      suggestion,
    });
  } catch (error) {
    console.error("Create recipe suggestion error:", error);
    return res.status(500).json({
      message: "Something went wrong while creating the recipe suggestions.",
    });
  }
}

async function reviewRecipeSuggestion(req, res) {
  try {
    const { suggestionId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    if (req.recipeRole !== "executive-chef") {
      return res.status(403).json({
        message: "Only the Executive Chef can approve or reject suggestions.",
      });
    }

    const suggestion = await RecipeSuggestion.findOne({
      _id: suggestionId,
      recipe: req.recipe._id,
    });

    if (!suggestion) {
      return res.status(404).json({ message: "Recipe suggestion not found." });
    }

    if (suggestion.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This suggestion has already been reviewed." });
    }

    if (status === "approved") {
      req.recipe[suggestion.field] = suggestion.suggestedValue;

      await req.recipe.save();
    }

    suggestion.status = status;

    await suggestion.save();

    await suggestion.populate("author", "username email");

    return res.status(200).json({
      message:
        status === "approved"
          ? "Suggestion approved and recipe updated."
          : "Suggested rejection",
      suggestion,
      recipe: req.recipe,
    });
  } catch (error) {
    console.error("Review recipe suggestion error:", error);
    return res
      .status(500)
      .json({
        message: "Something went wrong while reviewing the recipe suggestion.",
      });
  }
}

module.exports = {
  getRecipeSuggestions,
  createRecipeSuggestion,
  reviewRecipeSuggestion,
};
