const express = require("express");
const router = express.Router();

const recipeSuggestionControllers = require("../controllers/recipeSuggestionControllers");
const verifyAuthentication = require("../middleware/verifyAuthentication");
const verifyRecipeAccess = require("../middleware/verifyRecipeAccess");

router.use(verifyAuthentication);

router.get(
  "/:recipeId/suggestions",
  verifyRecipeAccess,
  recipeSuggestionControllers.getRecipeSuggestions,
);
router.post(
  "/:recipeId/suggestions",
  verifyRecipeAccess,
  recipeSuggestionControllers.createRecipeSuggestion,
);
router.patch(
  "/:recipeId/suggestions/:suggestionId",
  verifyRecipeAccess,
  recipeSuggestionControllers.reviewRecipeSuggestion,
);

module.exports = router;
