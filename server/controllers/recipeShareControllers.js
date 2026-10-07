const Recipe = require("../models/Recipe");
const RecipeShare = require("../models/RecipeShare");
const User = require("../models/User");

async function getRecipeShares(req, res) {
  try {
    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found.",
      });
    }

    // Only the Executive Chef can manage/view the sharing list
    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the Executive Chef can view recipe sharing.",
      });
    }

    const recipeShares = await RecipeShare.find({
      recipe: recipeId,
    }).populate("user", "username email");

    return res.status(200).json({
      recipeShares,
    });
  } catch (error) {
    console.error("Get recipe shares error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting recipe shares.",
    });
  }
}

async function shareRecipe(req, res) {
  try {
    const { recipeId } = req.params;
    const { email, role } = req.body;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the Executive Chef can share this recipe." });
    }

    const userToInvite = await User.findOne({ email });

    if (!userToInvite) {
      return res
        .status(404)
        .json({ message: "No user was found with that email address." });
    }

    if (userToInvite._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You are already the Executive Chef of this recipe.",
      });
    }

    const existingShare = await RecipeShare.findOne({
      recipe: recipeId,
      user: userToInvite._id,
    });

    if (existingShare) {
      return res
        .status(400)
        .json({ message: "This recipe is already shared with this user." });
    }

    const recipeShare = await RecipeShare.create({
      recipe: recipeId,
      user: userToInvite._id,
      role: role || "chef",
      invitedBy: req.user._id,
    });

    return res.status(201).json({
      message: "Recipe shared successfully.",
      recipeShare,
    });
  } catch (error) {
    console.error("Share recipe error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while sharing the recipe." });
  }
}

async function updateRecipeShare(req, res) {
  try {
    const { recipeId, shareId } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "chef",
      "sous-chef",
      "co-executive-chef",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid recipe sharing role.",
      });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found.",
      });
    }

    // Only the Executive Chef can change roles
    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the Executive Chef can change kitchen roles.",
      });
    }

    const recipeShare = await RecipeShare.findOne({
      _id: shareId,
      recipe: recipeId,
    });

    if (!recipeShare) {
      return res.status(404).json({
        message: "Recipe share not found.",
      });
    }

    recipeShare.role = role;

    await recipeShare.save();

    return res.status(200).json({
      message: "Kitchen role updated successfully.",
      recipeShare,
    });
  } catch (error) {
    console.error("Update recipe share error:", error);

    return res.status(500).json({
      message: "Something went wrong while updating the kitchen role.",
    });
  }
}

async function deleteRecipeShare(req, res) {
  try {
    const { recipeId, shareId } = req.params;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found.",
      });
    }

    // Only the Executive Chef can remove people
    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the Executive Chef can remove someone from this recipe.",
      });
    }

    const recipeShare = await RecipeShare.findOne({
      _id: shareId,
      recipe: recipeId,
    });

    if (!recipeShare) {
      return res.status(404).json({
        message: "Recipe share not found.",
      });
    }

    await recipeShare.deleteOne();

    return res.status(200).json({
      message: "User has been removed from this recipe.",
    });
  } catch (error) {
    console.error("Delete recipe share error:", error);

    return res.status(500).json({
      message: "Something went wrong while removing recipe access.",
    });
  }
}

module.exports = {
  shareRecipe,
  getRecipeShares,
  updateRecipeShare,
  deleteRecipeShare,
};

