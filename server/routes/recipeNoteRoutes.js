const express = require("express");
const router = express.Router();

const recipeNoteController = require('../controllers/recipeNoteControllers');
const verifyAuthentication = require('../middleware/verifyAuthentication');
const verifyRecipeAccess = require('../middleware/verifyRecipeAccess');

router.use(verifyAuthentication);

router.get("/:recipeId/notes", verifyRecipeAccess, recipeNoteController.getRecipeNotes);
router.post("/:recipeId/notes", verifyRecipeAccess, recipeNoteController.createRecipeNote);

module.exports = router;

