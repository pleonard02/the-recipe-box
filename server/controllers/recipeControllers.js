const Recipe = require("../models/Recipe");
const RecipeShare = require("../models/RecipeShare");

async function getAllRecipes(req, res) {
  try {
    const recipes = await Recipe.find({ owner: req.user._id });
    return res.status(200).json({ recipes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not retrieve recipes." });
  }
}

async function getPublicRecipes(req, res) {
  try {
    const query = { isPublic: true };
    for (const field of ["term", "category", "cuisine"]) {
      if (req.query[field] !== undefined && (typeof req.query[field] !== "string" || req.query[field].length > 100)) {
        return res.status(400).json({ message: "Invalid recipe search." });
      }
    }
    if (req.query.term?.trim()) {
      const escaped = req.query.term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.name = { $regex: escaped, $options: "i" };
    }
    if (req.query.category) query.category = req.query.category;
    if (req.query.cuisine) query.cuisine = req.query.cuisine;
    const recipes = await Recipe.find(query).sort({ createdAt: -1 }).limit(100);
    return res.json({ recipes: recipes.map((recipe) => ({ ...recipe.toObject(), isFavorite: false })) });
  } catch (error) {
    console.error("Public recipe search error:", error);
    return res.status(500).json({ message: "Could not load public recipes." });
  }
}

async function createRecipe(req, res) {
  try {
    const {
      name,
      description,
      image,
      category,
      cuisine,
      source,
      externalId,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      isPublic,
      isFavorite,
    } = req.body;

    const newRecipe = await Recipe.create({
      owner: req.user._id,
      name,
      description,
      image,
      category,
      cuisine,
      source,
      externalId,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      isPublic,
      isFavorite,
    });

    return res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function getOneRecipe(req, res) {
  try {
    if (!req.recipe) {
      return res.status(404).json({ message: "Recipe not found or recipe access was not loaded." });
    }

    const shared = Boolean(req.recipeShare);
    return res.status(200).json({
      ...req.recipe.toObject(),
      isShared: shared,
      isPublicViewer: req.recipeRole === "public-viewer",
      isFavorite: shared ? Boolean(req.recipeShare.isFavorite) : req.recipeRole === "public-viewer" ? false : req.recipe.isFavorite,
    });
  } catch (error) {
    console.error("Get one recipe error:", error);
    return res.status(400).json({ message: "Could not retrieve recipe." });
  }
}

async function updateRecipe(req, res) {
  try {
    const recipe = req.recipe;

    if (req.body.name !== undefined) recipe.name = req.body.name;
    if (req.body.description !== undefined) recipe.description = req.body.description;
    if (req.body.image !== undefined) recipe.image = req.body.image;
    if (req.body.category !== undefined) recipe.category = req.body.category;
    if (req.body.cuisine !== undefined) recipe.cuisine = req.body.cuisine;
    if (req.body.source !== undefined) recipe.source = req.body.source;
    if (req.body.externalId !== undefined) recipe.externalId = req.body.externalId;
    if (req.body.ingredients !== undefined) recipe.ingredients = req.body.ingredients;
    if (req.body.instructions !== undefined) recipe.instructions = req.body.instructions;
    if (req.body.prepTime !== undefined) recipe.prepTime = req.body.prepTime;
    if (req.body.cookTime !== undefined) recipe.cookTime = req.body.cookTime;
    if (req.body.servings !== undefined) recipe.servings = req.body.servings;
    if (req.body.isPublic !== undefined) recipe.isPublic = req.body.isPublic;
    if (req.recipeRole === "executive-chef" && req.body.isFavorite !== undefined)
      recipe.isFavorite = req.body.isFavorite;

    await recipe.save();

    return res
      .status(200)
      .json({ message: "Recipe updated successfully!", recipe });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function deleteRecipe(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found!" });
    }

    if (recipe.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot delete this recipe." });
    }

    await recipe.deleteOne();

    return res.json({ message: "Recipe was successfully deleted." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}


async function getFavoriteRecipes(req, res) {
  try {
    const owned = await Recipe.find({ owner: req.user._id, isFavorite: true });
    const shares = await RecipeShare.find({ user: req.user._id, isFavorite: true }).populate("recipe");
    const shared = shares.filter((share) => share.recipe).map((share) => ({
      ...share.recipe.toObject(), isShared: true, isFavorite: true,
    }));
    return res.json({ recipes: [...owned, ...shared] });
  } catch (error) {
    console.error("Get favorites error:", error);
    return res.status(500).json({ message: "Could not retrieve favorite recipes." });
  }
}

async function updateFavorite(req, res) {
  if (typeof req.body.isFavorite !== "boolean") {
    return res.status(400).json({ message: "isFavorite must be true or false." });
  }
  try {
    const shared = req.recipeRole !== "executive-chef";
    if (shared) {
      const share = await RecipeShare.findOneAndUpdate(
        { _id: req.recipeShare._id, user: req.user._id, recipe: req.recipe._id },
        { $set: { isFavorite: req.body.isFavorite } },
        { new: true, runValidators: true },
      );
      if (!share) return res.status(403).json({ message: "You no longer have access to this recipe." });
    } else {
      req.recipe.isFavorite = req.body.isFavorite;
      await req.recipe.save();
    }
    return res.json({ recipe: {
      ...req.recipe.toObject(), isShared: shared, isFavorite: req.body.isFavorite,
    } });
  } catch (error) {
    console.error("Update favorite error:", error);
    return res.status(400).json({ message: "Could not update favorite." });
  }
}

module.exports = {
  getPublicRecipes,
  getFavoriteRecipes,
  updateFavorite,
  getAllRecipes,
  createRecipe,
  getOneRecipe,
  updateRecipe,
  deleteRecipe,
};
