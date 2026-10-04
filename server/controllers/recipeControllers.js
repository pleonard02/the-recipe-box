const Recipe = require('../models/Recipe');

async function getAllRecipes (req, res) {
    try {
        const recipes = await Recipe.find({ owner: req.user._id});
        return res.status(200).json({recipes});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Could not retrieve recipes."})
    }
}

async function createRecipe (req, res) {
    try {
        const {
            name,
            description,
            ingredients,
            instructions,
            prepTime,
            cookTime,
            servings,
            isPublic,
        } = req.body;

        const newRecipe = await Recipe.create({
            owner: req.user._id,
            name,
            description,
            ingredients,
            instructions,
            prepTime,
            cookTime,
            servings,
            isPublic,
        });

        return res.status(201).json(newRecipe);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
}

async function getOneRecipe (req, res) {
    try {
        const recipe = await Recipe.findById(req.params.recipeId);

        if(!recipe) {
            return res.status(404).json({ message: "We could not "})
        }

        if (recipe.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot view this recipe." })
        }

        return res.status(200).json(recipe);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
}

async function updateRecipe (req, res) {
    try {
        const recipe = await Recipe.findById(req.params.recipeId);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." })
        }

        if (recipe.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot update this recipe."})
        }

        if (req.body.name !== undefined) recipe.name = req.body.name;
        if (req.body.description !== undefined) recipe.description = req.body.description;
        if (req.body.ingredients !== undefined) recipe.ingredients = req.body.ingredients;
        if (req.body.instructions !== undefined) recipe.instructions = req.body.instructions;
        if (req.body.prepTime !== undefined) recipe.prepTime = req.body.prepTime;
        if (req.body.cookTime !== undefined) recipe.cookTime = req.body.cookTime;
        if (req.body.servings !== undefined) recipe.servings = req.body.servings;
        if (req.body.isPublic !== undefined) recipe.isPublic = req.body.isPublic;
    
        await recipe.save();
        
        return res.status(200).json({ message: 'Recipe updated successfully!', recipe,});
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
}

async function deleteRecipe (req, res) {
    try {
        const recipe = await Recipe.findById(req.params.recipeId);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found!" });
        }

        if (recipe.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot delete this recipe."})
        }

        await recipe.deleteOne();
        
        return res.json({ message: "Recipe was successfully deleted." });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getAllRecipes,
    createRecipe,
    getOneRecipe,
    updateRecipe,
    deleteRecipe,
}