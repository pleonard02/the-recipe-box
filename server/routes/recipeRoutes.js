const express = require("express");
const router = express.Router();
const recipeControllers = require("../controllers/recipeControllers");
const verifyAuthentication = require("../middleware/verifyAuthentication");
const verifyRecipeAccess = require("../middleware/verifyRecipeAccess");
const verifyRecipeEditor = require("../middleware/verifyRecipeEditor");

router.use(verifyAuthentication);

router.get("/", recipeControllers.getAllRecipes);
router.post("/", recipeControllers.createRecipe);
router.get("/:recipeId", verifyRecipeAccess, recipeControllers.getOneRecipe);
router.patch("/:recipeId", verifyRecipeAccess, verifyRecipeEditor, recipeControllers.updateRecipe);
router.delete("/:recipeId", verifyRecipeAccess, recipeControllers.deleteRecipe);

module.exports = router;
