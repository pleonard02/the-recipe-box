const express = require("express");
const router = express.Router();
const recipeControllers = require("../controllers/recipeControllers");
const verifyAuthentication = require("../middleware/verifyAuthentication");

router.use(verifyAuthentication);

router.get("/", recipeControllers.getAllRecipes);
router.post("/", recipeControllers.createRecipe);
router.get("/:recipeId", recipeControllers.getOneRecipe);
router.patch("/:recipeId", recipeControllers.updateRecipe);
router.delete("/:recipeId", recipeControllers.deleteRecipe);

module.exports = router;