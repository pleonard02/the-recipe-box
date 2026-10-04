const express = require("express");
const router = express.Router();
const recipeControllers = require("../controllers/recipeControllers");
const verifyAuthentication = require("../middleware/verifyAuthentication");

router.use(verifyAuthentication);

router.get("/api/recipes", recipeControllers.getAllRecipes);
router.post("/api/recipes", recipeControllers.createRecipe);
router.get("/api/recipes/:recipeId", recipeControllers.getOneRecipe);
router.patch("/api/recipes/:recipeId", recipeControllers.updateRecipe);
router.delete("/api/recipes/:recipeId", recipeControllers.deleteRecipe);

module.exports = router;