const Recipe = require("../models/Recipe");
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

    if (!["chef", "sous-chef", "co-executive-chef"].includes(req.recipeRole)) {
      return res
        .status(403)
        .json({ message: "Only invited collaborators can suggest changes to this recipe." });
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

    if (!["ingredients", "prepTime", "cookTime", "servings"].includes(field) &&
        (typeof suggestedValue !== "string" || (["name", "instructions"].includes(field) && !suggestedValue.trim()))) {
      return res.status(400).json({ message: "Enter valid text for this recipe field." });
    }
    const candidate = new Recipe(req.recipe.toObject());
    candidate.set(field, suggestedValue);
    try {
      await candidate.validate([field]);
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }
    if (["prepTime", "cookTime", "servings"].includes(field)) {
      const value = candidate[field];
      if (!Number.isFinite(value) || value < (field === "servings" ? 1 : 0)) {
        return res.status(400).json({ message: "Enter a valid nonnegative time or at least one serving." });
      }
    }
    if (field === "ingredients" && (!Array.isArray(suggestedValue) || !suggestedValue.length || suggestedValue.some((item) => !item || typeof item.name !== "string" || !item.name.trim() || (item.quantity != null && (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 0))))) {
      return res.status(400).json({ message: "Each ingredient needs a name and a valid nonnegative quantity." });
    }
    const originalValue = req.recipe[field];

    const suggestion = await RecipeSuggestion.create({
      recipe: req.recipe._id,
      author: req.user._id,
      field,
      originalValue,
      suggestedValue: candidate.get(field),
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
      const originalValue = ["prepTime", "cookTime", "servings"].includes(suggestion.field)
        ? require("../utils/recipeNumber")(suggestion.originalValue)
        : suggestion.originalValue;
      if (JSON.stringify(req.recipe[suggestion.field]) !== JSON.stringify(originalValue)) {
        return res.status(409).json({ message: "This field changed since the suggestion was submitted. Reject it and ask for an updated suggestion." });
      }
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
          : "Suggestion rejected.",
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
