const express = require("express");
const router = express.Router();
const recipeShareControllers = require("../controllers/recipeShareControllers.js");
const verifyAuthentication = require("../middleware/verifyAuthentication.js");

router.use(verifyAuthentication);
router.get("/:recipeId/shares", recipeShareControllers.getRecipeShares);
router.post("/:recipeId/shares", recipeShareControllers.shareRecipe);
router.patch("/:recipeId/shares/:shareId", recipeShareControllers.updateRecipeShare);
router.delete("/:recipeId/shares/:shareId", recipeShareControllers.deleteRecipeShare);

module.exports = router;
