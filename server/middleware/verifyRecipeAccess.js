const Recipe = require("../models/Recipe");
const RecipeShare = require("../models/RecipeShare");
const { isObjectIdOrHexString } = require("mongoose");

async function verifyRecipeAccess(req, res, next) {
  try {
    const { recipeId } = req.params;
    if (!isObjectIdOrHexString(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID." });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found.",
      });
    }

    // Owner = Executive Chef
    if (recipe.owner.toString() === req.user._id.toString()) {
      req.recipe = recipe;
      req.recipeRole = "executive-chef";

      return next();
    }

    // Check whether recipe was shared with this user
    const recipeShare = await RecipeShare.findOne({
      recipe: recipeId,
      user: req.user._id,
    });

    if (!recipeShare && recipe.isPublic && req.method === "GET" && req.route?.path === "/:recipeId") {
      req.recipe = recipe;
      req.recipeRole = "public-viewer";
      return next();
    }

    if (!recipeShare) {
      return res.status(403).json({
        message: "You do not have access to this recipe.",
      });
    }

    req.recipe = recipe;
    req.recipeShare = recipeShare;
    req.recipeRole = recipeShare.role;

    next();
  } catch (error) {
    console.error("Verify recipe access error:", error);

    return res.status(500).json({
      message: "Something went wrong while checking recipe access.",
    });
  }
}

module.exports = verifyRecipeAccess;
